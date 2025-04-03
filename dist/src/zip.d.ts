export declare function zip(repo: string, exclude: string[]): Promise<{
    zipFileName: string;
    env: string | undefined;
} | undefined>;
