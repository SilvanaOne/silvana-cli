"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zip = zip;
const fs_1 = require("fs");
const archiver_1 = __importDefault(require("archiver"));
const files_1 = require("./files");
const debug_1 = require("./debug");
const chalk_1 = __importDefault(require("chalk"));
async function zip(repo, exclude) {
    try {
        const sourceDir = (0, files_1.rootFolder)();
        const zipFileName = (0, files_1.folder)() + `${repo}.zip`;
        if (await (0, files_1.isExist)(zipFileName)) {
            if ((0, debug_1.debug)())
                console.log(`Removing existing zip file: ${zipFileName}`);
            await fs_1.promises.unlink(zipFileName);
        }
        const output = (0, fs_1.createWriteStream)(zipFileName, { encoding: "binary" });
        const archive = (0, archiver_1.default)("zip", {
            zlib: { level: 9 },
        });
        const streamFinished = new Promise((resolve, reject) => {
            output.on("close", () => resolve());
            output.on("error", (err) => reject(err));
        });
        archive.pipe(output);
        archive.glob("**/*", {
            cwd: sourceDir,
            ignore: [
                ".git/**",
                "node_modules/**",
                "yarn.lock",
                ".yarn/**",
                ".zkcloudworker/**",
                "dist/**",
                "test/**",
                "tests/**",
                "cache/**",
                "packages/*/cache/**",
                "packages/*/node_modules/**",
                "packages/*/dist/**",
                "packages/*/.next/**",
                "packages/*/build/**",
                "packages/*/data/**",
                "packages/*/.env",
                "packages/*/pnp.cjs",
                "packages/*/.pnp.loader.mjs",
                "packages/*/.yarn/**",
                "packages/*/.vscode/**",
                "packages/*/.DS_Store",
                "pnp.cjs",
                ".pnp.loader.mjs",
                ".vscode/**",
                ".DS_Store",
                ...exclude,
                ...exclude.map((e) => e + "/**"),
            ],
            dot: true,
        });
        await new Promise((resolve, reject) => {
            output.on("close", () => resolve());
            output.on("error", (err) => reject(err));
            archive.finalize();
        });
        await streamFinished;
        return zipFileName;
    }
    catch (e) {
        console.error(chalk_1.default.red(`Error zipping ${repo}`), e);
        return undefined;
    }
}
