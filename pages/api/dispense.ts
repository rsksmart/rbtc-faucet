import { NextApiRequest, NextApiResponse } from 'next';
import config from '../../config.json';
import Tx from 'ethereumjs-tx';
import Web3 from 'web3';
import logger from './../../utils/logger';
import rskjsUtil, { isValidChecksumAddress, toChecksumAddress } from 'rskjs-util';
import { TxParameters, FaucetHistory, CaptchaSolution, CaptchaSolutionResponse } from '../../types/types.js';
import axios from 'axios';

let faucetHistory: FaucetHistory = {};

const handleDispense = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  try {
    res.setHeader('Content-Type', 'application/json');

    const web3 = new Web3(new Web3.providers.HttpProvider(config.RSK_NODE));
    web3.transactionConfirmationBlocks = 1;

    const dispenseAddress: string = req.body.dispenseAddress;
    const resetFaucetHistory: boolean = req.body.resetFaucetHistory;
    const checksumed = {
      mainnet: <boolean>rskjsUtil.isValidChecksumAddress(dispenseAddress, 30),
      testnet: <boolean>rskjsUtil.isValidChecksumAddress(dispenseAddress, 31)
    };

    logger.event('dispensing to ' + dispenseAddress);

    if (resetFaucetHistory) {
      //don't know if this could be productive but i'm using it for testing
      faucetHistory = {};
    }

    console.log(dispenseAddress);

    if (
      dispenseAddress == undefined ||
      dispenseAddress == '' ||
      dispenseAddress.substring(0, 2) != '0x' ||
      dispenseAddress.length != 42
    ) {
      logger.warning('provided an invalid address');

      res
        .status(409)
        .end(JSON.stringify({ modalTitle: 'Error', message: 'Please provide a valid address', modalStatus: 'error' }));
    } else if (!faucetHistory.hasOwnProperty(dispenseAddress)) {
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
          res.setHeader('Content-Type', 'application/json');
          res.status(200).json(
            JSON.stringify({
              txHash,
              modalTitle: 'Sent',
              modalStatus: 'success',
              message: !isValidChecksumAddress(dispenseAddress, 31)
                ? 'Successfully sent some RBTCs to ' +
                  dispenseAddress +
                  '.\n Please consider using this address with RSK Testnet checksum: ' +
                  toChecksumAddress(dispenseAddress, 31)
                : 'Successfully sent some RBTCs to ' + dispenseAddress
            })
          );
        })
        .on('error', (error: Error) => {
          logger.sendSignedTransactionError(error);

          res.status(500).json(
            JSON.stringify({
              modalTitle: 'Error',
              modalStatus: 'error',
              message: 'Something went wrong, please try again in a while'
            })
          );
        });
    } else {
      logger.warning(dispenseAddress + ' is trying to dispense more than once in a day, dispense denied');

      const data = JSON.stringify({
        modalTitle: 'Unsent',
        message: 'Address already used today, try again tomorrow',
        modalStatus: 'error'
      });

      res.status(200).end(data);
    }
  } catch (e) {
    logger.error(e);

    res.status(500).end(JSON.stringify({ message: 'This is unexpected' }));
  }
};

export default handleDispense;
