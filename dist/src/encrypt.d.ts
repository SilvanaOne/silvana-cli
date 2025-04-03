interface EncryptionInput {
    text: string;
    publicKey: string;
}
interface DecryptionInput {
    encryptedData: string;
    privateKey: string;
}
/**
 * Generates a new RSA key pair
 * @returns An object containing the private and public keys in PEM format
 */
export declare function generateKeyPair(): {
    privateKey: string;
    publicKey: string;
};
/**
 * Encrypts text using a hybrid RSA-AES scheme
 * Uses AES-256-GCM for content encryption and RSA for key encryption
 */
export declare function encryptWithPublicKey({ text, publicKey, }: EncryptionInput): string;
/**
 * Decrypts text that was encrypted using encryptWithPublicKey
 * Requires the corresponding private key to the public key used for encryption
 */
export declare function decryptWithPrivateKey({ encryptedData, privateKey, }: DecryptionInput): string;
/**
 * Validates that a string is a valid PEM formatted key
 */
export declare function isValidPEMKey(key: string, type: "public" | "private"): boolean;
export {};
