'use server'
import { headers } from 'next/headers';
import AddressUtil from '../../utils/address-util';
import Web3 from 'web3';
import { CaptchaSolutionRequest, CaptchaSolutionResponse, DispenseResponse, FaucetHistory, TxParameters } from '@/types/types';
import { DispenseLogFields, hexValueToRbtc, logDispense, logFaucetError, logFaucetEvent } from '@/utils/logger';
import CaptchaSolver from '@/utils/captcha-solver';
import ValidationStatus from '@/model/validation-status';
import { CronJob } from 'cron';
import FrontendText from '@/utils/frontend-text';
import {
  alreadyDispensed,
  captchaRejected,
  insuficientFunds,
  invalidAddress,
  parseValidationOutcome,
  receiverBalanceExceeded,
  ValidationError,
  ValidationOutcome,
} from '@/utils/validations';
import TxParametersGenerator from '@/utils/tx-parameters-generator';
import { loadFaucetHistory, saveFaucetHistory } from '@/app/lib/faucetHistory';
import { isValidChecksumAddress } from '@rsksmart/rsk-utils';
import { getServerEnv } from '@/constants';

const serverEnv = getServerEnv();

interface IData {
  address: string
  captcha: CaptchaSolutionRequest,
  promoCode: string | undefined
  isMainnetRns: boolean
}

//Job
new CronJob(
  '00 00 12 * * 0-6',
  () => {
    //This job will begin when the first user calls dispense api
    //Runs every day at 12:00:00 AM. == 00:00:00 HS
    try {
      const faucetHistory = {};
      saveFaucetHistory(faucetHistory);
      logFaucetEvent('faucet_history.reset', { status: 'success' });
    } catch (err) {
      logFaucetError('faucet_history.reset', err, { status: 'failure' });
    }
  },
  () => {
    logFaucetEvent('faucet_history.reset_job_stopped');
  },
  true /* Start the job right now */,
  'America/Los_Angeles' /* Time zone of this job. */
);
const web3: Web3 = new Web3(new Web3.providers.HttpProvider(serverEnv.RSK_NODE));
const addressUtil = new AddressUtil();
const captchaSolver = new CaptchaSolver();
const frontendText = new FrontendText();
const TESTNET_CHAIN_ID = 31;

export async function dispense(data: IData) {
  const startedAt = Date.now();
  const faucetHistory: FaucetHistory = loadFaucetHistory();
  const { address, captcha, promoCode, isMainnetRns } = data;

  const headersList = await headers();
  const ip: string = headersList.get('x-forwarded-for') || headersList.get('x-user-ip') as string || 'unknown';
  const faucetBalance: number = Number(await web3.eth.getBalance(serverEnv.FAUCET_ADDRESS));
  const rnsDomain = address.includes('.rsk') ? address : undefined;

  const logOutcome = (
    fields: Omit<DispenseLogFields, 'event' | 'ip' | 'promoCode' | 'isMainnetRns' | 'rnsDomain' | 'to' | 'durationMs'> & { to?: string }
  ) => {
    const { to: toAddress, ...rest } = fields;
    logDispense({
      event: 'dispense',
      ip,
      promoCode: promoCode || undefined,
      isMainnetRns,
      rnsDomain,
      durationMs: Date.now() - startedAt,
      to: toAddress ?? address,
      ...rest,
    });
  };

  try {

    const dispenseAddress: string = await addressUtil.retriveAddressFromFrontend(address, isMainnetRns);
    const captchaSolutionRequest: CaptchaSolutionRequest = captcha;

    const captchaSolutionResponse: CaptchaSolutionResponse = await captchaSolver.solve(captchaSolutionRequest);
    const captchaVerified = captchaSolutionResponse.success;

    const recipientBalanceWei =
      serverEnv.FILTER_BY_BALANCE && !promoCode
        ? BigInt(await web3.eth.getBalance(dispenseAddress))
        : BigInt(0);

    //Validations
    //each validation will return an error message, if it success it'll return an empty string (empty error message)
    const validationStatus: ValidationStatus = runValidations(
      captchaSolutionResponse,
      dispenseAddress,
      address,
      faucetBalance,
      recipientBalanceWei,
      ip,
      promoCode,
      faucetHistory,
      isMainnetRns
    );

    if (!validationStatus.valid()) {
      logOutcome({
        status: 'validation_failed',
        to: dispenseAddress,
        captchaVerified,
        errorMessages: validationStatus.logCodes,
      });

      const data: DispenseResponse = {
        title: 'Error',
        text: frontendText.invalidTransaction(validationStatus.userMessages),
        type: 'error',
      };
      filterAddresses(dispenseAddress, ip, promoCode);

      return data
    } else {
      const fee = await estimationFee(dispenseAddress);
      const txParametersGenerator = new TxParametersGenerator();
      const txParameters: TxParameters = await txParametersGenerator.generate(dispenseAddress, web3, fee, promoCode);
      const valueRbtc = hexValueToRbtc(txParameters.value);

      const account = web3.eth.accounts.privateKeyToAccount('0x' + serverEnv.FAUCET_PRIVATE_KEY);
      web3.eth.accounts.wallet.add(account);
      const signedTx = await web3.eth.accounts.signTransaction(
        {
          to: txParameters.to,
          value: parseInt(txParameters.value, 16),
          gas: txParameters.gas,
          gasPrice: txParameters.gasPrice,
          nonce: await web3.eth.getTransactionCount(serverEnv.FAUCET_ADDRESS, 'pending'),
          chainId: TESTNET_CHAIN_ID
        },
        account.privateKey
      );

      const txHash = signedTx.transactionHash;
      if(!txHash || !signedTx.rawTransaction) {
        logOutcome({
          status: 'failure',
          to: dispenseAddress,
          from: txParameters.from,
          valueRbtc,
          captchaVerified,
          errorMessages: ['transaction_signing_failed'],
        });
        const data: DispenseResponse = {
          title: 'Error',
          text: 'We could not prepare your transaction. Please try again in a few minutes.',
          type: 'error',
          resetCaptcha: true
        };
        filterAddresses(dispenseAddress, ip, promoCode);
        return data;
      }

      try {
        const currentAddress = faucetHistory[dispenseAddress];
        currentAddress.loading = true;
        await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        currentAddress.mint = true;
        currentAddress.loading = false;
        faucetHistory[dispenseAddress] = currentAddress;
        saveFaucetHistory(faucetHistory);

        logOutcome({
          status: 'success',
          to: dispenseAddress,
          from: txParameters.from,
          valueRbtc,
          txHash,
          captchaVerified,
        });

        const data: DispenseResponse = {
          txHash,
          title: 'Sent',
          type: 'success',
          text: frontendText.dispense(dispenseAddress, txHash),
          dispenseComplete: true,
          checksumed: isValidChecksumAddress(dispenseAddress, TESTNET_CHAIN_ID)
        };

        return data
      } catch (error) {
        filterAddresses(dispenseAddress, ip, promoCode);
        logOutcome({
          status: 'failure',
          to: dispenseAddress,
          from: txParameters.from,
          valueRbtc,
          txHash,
          captchaVerified,
          err: error,
          errorMessages: ['transaction_broadcast_failed'],
        });

        const data: DispenseResponse = {
          title: 'Error',
          text: await frontendText.failedTransaction(txHash, web3),
          type: 'error',
          resetCaptcha: true
        };

        return data;
      }
    }
  } catch (e) {
    logOutcome({
      status: 'error',
      err: e,
    });

    const data: DispenseResponse = {
      title: 'Error',
      text: 'An unexpected error occurred. Please try again in a few minutes.',
      type: 'error',
      resetCaptcha: true
    };
    filterAddresses(address, ip, promoCode);
    return data;
  }

}

const runValidations = (
  captchaSolutionResponse: CaptchaSolutionResponse,
  dispenseAddress: string,
  inputAddress: string,
  faucetBalance: number,
  recipientBalanceWei: bigint,
  ip: string,
  promoCode: string | undefined,
  faucetHistory: FaucetHistory,
  isMainnetRns: boolean
): ValidationStatus => {
  const validations: (() => ValidationOutcome)[] = [
    () => captchaRejected(captchaSolutionResponse),
    () => alreadyDispensed(dispenseAddress, ip, faucetHistory, promoCode),
    () => invalidAddress(dispenseAddress, inputAddress, isMainnetRns),
    () => receiverBalanceExceeded(recipientBalanceWei, promoCode),
    () => insuficientFunds(faucetBalance)
  ];
  const errors = validations
    .map((validate) => parseValidationOutcome(validate()))
    .filter((error): error is ValidationError => error !== null);

  return new ValidationStatus(errors);
}

async function filterAddresses(dispenseAddress: string, ip:string, promoCode: string | undefined) {
  const faucetHistory = await loadFaucetHistory();
  const isFilterByIP = promoCode ? false : serverEnv.FILTER_BY_IP;
  const key = Object.keys(faucetHistory).find((key) => {
    const historyEntry = faucetHistory[key];
    return (historyEntry.ip === ip && isFilterByIP) || historyEntry.address === dispenseAddress
  });
  const adddress = key ? faucetHistory[key!] : null;
  if (!adddress?.mint && !adddress?.loading) delete faucetHistory[dispenseAddress]
  saveFaucetHistory(faucetHistory);
}

export async function estimationFee(dispenseAddress:string) {
  const VALUE_TO_DISPENSE = serverEnv.VALUE_TO_DISPENSE;
  const value = web3.utils.toWei(VALUE_TO_DISPENSE.toString(), 'ether');
  const gasEstimate = await web3.eth.estimateGas({
    from: serverEnv.FAUCET_ADDRESS,
    to: dispenseAddress,
    data: '',
    value: value
  });
  const gasPrice = await web3.eth.getGasPrice();
  const estimatedCost = BigInt(gasEstimate) * BigInt(gasPrice);
  return estimatedCost || BigInt(0);
}

