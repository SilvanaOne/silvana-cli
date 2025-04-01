# silvana-cli

Silvana zkProver CLI tool

## Installation

```sh
npm install -g silvana-cli
```

To confirm successful installation:

```sh
silvana --version
```

### Updating the Silvana zkProver CLI

```sh
npm update -g silvana-cli
```

## Deploying the repo

Make sure that you have the author and name fields set correctly in package.json and run

```sh
silvana deploy
```

or, to see the logs:

```sh
silvana deploy -v
```

You can see now your agent on https://silvascan.io/testnet/agents

The package should have at the root directory index.ts file that exports the zkcloudworker function:

```typescript
// index.ts at the package root directory
import { Cloud, zkCloudWorker } from "@silvana-one/prover";
import { initBlockchain } from "@silvana-one/mina-utils";
import { initializeBindings } from "o1js";
import { MyWorker } from "./src/worker";

export async function zkcloudworker(cloud: Cloud): Promise<zkCloudWorker> {
  await initializeBindings();
  await initBlockchain(cloud.chain);
  return new MyWorker(cloud);
}
```

and the directory in tsconfig.json for `tsc` compilation result should be `dist`:

```
"compilerOptions": {
    "outDir": "./dist"
}
```

## Getting help

```sh
silvana --help
```

```
Silvana zkProver CLI tool v0.1.0 (c) Silvana 2025 www.silvana.one

Usage: Silvana [options] [command]

Silvana zkProver CLI tool

Options:
  -V, --version                output the version number
  -v, --verbose                verbose mode, print all logs
  -f, --folder <folder>        folder with repo
  -r, --repo <repo>            repo name
  -d, --developer <developer>  developer name
  -m, --manager <pm>           package manager: yarn | npm
  -b, --build <build>          build script
  -j, --jwt <jwt>              JWT token
  -h, --help                   display help for command

Commands:
  deploy [options]             deploy the repo to the cloud
  verify [options]             verify the contract of the repo
  watch                        watch the job events for the repo
  config                       save default configuration
  help [command]               display help for command
```

## Development

You need to install node and git
and clone this repo

```
git clone https://github.com/silvanaone/silvana-cli
cd silvana-cli
touch yarn.lock
yarn
```

Running locally:

```
yarn cli
```
