import RNSUtil from "./rns-util";

class Validations {

    static unexistingRNSAlias(existingAlias:boolean , dispenseAddress: string): string {
        return !existingAlias ? dispenseAddress + ' is an unexisting alias, please provide an existing one' : '';
    }

    static insuficientFunds(faucetBalance: number) { 
        return faucetBalance < 100000000000000000 ? 'Faucet has enough funds' : ''
    };
    
    static captchaRejected(result: string): string  {
        return result == 'rejected' ? 'Invalid captcha. Notice that this captcha is case sensitive.' : '';
    }
      
    static alreadyDispensed(faucetHistory: any, dispenseAddress: string): string {
        return faucetHistory.hasOwnProperty(dispenseAddress.toLowerCase())
        ? 'Address already used today, try again tomorrow.'
        : '';
    }
      
    static invalidAddress(dispenseAddress: string, rnsUtil: RNSUtil): string {
        return dispenseAddress == undefined ||
        dispenseAddress == '' ||
        (dispenseAddress.substring(0, 2) != '0x' && !rnsUtil.isRNS(dispenseAddress)) ||
        (dispenseAddress.length != 42 && !rnsUtil.isRNS(dispenseAddress))
          ? 'Invalid address.'
          : '';
    }
      

}

export default Validations