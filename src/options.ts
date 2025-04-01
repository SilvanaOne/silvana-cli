import { program } from "./cli";
import { rootFolder, isExist, loadPackageJson, load } from "./files";
import { getConfig } from "./config";
import { debug } from "./debug";

export async function options(): Promise<{
  developer: string;
  repo: string;
  version: string;
  JWT: string;
  packageManager: string;
  build?: string;
}> {
  if (debug()) console.log("Options:", program.opts());
  const defaultConfig: any = (await getConfig()) ?? {};
  const folder = rootFolder();
  const packageJsonFilename = `${folder}/package.json`;
  if (!isExist(packageJsonFilename)) {
    console.error(`File ${packageJsonFilename} does not exist`);
    process.exit(1);
  }
  const packageJSON = await loadPackageJson();

  if (!packageJSON) {
    console.error(`package.json file is not found`);
    process.exit(1);
  }
  if (debug())
    console.log("package.json:", {
      name: packageJSON.name,
      author: packageJSON.author,
      packageManager: packageJSON.packageManager,
    });
  const repo = program.opts().repo ?? packageJSON.name ?? defaultConfig.repo;
  if (!repo) {
    console.error(`Repo name is not provided`);
    process.exit(1);
  }
  const developer =
    program.opts().developer ?? packageJSON.author ?? defaultConfig.developer;
  if (!developer) {
    console.error(`Developer name is not provided`);
    process.exit(1);
  }
  const build = program.opts().build ?? packageJSON.scripts?.["build:agent"];
  if (build && typeof build !== "string") {
    console.error(`Build script build:agent should be a string`);
    process.exit(1);
  }

  const version = packageJSON.version ?? "0.1.0";

  const JWT = program.opts().jwt ?? defaultConfig.jwt;
  if (!JWT) {
    console.error(`JWT is not provided`);
    process.exit(1);
  }

  let packageManager = program.opts().pm;

  if (
    !packageManager &&
    packageJSON.packageManager !== undefined &&
    typeof packageJSON.packageManager == `string`
  ) {
    packageManager = (packageJSON.packageManager as string).split("@")[0];
  }
  if (!packageManager) packageManager = defaultConfig.packageManager;
  if (!packageManager) packageManager = "npm";

  const result = { developer, repo, version, JWT, packageManager, build };
  if (debug()) console.log("options used:", result);
  return result;
}
