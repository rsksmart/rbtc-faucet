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

export interface CaptchaSolution {
  id: string;
  solution: string;
}

export interface CaptchaSolutionResponse {
  result: 'accepted' | 'rejected';
  reject_reason: 'too many trials' | 'incorrect solution' | '';
  trials_left: number;
}
