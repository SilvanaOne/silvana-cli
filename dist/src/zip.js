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
const exclude_1 = require("./exclude");
const encrypt_1 = require("./encrypt");
const publicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmB+DYQ7I+K5wxHyyDfS62ftuepFp47bHMCyvbW6zRQ5FrS0ylPgzirfNqOn3o3L0Cw4ydCzOI2H+6PJI1h/XO0TGpwbYabHhJKfw7kQyAOBix/eMpg+JMu/rjcuIYzmBs5t97ydkC66+dCAIIFdmmqwTJK2rEs2rIiyCsQ16uxFm30ds8sqkq9Pcd3oCyW0ey4j+68pDqFcbgXmHKVk4Mc1N744b+Ebx1pgSNvxTCzylZf3eXYZhl39NfsanSbTGpN4Q9+vzVKOi2pXLgLDAzVmml66wbrWnutqEEpTrK3eZPcvbCnrGOVXUMpUQ1DM2aaIua/9CQhhV7QbPO0h8YQIDAQAB";
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
                ...(await (0, exclude_1.getExcludeList)(sourceDir)),
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
        // Read .env file if it exists
        let env = undefined;
        try {
            const envPath = `${sourceDir}.env`;
            if (await (0, files_1.isExist)(envPath)) {
                if ((0, debug_1.debug)())
                    console.log(`Reading .env file: ${envPath}`);
                env = await fs_1.promises.readFile(envPath, "utf8");
            }
        }
        catch (error) {
            console.error(chalk_1.default.yellow(`Warning: Could not read .env file to transfer it to Silvana zkProver environment`), error.message);
        }
        return {
            zipFileName,
            env: env ? (0, encrypt_1.encryptWithPublicKey)({ text: env, publicKey }) : undefined,
        };
    }
    catch (e) {
        console.error(chalk_1.default.red(`Error zipping ${repo}`), e);
        return undefined;
    }
}
