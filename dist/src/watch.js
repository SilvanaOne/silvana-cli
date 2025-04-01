"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watch = watch;
const nats_1 = require("nats");
const options_1 = require("./options");
async function watch() {
    const endpoint = "http://cloud.zkcloudworker.com:4222";
    const { repo, developer, version, JWT, packageManager } = await (0, options_1.options)();
    const jobKeys = [`zkcloudworker.job.${clean(developer)}.${clean(repo)}`];
    await watchJobStatuses(endpoint, jobKeys).catch(console.error);
}
async function watchJobStatuses(endpoint, jobKeys) {
    const nc = await (0, nats_1.connect)({ servers: endpoint });
    const js = nc.jetstream();
    const kv = await js.views.kv("profiles");
    // Function to watch the status of a single job
    async function watchJobStatus(jobId) {
        let historyJob = true;
        const iterJob = await kv.watch({
            key: `zkcloudworker.jobStatus.${jobId}`,
            initializedFn: () => {
                historyJob = false;
            },
        });
        for await (const e of iterJob) {
            const jobStatus = JSON.parse(e.string());
            console.log(`${historyJob ? "History" : "Updated"} ${e.key} @ ${e.revision} -> `, jobStatus);
            if (jobStatus.status === "finished" || jobStatus.status === "failed") {
                break;
            }
        }
    }
    // Function to watch multiple job statuses concurrently
    async function watchMultipleJobs(key) {
        let history = true;
        const iter = await kv.watch({
            key,
            initializedFn: () => {
                history = false;
            },
        });
        for await (const e of iter) {
            const job = JSON.parse(e.string());
            console.log(`${history ? "History" : "Updated"} ${e.key} @ ${e.revision} -> `, job);
            // Start watching the jobStatus of the current job
            watchJobStatus(job.jobId);
        }
    }
    // Watch all jobs concurrently
    await Promise.all(jobKeys.map((key) => watchMultipleJobs(key)));
    await nc.drain();
}
function clean(input) {
    // Define the allowed characters based on the regular expression
    const allowedChars = /^[-/=.\w]+$/;
    // Filter the input string to include only the allowed characters
    const filtered = input
        .split("")
        .filter((char) => allowedChars.test(char))
        .join("");
    return filtered;
}
