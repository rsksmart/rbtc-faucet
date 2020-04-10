import faucet from '../faucet-sensitive.json';
import devConfig from '../dev-config.json';
import testConfig from '../test-config.json';

const productionDevelopmentTest = (prod: any, dev: any, test: any): any => {
    switch (process.env.NODE_ENV) {
      case 'production':
        return prod;
      case 'development':
        return dev;
      case 'test':
        return test;
      default:
        throw 'Undefined environment';
    }
};

export function faucetPrivateKey(): string {
    return productionDevelopmentTest(
      faucet.FAUCET_PRIVATE_KEY,
      devConfig.FAUCET_PRIVATE_KEY,
      'c3d40c98585e2c61add9c6a94b66cd7f5c5577e45d900c6c0e3139df1310292f'
    );
}

export function faucetAddress(): string {
  return productionDevelopmentTest(
    faucet.FAUCET_ADDRESS,
    devConfig.FAUCET_ADDRESS,
    '0xF7D1dF4f96A812598d4E398f5539c4f98DA958ab'
  );
}