import { createWriteStream, promises as fs } from "fs";
import archiver from "archiver";
import { folder, rootFolder, isExist } from "./files";
import { debug } from "./debug";
import chalk from "chalk";
import { getExcludeList } from "./exclude";
import { encryptWithPublicKey } from "./encrypt";
const publicKey =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmB+DYQ7I+K5wxHyyDfS62ftuepFp47bHMCyvbW6zRQ5FrS0ylPgzirfNqOn3o3L0Cw4ydCzOI2H+6PJI1h/XO0TGpwbYabHhJKfw7kQyAOBix/eMpg+JMu/rjcuIYzmBs5t97ydkC66+dCAIIFdmmqwTJK2rEs2rIiyCsQ16uxFm30ds8sqkq9Pcd3oCyW0ey4j+68pDqFcbgXmHKVk4Mc1N744b+Ebx1pgSNvxTCzylZf3eXYZhl39NfsanSbTGpN4Q9+vzVKOi2pXLgLDAzVmml66wbrWnutqEEpTrK3eZPcvbCnrGOVXUMpUQ1DM2aaIua/9CQhhV7QbPO0h8YQIDAQAB";

export async function zip(
  repo: string,
  exclude: string[]
): Promise<{ zipFileName: string; env: string | undefined } | undefined> {
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
    const excludeList = await getExcludeList(sourceDir);

    archive.glob("**/*", {
      cwd: sourceDir,
      ignore: [...exclude, ...excludeList]
        .map((pattern) => {
          // Remove any existing /** suffix
          pattern = pattern.replace(/\/\*\*$/, "");
          // Remove double slashes
          pattern = pattern.replace(/\/\//g, "/");
          // If pattern doesn't end with /** or *, add /**
          if (!pattern.endsWith("/**") && !pattern.endsWith("*")) {
            pattern = pattern + "/**";
          }
          return pattern;
        })
        .filter((pattern) => !pattern.startsWith("!")), // Remove negation patterns

      dot: false,
    });

    await new Promise<void>((resolve, reject) => {
      output.on("close", () => resolve());
      output.on("error", (err) => reject(err));
      archive.finalize();
    });

    await streamFinished;

    // Read .env file if it exists
    let env: string | undefined = undefined;
    try {
      const envPath = `${sourceDir}.env`;
      if (await isExist(envPath)) {
        if (debug()) console.log(`Reading .env file: ${envPath}`);
        env = await fs.readFile(envPath, "utf8");
      }
    } catch (error: any) {
      console.error(
        chalk.yellow(
          `Warning: Could not read .env file to transfer it to Silvana zkProver environment`
        ),
        error.message
      );
    }
    return {
      zipFileName,
      env: env ? encryptWithPublicKey({ text: env, publicKey }) : undefined,
    };
  } catch (e) {
    console.error(chalk.red(`Error zipping ${repo}`), e);
    return undefined;
  }
}
