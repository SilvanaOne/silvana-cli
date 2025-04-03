"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExcludeList = getExcludeList;
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
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
async function getExcludeList(sourceDir) {
    const gitignoreList = [];
    try {
        // Function to read .gitignore file and parse its contents
        const readGitignore = async (filePath) => {
            try {
                const content = await (0, promises_1.readFile)(filePath, "utf8");
                return content
                    .split("\n")
                    .map((line) => line.trim())
                    .filter((line) => line && !line.startsWith("#"));
            }
            catch (error) {
                return [];
            }
        };
        // Function to check if a path should be excluded based on exclude list
        const shouldExclude = (itemPath, excludePatterns) => {
            const relativePath = path_1.default.relative(sourceDir, itemPath);
            return excludePatterns.some((pattern) => {
                if (pattern.endsWith("/**")) {
                    const dirPattern = pattern.slice(0, -3);
                    return (relativePath === dirPattern ||
                        relativePath.startsWith(dirPattern + "/"));
                }
                return relativePath === pattern;
            });
        };
        // Function to recursively browse directories and collect .gitignore entries
        const browseDirectories = async (dir, excludePatterns) => {
            let gitignoreEntries = [];
            try {
                // Check for .gitignore in current directory
                const gitignorePath = path_1.default.join(dir, ".gitignore");
                try {
                    const gitignoreStats = await (0, promises_1.stat)(gitignorePath);
                    if (gitignoreStats.isFile()) {
                        const entries = await readGitignore(gitignorePath);
                        // Convert relative paths in .gitignore to paths relative to sourceDir
                        const relativeDirToSource = path_1.default.relative(sourceDir, dir);
                        const prefix = relativeDirToSource ? relativeDirToSource + "/" : "";
                        gitignoreEntries.push(...entries.map((entry) => prefix + entry));
                    }
                }
                catch (error) {
                    // .gitignore doesn't exist, continue
                }
                // Read directory contents
                const items = await (0, promises_1.readdir)(dir, { withFileTypes: true });
                // Process subdirectories
                for (const item of items) {
                    if (item.isDirectory()) {
                        const itemPath = path_1.default.join(dir, item.name);
                        // Skip if this directory should be excluded
                        if (shouldExclude(itemPath, excludePatterns)) {
                            continue;
                        }
                        // Recursively browse subdirectory
                        const subEntries = await browseDirectories(itemPath, excludePatterns);
                        gitignoreEntries.push(...subEntries);
                    }
                }
                return gitignoreEntries;
            }
            catch (error) {
                return gitignoreEntries;
            }
        };
        gitignoreList.push(...(await browseDirectories(sourceDir, exclude)));
    }
    catch (error) {
        console.error("Error processing .gitignore files:", error.message);
    }
    return [...exclude, ...gitignoreList];
}
