import Store from '../../store/root-store';
import { NextApiRequest, NextApiResponse } from 'next';
import FaucetUtil from '../../utils/faucet-util';
import { PromiEvent, TransactionReceipt } from 'web3-core';
import Web3Util from '../../utils/web3-util';
import config from '../../config.json';

const faucetUtil = new FaucetUtil();
const web3Util = new Web3Util();

const handleDispense = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    res.setHeader('Content-Type', 'application/json');

    const address: string = req.body.address;
    let faucetNonce: number = -1;

    try{
        faucetNonce = await web3Util.nonceForAddress(config.FAUCET_ADDRESS);
        console.log('este nonce' + faucetNonce);
    } catch(e) {
        console.error(e);
        res.status(500).end({});
    }
    
    if(!Store.getInstance().alreadyDispensed(address)) {
        faucetUtil.dispense(address, faucetNonce)
            .on('transactionHash', (txHash: string) => {
                Store.getInstance().saveDispensedAddress(address);
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ transactionHash: txHash });
            }).on('error', (e: Error) => res.status(400).json({ error: e }));     
    } else {
        res.status(204).end({}) //if its already dispensed
    }
}

export default handleDispense;