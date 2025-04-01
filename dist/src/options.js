"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = options;
const cli_1 = require("./cli");
const files_1 = require("./files");
const config_1 = require("./config");
const debug_1 = require("./debug");
async function options() {
    if ((0, debug_1.debug)())
        console.log("Options:", cli_1.program.opts());
    const defaultConfig = (await (0, config_1.getConfig)()) ?? {};
    const folder = (0, files_1.rootFolder)();
    const packageJsonFilename = `${folder}/package.json`;
    if (!(0, files_1.isExist)(packageJsonFilename)) {
        console.error(`File ${packageJsonFilename} does not exist`);
        process.exit(1);
    }
    const packageJSON = await (0, files_1.loadPackageJson)();
    if (!packageJSON) {
        console.error(`package.json file is not found`);
        process.exit(1);
    }
    if ((0, debug_1.debug)())
        console.log("package.json:", {
            name: packageJSON.name,
            author: packageJSON.author,
            packageManager: packageJSON.packageManager,
        });
    const repo = cli_1.program.opts().repo ?? packageJSON.name ?? defaultConfig.repo;
    if (!repo) {
        console.error(`Repo name is not provided`);
        process.exit(1);
    }
    const developer = cli_1.program.opts().developer ?? packageJSON.author ?? defaultConfig.developer;
    if (!developer) {
        console.error(`Developer name is not provided`);
        process.exit(1);
    }
    const build = packageJSON.scripts?.["build:agent"];
    if (build && typeof build !== "string") {
        console.error(`Build script build:agent should be a string`);
        process.exit(1);
    }
    const version = packageJSON.version ?? "0.1.0";
    const JWT = cli_1.program.opts().jwt ?? defaultConfig.jwt;
    if (!JWT) {
        console.error(`JWT is not provided`);
        process.exit(1);
    }
    let packageManager = cli_1.program.opts().pm;
    if (!packageManager &&
        packageJSON.packageManager !== undefined &&
        typeof packageJSON.packageManager == `string`) {
        packageManager = packageJSON.packageManager.split("@")[0];
    }
    if (!packageManager)
        packageManager = defaultConfig.packageManager;
    if (!packageManager)
        packageManager = "npm";
    const result = { developer, repo, version, JWT, packageManager, build };
    if ((0, debug_1.debug)())
        console.log("options used:", result);
    return result;
}
