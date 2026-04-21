import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts a string using AES-256-GCM.
 * Requires ENCRYPTION_KEY in .env (32 bytes / 64 hex chars).
 */
export function encrypt(text: string): string {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length !== 64) {
        throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes).");
    }

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, Buffer.from(key, "hex"), iv);

    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Format: iv:tag:encrypted (all hex)
    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts a string encrypted with the above encrypt function.
 */
export function decrypt(hash: string): string {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length !== 64) {
        throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes).");
    }

    const [ivHex, tagHex, encryptedHex] = hash.split(":");
    if (!ivHex || !tagHex || !encryptedHex) {
        throw new Error("Invalid encrypted format.");
    }

    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");

    const decipher = createDecipheriv(ALGORITHM, Buffer.from(key, "hex"), iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
}
