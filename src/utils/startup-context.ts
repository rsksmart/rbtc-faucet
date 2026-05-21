import { version as appVersion } from '../../package.json';
import nextPkg from 'next/package.json';

function rpcHost(rpcUrl: string | undefined): string | undefined {
  if (!rpcUrl) return undefined;
  try {
    return new URL(rpcUrl).host;
  } catch {
    return 'invalid';
  }
}

export function getStartupContext() {
  const port = process.env.PORT ?? '3000';
  const hostname = process.env.HOSTNAME ?? '0.0.0.0';

  return {
    event: 'startup' as const,
    version: appVersion,
    nodeVersion: process.version,
    nextVersion: nextPkg.version,
    nodeEnv: process.env.NODE_ENV ?? 'development',
    runtime: process.env.NEXT_RUNTIME ?? 'nodejs',
    port: Number(port),
    hostname,
    listenUrl: `http://${hostname}:${port}`,
    logLevel: process.env.LOG_LEVEL ?? 'info',
    rskNodeHost: rpcHost(process.env.RSK_NODE),
    faucetAddress: process.env.FAUCET_ADDRESS,
    filterByIp: process.env.FILTER_BY_IP === 'true',
    timerLimitMs: Number(process.env.TIMER_LIMIT) || undefined,
    valueToDispense: Number(process.env.VALUE_TO_DISPENSE) || undefined,
    promoValueToDispense: Number(process.env.PROMO_VALUE_TO_DISPENSE) || undefined,
  };
}
