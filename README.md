# RBTC Faucet

## Description

Faucet to dispense test RBTC for RSK Testnet.

## Stack

*ARCHITECTURE-DIAGRAM*

## Running development environment

In order to run it you'll need to 

- Setup *config.json* variables
- Run rust-captcha service
- Run Next JS App


### Setup config.json variables

*TODO*

### Running rust captcha service

This app consumes from a captcha service, in order develop you'll need to run it locally.

It can be run in a docker container (recomended) or from sources. 

Please check [README.md](https://github.com/rootstock/rbtc-faucet/tree/master/captcha) at *captcha/*

Notice that this server is missing Access-Control-Allow-Origin headers, you can install [this](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=es) chrome extension to disable this check. 

### Running Next JS App

First install depenecies

```bash
# At root folder

yarn
```

```bash
# At captcha/docker

make run
```

Then run app 

```bash
# At root folder

yarn dev
```

## Debugging with VS Code

Next.js can be started in debug mode by using the `--inspect` flag like regular Node processes. Remember to start your `next` process with this flag, as VS Code otherwise won't be able to connect to your Node process and debug your server-side code. The following *launch.json* sets this flag for you, but if you start your Next process in different way, remember to add this flag.

In order to debug with VS Code debugger, setup you *.vscode/launch.json* like this

```js
// At .vscode/launch.json

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

Create a debug script at *package.json* and setup `NODE_OPTIONS` with `--inspect` flag.

```js
// At package.json

{
    "scripts": {
        "debug": "NODE_OPTIONS=--inspect next"
    }
}
```

To get detailed info, please go to [this](https://github.com/microsoft/vscode-recipes/tree/master/Next-js) site.