import axios from 'axios';
import Web3 from 'web3';
import http from 'http';
import listen from 'test-listen';
import { apiResolver } from 'next-server/dist/server/api-utils';
import sinon from 'sinon';
import { captchaApiUrl, valueToDispense, provider } from '../../../utils/env-util';
import handleDispense from '../dispense';

const CAPTCHA_API_URL = captchaApiUrl();
const VALUE_TO_DISPENSE = valueToDispense();

//let clock = sinon.useFakeTimers();
var ganacheServer;
var web3: Web3;
var server: http.Server;
var accounts: string[];
var apiUrl: string;

beforeAll(async () => {
  web3 = new Web3(provider());
  web3.transactionConfirmationBlocks = 1;
  accounts = await web3.eth.getAccounts();

  console.log('this accs: ' + JSON.stringify(accounts));

  let requestHandler = (req: any, res: any) => {
    return apiResolver(req, res, undefined, handleDispense);
  };

  server = http.createServer(requestHandler);
  apiUrl = await listen(server);

  setupRNS();
});

afterEach(() => resetFaucetHistory());

afterAll(() => {
  //clock.restore();
  server.close();
});

test('there are four accounts', () => {
  expect.assertions(2);

  const prefixArray = accounts.map(e => e.substring(0, 2));

  expect(accounts.length).toBe(4);
  expect(prefixArray.every(e => e == '0x')).toBeTruthy();
});

test('dispense to a new address, should respond 200 and a txHash', async () => {
  expect.assertions(3);

  const response = await axios.post(apiUrl, { dispenseAddress: accounts[1] });
  const balance = await web3.eth.getBalance(accounts[1]);

  expect(response.status).toBe(200);
  expect(response.data.txHash).toBeTruthy();
  expect(balance).toBe(100000000000000000);
});

test('# dispense more than one time to an address, should only dispense the first time and then deny', async () => {
  expect.assertions(5);

  const dispenseAddress = accounts[2];
  const oldBalance = await web3.eth.getBalance(dispenseAddress);
  const firstResponse = await axios.post(apiUrl, {
    dispenseAddress,
    captcha: 'asd'
  });

  try {
    await axios.post(apiUrl, {
      dispenseAddress,
      captcha: 'asd'
    });
  } catch (e) {
    expect(e.response.status).toBe(409);
  }

  try {
    await axios.post(apiUrl, {
      dispenseAddress,
      captcha: 'asd'
    });
  } catch (e) {
    expect(e.response.status).toBe(409);
  }

  expect(firstResponse.status).toBe(200);
  expect(firstResponse.data.txHash).toBeTruthy();

  const currentBalance = await web3.eth.getBalance(dispenseAddress);
  const expectedBalance = incrementByValueToDispense(oldBalance);

  expect(Number(currentBalance)).toBe(expectedBalance);
});

/*
test("# dispense to an invalid address, shouldn't dispense and respond 409", async () => {
  try {
    await axios.post(API_URL + '/dispense', {
      dispenseAddress: '0x0'
    });
  } catch (e) {
    expect(e.response.status).toBe(409);
  }
});
test('# dispense to an invalid checksum address (TODO), should dispense and respond 200', async () => {
  const res = await axios.post(API_URL + '/dispense', {
    dispenseAddress: '0xD5e6Bfc7E5d982C1F7bAc4D9c7e769BEb0A6f626',
  });

  expect(res.status).toBe(200);
  expect(res.data.txHash).toBeTruthy();
  expect(res.data.checksumed).toBeFalsy();
});
test('# dispense to a rns alias (TODO), should dispense and return 200', () => {
  expect(true).toBeTruthy();
});
test("# dispense to a invalid rns alias (TODO), shouldn't dispense and return 409", () => {
  expect(true).toBeTruthy();
});
test('# dispense right value, should be ' + VALUE_TO_DISPENSE, async () => {
  const dispenseAddress = randomAddress(3);
  const balance = await web3.eth.getBalance(dispenseAddress);
  await axios.post(API_URL + '/dispense', {
    dispenseAddress
  });
  const currentBalance = await web3.eth.getBalance(dispenseAddress);
  const expectedBalance = incrementByValueToDispense(balance);

  expect(Number(currentBalance)).toBe(expectedBalance);
});

*/

const resetFaucetHistory = () => {
  //clock.tick(86400000)
};

const setupRNS = () => {};

const incrementByValueToDispense = (balance: string) =>
  Number(balance) + Number(web3.utils.toWei(valueToDispense().toString(), 'ether'));
