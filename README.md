# RBTC Faucet

## Description

Faucet to dispense test RBTC for RSK Testnet.

This is a NextJS app that interacts with the RSK blockchain and uses a captcha service. Therefore we can identify 3 actors

1. NextJS app
2. RSK Blockchain
3. Captcha service 

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
  "FAUCET_ADDRESS": "ADDRESS",
  "FAUCET_PRIVATE_KEY": "PRIVATE_KEY",
  "GAS_PRICE": 60000000,
  "GAS_LIMIT": 800000,
  "VALUE_TO_DISPENSE": 0.001,
  "TAG_MANAGER_ID": "GTM-XXXXXXX"
}
```

In order to run a production version, please check if `prod-config.json` exists, if not create one with the configuration described previously.

- **RSK_NODE** is the URL where the node is running.
- **API_URL** where the API is hosted.
- **NEW_CAPTCHA_URL** is the URL where you're gonna request a new captcha.
- **SOLVE_CAPTCHA_URL** is for checking the solution.
- **CAPTCHA_API_URL** is where the captcha-api is hosted. 
- **TAG_MANAGER_ID** id for google service (this one shouldn't be changed).

To get more about info the captcha service, please read [this README](https://github.com/rsksmart/rust-captcha/blob/master/README.md).

## Running development environment

First install depenecies (use yarn)

```bash
yarn
```

Then run app 

```bash
yarn dev
```

You'll need a running blockchain in order to run this environment. To do this, you can run a local ganache and point it at _dev-config.json_, **RSK_NODE** variable.
Notice that you won't be able to get a real [explorer](https://explorer.testnet.rsk.co/) link because you're running a local blockchain instead of an RSK one!

For this environment you can use a test captcha service with this config (at __dev-config.json__).

```json
  {
    "NEW_CAPTCHA_URL": "https://rust-captcha.herokuapp.com/new/easy/5/998",
    "SOLVE_CAPTCHA_URL": "https://rust-captcha.herokuapp.com/solution/",
    "CAPTCHA_API_URL": "https://rust-captcha.herokuapp.com"
  }
```

There is no need to change API_URL, VALUE_TO_DISPENSE, GAS_PRICE, GAS_LIMIT and TAG_MANAGER_ID.

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

You can lint the whole project with [prettier](https://prettier.io/), just run

```bash
yarn lint
```

Setup linting options at `.prettierrc`