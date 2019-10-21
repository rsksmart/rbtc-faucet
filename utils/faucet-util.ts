import { PromiEvent, TransactionReceipt } from 'web3-core';
import Web3Util, {txParameters} from './web3-util';
import config from './../config.json';

class FaucetUtil {
    dispense(address: string): PromiEvent<TransactionReceipt> {
        const web3Util = new Web3Util(config.rskNode);

        const txParameters: txParameters = {
            nonce: web3Util.nonceForAddress(address),
            gasPrice: config.gasPrice,
            gas: 10000,
            value: config.valueToDispense,
            to: address
        }

        return web3Util.sendSignedTransaction(txParameters);
    }
}

export default FaucetUtil