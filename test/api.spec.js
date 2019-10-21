const assert = require('chai').assert;
const axios = require('axios');

const TEST_ADDRESS = require('./../config').TEST_ADDRESS;
const API_URL = 'http://localhost:3000/api';

describe('Faucet API', () => {
    describe('/dispense', () => {
        describe('# dispensing to a new address', () =>
            it('> should respond 200 and a txHash', async () => {
                const endPoint = API_URL + '/dispense';

                const res = await axios.post(endPoint, {
                    address: TEST_ADDRESS
                })
                assert.ok(res.status == 200);  
            })
        )
    })    
})