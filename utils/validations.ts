import { CaptchaSolutionResponse } from '../types/types';
import {isValidAddress} from 'rskjs-util';

export const insuficientFunds = (faucetBalance: number) =>
  faucetBalance < 100000000000000000 ? 'Faucet has not enough funds.' : '';
export const needsCaptchaReset = (captchaSolutionResponse: CaptchaSolutionResponse): boolean =>
  captchaSolutionResponse.trials_left == 0;
export const captchaRejected = (result: string): string =>
  result == 'rejected' ? 'Invalid captcha (notice that this captcha is case sensitive).' : '';
export const alreadyDispensed = (dispenseAddress: string, faucetHistory: any): string =>
  faucetHistory.hasOwnProperty(dispenseAddress.toLowerCase()) ? 'Address already used today, try again tomorrow.' : '';
export const invalidAddress = (dispenseAddress: string): string => !isValidAddress(dispenseAddress) ? 'Invalid address, provide a valid one.' : '';