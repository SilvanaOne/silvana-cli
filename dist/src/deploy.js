"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploy = deploy;
const files_1 = require("./files");
const options_1 = require("./options");
const zip_1 = require("./zip");
const upload_1 = require("./upload");
const install_1 = require("./install");
const debug_1 = require("./debug");
const chalk_1 = __importDefault(require("chalk"));
const promises_1 = __importDefault(require("fs/promises"));
const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
async function deploy(params) {
    const { protect, exclude, dry = false } = params;
    const { repo, developer, version, JWT, packageManager, build } = await (0, options_1.options)();
    console.log(`Deploying the repo to the cloud...`, {
        developer,
        repo,
        version,
        packageManager,
        build: params.build ?? build,
        ...params,
    });
    if (JWT === undefined) {
        console.error(chalk_1.default.red(`Error:`) + ` JWT must be provided to protect the repo`);
        process.exit(1);
    }
    console.log("Creating zip file...");
    await (0, files_1.createDirectories)();
    const zipResult = await (0, zip_1.zip)(repo, exclude ?? []);
    if (!zipResult) {
        console.error(chalk_1.default.red("Error creating zip file"));
        return;
    }
    const { zipFileName, env } = zipResult;
    if ((0, debug_1.debug)())
        console.log("Zip file created:", zipFileName);
    const stat = await promises_1.default.stat(zipFileName);
    const size = stat.size;
    if ((0, debug_1.debug)())
        console.log("Zip file size:", size.toLocaleString(), "bytes");
    if (size > MAX_FILE_SIZE) {
        console.error(chalk_1.default.red(`Error:`) +
            ` zip file is too big: ${(stat.size / 1024 / 1024).toFixed(2)} MB, maximum allowed size is ${MAX_FILE_SIZE_MB} MB)`);
        return;
    }
    if (dry) {
        console.log("Dry run completed. No changes were made.");
        return;
    }
    console.log("Uploading zip file to Silvana zkProver cloud storage...");
    const data = await (0, files_1.loadBinary)(zipFileName);
    if (!data) {
        console.error(chalk_1.default.red("Error reading zip file"));
        return;
    }
    await (0, upload_1.upload)({
        data,
        mimeType: "application/zip",
        developer,
        repo,
        version,
        JWT,
    });
    await (0, install_1.install)({
        JWT,
        repo,
        developer,
        version,
        size,
        packageManager,
        protect: protect ?? false,
        build: params.build ?? build,
        env,
    });
}
