import {TxParameters} from "../../../types/types";
import {faucetAddress, gasLimit, gasPrice, valueToDispense} from "../../../utils/env-util";
import Web3 from 'web3';
import logger from "../../../utils/logger";

class TxParametersGenerator {
    async generate(rskAddress: string, dispenseAddress: string, web3: Web3) {
        logger.info('From mocked TxParametersGenerator');

        const txParameters: TxParameters = {
            from: faucetAddress(),
            to: rskAddress ? rskAddress : dispenseAddress,
            nonce: web3.utils.toHex(await web3.eth.getTransactionCount(faucetAddress())),
            gasPrice: web3.utils.toHex(gasPrice()),
            gas: web3.utils.toHex(gasLimit()),
            value: web3.utils.toHex(web3.utils.toWei(valueToDispense().toString()))
        };

        return txParameters;
    }
}

export default TxParametersGenerator;