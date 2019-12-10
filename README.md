# RBTC Faucet

## Description

Faucet to dispense test RBTC for RSK Testnet.

## Architecture

![diagram](./diagrams/stack.png)

## Setup -config.json variables

There are 3 differents environments, production, development and testing, each one has a specific -config.json file 

- Production: `prod-config.json`
- Development: `dev-config.json`
- Testing: `test-config.json`

Please check `-config.json` and fill them with right values.

```json
{
  "RSK_NODE": "NODE_URL", 
  "API_URL": "API_FETCH_URL",
  "NEW_CAPTCHA_URL": "http://rust-captcha.com/new/easy/5/998",
  "SOLVE_CAPTCHA_URL": "http://rust-captcha.com:8080/solution/",
  "CAPTCHA_API_URL": "http://rust-captcha.com:8080",
  "FAUCET_ADDRESS": "ADDRESS",
  "FAUCET_PRIVATE_KEY": "PRIVATE_KEY",
  "GAS_PRICE": 60000000,
  "GAS_LIMIT": 800000,
  "VALUE_TO_DISPENSE": 0.001,
  "TAG_MANAGER_ID": "GTM-XXXXXXX"
}
```

**NEW_CAPTCHA_URL** is the URL where you're gonna request a new captcha, **SOLVE_CAPTCHA_URL** is for checking the solution and **CAPTCHA_API_URL** is where the captcha-api is hosted, to get more info please read [this README](https://github.com/rsksmart/rust-captcha/blob/master/README.md).

## Running development environment

First install depenecies

```bash
yarn
```

Then run app 

```bash
yarn dev
```

## Production deploy

Checkout Next.js [tutorial](https://nextjs.org/learn/basics/deploying-a-nextjs-app/deploying-to-your-own-environment) or [docs](https://nextjs.org/docs#production-deployment)

## Docker 

This project has been dockerized 

First build the image

```bash
docker build -t rbtc-faucet .
```

Then run

```bash
docker run -d --name rbtc-faucet -p 3000:3000 rbtc-faucet
```

## Linting

There it's a script in order to lint using [prettier](https://prettier.io/) the whole project, just run

```bash
yarn lint
```

You can setup linting options at `.prettierrc`