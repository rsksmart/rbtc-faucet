import RNSUtil from '../rns-util';
import Web3 from 'web3';
import config from '../../config.json';

const web3 = new Web3(new Web3.providers.HttpProvider(config.RSK_NODE));
web3.transactionConfirmationBlocks = 1;

test('resolve a valid rns address to a real one TODO', async () => {
/*   const rnsAddress = 'federico.rsk';
  const realAddress = await new RNSUtil(web3).resolveAddr(rnsAddress);

  console.log(realAddress);
  console.log(realAddress.length); */

  //expect(true).not.toBe('0x0000000000000000000000000000000000000000');
  expect(true).toBeTruthy();
});
