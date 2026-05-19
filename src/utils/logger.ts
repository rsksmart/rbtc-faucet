import pino from 'pino';
import Web3 from 'web3';

export type DispenseStatus = 'success' | 'failure' | 'validation_failed' | 'error';

export interface DispenseLogFields {
  event: 'dispense';
  status: DispenseStatus;
  ip: string;
  to: string;
  from?: string;
  valueRbtc?: string;
  promoCode?: string;
  txHash?: string;
  captchaVerified?: boolean;
  errorMessages?: string[];
  durationMs?: number;
  isMainnetRns?: boolean;
  rnsDomain?: string;
  err?: unknown;
}

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label: string) => ({ level: label }),
  },
  base: {
    service: 'rbtc-faucet',
  },
  serializers: {
    err: pino.stdSerializers.err,
  },
});

export function hexValueToRbtc(hexValue: string): string {
  return Web3.utils.fromWei(BigInt(hexValue).toString(), 'ether');
}

export function logDispense(fields: DispenseLogFields): void {
  const { status, err, ...rest } = fields;
  const level = status === 'success' ? 'info' : status === 'validation_failed' ? 'warn' : 'error';
  logger[level]({ ...rest, status, ...(err !== undefined ? { err } : {}) }, 'dispense');
}

export function logFaucetEvent(
  event: string,
  fields: Record<string, unknown> = {},
  message?: string
): void {
  logger.info({ event, ...fields }, message ?? event);
}

export function logFaucetError(
  event: string,
  err: unknown,
  fields: Record<string, unknown> = {}
): void {
  logger.error({ event, err, ...fields }, event);
}

export default logger;
