#! /usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.program = void 0;
const commander_1 = require("commander");
const config_1 = require("./config");
const deploy_1 = require("./deploy");
const verify_1 = require("./verify");
const package_json_1 = require("../package.json");
const watch_1 = require("./watch");
exports.program = new commander_1.Command();
exports.program
    .name("Silvana")
    .description("Silvana zkProver CLI tool")
    .version(package_json_1.version)
    .option("-v, --verbose", "verbose mode, print all logs")
    .option("-f, --folder <folder>", "folder with repo")
    .option("-r, --repo <repo>", "repo name")
    .option("-d, --developer <developer>", "developer name")
    .option("-m, --manager <pm>", "package manager: yarn | npm")
    .option("-b, --build <build>", "build script")
    .option("-j, --jwt <jwt>", "JWT token");
exports.program
    .command("deploy")
    .description("deploy the repo to the cloud")
    .option("-p, --protect", "protect the deployment from changes")
    .option("-e, --exclude [names...]", "exclude files and folders from deployment")
    .action(async (options) => {
    console.time("deployed");
    await (0, deploy_1.deploy)(options);
    console.timeEnd("deployed");
});
exports.program
    .command("verify")
    .description("verify the contract of the repo")
    .option("-e, --exclude [names...]", "exclude files and folders from deployment")
    .action(async (options) => {
    console.time("verified");
    await (0, verify_1.verify)(options);
    console.timeEnd("verified");
});
exports.program
    .command("watch")
    .description("watch the job events for the repo")
    .action(async () => {
    console.time("deployed");
    await (0, watch_1.watch)();
    console.timeEnd("deployed");
});
exports.program
    .command("config")
    .description("save default configuration")
    .action(async (options) => {
    console.log(`Saving default configuration...`);
    await (0, config_1.writeConfig)(exports.program.opts() ?? {});
});
//TODO: add the unprotect command after JWT format upgrade
async function main() {
    console.log(`Silvana zkProver CLI tool v${package_json_1.version} (c) Silvana 2025 www.silvana.one\n`);
    await exports.program.parseAsync();
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
