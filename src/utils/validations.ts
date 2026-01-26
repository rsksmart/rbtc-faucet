import { isValidAddress } from '@rsksmart/rsk-utils';
import { CaptchaSolutionResponse, FaucetHistory } from '../types/types';
import { saveFaucetHistory } from '@/app/lib/faucetHistory';
import { getServerEnv } from '@/constants';

const serverEnv = getServerEnv();

const EROR_CODE = {
  'missing-input-secret':	'The secret parameter is missing.',
  'invalid-input-secret':	'The secret parameter is invalid or malformed.',
  'missing-input-response':	'The response parameter is missing.',
  'invalid-input-response':	'The response parameter is invalid or malformed.',
  'bad-request':	'The request is invalid or malformed.',
  'timeout-or-duplicate':	'The response is no longer valid: either is too old or has been used previously.'
}

const CHAIN_ID = 30; //We are solving RNS from mainnet, so we need to use mainnet chain id to validate addresses

export const insuficientFunds = (faucetBalance: number) =>
  faucetBalance < 100000000000000000 ? 'Faucet has not enough funds.' : '';

export const captchaRejected = (response: CaptchaSolutionResponse): string =>
  response.success ? '' : EROR_CODE[response['error-codes'][0]] || 'Captcha Error';

export const alreadyDispensed = (address: string, ip:string, faucetHistory: FaucetHistory, promoCode?: string): string => {
  const key = Object.keys(faucetHistory).find((key) => faucetHistory[key].ip === ip || faucetHistory[key].address === address);
  let currentUser = key ? faucetHistory[key!] : null; 
  const isFilterByIP = promoCode ? false : serverEnv.FILTER_BY_IP;
  const TIMER_LIMIT = serverEnv.TIMER_LIMIT;
  const currentTime = new Date();

  const usedUserTime = currentUser?.time ? new Date(currentUser?.time).getTime() : 0;
  const timer = currentTime.getTime() - usedUserTime;

  if (timer >= TIMER_LIMIT && !currentUser?.mint) {
    delete faucetHistory[address];
    currentUser = null;
  }

  const usedAddress = faucetHistory.hasOwnProperty(address)
  if (currentUser?.ip === ip && isFilterByIP) return 'IP already used today, try again tomorrow.'
  if (usedAddress) return 'Address already used today, try again tomorrow.'
  faucetHistory[address] = {
    address,
    ip,
    time: new Date(),
    promoCode
  };
  saveFaucetHistory(faucetHistory)
  return ''
}
export const invalidAddress = (dispenseAddress: string, isMainnetRns: boolean): string => !isValidAddress(dispenseAddress, isMainnetRns ? 30 : 31) ? 'Invalid address, provide a valid one.' : '';
