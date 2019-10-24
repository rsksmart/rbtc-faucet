const assert = require('chai').assert;
const axios = require('axios');
const keccak256 = require('keccak256');
const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider(require('./../config').RSK_NODE));
web3.transactionConfirmationBlocks = 1;

const VALUE_TO_DISPENSE = require('./../config').VALUE_TO_DISPENSE;
const API_URL = require('./../config.json').API_URL;
const randomAddress = num =>
  '0x' +
  keccak256(num)
    .toString('hex')
    .substring(0, 40);

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
      it('should only dispense the first time, respond 200 and then respond 204', async () => {
        const dispenseAddress = randomAddress(2);
        const firstResponse = await axios.post(API_URL + '/dispense', {
          dispenseAddress
        });
        const secondResponse = await axios.post(API_URL + '/dispense', {
          dispenseAddress
        });
        const thirdResponse = await axios.post(API_URL + '/dispense', {
          dispenseAddress
        });

        assert.equal(200, firstResponse.status);
        assert.ok(firstResponse.data.txHash);

        assert.equal(secondResponse.status, 204);
        assert.equal(thirdResponse.status, 204);
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
        const expectedBalance = Number(balance) + Number(web3.utils.toWei((0.1).toString(), 'ether'));

        assert.equal(currentBalance, expectedBalance);
      }));
  });
});
