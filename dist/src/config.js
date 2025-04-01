"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeConfig = writeConfig;
exports.getConfig = getConfig;
const files_1 = require("./files");
const debug_1 = require("./debug");
const chalk_1 = __importDefault(require("chalk"));
async function writeConfig(config) {
    if ((0, debug_1.debug)())
        console.log("Writing config:\n", config);
    try {
        await (0, files_1.write)({
            data: config,
            filename: "config",
            allowRewrite: true,
        });
        console.log(`New default configuration has been set`, config);
    }
    catch (e) {
        console.error(chalk_1.default.red("Error saving config"), e);
    }
}
async function getConfig() {
    try {
        if (!(await (0, files_1.isFileExist)("config")))
            return undefined;
        const data = await (0, files_1.load)("config");
        if ((0, debug_1.debug)())
            console.log("config:", data);
        return data;
    }
    catch (e) {
        //console.error("Error reading config.json file:", e);
        return undefined;
    }
}
