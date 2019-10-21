import Web3 from 'web3';
import config from './../config.json';
import Tx from 'ethereumjs-tx';
import { PromiEvent, TransactionReceipt } from 'web3-core';

export type txParameters = {
    nonce: number,
    gasPrice: number,
    gas: number,
    value: number,
    to: string
}

class Web3Util {
    rskNode: string;
    web3: Web3;

    constructor(rskNode: string) {
        this.rskNode = rskNode;
        this.web3 = new Web3(new Web3.providers.HttpProvider(this.rskNode));
    }

    sendSignedTransaction(txParameters: txParameters): PromiEvent<TransactionReceipt> {
        let tx = new Tx(txParameters);
        tx.sign(new Buffer(config.faucetPrivateKey));
        
        return this.web3.eth.sendSignedTransaction(tx.serialize().toString('hex'));
    }

    nonceForAddress(address: string): number {
        return 0;
    }
}

export default Web3Util;