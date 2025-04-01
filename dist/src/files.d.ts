export declare function folder(): string;
export declare function rootFolder(): string;
export type FileEncoding = "text" | "binary";
export declare function write(params: {
    data: object;
    filename: string;
    allowRewrite?: boolean;
}): Promise<string | undefined>;
export declare function load(filename: string): Promise<any>;
export declare function loadPackageJson(): Promise<any>;
export declare function isFileExist(filename: string): Promise<boolean>;
export declare function loadBinary(filename: string): Promise<Buffer<ArrayBufferLike> | undefined>;
export declare function loadText(filename: string): Promise<string | undefined>;
export declare function saveBinary(params: {
    data: Buffer;
    filename: string;
}): Promise<void>;
export declare function saveText(params: {
    data: string;
    filename: string;
}): Promise<void>;
export declare function isExist(name: string): Promise<boolean>;
export declare function createDirectories(): Promise<void>;
