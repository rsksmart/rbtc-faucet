import { TxParameters } from '../types/types';
import { gasLimit, gasPrice, getPromoValue, valueToDispense } from './env-util';
import { faucetAddress } from './faucet-sensitive-util';
import Web3 from 'web3';
import BN from 'bn.js';

class TxParametersGenerator {
  async generate(dispenseAddress: string, web3: Web3, fee: BN, promoCode?: string) {

    const VALUE_TO_DISPENSE = valueToDispense();
    const PROMO_VALUE_TO_DISPENSE = getPromoValue();
    const value = promoCode ? PROMO_VALUE_TO_DISPENSE : VALUE_TO_DISPENSE;

    const valueInWei = web3.utils.toWei(value.toString(), 'ether');
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
