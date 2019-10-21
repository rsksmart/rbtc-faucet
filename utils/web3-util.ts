import Web3 from 'web3';
import config from './../config.json';
import Tx from 'ethereumjs-tx';
import { PromiEvent, TransactionReceipt } from 'web3-core';
import BN from 'bn.js';

export type txParameters = {
    from: string,
    to: string
    nonce: string,
    gasPrice: string,
    gas: string,
    value: string,
}

class Web3Util {
    web3: Web3;

    constructor() {
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.RSK_NODE));
    }

    sendSignedTransaction(txParameters: txParameters): PromiEvent<TransactionReceipt> {
        let tx = new Tx(txParameters);
        tx.sign(Buffer.from(config.FAUCET_PRIVATE_KEY, 'hex'));
        
        return this.web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'));
    }

    async nonceForAddress(address: string): Promise<number> {
        return await this.web3.eth.getTransactionCount(address);
    }

    toHex(num: number) {
        return this.web3.utils.toHex(num);
    }

    toWei(ether: number): string {
        return this.web3.utils.toWei(ether.toString(), 'ether');
    }
}

export default Web3Util;