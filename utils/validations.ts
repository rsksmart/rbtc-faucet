import { CaptchaSolutionResponse } from '../types/types';
import RNSUtil from './rns-util';

export const unexistingRNSAlias = (dispenseAddress: string, existingAlias: boolean): string =>
  !existingAlias ? dispenseAddress + ' is an unexisting alias, please provide an existing one' : '';
export const insuficientFunds = (faucetBalance: number) =>
  faucetBalance < 100000000000000000 ? 'Faucet has enough funds' : '';
export const needsCaptchaReset = (captchaSolutionResponse: CaptchaSolutionResponse): boolean =>
  captchaSolutionResponse.trials_left == 0;
export const captchaRejected = (result: string): string =>
  result == 'rejected' ? 'Invalid captcha (notice that this captcha is case sensitive).' : '';
export const alreadyDispensed = (dispenseAddress: string, faucetHistory: any): string =>
  faucetHistory.hasOwnProperty(dispenseAddress.toLowerCase()) ? 'Address already used today, try again tomorrow.' : '';
export const invalidAddress = (dispenseAddress: string, rnsUtil: RNSUtil): string =>
  dispenseAddress == undefined ||
  dispenseAddress == '' ||
  (dispenseAddress.substring(0, 2) != '0x' && !rnsUtil.isRNS(dispenseAddress)) ||
  (dispenseAddress.length != 42 && !rnsUtil.isRNS(dispenseAddress))
    ? 'Invalid address.'
    : '';
