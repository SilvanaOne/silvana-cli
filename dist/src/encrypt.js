"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKeyPair = generateKeyPair;
exports.encryptWithPublicKey = encryptWithPublicKey;
exports.decryptWithPrivateKey = decryptWithPrivateKey;
exports.isValidPEMKey = isValidPEMKey;
const crypto = __importStar(require("crypto"));
/**
 * Generates a new RSA key pair
 * @returns An object containing the private and public keys in PEM format
 */
function generateKeyPair() {
    const { privateKey: pemPrivateKey, publicKey: pemPublicKey } = crypto.generateKeyPairSync("rsa", {
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
 * Encrypts text using a hybrid RSA-AES scheme
 * Uses AES-256-GCM for content encryption and RSA for key encryption
 */
function encryptWithPublicKey({ text, publicKey, }) {
    // Generate a random AES-256 key and IV
    const aesKey = crypto.randomBytes(32); // 256 bits
    const iv = crypto.randomBytes(16); // 128 bits
    // Create PEM formatted public key
    const pemPublicKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
    // Encrypt the AES key with RSA
    const encryptedKey = crypto.publicEncrypt({
        key: pemPublicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    }, aesKey);
    // Encrypt the actual content with AES-256-GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", aesKey, iv);
    let encryptedContent = cipher.update(text, "utf8", "base64");
    encryptedContent += cipher.final("base64");
    const authTag = cipher.getAuthTag();
    // Combine all the encrypted data
    const encryptedData = {
        encryptedContent: encryptedContent,
        authTag: authTag.toString("base64"),
        encryptedKey: encryptedKey.toString("base64"),
        iv: iv.toString("base64"),
    };
    // Return JSON string of encrypted data
    return JSON.stringify(encryptedData);
}
/**
 * Decrypts text that was encrypted using encryptWithPublicKey
 * Requires the corresponding private key to the public key used for encryption
 */
function decryptWithPrivateKey({ encryptedData, privateKey, }) {
    try {
        // Parse the encrypted data
        const parsedData = JSON.parse(encryptedData);
        // Create PEM formatted private key
        const pemPrivateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
        // Decrypt the AES key using RSA
        const aesKey = crypto.privateDecrypt({
            key: pemPrivateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        }, Buffer.from(parsedData.encryptedKey, "base64"));
        // Decrypt the content using AES-256-GCM
        const decipher = crypto.createDecipheriv("aes-256-gcm", aesKey, Buffer.from(parsedData.iv, "base64"));
        decipher.setAuthTag(Buffer.from(parsedData.authTag, "base64"));
        let decrypted = decipher.update(parsedData.encryptedContent, "base64", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }
    catch (error) {
        throw new Error(`Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}
/**
 * Validates that a string is a valid PEM formatted key
 */
function isValidPEMKey(key, type) {
    try {
        const header = type === "public" ? "PUBLIC" : "PRIVATE";
        const pemKey = `-----BEGIN ${header} KEY-----\n${key}\n-----END ${header} KEY-----`;
        // Attempt to create a key object - this will throw if invalid
        crypto.createPublicKey(pemKey);
        return true;
    }
    catch {
        return false;
    }
}
