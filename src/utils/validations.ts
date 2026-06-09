import { isValidAddress } from '@rsksmart/rsk-utils';
import Web3 from 'web3';
import { CaptchaSolutionResponse, FaucetHistory } from '../types/types';
import { saveFaucetHistory } from '@/app/lib/faucetHistory';
import { getServerEnv } from '@/constants';
import { INVALID_RNS } from './address-util';

const serverEnv = getServerEnv();

const CAPTCHA_ERROR_MESSAGES: Record<string, string> = {
  'missing-input-secret': 'Captcha verification is temporarily unavailable. Please try again later.',
  'invalid-input-secret': 'Captcha verification is temporarily unavailable. Please try again later.',
  'missing-input-response': 'Please complete the captcha before submitting.',
  'invalid-input-response': 'Captcha verification failed. Please complete the captcha and try again.',
  'bad-request': 'Captcha verification failed. Please try again.',
  'timeout-or-duplicate': 'This captcha has expired or was already used. Please complete a new captcha.',
};

const networkLabel = (isMainnetRns: boolean) =>
  isMainnetRns ? 'Rootstock mainnet' : 'Rootstock testnet';

export const insuficientFunds = (faucetBalance: number) =>
  faucetBalance < 100000000000000000
    ? 'The faucet is temporarily out of test RBTC. Please try again later or ask for help in our Discord.'
    : '';

export const receiverBalanceExceeded = (
  recipientBalanceWei: bigint,
  promoCode?: string
): string => {
  const isFilterByBalance = promoCode ? false : serverEnv.FILTER_BY_BALANCE;
  if (!isFilterByBalance) {
    return '';
  }
  const maxBalanceWei = BigInt(
    Web3.utils.toWei(serverEnv.MAX_RECEIVER_BALANCE.toString(), 'ether')
  );
  if (recipientBalanceWei > maxBalanceWei) {
    return `This address already holds more than ${serverEnv.MAX_RECEIVER_BALANCE} test RBTC and cannot receive more from the faucet.`;
  }
  return '';
};

export const captchaRejected = (response: CaptchaSolutionResponse): string =>
  response.success
    ? ''
    : CAPTCHA_ERROR_MESSAGES[response['error-codes'][0]] ??
      'Captcha verification failed. Please try again.';

export const alreadyDispensed = (
  address: string,
  ip: string,
  faucetHistory: FaucetHistory,
  promoCode?: string
): string => {
  const key = Object.keys(faucetHistory).find(
    (key) => faucetHistory[key].ip === ip || faucetHistory[key].address === address
  );
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

  const usedAddress = faucetHistory.hasOwnProperty(address);
  if (currentUser?.ip === ip && isFilterByIP) {
    return 'Only one faucet request per IP address is allowed every 24 hours. Please try again tomorrow.';
  }
  if (usedAddress) {
    return 'This address has already received test RBTC in the last 24 hours. Please try again tomorrow.';
  }
  faucetHistory[address] = {
    address,
    ip,
    time: new Date(),
    promoCode,
  };
  saveFaucetHistory(faucetHistory);
  return '';
};

export const invalidAddress = (
  resolvedAddress: string,
  inputAddress: string,
  isMainnetRns: boolean
): string => {
  if (resolvedAddress === INVALID_RNS) {
    return `We could not resolve "${inputAddress}" on ${networkLabel(isMainnetRns)}. Check that the name is registered and spelled correctly.`;
  }

  const chainId = isMainnetRns ? 30 : 31;
  if (isValidAddress(resolvedAddress, chainId)) {
    return '';
  }

  if (inputAddress.includes('.rsk')) {
    return `The address resolved from "${inputAddress}" is not valid for ${networkLabel(isMainnetRns)}.`;
  }

  return `Enter a valid ${networkLabel(isMainnetRns)} address (0x followed by 40 hexadecimal characters) or a registered .rsk name.`;
};
