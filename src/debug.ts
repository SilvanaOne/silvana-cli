import { program } from "./cli";

export function debug(): boolean {
  return program.opts().verbose ?? false;
}
