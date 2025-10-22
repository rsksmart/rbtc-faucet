import { getServerEnv } from '@/constants';
import { TxParameters } from '../types/types';
import Web3 from 'web3';

class TxParametersGenerator {
  async generate(dispenseAddress: string, web3: Web3, fee: bigint, promoCode?: string) {
    const serverEnv = getServerEnv();

    const { VALUE_TO_DISPENSE, PROMO_VALUE_TO_DISPENSE, FAUCET_ADDRESS, GAS_PRICE, GAS_LIMIT } = serverEnv;
    const value = promoCode ? PROMO_VALUE_TO_DISPENSE : VALUE_TO_DISPENSE;

    const valueInWei = web3.utils.toWei(value.toString(), 'ether');
    const valueToSend = BigInt(valueInWei);

    const txParameters: TxParameters = {
      from: FAUCET_ADDRESS,
      to: dispenseAddress,
      nonce: web3.utils.toHex(await web3.eth.getTransactionCount(FAUCET_ADDRESS, 'pending')),
      gasPrice: web3.utils.toHex(GAS_PRICE),
      gas: web3.utils.toHex(GAS_LIMIT),
      value: web3.utils.toHex(valueToSend)
    };

    return txParameters;
  }
}

export default TxParametersGenerator;
