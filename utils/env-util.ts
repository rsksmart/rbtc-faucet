import Web3 from 'web3';
import prodConfig from '../prod-config.json';
import devConfig from '../dev-config.json';
import testConfig from '../test-config.json';

const FAUCET_PRIVATE_KEY_DEVELOP_TESTING = 'c3d40c98585e2c61add9c6a94b66cd7f5c5577e45d900c6c0e3139df1310292f';
type Account = { balance: string; secretKey?: string };

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
const emptyAccounts = (size: number): Account[] => {
  let accounts: Account[] = [
    {
      balance: '0x56BC75E2D63100000',
      secretKey: '0x' + FAUCET_PRIVATE_KEY_DEVELOP_TESTING
    }
  ];
  for (let i = 0; i < size - 1; i++) accounts.push({ balance: '0x0' });

  return accounts;
};

//bundling ganache-cli at dev/prod env, produces compiling error (missing dependencies on client side)
var currentProvider: any;
export function provider(): any {
  if (!currentProvider) {
    let ganache = null;
    if (process.env.NODE_ENV == 'test') {
      ganache = require('ganache-cli').provider({
        accounts: emptyAccounts(5),
        gasPrice: '0x0'
      });
    }
    currentProvider = productionDevelopmentTest(
      new Web3.providers.HttpProvider(prodConfig.RSK_NODE),
      new Web3.providers.HttpProvider(devConfig.RSK_NODE),
      ganache
    );
  }
  return currentProvider;
}

export function apiUrl(): string {
  return productionDevelopmentTest(prodConfig.API_URL, devConfig.API_URL, devConfig.API_URL);
}

export function solveCaptchaUrl(): string {
  return productionDevelopmentTest(
    prodConfig.SOLVE_CAPTCHA_URL,
    devConfig.SOLVE_CAPTCHA_URL,
    devConfig.SOLVE_CAPTCHA_URL
  );
}

export function gasPrice(): number {
  return productionDevelopmentTest(prodConfig.GAS_PRICE, devConfig.GAS_PRICE, devConfig.GAS_PRICE);
}

export function gasLimit(): number {
  return productionDevelopmentTest(prodConfig.GAS_LIMIT, devConfig.GAS_LIMIT, devConfig.GAS_LIMIT);
}

export function valueToDispense(): number {
  return productionDevelopmentTest(
    prodConfig.VALUE_TO_DISPENSE,
    devConfig.VALUE_TO_DISPENSE,
    devConfig.VALUE_TO_DISPENSE
  );
}

export function secretCaptcha(): number {
  return productionDevelopmentTest(
    prodConfig.SECRET_VERIFY_CAPTCHA,
    devConfig.SECRET_VERIFY_CAPTCHA,
    devConfig.SECRET_VERIFY_CAPTCHA
  );
}

export function siteKey(): string {
  return productionDevelopmentTest(
    prodConfig.SITE_KEY_CAPTCHA,
    devConfig.SITE_KEY_CAPTCHA,
    devConfig.SITE_KEY_CAPTCHA
  );
}

export function tagManagerId(): string {
  return productionDevelopmentTest(prodConfig.TAG_MANAGER_ID, devConfig.TAG_MANAGER_ID, devConfig.TAG_MANAGER_ID);
}

export function filterByIP(): string {
  return productionDevelopmentTest(
    prodConfig.FILTER_BY_IP,
    devConfig.FILTER_BY_IP,
    devConfig.FILTER_BY_IP
  );
}