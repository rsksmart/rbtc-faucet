# RBTC Faucet

## Description

Faucet to dispense test RBTC for RSK Testnet.

This is a NextJS app that interacts with the RSK blockchain and uses a captcha service. Therefore we can identify 3 actors

1. NextJS app
2. RSK Blockchain

## Setup -config.json variables

There are 3 differents environments, production, development and testing, each one has a specific -config.json file 

- Production: `prod-config.json`
- Development: `dev-config.json`
- Testing: `test-config.json`

Please check `-config.json` and fill them with right values.

```json
{
  "RSK_NODE": "NODE_URL", 
  "SOLVE_CAPTCHA_URL": "https://www.google.com/recaptcha/api/siteverify",
  "SECRET_VERIFY_CAPTCHA": "",
  "SITE_KEY_CAPTCHA": "",
  "FAUCET_ADDRESS": "ADDRESS",
  "FAUCET_PRIVATE_KEY": "PRIVATE_KEY",
  "GAS_PRICE": 60000000,
  "GAS_LIMIT": 800000,
  "VALUE_TO_DISPENSE": 0.0005,
  "PROMO_VALUE_TO_DISPENSE": 0.05,
  "TAG_MANAGER_ID": "GTM-XXXXXXX",
  "PROMO_CODE": []
}
```

In order to run a production version, please check if `prod-config.json` exists, if not create one with the configuration described previously.

- **RSK_NODE** is the URL where the node is running.
- **SOLVE_CAPTCHA_URL** is for checking the solution.
- **SECRET_VERIFY_CAPTCHA** secret for captcha validation.
- **SITE_KEY_CAPTCHA** verification key from the client.
- **TAG_MANAGER_ID** id for google service (this one shouldn't be changed).
- **PROMO_CODE** array of codes.

You need to create a [proyect](https://www.google.com/recaptcha/admin) in Google to get the site_key and captcha secret.

## Running development environment

### Node

This project requires node version 16

First install depenecies (use yarn)

```bash
npm install
```

Then run app 

```bash
npm run dev
```

You'll need a running blockchain in order to run this environment. To do this, you can run a local ganache and point it at _dev-config.json_, **RSK_NODE** variable.
Notice that you won't be able to get a real [explorer](https://explorer.testnet.rsk.co/) link because you're running a local blockchain instead of an RSK one!

There is no need to change VALUE_TO_DISPENSE, GAS_PRICE, GAS_LIMIT and TAG_MANAGER_ID.

## Promo Code
In order to use this functionality, you must add an array of objects like this:

```
{ "code": "ESP_01",  "activationDate": "2024-11-13", "expirationDate": "2024-11-14", "maxDispensableRBTC": 1 },
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

You can lint the whole project with [prettier](https://prettier.io/), just run

```bash
npm run lint
```

Setup linting options at `.prettierrc`