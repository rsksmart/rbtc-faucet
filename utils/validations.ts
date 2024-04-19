import { CaptchaSolutionResponse, FaucetHistory } from '../types/types';
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
export const alreadyDispensed = (address: string, ip: string, faucetHistory: FaucetHistory): string => {
  const addressLastTimeUsed = faucetHistory.addresses[address]?.lastTimeUsed
  const ipLastTimeUsed = faucetHistory.ips[ip]?.lastTimeUsed

  if (addressLastTimeUsed && !is24HoursOld(addressLastTimeUsed)) {
    return 'IP already used today, try again tomorrow.'
  } else if (ipLastTimeUsed && !is24HoursOld(ipLastTimeUsed)) {
    return 'Address already used today, try again tomorrow.'
  } else {
    return ''
  }
}

export function is24HoursOld(lastTimeUsed) {
  const now = new Date().getTime()
  const timePassed = now - lastTimeUsed.getTime()

  return (timePassed / 3600000) >= 24
}

export const invalidAddress = (dispenseAddress: string): string => !isValidAddress(dispenseAddress) ? 'Invalid address, provide a valid one.' : '';