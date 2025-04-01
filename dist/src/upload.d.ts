export declare function upload(params: {
    data: Buffer;
    mimeType: string | undefined;
    developer: string;
    repo: string;
    version: string;
    JWT: string;
}): Promise<void>;
