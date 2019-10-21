const assert = require('chai').assert;
const axios = require('axios');
const keccak256 = require('keccak256');

const API_URL = require('./../config.json').API_URL;

describe('Faucet API', () => {
    describe('/dispense', () => {
        const randomAddress = num => '0x' + keccak256(num).toString('hex').substring(0, 40)

        describe('# dispensing to a new address', () =>
            it('> should respond 200 and a txHash', async () => {
                const address = randomAddress(1);
                const res = await axios.post(API_URL + '/dispense', { address })

                assert.equal(res.status, 200); 
                assert.ok(res.data.transactionHash); 
            })
        );

        describe('# dispensing more than one time to an address', () => 
            it('should only dispense the first time and then respond 204', async () => {
                const address = randomAddress(2);
                const firstResponse = await axios.post(API_URL + '/dispense', { address });
                const secondResponse = await axios.post(API_URL + '/dispense', { address });
                const thirdResponse = await axios.post(API_URL + '/dispense', { address });

                assert.equal(200, firstResponse.status); 
                assert.ok(firstResponse.data.transactionHash); 
                
                assert.equal(secondResponse.status, 204);
                assert.equal(thirdResponse.status, 204);
            })
        );

        describe('# dispensing to an invalid address', () => 
            it('shouldn\'t dispense anything', async () => {                
                try {
                    await axios.post(API_URL + '/dispense', { address: '0x0' });
                } catch(e) {
                    return assert.equal(e.response.status, 409); 
                }
            })
        );
    });
})