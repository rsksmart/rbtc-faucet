## Debugging with VS Code

In order to debug with VS Code debugger, setup you *`.vscode/launch.json`* like this

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