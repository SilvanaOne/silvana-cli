import fs from "fs/promises";
import { debug } from "./debug";
import { program } from "./cli";

export function folder(): string {
  let rootFolder = program.opts().folder ?? "./";
  if (rootFolder.endsWith("/") === false) rootFolder += "/";
  return rootFolder + ".zkcloudworker/";
}

export function rootFolder(): string {
  let rootFolder = program.opts().folder ?? "./";
  if (rootFolder.endsWith("/") === false) rootFolder += "/";
  return rootFolder;
}

export type FileEncoding = "text" | "binary";

export async function write(params: {
  data: object;
  filename: string;
  allowRewrite?: boolean;
}): Promise<string | undefined> {
  const { data, filename, allowRewrite } = params;

  const name = folder() + filename + ".json";
  try {
    await createDirectories();
    if (debug())
      console.log("Writing file", {
        data,
        filename,
        allowRewrite,
      });

    if (!allowRewrite && (await isExist(name))) {
      console.error(`File ${name} already exists`);
      return;
    }
    await backup(filename);

    await fs.writeFile(name, JSON.stringify(data, null, 2));
    return name;
  } catch (e) {
    console.error(`Error writing file ${name}`);
    return undefined;
  }
}

export async function load(filename: string) {
  const name = folder() + filename + ".json";
  try {
    const filedata = await fs.readFile(name, "utf8");
    const data = JSON.parse(filedata);
    return data;
  } catch (e) {
    console.error(`File ${name} does not exist or has wrong format`);
    return undefined;
  }
}

export async function loadPackageJson() {
  const name = rootFolder() + "package.json";
  try {
    const filedata = await fs.readFile(name, "utf8");
    const data = JSON.parse(filedata);
    return data;
  } catch (e) {
    console.error(`File ${name} does not exist or has wrong format`);
    return undefined;
  }
}

export async function isFileExist(filename: string): Promise<boolean> {
  const name = folder() + filename + ".json";
  try {
    if (debug())
      console.log("isFileExist", {
        filename,
        name,
      });

    if (await isExist(name)) return true;
    else return false;
  } catch (e) {
    console.error(`Error checking file ${name}`);
    return false;
  }
}

export async function loadBinary(filename: string) {
  try {
    return await fs.readFile(filename);
  } catch (e) {
    console.error(`Cannot read file ${filename}`, e);
    return undefined;
  }
}

export async function loadText(filename: string) {
  try {
    return await fs.readFile(filename, "utf8");
  } catch (e) {
    console.error(`Cannot read file ${filename}`, e);
    return undefined;
  }
}

export async function saveBinary(params: { data: Buffer; filename: string }) {
  const { data, filename } = params;
  try {
    await fs.writeFile(filename, data, "binary");
  } catch (e) {
    console.error(`Error writing file ${filename}`, e);
  }
}

export async function saveText(params: { data: string; filename: string }) {
  const { data, filename } = params;
  try {
    await fs.writeFile(filename, data, "utf8");
  } catch (e) {
    console.error(`Error writing file ${filename}`, e);
  }
}

export async function isExist(name: string): Promise<boolean> {
  // check if file exists
  try {
    await fs.access(name);
    return true;
  } catch (e) {
    // if not, return
    return false;
  }
}

async function backup(filename: string) {
  const name = folder() + filename + ".json";

  const backupName =
    folder() + "backup/" + filename + "." + getFormattedDateTime() + ".json";
  // check if file exists
  try {
    await fs.access(name);
  } catch (e) {
    // if not, return
    return;
  }
  // copy file to backup
  await fs.copyFile(name, backupName);
}

export async function createDirectories() {
  // check if data directory exists
  try {
    await fs.access(folder());
  } catch (e) {
    // if not, create it
    await fs.mkdir(folder());
  }
  // check if data directory exists
  try {
    await fs.access(folder() + "backup");
  } catch (e) {
    // if not, create it
    await fs.mkdir(folder() + "backup");
  }
}

function getFormattedDateTime(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");

  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  return `${year}.${month}.${day}-${hours}.${minutes}.${seconds}`;
}
