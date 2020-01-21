import { string } from 'prop-types';

export interface TxParameters {
  from: string;
  to: string;
  nonce: string;
  gasPrice: string;
  gas: string;
  value: string;
}

export interface FaucetHistory {
  [address: string]: string;
}

export interface CaptchaSolutionRequest {
  id: string;
  solution: string;
}

export interface CaptchaSolutionResponse {
  result: 'accepted' | 'rejected';
  reject_reason: 'too many trials' | 'incorrect solution' | '';
  trials_left: number;
}

export interface DispenseResponse {
  titleText: string;
  type: 'warning' | 'info' | 'error' | 'success' | 'question';
  text: string;
  txHash?: string;
  resetCaptcha?: boolean;
  dispenseComplete?: boolean;
  checksumed?: boolean;
}
