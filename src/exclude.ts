import { readFile, readdir, stat } from "fs/promises";
import path from "path";

const exclude = [
  ".env",
  ".git/**",
  "node_modules/**",
  "yarn.lock",
  ".yarn/**",
  ".zkcloudworker/**",
  ".silvana/**",
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
];

export async function getExcludeList(sourceDir: string): Promise<string[]> {
  const gitignoreList: string[] = [];
  try {
    // Function to read .gitignore file and parse its contents
    const readGitignore = async (filePath: string): Promise<string[]> => {
      try {
        const content = await readFile(filePath, "utf8");
        return content
          .split("\n")
          .map((line: string) => line.trim())
          .filter((line: string) => line && !line.startsWith("#"));
      } catch (error) {
        return [];
      }
    };

    // Function to check if a path should be excluded based on exclude list
    const shouldExclude = (
      itemPath: string,
      excludePatterns: string[]
    ): boolean => {
      const relativePath = path.relative(sourceDir, itemPath);
      return excludePatterns.some((pattern) => {
        if (pattern.endsWith("/**")) {
          const dirPattern = pattern.slice(0, -3);
          return (
            relativePath === dirPattern ||
            relativePath.startsWith(dirPattern + "/")
          );
        }
        return relativePath === pattern;
      });
    };

    // Function to recursively browse directories and collect .gitignore entries
    const browseDirectories = async (
      dir: string,
      excludePatterns: string[]
    ): Promise<string[]> => {
      let gitignoreEntries: string[] = [];

      try {
        // Check for .gitignore in current directory
        const gitignorePath = path.join(dir, ".gitignore");
        try {
          const gitignoreStats = await stat(gitignorePath);
          if (gitignoreStats.isFile()) {
            const entries = await readGitignore(gitignorePath);
            // Convert relative paths in .gitignore to paths relative to sourceDir
            const relativeDirToSource = path.relative(sourceDir, dir);
            const prefix = relativeDirToSource ? relativeDirToSource + "/" : "";
            gitignoreEntries.push(...entries.map((entry) => prefix + entry));
          }
        } catch (error) {
          // .gitignore doesn't exist, continue
        }

        // Read directory contents
        const items = await readdir(dir, { withFileTypes: true });

        // Process subdirectories
        for (const item of items) {
          if (item.isDirectory()) {
            const itemPath = path.join(dir, item.name);

            // Skip if this directory should be excluded
            if (shouldExclude(itemPath, excludePatterns)) {
              continue;
            }

            // Recursively browse subdirectory
            const subEntries = await browseDirectories(
              itemPath,
              excludePatterns
            );
            gitignoreEntries.push(...subEntries);
          }
        }

        return gitignoreEntries;
      } catch (error) {
        return gitignoreEntries;
      }
    };
    gitignoreList.push(...(await browseDirectories(sourceDir, exclude)));
  } catch (error: any) {
    console.error("Error processing .gitignore files:", error.message);
  }
  return [...exclude, ...gitignoreList];
}
