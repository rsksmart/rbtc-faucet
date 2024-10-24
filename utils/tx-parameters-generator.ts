import { TxParameters } from '../types/types';
import { gasLimit, gasPrice, valueToDispense } from './env-util';
import { faucetAddress } from './faucet-sensitive-util';
import Web3 from 'web3';
import BN from 'bn.js';

class TxParametersGenerator {
  async generate(dispenseAddress: string, web3: Web3, fee: BN) {

    const VALUE_TO_DISPENSE = valueToDispense();
    const valueInWei = web3.utils.toWei(VALUE_TO_DISPENSE.toString(), 'ether');
    const valueToSend = web3.utils.toBN(valueInWei).sub(fee);

    const txParameters: TxParameters = {
      from: faucetAddress(),
      to: dispenseAddress,
      nonce: web3.utils.toHex(await web3.eth.getTransactionCount(faucetAddress(), 'pending')),
      gasPrice: web3.utils.toHex(gasPrice()),
      gas: web3.utils.toHex(gasLimit()),
      value: web3.utils.toHex(valueToSend)
    };

    return txParameters;
  }
}

export default TxParametersGenerator;
