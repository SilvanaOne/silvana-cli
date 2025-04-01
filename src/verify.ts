import { createDirectories, loadBinary } from "./files";
import { options } from "./options";
import { zip } from "./zip";
import { upload } from "./upload";
import { install } from "./install";
import { debug } from "./debug";
import chalk from "chalk";
import fs from "fs/promises";

const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function verify(params: {
  protect?: boolean;
  exclude?: string[];
}) {
  const { protect, exclude } = params;
  const { repo, developer, version, JWT, packageManager } = await options();
  console.log(`Verifying the contract...`, {
    developer,
    repo,
    version,
    packageManager,
    ...params,
  });

  if (JWT === undefined) {
    console.error(chalk.red(`Error:`) + ` JWT must be provided`);
    process.exit(1);
  }

  console.log("Creating zip file...");
  await createDirectories();
  const zipFileName = await zip(repo, exclude ?? []);
  if (!zipFileName) {
    console.error(chalk.red("Error creating zip file"));
    return;
  }
  if (debug()) console.log("Zip file created:", zipFileName);

  const stat = await fs.stat(zipFileName);
  const size = stat.size;
  if (debug()) console.log("Zip file size:", size.toLocaleString(), "bytes");
  if (size > MAX_FILE_SIZE) {
    console.error(
      chalk.red(`Error:`) +
        ` zip file is too big: ${(stat.size / 1024 / 1024).toFixed(
          2
        )} MB, maximum allowed size is ${MAX_FILE_SIZE_MB} MB)`
    );
    return;
  }
  console.log("Uploading zip file to zkCloudWorker's cloud storage...");
  const data = await loadBinary(zipFileName);
  if (!data) {
    console.error(chalk.red("Error reading zip file"));
    return;
  }
  await upload({
    data,
    mimeType: "application/zip",
    developer,
    repo,
    version,
    JWT,
  });

  await install({
    JWT,
    repo,
    developer,
    version,
    size,
    packageManager,
    protect: protect ?? false,
    verify: true,
  });
}
