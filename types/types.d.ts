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

export interface FaucetButton {
  variant: ButtonProps['variant'];
  onClick:
    | ((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void)
    | undefined;
}
