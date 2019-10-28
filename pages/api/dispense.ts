import { NextApiRequest, NextApiResponse } from 'next';
import config from '../../config.json';
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

//Conditions
const needsCaptchaReset = (captchaSolutionResponse: CaptchaSolutionResponse): boolean =>
  captchaSolutionResponse.trials_left == 0;

const captchaRejected = (result: string): string =>
  result == 'rejected' ? 'Invalid captcha. Notice that this captcha is case sensitive.' : '';
const alreadyDispensed = (dispenseAddress: string): string =>
  faucetHistory.hasOwnProperty(dispenseAddress) ? 'Address already used today, try again tomorrow.' : '';
const invalidAddress = (dispenseAddress: string): string =>
  dispenseAddress == undefined ||
  dispenseAddress == '' ||
  dispenseAddress.substring(0, 2) != '0x' ||
  dispenseAddress.length != 42
    ? 'Invalid address.'
    : '';

//Request Handler
const handleDispense = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  try {
    res.setHeader('Content-Type', 'application/json');

    const web3 = new Web3(new Web3.providers.HttpProvider(config.RSK_NODE));
    web3.transactionConfirmationBlocks = 1;

    const dispenseAddress: string = req.body.dispenseAddress;
    const captchaSolutionRequest: CaptchaSolutionRequest = req.body.captcha;
    const resetFaucetHistory: boolean = req.body.resetFaucetHistory;

    logger.event('dispensing to ' + dispenseAddress);
    logger.event('captcha ' + JSON.stringify(captchaSolutionRequest));

    if (resetFaucetHistory) {
      //don't know if this could be productive but i'm using it for testing
      faucetHistory = {};
    }

    const captchaSolutionResponse: CaptchaSolutionResponse = await solveCaptcha(captchaSolutionRequest);
    //const captchaSolutionResponse: CaptchaSolutionResponse = {result: 'accepted', reject_reason: '', trials_left: 5};

    //Validations
    //each validation will return an error message, if it success it'll return an empty string (empty error message)
    const validations = [ 
      () => captchaRejected(captchaSolutionResponse.result),
      () => alreadyDispensed(dispenseAddress),
      () => invalidAddress(dispenseAddress)
    ];
    const errorMessages = validations.map(validate => validate()).filter(e => e != '');
    if (errorMessages.length > 0) {
      errorMessages.forEach(e => logger.error(e));

      const parsedMessages = errorMessages.reduce((a, b) => '- ' + a + '\n-' + b);
      const data: DispenseResponse = {
        titleText: 'Error',
        text: parsedMessages,
        type: 'error',
        resetCaptcha: needsCaptchaReset(captchaSolutionResponse)
      };
      res.status(409).end(JSON.stringify(data)); //409 Conflict
    } else {
      //Dispensing
      const txParameters: TxParameters = {
        from: config.FAUCET_ADDRESS,
        to: dispenseAddress,
        nonce: web3.utils.toHex(await web3.eth.getTransactionCount(config.FAUCET_ADDRESS)),
        gasPrice: web3.utils.toHex(config.GAS_PRICE),
        gas: web3.utils.toHex(config.GAS_LIMIT),
        value: web3.utils.toHex(web3.utils.toWei(config.VALUE_TO_DISPENSE.toString()))
      };

      logger.txParameters(txParameters);

      let tx = new Tx(txParameters);
      tx.sign(Buffer.from(config.FAUCET_PRIVATE_KEY, 'hex'));
      const encodedTx = '0x' + tx.serialize().toString('hex');

      logger.info('encodedTx ' + encodedTx);

      web3.eth
        .sendSignedTransaction(encodedTx)
        .on('transactionHash', (txHash: string) => {
          logger.dispensed(dispenseAddress, txHash);

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
            dispenseComplete: true
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

    const url = config.SOLVE_CAPTCHA_URL + captcha.id + '/' + captcha.solution;
    const res = await axios.post(url, captcha);
    const result: CaptchaSolutionResponse = res.data;
    logger.event('captcha solution response ' + JSON.stringify(result));

    return result;
  } catch (e) {
    console.log('este ' + JSON.stringify(e));
    return { result: <'accepted' | 'rejected'>'rejected', reject_reason: e, trials_left: 0 };
  }
};

export default handleDispense;