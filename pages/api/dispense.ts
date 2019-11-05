import { NextApiRequest, NextApiResponse } from 'next';
import Tx from 'ethereumjs-tx';
import Web3 from 'web3';
import logger from './../../utils/logger';
import { isValidChecksumAddress, toChecksumAddress } from 'rskjs-util';
import {
  TxParameters,
  FaucetHistory,
  CaptchaSolutionRequest,
  CaptchaSolutionResponse,
  DispenseResponse
} from '../../types/types';
import axios from 'axios';
import { CronJob } from 'cron';
import RNSUtil from '../../utils/rns-util';
import { faucetAddress, provider, faucetPrivateKey, gasPrice, gasLimit, valueToDispense, solveCaptchaUrl } from '../../utils/env-util';

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
const rnsUtil: RNSUtil = new RNSUtil(web3);

//Request Handler
const handleDispense = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const faucetBalance: number = Number(await web3.eth.getBalance(faucetAddress()));

  try {
    res.setHeader('Content-Type', 'application/json');

    const dispenseAddress: string = req.body.dispenseAddress;
    const captchaSolutionRequest: CaptchaSolutionRequest = req.body.captcha;

    logger.event('dispensing to ' + dispenseAddress);
    logger.event('captcha ' + JSON.stringify(captchaSolutionRequest));

    const captchaSolutionResponse: CaptchaSolutionResponse = await solveCaptcha(captchaSolutionRequest);
    //const captchaSolutionResponse: CaptchaSolutionResponse = {result: 'accepted', reject_reason: '', trials_left: 5};

    //Validations
    //each validation will return an error message, if it success it'll return an empty string (empty error message)
    const existingAlias: boolean = await rnsUtil.existingAlias(dispenseAddress);

    const unexistingRNSAlias = (dispenseAddress: string): string =>
      !existingAlias ? dispenseAddress + ' is an unexisting alias, please provide an existing one' : '';
    const insuficientFunds = () => (faucetBalance < 100000000000000000 ? 'Faucet has enough funds' : '');
    const needsCaptchaReset = (captchaSolutionResponse: CaptchaSolutionResponse): boolean =>
      captchaSolutionResponse.trials_left == 0;
    const captchaRejected = (result: string): string =>
      result == 'rejected' ? 'Invalid captcha. Notice that this captcha is case sensitive.' : '';
    const alreadyDispensed = (dispenseAddress: string): string =>
      faucetHistory.hasOwnProperty(dispenseAddress) ? 'Address already used today, try again tomorrow.' : '';
    const invalidAddress = (dispenseAddress: string): string =>
      dispenseAddress == undefined ||
      dispenseAddress == '' ||
      (dispenseAddress.substring(0, 2) != '0x' && !rnsUtil.isRNS(dispenseAddress)) ||
      (dispenseAddress.length != 42 && !rnsUtil.isRNS(dispenseAddress))
        ? 'Invalid address.'
        : '';

    const validations: (() => string)[] = [
      () => captchaRejected(captchaSolutionResponse.result),
      () => alreadyDispensed(dispenseAddress),
      () => (dispenseAddress.includes('rsk') ? unexistingRNSAlias(dispenseAddress) : invalidAddress(dispenseAddress)),
      () => insuficientFunds()
    ];
    const errorMessages: string[] = validations.map(validate => validate()).filter(e => e != '' && e != '-');
    if (errorMessages.length > 0) {
      errorMessages.forEach(e => logger.error(e));

      const parsedMessages: string = errorMessages.reduce((a, b) => '- ' + a + '\n-' + b);
      const data: DispenseResponse = {
        titleText: 'Error',
        text: parsedMessages,
        type: 'error',
        resetCaptcha: needsCaptchaReset(captchaSolutionResponse)
      };
      res.status(409).end(JSON.stringify(data)); //409 Conflict
    } else {
      //Dispensing
      let rskAddress: string = '';

      if (existingAlias) {
        const rnsAddress = dispenseAddress;
        rskAddress = await rnsUtil.resolveAddr(rnsAddress);
      }

      const txParameters: TxParameters = {
        from: faucetAddress(),
        to: rskAddress ? rskAddress : dispenseAddress,
        nonce: web3.utils.toHex(await web3.eth.getTransactionCount(faucetAddress())),
        gasPrice: web3.utils.toHex(gasPrice()),
        gas: web3.utils.toHex(gasLimit()),
        value: web3.utils.toHex(web3.utils.toWei(valueToDispense().toString()))
      };

      logger.txParameters(txParameters);

      let tx = new Tx(txParameters);
      tx.sign(Buffer.from(faucetPrivateKey(), 'hex'));
      const encodedTx = '0x' + tx.serialize().toString('hex');

      logger.info('encodedTx ' + encodedTx);

      web3.eth
        .sendSignedTransaction(encodedTx)
        .on('transactionHash', (txHash: string) => {
          logger.dispensed(rskAddress ? rskAddress : dispenseAddress, txHash);

          faucetHistory[dispenseAddress] = 'dispensed';
          const data: DispenseResponse = {
            txHash,
            titleText: 'Sent',
            type: 'success',
            text: !isValidChecksumAddress(dispenseAddress, 31)
              ? 'Successfully sent some RBTCs to ' +
                dispenseAddress +
                '.\n Please consider using this address with RSK Testnet checksum: ' +
                toChecksumAddress(dispenseAddress, 31)
              : 'Successfully sent some RBTCs to ' + dispenseAddress,
            dispenseComplete: true,
            checksumed: rskAddress ? isValidChecksumAddress(rskAddress, 31 ) : isValidChecksumAddress(dispenseAddress, 31)
          };
          res.status(200).json(JSON.stringify(data)); //200 OK
        })
        .on('error', (error: Error) => {
          logger.sendSignedTransactionError(error);

          const data: DispenseResponse = {
            titleText: 'Error',
            type: 'error',
            text: 'Something went wrong, please try again in a while',
            resetCaptcha: needsCaptchaReset(captchaSolutionResponse)
          };
          res.status(500).json(JSON.stringify(data)); //500 Internal Server Error
        });
    }
  } catch (e) {
    logger.error(e);

    const data: DispenseResponse = {
      titleText: 'Error',
      text: 'This is unexpected, please try again later.',
      type: 'error'
    };
    res.status(500).end(JSON.stringify(data)); //500 Internal Server Error
  }
};

//Captcha solver
const solveCaptcha = async (captcha: CaptchaSolutionRequest): Promise<CaptchaSolutionResponse> => {
  try {
    if (captcha.solution == '') captcha.solution = "doesn't matter";

    const url = solveCaptchaUrl() + captcha.id + '/' + captcha.solution;
    const res = await axios.post(url, captcha);
    const result: CaptchaSolutionResponse = res.data;
    logger.event('captcha solution response ' + JSON.stringify(result));

    return result;
  } catch (e) {
    logger.error(e);
    return { result: <'accepted' | 'rejected'>'rejected', reject_reason: e, trials_left: 0 };
  }
};

export default handleDispense;
