"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.silvanaRequest = silvanaRequest;
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
async function silvanaRequest(params) {
    try {
        const { command, task, transactions, args, metadata, mode, jobId, repo, developer, JWT, includeLogs, } = params;
        const apiData = {
            auth: "M6t4jtbBAFFXhLERHQWyEB9JA9xi4cWqmYduaCXtbrFjb7yaY7TyaXDunKDJNiUTBEcyUomNXJgC",
            command: command,
            jwtToken: JWT,
            data: {
                task,
                transactions: transactions ?? [],
                args,
                repo,
                developer,
                metadata,
                mode: mode ?? "sync",
                jobId,
                includeLogs,
            },
            chain: `devnet`,
        };
        const endpoint = "https://api.zkcloudworker.com/v1/devnet";
        const response = await axios_1.default.post(endpoint, apiData);
        return response.data;
    }
    catch (error) {
        console.error(chalk_1.default.red("Error while sending request to Silvana zkProver:"), error?.message ?? error?.data ?? error);
        process.exit(1);
    }
}
