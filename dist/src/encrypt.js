"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKeyPair = generateKeyPair;
exports.encryptWithPublicKey = encryptWithPublicKey;
exports.decryptWithPrivateKey = decryptWithPrivateKey;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generates a new RSA key pair
 * @returns An object containing the private and public keys in PEM format
 */
function generateKeyPair() {
    const { privateKey: pemPrivateKey, publicKey: pemPublicKey } = crypto_1.default.generateKeyPairSync("rsa", {
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
function encryptWithPublicKey(params) {
    const { text, publicKey } = params;
    const buffer = Buffer.from(text, "utf8");
    // Reconstruct the PEM format by adding the header and footer
    const pemPublicKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
    const encrypted = crypto_1.default.publicEncrypt({
        key: pemPublicKey,
        padding: crypto_1.default.constants.RSA_PKCS1_OAEP_PADDING,
    }, buffer);
    return encrypted.toString("base64");
}
/**
 * Decrypts a string using a private key
 * @param encryptedText The encrypted string in base64 format
 * @param privateKey The private key in PEM format
 * @returns The decrypted string
 */
function decryptWithPrivateKey(params) {
    const { encryptedText, privateKey } = params;
    const buffer = Buffer.from(encryptedText, "base64");
    // Reconstruct the PEM format by adding the header and footer
    const pemPrivateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
    const decrypted = crypto_1.default.privateDecrypt({
        key: pemPrivateKey,
        padding: crypto_1.default.constants.RSA_PKCS1_OAEP_PADDING,
    }, buffer);
    return decrypted.toString("utf8");
}
