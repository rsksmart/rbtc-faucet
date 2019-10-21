const assert = require('chai').assert;
const axios = require('axios');

const API_URL = require('./../config.json').API_URL;
const TEST_ADDRESS = "0xC74114b9E84F4c6c7f9c58cA087D38c5212D39bC";

describe('Faucet API', () => {
    describe('/dispense', () => {
        beforeEach(() => {
            //reset store
        })
        describe('# dispensing to a new address', () =>
            it('> should respond 200 and a txHash', async () => {
                const res = await axios.post(API_URL + '/dispense', { address: TEST_ADDRESS })

                assert.equal(res.status, 200); 
                assert.ok(res.data.transactionHash); 
            })
        );
    })    
})