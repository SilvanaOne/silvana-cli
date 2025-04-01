import { zkCloudWorkerRequest } from "./api";
import { sleep } from "./sleep";
import { debug } from "./debug";
import chalk from "chalk";

export async function install(params: {
  JWT: string;
  repo: string;
  developer: string;
  version: string;
  size: number;
  protect: boolean;
  packageManager: string;
  verify?: boolean;
}) {
  const {
    JWT,
    repo,
    developer,
    version,
    size,
    packageManager,
    protect,
    verify,
  } = params;

  const command = verify === true ? "verify" : "deploy";
  const task = verify === true ? "verification" : "deployment";
  let answer = await zkCloudWorkerRequest({
    command,
    developer,
    repo,
    task: command,
    args: JSON.stringify({ packageManager, version, size, protect }, null, 2),
    metadata: `${command} ${repo} v. ${version} by ${developer} using ${packageManager} package manager`,
    mode: "async",
    JWT,
  });
  if (debug()) console.log(`deploy api call result:`, answer);
  const jobId = answer.jobId;
  console.log(`Installing repo, this may take a few minutes...`);
  let result: string | undefined = undefined;
  const allLogs: string[] = [];
  const printedLogs: string[] = [];

  function print(logs: string[]) {
    allLogs.push(...logs);
    logs.forEach((log) => {
      if (printedLogs.includes(log) === false) {
        printedLogs.push(log);
        // replace all occurrences of "error" with red color
        const text = log.replace(/error/gi, (matched) => chalk.red(matched));
        console.log(text);
      }
    });
  }
  let printLogs = debug();
  let isAllLogsFetchedFlag = false;

  while (
    (result === undefined && answer.jobStatus !== "failed") ||
    isAllLogsFetchedFlag === false
  ) {
    await sleep(5000);
    answer = await zkCloudWorkerRequest({
      command: "jobResult",
      jobId,
      includeLogs: printLogs,
      JWT,
    });
    //console.log("answer", answer);
    result = answer.result;
    isAllLogsFetchedFlag = (answer.isFullLog ?? false) || isAllLogsFetchedFlag;

    if (
      printLogs &&
      answer?.logs !== undefined &&
      answer?.logs !== null &&
      Array.isArray(answer.logs) === true
    )
      print(answer.logs);

    if (
      answer.jobStatus === "failed" ||
      (answer.result !== undefined &&
        result !== "deployed" &&
        result !== "verified")
    ) {
      printLogs = true;
    } else if (
      answer.jobStatus === "finished" &&
      (result === "deployed" || result === "verified")
    ) {
      isAllLogsFetchedFlag = debug() === false;
    }
  }
  if (result !== "deployed" && result !== "verified") {
    console.log(
      chalk.red(`ERROR: ${task} failed`) +
        (result !== undefined ? `: ${result}` : "")
    );
    process.exit(1);
  } else {
    console.log(chalk.green(`SUCCESS: ${task} completed`));
  }
}
