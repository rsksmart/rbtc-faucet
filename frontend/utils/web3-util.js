import web3 from 'web3';
import config from './../config.json';
import Tx from 'ethereumjs-tx';

class Web3Util {

    constructor(rskNode) {
        this.rskNode = rskNode;
    }

    getWeb3(rskNode) {
        web3 = new Web3();
        web3.setProvider(new web3.providers.HttpProvider(this.rskNode));
    
        return web3;
    }

    sendSignedTransaction(txParameters) {
        let tx = new Tx(txParameters);
        tx.sign(config.faucetPrivateKey);
        
        return web3.eth.sendRawTransaction(tx.serialize().toString('hex'));
    }

}

export default Web3Util;