const assert = require('chai').assert;
const axios = require('axios');
const keccak256 = require('keccak256');

const API_URL = require('./../config.json').API_URL;

describe('Faucet API', () => {
    describe('/dispense', () => {
        const randomAddress = _ => '0x' + keccak256(Math.random() * Math.random()).toString('hex').substring(0, 40)

        describe('# dispensing to a new address', () =>
            it('> should respond 200 and a txHash', async () => {
                const res = await axios.post(API_URL + '/dispense', { address: randomAddress() })

                assert.equal(200, res.status); 
                assert.ok(res.data.transactionHash); 
            })
        );
    });
})