/**
 * Generates a new RSA key pair
 * @returns An object containing the private and public keys in PEM format
 */
export declare function generateKeyPair(): {
    privateKey: string;
    publicKey: string;
};
/**
 * Encrypts a string using a public key
 * @param text The string to encrypt
 * @param publicKey The public key in PEM format
 * @returns The encrypted data as a base64 encoded string
 */
export declare function encryptWithPublicKey(params: {
    text: string;
    publicKey: string;
}): string;
/**
 * Decrypts a string using a private key
 * @param encryptedText The encrypted string in base64 format
 * @param privateKey The private key in PEM format
 * @returns The decrypted string
 */
export declare function decryptWithPrivateKey(params: {
    encryptedText: string;
    privateKey: string;
}): string;
