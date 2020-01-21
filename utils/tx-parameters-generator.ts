import { TxParameters } from '../types/types';
import { faucetAddress, gasLimit, gasPrice, valueToDispense } from './env-util';
import Web3 from 'web3';

class TxParametersGenerator {
  async generate(rskAddress: string, dispenseAddress: string, web3: Web3) {
    const txParameters: TxParameters = {
      from: faucetAddress(),
      to: rskAddress ? rskAddress : dispenseAddress,
      nonce: web3.utils.toHex(await web3.eth.getTransactionCount(faucetAddress(), 'pending')),
      gasPrice: web3.utils.toHex(gasPrice()),
      gas: web3.utils.toHex(gasLimit()),
      value: web3.utils.toHex(web3.utils.toWei(valueToDispense().toString()))
    };

    return txParameters;
  }
}

export default TxParametersGenerator;
