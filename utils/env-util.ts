import Web3 from "web3";
import config from '../config.json';

export function provider(): any {
    return new Web3.providers.HttpProvider(require('../config.json').RSK_NODE);
}

export function faucetAddress(): string {
    return config.FAUCET_ADDRESS;
}

export function faucetPrivateKey(): string {
    return config.FAUCET_PRIVATE_KEY;
}

export function apiUrl(): string {
    return config.API_URL;
}

export function newCaptchaUrl(): string {
    return config.NEW_CAPTCHA_URL;
}

export function solveCaptchaUrl(): string {
    return config.SOLVE_CAPTCHA_URL
}

export function captchaApiUrl(): string {
    return config.CAPTCHA_API_URL;
}

export function gasPrice(): number {
    return config.GAS_PRICE;
}

export function gasLimit(): number {
    return config.GAS_LIMIT;
}

export function valueToDispense(): number {
    return config.VALUE_TO_DISPENSE;
}