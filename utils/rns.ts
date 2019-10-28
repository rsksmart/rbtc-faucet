import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";
import { Resolver } from "@rnsdomains/rns-sdk-js";
const namehash = require('eth-ens-namehash');



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
const resolverAbiList: AbiItem[] = [
    {
        "constant": true,
        "inputs": [{
            "name": "interfaceID",
            "type": "bytes4"
        }],
        "name": "supportsInterface",
        "outputs": [{
            "name": "",
            "type": "bool"
        }
        ],
        "payable": false,
        "stateMutability": "pure",
        "type": "function"
    },
    {
      "constant": true,
      "inputs": [
      {
          "name": "node",
          "type": "bytes32"
      }
      ],
      "name": "addr",
      "outputs": [
      {
          "name": "",
          "type": "address"
      }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  }
]

const defaultRegistryAddress = '0xeff983147ae97758c04f65ac7dee7c7cacf48ba2';

class RNS {

    registry: Contract;
    web3: Web3;

    constructor(registryAddres: string = defaultRegistryAddress, web3: Web3) {
        this.registry = new web3.eth.Contract(registryAbi, registryAddres);
        this.web3 = web3;
    }

    /* async resolver(rnsAddress: string): Resolver {
        const hash: string = this.nameHash(rnsAddress);
        
        return new Resolver(this.web3.currentProvider, hash, resolverAbiList);
    } */

    nameHash(rnsAddress: string): string {
        return namehash.hash(rnsAddress);
    }

    async resolveAddr(rnsAddress: string): Promise<string> {
        const hash = this.nameHash(rnsAddress);
        const resolverAddr = await this.registry.methods.resolver(hash).call();
        const resolver = new this.web3.eth.Contract(resolverAbiList, resolverAddr);
        if(!await resolver.methods.supportsInterface('0x3b3b57de').call())
            throw 'No address resolution found';
        
        return resolver.methods.addr(hash).call();   
    }

    isRNS(address: string): boolean {
        const labels = address.split('.');
        
        return labels[labels.length - 1] === 'rsk';
    }
}