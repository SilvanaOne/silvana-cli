"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.install = install;
const api_1 = require("./api");
const sleep_1 = require("./sleep");
const debug_1 = require("./debug");
const chalk_1 = __importDefault(require("chalk"));
async function install(params) {
    const { JWT, repo, developer, version, size, packageManager, protect, verify, build, env, } = params;
    const command = verify === true ? "verify" : "deploy";
    const task = verify === true ? "verification" : "deployment";
    let answer = await (0, api_1.silvanaRequest)({
        command,
        developer,
        repo,
        task: command,
        args: JSON.stringify({ packageManager, version, size, protect, build, env }, null, 2),
        metadata: `${command} ${repo} v. ${version} by ${developer} using ${packageManager} package manager`,
        mode: "async",
        JWT,
    });
    if ((0, debug_1.debug)())
        console.log(`deploy api call result:`, answer);
    const jobId = answer.jobId;
    console.log(`Installing repo, this may take a few minutes...`);
    let result = undefined;
    const allLogs = [];
    const printedLogs = [];
    function print(logs) {
        allLogs.push(...logs);
        logs.forEach((log) => {
            if (printedLogs.includes(log) === false) {
                printedLogs.push(log);
                // replace all occurrences of "error" with red color
                const text = log.replace(/error/gi, (matched) => chalk_1.default.red(matched));
                console.log(text);
            }
        });
    }
    let printLogs = (0, debug_1.debug)();
    let isAllLogsFetchedFlag = false;
    while ((result === undefined && answer.jobStatus !== "failed") ||
        isAllLogsFetchedFlag === false) {
        await (0, sleep_1.sleep)(5000);
        answer = await (0, api_1.silvanaRequest)({
            command: "jobResult",
            jobId,
            includeLogs: printLogs,
            JWT,
        });
        //console.log("answer", answer);
        result = answer.result;
        isAllLogsFetchedFlag = (answer.isFullLog ?? false) || isAllLogsFetchedFlag;
        if (printLogs &&
            answer?.logs !== undefined &&
            answer?.logs !== null &&
            Array.isArray(answer.logs) === true)
            print(answer.logs);
        if (answer.jobStatus === "failed" ||
            (answer.result !== undefined &&
                result !== "deployed" &&
                result !== "verified")) {
            printLogs = true;
        }
        else if (answer.jobStatus === "finished" &&
            (result === "deployed" || result === "verified")) {
            isAllLogsFetchedFlag = (0, debug_1.debug)() === false;
        }
    }
    if (result !== "deployed" && result !== "verified") {
        console.log(chalk_1.default.red(`ERROR: ${task} failed`) +
            (result !== undefined ? `: ${result}` : ""));
        process.exit(1);
    }
    else {
        console.log(chalk_1.default.green(`SUCCESS: ${task} completed`));
    }
}
