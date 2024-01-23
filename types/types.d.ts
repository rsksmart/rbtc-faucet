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
  [address: string]: number;
}

export interface CaptchaSolutionRequest {
  id: string;
  solution: string;
}

export interface CaptchaSolutionResponse {
  reject_reason: 'too many trials' | 'incorrect solution' | '';
  result: {
    solution: string,
    trials_left: number;
  }
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

export interface ExistingAliasStatus {
  status: boolean;
  realAddress: string;
}
