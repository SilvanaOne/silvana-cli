import axios from "axios";
import chalk from "chalk";

export async function silvanaRequest(params: {
  command: string;
  task?: string;
  transactions?: string[];
  args?: string;
  metadata?: string;
  mode?: string;
  jobId?: string;
  repo?: string;
  developer?: string;
  JWT: string;
  includeLogs?: boolean;
}) {
  try {
    const {
      command,
      task,
      transactions,
      args,
      metadata,
      mode,
      jobId,
      repo,
      developer,
      JWT,
      includeLogs,
    } = params;
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

    const response = await axios.post(endpoint, apiData);
    return response.data;
  } catch (error: any) {
    console.error(
      chalk.red("Error while sending request to Silvana zkProver:"),
      error?.message ?? error?.data ?? error
    );
    process.exit(1);
  }
}
