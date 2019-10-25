const assert = require('chai').assert;
const axios = require('axios');
const keccak256 = require('keccak256');
const Web3 = require('web3');
const nock = require('nock');
const MockAdapter = require('axios-mock-adapter');

const web3 = new Web3(new Web3.providers.HttpProvider(require('./../config').RSK_NODE));
web3.transactionConfirmationBlocks = 1;

const CAPTCHA_API_URL = require('./../config').CAPTCHA_API_URL;
const VALUE_TO_DISPENSE = require('./../config').VALUE_TO_DISPENSE;
const API_URL = require('./../config.json').API_URL;
const randomAddress = num =>
  '0x' +
  keccak256(num)
    .toString('hex')
    .substring(0, 40);

//right now nock isn't mocking anything, therefore every test fails
nock(CAPTCHA_API_URL).post('\/solution(.*)').reply(200, {result: 'accepted', reject_reason: '', trials_left: 5});

describe('Faucet API', () => {
  describe('/dispense', () => {
    describe('# dispense to a new address', () =>
      it('should respond 200 and a txHash', async () => {
        const res = await axios.post(API_URL + '/dispense', {
          dispenseAddress: randomAddress(1),
          resetFaucetHistory: true
        });

        assert.equal(res.status, 200);
        assert.ok(res.data.txHash);
      }));
    describe('# dispense more than one time to an address', () =>
      it('should only dispense the first time and then deny', async () => {
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
          assert.equal(e.response.status, 409);
        }

        try {
          await axios.post(API_URL + '/dispense', {
            dispenseAddress
          });
        } catch (e) {
          assert.equal(e.response.status, 409);
        }

        assert.equal(200, firstResponse.status);
        assert.ok(firstResponse.data.txHash);

        const currentBalance = await web3.eth.getBalance(dispenseAddress);
        const expectedBalance = incrementByValueToDispense(oldBalance);

        assert.equal(currentBalance, expectedBalance);
      }));
    describe('# dispense to an invalid address', () =>
      it("shouldn't dispense and respond 409", async () => {
        try {
          await axios.post(API_URL + '/dispense', {
            dispenseAddress: '0x0'
          });
        } catch (e) {
          assert.equal(e.response.status, 409);
        }
      }));
    describe('# dispense to an invalid checksum address (TODO)', () =>
      it('should dispense and respond 200', async () => {
        assert.ok(true);
      }));
    describe('# dispense to a rns alias (TODO)', () =>
      it('should dispense and return 200', () => {
        assert.ok(true);
      }));
    describe('# dispense to a invalid rns alias (TODO)', () =>
      it("shouldn't dispense and return 409", () => {
        assert.ok(true);
      }));
    describe('# dispense right value', () =>
      it('should be ' + VALUE_TO_DISPENSE, async () => {
        const dispenseAddress = randomAddress(3);
        const balance = await web3.eth.getBalance(dispenseAddress);
        await axios.post(API_URL + '/dispense', {
          dispenseAddress,
          resetFaucetHistory: true
        });
        const currentBalance = await web3.eth.getBalance(dispenseAddress);
        const expectedBalance = incrementByValueToDispense(balance);

        assert.equal(currentBalance, expectedBalance);
      }));
  });
});

const incrementByValueToDispense = balance =>
  Number(balance) + Number(web3.utils.toWei(VALUE_TO_DISPENSE.toString(), 'ether'));
