import { createWriteStream, promises as fs } from "fs";
import archiver from "archiver";
import { folder, rootFolder, isExist } from "./files";
import { debug } from "./debug";
import chalk from "chalk";

export async function zip(
  repo: string,
  exclude: string[]
): Promise<string | undefined> {
  try {
    const sourceDir = rootFolder();
    const zipFileName = folder() + `${repo}.zip`;

    if (await isExist(zipFileName)) {
      if (debug()) console.log(`Removing existing zip file: ${zipFileName}`);
      await fs.unlink(zipFileName);
    }

    const output = createWriteStream(zipFileName, { encoding: "binary" });
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    const streamFinished = new Promise<void>((resolve, reject) => {
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

    await new Promise<void>((resolve, reject) => {
      output.on("close", () => resolve());
      output.on("error", (err) => reject(err));
      archive.finalize();
    });

    await streamFinished;
    return zipFileName;
  } catch (e) {
    console.error(chalk.red(`Error zipping ${repo}`), e);
    return undefined;
  }
}
