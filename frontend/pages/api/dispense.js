import store from '../../store/root-store';
import Web3Util from '../../utils/web3-util';
import config from '../../config.json'

const handleDispense = (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    const address = req.data.address;


    if(!store.faucetHistory[address]) {
        dispense(address)
            .on('transactionHash', txHash => {
                store.saveDispensedAddress({address, txHash})
                res.status(200).json({ transactionHash: txHash })
            })
            .on('error', e => res.status(400).json({ error: e }))
    } else
        res.status(204).end() //if its already dispensed
}

const dispense = address => {
    const web3Util = new Web3Util({rskNode: config.rskNode});

    const txParameters = {
        nonce: web3Util.nonceForAddress(address),
        gasPrice: config.gasPrice,
        gas: gas,
        value: config.valueToDispense,
        to: address
    }

    return web3Util.sendSignedTransaction(txParameters);
}

export default handleDispense;