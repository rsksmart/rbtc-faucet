import { NextApiRequest, NextApiResponse } from 'next';
import config from '../../config.json';
import Tx from 'ethereumjs-tx';
import Web3 from 'web3';
import logger from './../../utils/logger';
import rskjsUtil from 'rskjs-util';
import { FaucetHistory, TxParameters } from '../../types.js';

let faucetHistory: FaucetHistory  = {}

const handleDispense = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    res.setHeader('Content-Type', 'application/json');

    const web3 = new Web3(new Web3.providers.HttpProvider(config.RSK_NODE));
    web3.transactionConfirmationBlocks = 1;

    const dispenseAddress: string = req.body.address;
    const checksumed = {
        mainnet: <boolean> rskjsUtil.isValidChecksumAddress(dispenseAddress, 30),
        testnet: <boolean> rskjsUtil.isValidChecksumAddress(dispenseAddress, 31)
    }

    if(!rskjsUtil.isValidAddress(dispenseAddress)){
        logger.warning('provided an invalid address');
        
        res.status(409).end()
    } else if(!faucetHistory.hasOwnProperty(dispenseAddress)) {
        logger.event('dispensing to ' + dispenseAddress);
        
        const txParameters: TxParameters = {
            from: config.FAUCET_ADDRESS,
            to: dispenseAddress,
            nonce: web3.utils.toHex(await web3.eth.getTransactionCount(config.FAUCET_ADDRESS)),
            gasPrice: web3.utils.toHex(config.GAS_PRICE),
            gas: web3.utils.toHex(config.GAS_LIMIT),
            value: web3.utils.toHex(web3.utils.toWei(config.VALUE_TO_DISPENSE.toString())),
        }

        logger.txParameters(txParameters);

        let tx = new Tx(txParameters);
        tx.sign(Buffer.from(config.FAUCET_PRIVATE_KEY, 'hex'));
        const encodedTx = '0x' + tx.serialize().toString('hex');

        logger.info('encodedTx ' + encodedTx);
        
        web3.eth.sendSignedTransaction(encodedTx)
            .on('transactionHash', (txHash: string) => {
                logger.dispensed(dispenseAddress, txHash);

                faucetHistory[dispenseAddress] = 'dispensed';
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ txHash, checksumed });
            })
            .on('error', (error: Error) => { 
                logger.sendSignedTransactionError(error);

                res.status(400).json({ error }) 
            });     
    } else {
        logger.warning('this address has reached dispensing limit');

        res.status(204).end()
    }
}

export default handleDispense;