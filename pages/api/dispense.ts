import { NextApiRequest, NextApiResponse } from 'next';
import config from '../../config.json';
import Tx from 'ethereumjs-tx';
import Web3 from 'web3';
import logger from './../../utils/logger';

type txParameters = {
    from: string,
    to: string
    nonce: string,
    gasPrice: string,
    gas: string,
    value: string,
}

interface FaucetHistory { [address: string]: string; }
let faucetHistory: FaucetHistory  = {}

const handleDispense = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    res.setHeader('Content-Type', 'application/json');

    const web3 = new Web3(new Web3.providers.HttpProvider(config.RSK_NODE));
    web3.transactionConfirmationBlocks = 1;
//    web3.eth.transactionConfirmationBlocks = 1;
    const dispenseAddress: string = req.body.address;
    
    if(!faucetHistory.hasOwnProperty(dispenseAddress)) {
        logger.event('dispensing to ' + dispenseAddress);
        
        const txParameters: txParameters = {
            from: config.FAUCET_ADDRESS,
            to: dispenseAddress,
            nonce: web3.utils.toHex(await web3.eth.getTransactionCount(config.FAUCET_ADDRESS)),
            gasPrice: web3.utils.toHex(config.GAS_PRICE),
            gas: web3.utils.toHex(config.GAS_LIMIT),
            value: web3.utils.toHex(Number(web3.utils.toWei(config.VALUE_TO_DISPENSE.toString()))),            
        }

        logger.info('from ' + txParameters.from);
        logger.info('to ' + txParameters.to);
        logger.info('nonce ' + txParameters.nonce);
        logger.info('gasPrice ' + txParameters.gasPrice);
        logger.info('gas ' + txParameters.gas);
        logger.info('value ' + txParameters.value);

        let tx = new Tx(txParameters);
        tx.sign(Buffer.from(config.FAUCET_PRIVATE_KEY, 'hex'));
        const encodedTx = '0x' + tx.serialize().toString('hex');

        logger.info('encodedTx ' + encodedTx);
        
        web3.eth.sendSignedTransaction(encodedTx)
            .on('transactionHash', (txHash: string) => {
                logger.success('dispensed to ' + dispenseAddress);
                logger.success('tx hash ' + txHash);

                faucetHistory[dispenseAddress] = 'dispensed';
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ transactionHash: txHash });
            })
            .on('error', (e: Error) => { 
                logger.error('something went wrong');
                logger.error(e);
                res.status(400).json({ error: e }) 
            });     
    } else {
        logger.warning('this address has reached dispensing limit');
        res.status(204).end()
    }
}

export default handleDispense;