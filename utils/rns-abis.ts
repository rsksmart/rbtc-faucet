import { AbiItem } from 'web3-utils';

export const resolverAbiList: AbiItem[] = [
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

export const registryAbi: AbiItem = {
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
