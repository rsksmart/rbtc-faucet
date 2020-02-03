import RNSUtil from './rns-util';
import Web3 from 'web3';
import logger from './logger';

class AddressUtil {
  web3: Web3;
  constructor(web3: Web3) {
    this.web3 = web3;
  }
  async retriveAddressFromFrontend(frontendAddress: string = 'Undefined address'): Promise<string> {
    const posibleRnsAlias = frontendAddress.includes('.rsk');

    if(posibleRnsAlias) {
      try {
        const rnsUtil = new RNSUtil(this.web3);

        return await rnsUtil.resolveAddr(frontendAddress);
      } catch(e) {
        logger.error('Couldn\'t retrieve address by rns alias: ' + e);

        return e;
      }
    } else {
      return frontendAddress
    }
  }
}

export default AddressUtil;