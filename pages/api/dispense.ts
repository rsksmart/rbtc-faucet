import { NextApiRequest, NextApiResponse } from 'next';
import config from '../../config.json';
import Tx from 'ethereumjs-tx';
import Web3 from 'web3';
import chalk from 'chalk';

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

const logInfo = (info: string): void => logInfo('[ ' + chalk.cyan.dim('info') + ' ] ' + info);

const handleDispense = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    res.setHeader('Content-Type', 'application/json');

    const web3 = new Web3(new Web3.providers.HttpProvider(config.RSK_NODE));
    web3.transactionConfirmationBlocks = 1;
//    web3.eth.transactionConfirmationBlocks = 1;
    const dispenseAddress: string = req.body.address;
    
    if(!faucetHistory.hasOwnProperty(dispenseAddress)) {
        console.log('dispensing to ' + dispenseAddress);
        
        const txParameters: txParameters = {
            from: config.FAUCET_ADDRESS,
            to: dispenseAddress,
            nonce: web3.utils.toHex(await web3.eth.getTransactionCount(config.FAUCET_ADDRESS)),
            gasPrice: web3.utils.toHex(config.GAS_PRICE),
            gas: web3.utils.toHex(config.GAS_LIMIT),
            value: web3.utils.toHex(Number(web3.utils.toWei(config.VALUE_TO_DISPENSE.toString()))),            
        }

        console.log('from ' + txParameters.from);
        console.log('to ' + txParameters.to);
        console.log('nonce ' + txParameters.nonce);
        console.log('gasPrice ' + txParameters.gasPrice);
        console.log('gas ' + txParameters.gas);
        console.log('value ' + txParameters.value);

        let tx = new Tx(txParameters);
        tx.sign(Buffer.from(config.FAUCET_PRIVATE_KEY, 'hex'));
        const encodedTx = '0x' + tx.serialize().toString('hex');

        console.log('encodedTx ' + encodedTx);
        
        web3.eth.sendSignedTransaction(encodedTx)
            .on('transactionHash', (txHash: string) => {
                console.log('dispensed to ' + dispenseAddress);
                console.log('tx hash ' + txHash);

                faucetHistory[dispenseAddress] = 'dispensed';
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ transactionHash: txHash });
            })
            .on('error', (e: Error) => { 
                console.error('something went wrong');
                console.error(e);
                res.status(400).json({ error: e }) 
            });     
    } else {
        console.log('this address has reached dispensing limit');
        res.status(204).end()
    }
}

export default handleDispense;