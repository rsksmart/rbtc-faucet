import Web3Util, {txParameters} from './web3-util';
import config from './../config.json';
import { PromiEvent, TransactionReceipt } from 'web3-core';

class FaucetUtil {
    dispense(address: string, faucetNonce: number): PromiEvent<TransactionReceipt> {
        const web3Util = new Web3Util();

        const txParameters: txParameters = {
            from: config.FAUCET_ADDRESS,
            to: address,
            nonce: web3Util.toHex(faucetNonce),
            gasPrice: web3Util.toHex(config.GAS_PRICE),
            gas: web3Util.toHex(config.GAS_LIMIT),
            value: web3Util.toHex(Number(web3Util.toWei(config.VALUE_TO_DISPENSE))),            
        }

        return web3Util.sendSignedTransaction(txParameters);
    }
}

export default FaucetUtil