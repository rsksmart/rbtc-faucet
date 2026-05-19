import Resolver from '@rsksmart/rns-resolver.js'

export const INVALID_RNS = 'INVALID RNS';

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
      } catch {
        return INVALID_RNS;
      }
    } else {
      return frontendAddress
    }
  }
}

export default AddressUtil;