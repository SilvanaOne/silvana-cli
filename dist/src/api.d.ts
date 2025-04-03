export declare function silvanaRequest(params: {
    command: string;
    task?: string;
    transactions?: string[];
    args?: string;
    metadata?: string;
    mode?: string;
    jobId?: string;
    repo?: string;
    developer?: string;
    JWT: string;
    includeLogs?: boolean;
}): Promise<any>;
