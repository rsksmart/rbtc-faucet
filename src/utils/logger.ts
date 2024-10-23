import chalk from 'chalk';
import { TxParameters } from '../types/types';

const logger = {
  info: (info: any): void => console.log('[ ' + chalk.cyan.dim('info') + ' ] ' + info),
  warning: (warn: any): void => console.log('[ ' + chalk.yellow('warning') + ' ] ' + warn),
  error: (error: any): void => console.log('[ ' + chalk.red('error') + ' ] ' + error),
  success: (success: any): void => console.log('[ ' + chalk.green('success') + ' ] ' + success),
  event: (event: any): void => console.log('[ ' + chalk.magenta('event') + ' ] ' + event),
  txParameters: (txParameters: TxParameters): void => {
    logger.info('from ' + txParameters.from);
    logger.info('to ' + txParameters.to);
    logger.info('nonce ' + txParameters.nonce);
    logger.info('gasPrice ' + txParameters.gasPrice);
    logger.info('gas ' + txParameters.gas);
    logger.info('value ' + txParameters.value);
  },
  dispensed: (dispenseAddress: string, txHash: string) => {
    logger.success('dispensed to ' + dispenseAddress);
    logger.success('tx hash ' + txHash);
  },
  sendSignedTransactionError: (e: Error): void => {
    logger.error('something went wrong sending signed transaction');
    logger.error(e);
  }
};

export default logger;
