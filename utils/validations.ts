import { CaptchaSolutionResponse } from '../types/types';
import {isValidAddress} from 'rskjs-util';

const EROR_CODE = {
  'missing-input-secret':	'The secret parameter is missing.',
  'invalid-input-secret':	'The secret parameter is invalid or malformed.',
  'missing-input-response':	'The response parameter is missing.',
  'invalid-input-response':	'The response parameter is invalid or malformed.',
  'bad-request':	'The request is invalid or malformed.',
  'timeout-or-duplicate':	'The response is no longer valid: either is too old or has been used previously.'
}

export const insuficientFunds = (faucetBalance: number) =>
  faucetBalance < 100000000000000000 ? 'Faucet has not enough funds.' : '';
export const captchaRejected = (response: CaptchaSolutionResponse): string =>
  response.success ? '' : EROR_CODE[response['error-codes'][0]] || 'Captcha Error';
export const alreadyDispensed = (dispenseAddress: string, faucetHistory: any): string =>
  faucetHistory.hasOwnProperty(dispenseAddress.toLowerCase()) ? 'Address already used today, try again tomorrow.' : '';
export const invalidAddress = (dispenseAddress: string): string => !isValidAddress(dispenseAddress) ? 'Invalid address, provide a valid one.' : '';