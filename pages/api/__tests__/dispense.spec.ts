import axios from 'axios';
import Web3 from 'web3';
import http from 'http';
import listen from 'test-listen';
import { apiResolver } from 'next-server/dist/server/api-utils';
import { captchaApiUrl, valueToDispense, provider, solveCaptchaUrl } from '../../../utils/env-util';
import handleDispense from '../dispense';
import { isValidAddress, isValidChecksumAddress } from 'rskjs-util';
import nock from 'nock';

const CAPTCHA_API_URL = captchaApiUrl();
const VALUE_TO_DISPENSE = valueToDispense();
const TESTNET_CHAIN_ID = 31;

var web3: Web3;
var server: http.Server;
var accounts: string[];
var apiUrl: string;
var faucetAddress: string;

beforeAll(async () => {
  web3 = new Web3(provider());
  web3.transactionConfirmationBlocks = 1;
  web3.eth.transactionConfirmationBlocks = 1;
  accounts = await web3.eth.getAccounts();
  faucetAddress = accounts[0];

  let requestHandler = (req: any, res: any) => {
    return apiResolver(req, res, undefined, handleDispense);
  };

  server = http.createServer(requestHandler);
  apiUrl = await listen(server);

  setupRNS();
});

afterAll(async () => {
  server.close();
});

describe('NO CAPTCHA', () => {
  beforeEach(() => {
    nock(CAPTCHA_API_URL) //Mocking captcha service
      .post('/solution/1/1')
      .reply(200, { result: 'accepted', reject_reason: '', trials_left: 5 });
  });

  test('there are five accounts', () => {
    expect.assertions(2);

    const validAddresses = accounts.map(e => isValidAddress(e));

    expect(accounts.length).toBe(5);
    expect(validAddresses.every(e => e)).toBeTruthy();
  });

  test('dispense to a new address', async () => {
    expect.assertions(3);

    const response = await axios.post(apiUrl, { dispenseAddress: accounts[1], captcha: { id: 1, solution: 1 } });
    const balance = Number(web3.utils.fromWei(await web3.eth.getBalance(accounts[1]), 'ether'));

    expect(response.status).toBe(200);
    expect(response.data.txHash).toBeTruthy();
    expect(balance).toBe(valueToDispense());
  });

  test('# dispense more than one time to an address, should only dispense the first time and then deny', async () => {
    expect.assertions(5);

    const dispenseAddress = accounts[2];
    const oldBalance = web3.utils.fromWei(await web3.eth.getBalance(dispenseAddress), 'ether');
    const firstResponse = await axios.post(apiUrl, {
      dispenseAddress,
      captcha: { id: 1, solution: 1 }
    });

    try {
      await axios.post(apiUrl, {
        dispenseAddress,
        captcha: { id: 1, solution: 1 }
      });
    } catch (e) {
      expect(e.response.status).toBe(409);
    }

    try {
      await axios.post(apiUrl, {
        dispenseAddress,
        captcha: { id: 1, solution: 1 }
      });
    } catch (e) {
      expect(e.response.status).toBe(409);
    }

    expect(firstResponse.status).toBe(200);
    expect(firstResponse.data.txHash).toBeTruthy();

    const currentBalance = Number(web3.utils.fromWei(await web3.eth.getBalance(dispenseAddress), 'ether'));
    const expectedBalance = Number(oldBalance) + Number(valueToDispense());

    expect(currentBalance).toBe(expectedBalance);
  });

  test("# dispense to an invalid address, shouldn't dispense and respond 409", async () => {
    expect.assertions(2);

    const oldFaucetTransactionCount = await web3.eth.getTransactionCount(faucetAddress);

    try {
      await axios.post(apiUrl, {
        dispenseAddress: '0x0',
        captcha: { id: 1, solution: 1 }
      });
    } catch (e) {
      const newFaucetTransactionCount = await web3.eth.getTransactionCount(faucetAddress);
      expect(e.response.status).toBe(409);
      expect(newFaucetTransactionCount).toBe(oldFaucetTransactionCount);
    }
  });
  test('# dispense to an invalid checksum address, should dispense and respond 200', async () => {
    expect.assertions(4);

    const unchecksumedAddress: string = '0xD5e6Bfc7E5d982C1F7bAc4D9c7e769BEb0A6f626';

    expect(isValidChecksumAddress(unchecksumedAddress, TESTNET_CHAIN_ID)).toBeFalsy();

    const res = await axios.post(apiUrl, {
      dispenseAddress: unchecksumedAddress,
      captcha: { id: 1, solution: 1 }
    });

    expect(res.status).toBe(200);
    expect(res.data.txHash).toBeTruthy();
    expect(res.data.checksumed).toBeFalsy();
  });

  /*
  test('# dispense to a rns alias (TODO), should dispense and return 200', () => {
    expect(true).toBeTruthy();
  });
  test("# dispense to a invalid rns alias (TODO), shouldn't dispense and return 409", () => {
    expect(true).toBeTruthy();
  });
  */

  test('# dispense right value, should be ' + VALUE_TO_DISPENSE, async () => {
    const dispenseAddress = accounts[3];
    const oldBalance = Number(await web3.eth.getBalance(dispenseAddress));

    await axios.post(apiUrl, {
      dispenseAddress,
      captcha: { id: 1, solution: 1 }
    });

    const currentBalance = Number(web3.utils.fromWei(await web3.eth.getBalance(dispenseAddress), 'ether'));
    const expectedValueToDispense = currentBalance - oldBalance;

    expect(expectedValueToDispense).toBe(valueToDispense());
  });
});

describe('CAPTCHA', () => {
  test('dispensing with an invalid captcha', async () => {
    expect.assertions(2);

    try {
      await axios.post(apiUrl, { dispenseAddress: accounts[4], captcha: { id: 'invalid', solution: 'solution' } });
    } catch (e) {
      expect(e.response.status).toBe(409);
      expect(e.response.data.text).toBe('Invalid captcha (notice that this captcha is case sensitive).');
    }
  });
});

const setupRNS = () => {};
