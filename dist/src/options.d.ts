export declare function options(): Promise<{
    developer: string;
    repo: string;
    version: string;
    JWT: string;
    packageManager: string;
    build?: string;
}>;
