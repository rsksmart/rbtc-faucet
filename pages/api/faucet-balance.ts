import Web3 from 'web3';
import { NextApiRequest, NextApiResponse } from 'next';
import { provider, faucetAddress } from '../../utils/env-util.js';

//Utils
const web3: Web3 = new Web3(provider());
web3.transactionConfirmationBlocks = 1;

//Request Handler
const handleFaucetBalance = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  res.setHeader('Content-Type', 'application/json');

  try {
    const balanceWei = await web3.eth.getBalance(faucetAddress());
    const balance = Number(web3.utils.fromWei(balanceWei, 'ether'));
    res.status(200).end(JSON.stringify({ balance }));
  } catch (e) {
    res.status(500).end();
  }
};

export default handleFaucetBalance;
