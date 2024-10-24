import { NextApiRequest, NextApiResponse } from 'next';
import Tx from 'ethereumjs-tx';
import Web3 from 'web3';
import logger from './../../utils/logger';
import { isValidChecksumAddress } from 'rskjs-util';
import {
  TxParameters,
  FaucetHistory,
  CaptchaSolutionRequest,
  CaptchaSolutionResponse,
  DispenseResponse,
} from '../../types/types';
import { CronJob } from 'cron';
import { filterByIP, provider, valueToDispense } from '../../utils/env-util';
import {
  alreadyDispensed,
  captchaRejected,
  insuficientFunds,
  invalidAddress,
} from '../../utils/validations';
import ValidationStatus from '../../model/validation-status';
import TxParametersGenerator from '../../utils/tx-parameters-generator';
import FrontendText from '../../utils/frontend-text';
import CaptchaSolver from '../../utils/captcha-solver';
import AddressUtil from '../../utils/address-util';
  
import { faucetPrivateKey, faucetAddress } from '../../utils/faucet-sensitive-util';

let faucetHistory: FaucetHistory = {};

//Job
new CronJob(
  '00 00 12 * * 0-6',
  () => {
    //This job will begin when the first user calls dispense api
    //Runs every day at 12:00:00 AM. == 00:00:00 HS
    try {
      logger.event('restarting faucet history...');
      faucetHistory = {};
      logger.success('faucet history has been restarted succesfuly!');
    } catch (e) {
      logger.error('there was a problem with faucet history restart');
    }
  },
  () => {
    //This function is executed when the job stops
    logger.event('faucet history restart job has been stopped');
  },
  true /* Start the job right now */,
  'America/Los_Angeles' /* Time zone of this job. */
);

//Utils
const web3: Web3 = new Web3(provider());
web3.transactionConfirmationBlocks = 1;
const TESTNET_CHAIN_ID = 31;
const frontendText = new FrontendText();
const captchaSolver = new CaptchaSolver();
const addressUtil = new AddressUtil(web3);

//Request Handler
const handleDispense = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  let ip:string = (req.headers['x-forwarded-for'] || req.connection.remoteAddress) as string;
  logger.event('IP ' + ip);
  try {
    const faucetBalance: number = Number(await web3.eth.getBalance(faucetAddress()));

    res.setHeader('Content-Type', 'application/json');

    const dispenseAddress: string = await addressUtil.retriveAddressFromFrontend(req.body.dispenseAddress);
    const captchaSolutionRequest: CaptchaSolutionRequest = req.body.captcha;

    logger.event('dispensing to ' + dispenseAddress);
    logger.event('captcha ' + JSON.stringify(captchaSolutionRequest));

    const captchaSolutionResponse: CaptchaSolutionResponse = await captchaSolver.solve(captchaSolutionRequest);

    //Validations
    //each validation will return an error message, if it success it'll return an empty string (empty error message)
    const validationStatus: ValidationStatus = runValidations(
      captchaSolutionResponse,
      dispenseAddress,
      faucetBalance,
      ip
    );

    if (!validationStatus.valid()) {
      validationStatus.logErrors();

      const data: DispenseResponse = {
        titleText: 'Error',
        text: frontendText.invalidTransaction(validationStatus.errorMessages),
        type: 'error',
      };
      faucetHistory = filterAddresses(faucetHistory, dispenseAddress, ip);

      res.status(409).end(JSON.stringify(data)); //409 Conflict
    } else {
      const fee = await estimationFee(dispenseAddress);
      const txParametersGenerator = new TxParametersGenerator();
      const txParameters: TxParameters = await txParametersGenerator.generate(dispenseAddress, web3, fee);

      logger.txParameters(txParameters);

      const tx = new Tx(txParameters);
      tx.sign(Buffer.from(faucetPrivateKey(), 'hex'));

      const encodedTx = '0x' + tx.serialize().toString('hex');
      const txHash = '0x' + tx.hash(true).toString('hex');

      logger.info('encodedTx ' + encodedTx);
      logger.dispensed(dispenseAddress, txHash);

      try {
        const currentAddress = faucetHistory[dispenseAddress.toLowerCase()];
        currentAddress.loading = true;
        const receipt = await web3.eth.sendSignedTransaction(encodedTx);

        currentAddress.mint = true;
        currentAddress.loading = false;

        logger.success('Transaction succesfuly mined!');
        logger.success('Retrived this receipt');
        logger.success(JSON.stringify(receipt));

        const data: DispenseResponse = {
          txHash,
          titleText: 'Sent',
          type: 'success',
          text: frontendText.dispense(dispenseAddress, txHash),
          dispenseComplete: true,
          checksumed: isValidChecksumAddress(dispenseAddress, TESTNET_CHAIN_ID)
        };

        res.status(200).json(JSON.stringify(data)); //200 OK
      } catch (error) {
        faucetHistory = filterAddresses(faucetHistory, dispenseAddress, ip);
        logger.error('Error produced after sending a signed transaction.');
        logger.error(error);

        const data: DispenseResponse = {
          titleText: 'Error',
          text: await frontendText.failedTransaction(txHash, web3),
          type: 'error',
          resetCaptcha: true
        };

        res.status(500).end(JSON.stringify(data)); //500 Internal Server Error
      }
    }
  } catch (e) {
    logger.error(e);

    const data: DispenseResponse = {
      titleText: 'Error',
      text: 'Something went wrong, please try again in a while',
      type: 'error',
      resetCaptcha: true
    };
    faucetHistory = filterAddresses(faucetHistory, req.body.dispenseAddress?.toLowerCase(), ip);
    logger.event('Sending response ' + JSON.stringify(data));
    res.status(500).end(JSON.stringify(data)); //500 Internal Server Error
  }
};

function runValidations(
  captchaSolutionResponse: CaptchaSolutionResponse,
  dispenseAddress: string,
  faucetBalance: number,
  ip: string
): ValidationStatus {
  const validations: (() => string)[] = [
    () => captchaRejected(captchaSolutionResponse),
    () => alreadyDispensed(dispenseAddress.toLowerCase(), ip, faucetHistory),
    () => invalidAddress(dispenseAddress),
    () => insuficientFunds(faucetBalance)
  ];
  const errorMessages: string[] = validations.map(validate => validate()).filter(e => e != '' && e != '-');

  return new ValidationStatus(errorMessages);
}

function filterAddresses(faucetHistory: FaucetHistory, dispenseAddress: string, ip:string) {
  const isFilterByIP = filterByIP();
  const key = Object.keys(faucetHistory).find((key) => {
    const historyEntry = faucetHistory[key];
    return (historyEntry.ip === ip && isFilterByIP) || historyEntry.address === dispenseAddress.toLowerCase()
  });
  const adddress = key ? faucetHistory[key!] : null;
  if (!adddress?.mint && !adddress?.loading) delete faucetHistory[dispenseAddress.toLowerCase()]
  return faucetHistory;
}

async function estimationFee(dispenseAddress:string) {
  const VALUE_TO_DISPENSE = valueToDispense();
  const value = web3.utils.toWei(VALUE_TO_DISPENSE.toString(), 'ether');
  const gasEstimate = await web3.eth.estimateGas({
    from: faucetAddress(),
    to: dispenseAddress,
    data: '',
    value: value
  });
  const gasPrice = await web3.eth.getGasPrice();
  const estimatedCost = web3.utils.toBN(gasEstimate).mul(web3.utils.toBN(gasPrice));
  return estimatedCost || web3.utils.toBN('0');
}

export default handleDispense;
