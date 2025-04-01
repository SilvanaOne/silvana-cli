import { write, load, isFileExist } from "./files";
import { debug } from "./debug";
import chalk from "chalk";

export async function writeConfig(config: object): Promise<void> {
  if (debug()) console.log("Writing config:\n", config);
  try {
    await write({
      data: config,
      filename: "config",
      allowRewrite: true,
    });
    console.log(`New default configuration has been set`, config);
  } catch (e) {
    console.error(chalk.red("Error saving config"), e);
  }
}

export async function getConfig(): Promise<object | undefined> {
  try {
    if (!(await isFileExist("config"))) return undefined;
    const data = await load("config");
    if (debug()) console.log("config:", data);
    return data;
  } catch (e) {
    //console.error("Error reading config.json file:", e);
    return undefined;
  }
}
