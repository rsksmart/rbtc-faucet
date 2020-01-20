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
  DispenseResponse
} from '../../types/types';
import axios from 'axios';
import { CronJob } from 'cron';
import RNSUtil from '../../utils/rns-util';
import {
  faucetAddress,
  provider,
  faucetPrivateKey,
  solveCaptchaUrl
} from '../../utils/env-util';
import {
  alreadyDispensed,
  captchaRejected,
  insuficientFunds, invalidAddress,
  needsCaptchaReset,
  unexistingRNSAlias
} from "./validations";
import ValidationStatus from "../../model/validation-status";
import TxParametersGenerator from "./tx-parameters-generator";

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
const TESTNET_CHAIN_ID = 31;

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

    //Validations
    //each validation will return an error message, if it success it'll return an empty string (empty error message)
    const existingAlias: boolean = await rnsUtil.existingAlias(dispenseAddress);

    const validationStatus = runValidations(captchaSolutionResponse, dispenseAddress, existingAlias, faucetBalance);

    if (validationStatus.valid()) {
      validationStatus.logErrors();

      const data: DispenseResponse = {
        titleText: 'Error',
        text: validationStatus.parsedErrorsForFrontend(),
        type: 'error',
        resetCaptcha: needsCaptchaReset(captchaSolutionResponse)
      };
      res.status(409).end(JSON.stringify(data)); //409 Conflict
    } else {
      //Dispensing
      let rskAddress: string = '';
      const txParametersGenerator = new TxParametersGenerator();

      if (existingAlias) {
        const rnsAddress = dispenseAddress;
        rskAddress = await rnsUtil.resolveAddr(rnsAddress);
      }

      const txParameters: TxParameters = await txParametersGenerator.generate(rskAddress, dispenseAddress, web3);

      logger.txParameters(txParameters);

      let tx = new Tx(txParameters);
      tx.sign(Buffer.from(faucetPrivateKey(), 'hex'));
      const encodedTx = '0x' + tx.serialize().toString('hex');
      const txHash = '0x' + tx.hash(true).toString('hex')
      logger.info('encodedTx ' + encodedTx);

      web3.eth.sendSignedTransaction(encodedTx);
      faucetHistory[dispenseAddress.toLowerCase()] = 'dispensed';

      logger.dispensed(rskAddress ? rskAddress : dispenseAddress, txHash);

      const data: DispenseResponse = {
        txHash,
        titleText: 'Sent',
        type: 'success',
        text: dispenseTextForFrontend(dispenseAddress, txHash),
        dispenseComplete: true,
        checksumed: rskAddress
            ? isValidChecksumAddress(rskAddress, TESTNET_CHAIN_ID)
            : isValidChecksumAddress(dispenseAddress, TESTNET_CHAIN_ID)
      };
      res.status(200).json(JSON.stringify(data)); //200 OK
    }
  } catch (e) {
    logger.error(e);

    const data: DispenseResponse = {
      titleText: 'Error',
      text: 'Something went wrong, please try again in a while',
      type: 'error',
      resetCaptcha: true
    };

    logger.event('Sending response ' + JSON.stringify(data));
    res.status(500).end(JSON.stringify(data)); //500 Internal Server Error
  }
};

//Captcha solver
async function solveCaptcha(captcha: CaptchaSolutionRequest): Promise<CaptchaSolutionResponse> {
  try {
    if (captcha.solution == '') captcha.solution = "doesn't matter";

    const url = solveCaptchaUrl() + captcha.id + '/' + captcha.solution;

    logger.event('checking solution against captcha api, POST ' + url);

    const res = await axios.post(url, captcha);
    const result: CaptchaSolutionResponse = res.data;

    logger.event('captcha solution response ' + JSON.stringify(result));

    return result;
  } catch (e) {
    logger.error(e);
    return { result: <'accepted' | 'rejected'>'rejected', reject_reason: e, trials_left: 0 };
  }
};

function runValidations(captchaSolutionResponse: CaptchaSolutionResponse, dispenseAddress: string, existingAlias: boolean, faucetBalance: number): ValidationStatus {
  const validations: (() => string)[] = [
    () => captchaRejected(captchaSolutionResponse.result),
    () => alreadyDispensed(dispenseAddress, faucetHistory),
    () => (dispenseAddress.includes('rsk') ? unexistingRNSAlias(dispenseAddress, existingAlias) : invalidAddress(dispenseAddress, rnsUtil)),
    () => insuficientFunds(faucetBalance)
  ];
  const errorMessages: string[] = validations.map(validate => validate()).filter(e => e != '' && e != '-');

  return new ValidationStatus(errorMessages);
}

function dispenseTextForFrontend(dispenseAddress: string, txHash: string) {
  const message = 'Successfully sent some RBTCs to ' + dispenseAddress;

  const withTransactionHash = message + '<br/> <a href="https://explorer.testnet.rsk.co/tx/' + txHash + '" target="_blank">Transaction hash</a>';

  return withTransactionHash;
}

export default handleDispense;
