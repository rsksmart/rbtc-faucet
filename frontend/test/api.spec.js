const assert = require('chai').assert;
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

describe('API TEST', () => {
    describe('/dispense', () => {
        describe('# sending a request', () =>
            it('> should respond', async () => {
                console.log(API_URL + '/dispense');
                const res = await axios.post(API_URL + '/dispense', {address: ''})
                assert.ok(res.status == 200 || res.status == 400 || res.status == 204)
            })
        )
    })    
})