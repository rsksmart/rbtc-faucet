import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
const namehash = require('eth-ens-namehash');

class RNSUtil {
  registry: Contract;
  web3: Web3;

  constructor(web3: Web3, registryAddres: string = defaultRegistryAddress) {
    this.registry = new web3.eth.Contract([registryAbi], registryAddres);
    this.web3 = web3;
  }
  nameHash(rnsAddress: string): string {
    return namehash.hash(rnsAddress);
  }
  async resolveAddr(rnsAddress: string): Promise<string> {
    const nameHash = this.nameHash(rnsAddress);
    const resolverAddr = await this.resolverAddress(rnsAddress);

    if (resolverAddr == '0x0000000000000000000000000000000000000000' || resolverAddr == null)
      throw 'No address resolver';

    const resolver = new this.web3.eth.Contract(resolverAbiList, resolverAddr);
    if (!(await resolver.methods.supportsInterface('0x3b3b57de').call())) throw 'No address resolution found';

    const realAddr = await resolver.methods.addr(nameHash).call();

    return realAddr;
  }
  async resolverAddress(rnsAlias: string): Promise<string> {
    console.log('llego este name ' + rnsAlias);

    const hash = this.nameHash(rnsAlias);

    const resolverAddress = await this.registry.methods.resolver(hash).call();

    console.log(resolverAddress);

    return resolverAddress;
  }
  isRNS(address: string): boolean {
    const labels = address.split('.');

    return labels[labels.length - 1] === 'rsk';
  }
  async existingAlias(rnsAlias: string): Promise<boolean> {
    try {
      return (
        this.isRNS(rnsAlias) &&
        (await this.resolveAddr(rnsAlias)) != '0x0000000000000000000000000000000000000000' &&
        rnsAlias != undefined
      );
    } catch (e) {
      return false;
    }
  }
}

const registryAbi: AbiItem = {
  constant: true,
  inputs: [
    {
      name: 'node',
      type: 'bytes32'
    }
  ],
  name: 'resolver',
  outputs: [
    {
      name: '',
      type: 'address'
    }
  ],
  payable: false,
  stateMutability: 'view',
  type: 'function'
};
const defaultRegistryAddress = '0xeff983147ae97758c04f65ac7dee7c7cacf48ba2';
const resolverAbiList: AbiItem[] = [
  {
    constant: true,
    inputs: [
      {
        name: 'interfaceID',
        type: 'bytes4'
      }
    ],
    name: 'supportsInterface',
    outputs: [
      {
        name: '',
        type: 'bool'
      }
    ],
    payable: false,
    stateMutability: 'pure',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: 'node',
        type: 'bytes32'
      }
    ],
    name: 'addr',
    outputs: [
      {
        name: '',
        type: 'address'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  }
];

export default RNSUtil;
