import logger from './logger';
import Resolver from '@rsksmart/rns-resolver.js'

class AddressUtil {
  constructor() {}
  async retriveAddressFromFrontend(frontendAddress: string = 'Undefined address', mainnet: boolean): Promise<string> {
    const posibleRnsAlias = frontendAddress.includes('.rsk');

    if(posibleRnsAlias) {
      try {
        let resolver;
        if(mainnet) {
          resolver = Resolver.forRskMainnet({})
        } else {
          resolver = Resolver.forRskTestnet({})
        }
        const address = await resolver.addr(frontendAddress);
        return address
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