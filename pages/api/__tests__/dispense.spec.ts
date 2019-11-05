import axios from 'axios';
const keccak256 = require('keccak256');
import Web3 from 'web3';
import nock from 'nock';
import sinon from 'sinon';
import { provider, captchaApiUrl, valueToDispense, apiUrl } from '../../../utils/env-util';

const web3 = new Web3(provider());
web3.transactionConfirmationBlocks = 1;

const CAPTCHA_API_URL = captchaApiUrl();
const VALUE_TO_DISPENSE = valueToDispense();
const API_URL = apiUrl();
const randomAddress = (num: number) =>
  '0x' +
  keccak256(num)
    .toString('hex')
    .substring(0, 40);

//right now nock isn't mocking anything, therefore every test fails
nock(CAPTCHA_API_URL)
  .post('/solution(.*)')
  .reply(200, { result: 'accepted', reject_reason: '', trials_left: 5 });

let clock = sinon.useFakeTimers();

beforeAll(async () => { 
  setupRNS(); 
});
  
afterEach(() => resetFaucetHistory());

afterAll(() => { 
  clock.restore();
});

test('# dispense to a new address, should respond 200 and a txHash', async () => {
  const res = await axios.post(API_URL + '/dispense', {
    dispenseAddress: randomAddress(1),
  });

  expect(res.status).toBe(200);
  expect(res.data.txHash).toBeTruthy();
});
test('# dispense more than one time to an address, should only dispense the first time and then deny', async () => {
  const dispenseAddress = randomAddress(2);
  const oldBalance = await web3.eth.getBalance(dispenseAddress);
  const firstResponse = await axios.post(API_URL + '/dispense', {
    dispenseAddress
  });

  try {
    await axios.post(API_URL + '/dispense', {
      dispenseAddress
    });
  } catch (e) {
    expect(e.response.status).toBe(409);
  }

  try {
    await axios.post(API_URL + '/dispense', {
      dispenseAddress
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


const resetFaucetHistory = () => {
  clock.tick(86400000)
}

const setupRNS = () => {
}

const incrementByValueToDispense = (balance: string) =>
  Number(balance) + Number(web3.utils.toWei(VALUE_TO_DISPENSE.toString(), 'ether'));
