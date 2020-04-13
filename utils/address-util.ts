import Web3 from 'web3';
import logger from './logger';
import RNS from '@rsksmart/rns';

class AddressUtil {
  rns: RNS;
  constructor(web3: any) {
    this.rns = new RNS(web3);
  }
  async retriveAddressFromFrontend(frontendAddress: string = 'Undefined address'): Promise<string> {
    const posibleRnsAlias = frontendAddress.includes('.rsk');

    if(posibleRnsAlias) {
      try {
        return await this.rns.addr(frontendAddress);
      } catch(e) {
        logger.error(`Couldn't resolve address for this rnsAlias: ${frontendAddress}`);
        logger.error(e);

        return 'INVALID RNS';
      }
    } else {
      return frontendAddress
    }
  }
}

export default AddressUtil;