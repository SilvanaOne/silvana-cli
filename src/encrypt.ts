import crypto from "crypto";

/**
 * Generates a new RSA key pair
 * @returns An object containing the private and public keys in PEM format
 */
export function generateKeyPair(): { privateKey: string; publicKey: string } {
  const { privateKey: pemPrivateKey, publicKey: pemPublicKey } =
    crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

  // Extract just the base64 content from the PEM format
  const privateKey = pemPrivateKey
    .replace("-----BEGIN PRIVATE KEY-----\n", "")
    .replace("\n-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");
  const publicKey = pemPublicKey
    .replace("-----BEGIN PUBLIC KEY-----\n", "")
    .replace("\n-----END PUBLIC KEY-----", "")
    .replace(/\n/g, "");

  return { privateKey, publicKey };
}

/**
 * Encrypts a string using a public key
 * @param text The string to encrypt
 * @param publicKey The public key in PEM format
 * @returns The encrypted data as a base64 encoded string
 */
export function encryptWithPublicKey(params: {
  text: string;
  publicKey: string;
}): string {
  const { text, publicKey } = params;
  const buffer = Buffer.from(text, "utf8");

  // Reconstruct the PEM format by adding the header and footer
  const pemPublicKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;

  const encrypted = crypto.publicEncrypt(
    {
      key: pemPublicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    buffer
  );

  return encrypted.toString("base64");
}

/**
 * Decrypts a string using a private key
 * @param encryptedText The encrypted string in base64 format
 * @param privateKey The private key in PEM format
 * @returns The decrypted string
 */
export function decryptWithPrivateKey(params: {
  encryptedText: string;
  privateKey: string;
}): string {
  const { encryptedText, privateKey } = params;
  const buffer = Buffer.from(encryptedText, "base64");

  // Reconstruct the PEM format by adding the header and footer
  const pemPrivateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;

  const decrypted = crypto.privateDecrypt(
    {
      key: pemPrivateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    buffer
  );

  return decrypted.toString("utf8");
}
