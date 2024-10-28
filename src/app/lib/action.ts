'use server'
import { filterByIP, provider, valueToDispense } from '@/utils/env-util';
import { faucetAddress, faucetPrivateKey } from '@/utils/faucet-sensitive-util';
import { headers } from 'next/headers';
import AddressUtil from '../../utils/address-util';
import Tx from 'ethereumjs-tx';

import Web3 from 'web3';
import { CaptchaSolutionRequest, CaptchaSolutionResponse, DispenseResponse, FaucetHistory, TxParameters } from '@/types/types';
import logger from '@/utils/logger';
import CaptchaSolver from '@/utils/captcha-solver';
import ValidationStatus from '@/model/validation-status';
import { CronJob } from 'cron';
import FrontendText from '@/utils/frontend-text';
import { alreadyDispensed, captchaRejected, insuficientFunds, invalidAddress } from '@/utils/validations';
import TxParametersGenerator from '@/utils/tx-parameters-generator';
import { isValidChecksumAddress } from 'rskjs-util';

interface IData {
  address: string
  captcha: CaptchaSolutionRequest
}
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
    } catch {
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
const web3: Web3 = new Web3(provider());
const addressUtil = new AddressUtil(web3);
const captchaSolver = new CaptchaSolver();
const frontendText = new FrontendText();
const TESTNET_CHAIN_ID = 31;

export async function dispense(data: IData) {
const { address, captcha } = data;

  const ip: string = headers().get('x-forwarded-for') || headers().get('x-user-ip') as string;
  logger.event('IP ' + ip);
  const faucetBalance: number = Number(await web3.eth.getBalance(faucetAddress()));
try {

    const dispenseAddress: string = await addressUtil.retriveAddressFromFrontend(address);
    const captchaSolutionRequest: CaptchaSolutionRequest = captcha;

    logger.event('dispensing to ' + dispenseAddress);
    logger.event('captcha ' + JSON.stringify(captchaSolutionRequest));

    const captchaSolutionResponse: CaptchaSolutionResponse = await captchaSolver.solve(captchaSolutionRequest);
    //Validations
    //each validation will return an error message, if it success it'll return an empty string (empty error message)
    const validationStatus: ValidationStatus = runValidations(
      captchaSolutionResponse,
      dispenseAddress,
      faucetBalance,
      ip!
    );

    if (!validationStatus.valid()) {
      validationStatus.logErrors();

      const data: DispenseResponse = {
        title: 'Error',
        text: frontendText.invalidTransaction(validationStatus.errorMessages),
        type: 'error',
      };
      faucetHistory = await filterAddresses(faucetHistory, dispenseAddress, ip);

      return data
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
          title: 'Sent',
          type: 'success',
          text: frontendText.dispense(dispenseAddress, txHash),
          dispenseComplete: true,
          checksumed: isValidChecksumAddress(dispenseAddress, TESTNET_CHAIN_ID)
        };

        return data
      } catch (error) {
        faucetHistory = await filterAddresses(faucetHistory, dispenseAddress, ip);
        logger.error('Error produced after sending a signed transaction.');
        logger.error(error);

        const data: DispenseResponse = {
          title: 'Error',
          text: await frontendText.failedTransaction(txHash, web3),
          type: 'error',
          resetCaptcha: true
        };

        return data;
      }
    }
  } catch (e) {
    logger.error(e);

    const data: DispenseResponse = {
      title: 'Error',
      text: 'Something went wrong, please try again in a while',
      type: 'error',
      resetCaptcha: true
    };
    faucetHistory = await filterAddresses(faucetHistory, address, ip);
    logger.event('Sending response ' + JSON.stringify(data));
    return data;
  }

}

const runValidations = (
  captchaSolutionResponse: CaptchaSolutionResponse,
  dispenseAddress: string,
  faucetBalance: number,
  ip: string
): ValidationStatus => {
  const validations: (() => string)[] = [
    () => captchaRejected(captchaSolutionResponse),
    () => alreadyDispensed(dispenseAddress.toLowerCase(), ip, faucetHistory),
    () => invalidAddress(dispenseAddress),
    () => insuficientFunds(faucetBalance)
  ];
  const errorMessages: string[] = validations.map(validate => validate()).filter(e => e != '' && e != '-');

  return new ValidationStatus(errorMessages);
}

export async function filterAddresses(faucetHistory: FaucetHistory, dispenseAddress: string, ip:string) {
  const isFilterByIP = filterByIP();
  const key = Object.keys(faucetHistory).find((key) => {
    const historyEntry = faucetHistory[key];
    return (historyEntry.ip === ip && isFilterByIP) || historyEntry.address === dispenseAddress.toLowerCase()
  });
  const adddress = key ? faucetHistory[key!] : null;
  if (!adddress?.mint && !adddress?.loading) delete faucetHistory[dispenseAddress.toLowerCase()]
  return faucetHistory;
}

export async function estimationFee(dispenseAddress:string) {
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

