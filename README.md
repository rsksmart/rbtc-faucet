# RBTC Faucet

## Description

RBTC faucet to dispense test RBTC for RSK Testnet.

## Stack

ARCHITECTURE-DIAGRAM

## Running development environment

In order to run this environment you'll need to 

- Setup `config.json` variables
- Run rust-captcha service
- Run Next JS App


### Setup config.json variables

### Running rust captcha service

Please check README.md at captcha/

### Running Next JS App

First install depenecies

```bash
yarn
```

Then run app 

```
yarn dev
```

## Debugging with VS Code

Next.js can be started in debug mode by using the `--inspect` flag like regular Node processes. Remember to start your `next` process with this flag, as VS Code otherwise won't be able to connect to your Node process and debug your server-side code. The following `launch.json` sets this flag for you, but if you start your Next process in different way, remember to add this flag.

In order to debug with VS Code debugger, setup you `.vscode/launch.json` like this

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Next: Node",
            "runtimeExecutable": "npm",
            "runtimeArgs": [
                "run-script",
                "debug"
            ],
            "port": 9229,
            "console": "integratedTerminal"
        }
    ]
}
```

Create a debug script at package.json and setup `NODE_OPTIONS` with `--inspect` flag.

```json
{
    "scripts": {
        "debug": "NODE_OPTIONS=--inspect next"
    }
}
```