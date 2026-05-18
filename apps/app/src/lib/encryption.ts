/**
 * AES-256-GCM Encryption/Decryption using Web Crypto API.
 * Compatible with Edge Runtime (Cloudflare Workers, Vercel Edge).
 */

const ALGORITHM = "AES-GCM";
const IV_LENGTH = 12;
const TAG_LENGTH = 16; // 128 bits

function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getEncryptionKey(hexKey: string): Promise<CryptoKey> {
  const keyData = hexToUint8Array(hexKey);
  return crypto.subtle.importKey(
    "raw",
    keyData.buffer as ArrayBuffer,
    { name: ALGORITHM },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a string using AES-256-GCM.
 * Requires ENCRYPTION_KEY in .env (32 bytes / 64 hex chars).
 */
export async function encrypt(text: string): Promise<string> {
  const hexKey = process.env.ENCRYPTION_KEY;
  if (!hexKey || hexKey.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes).");
  }

  const key = await getEncryptionKey(hexKey);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encodedText = new TextEncoder().encode(text);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv.buffer as ArrayBuffer, tagLength: TAG_LENGTH * 8 },
    key,
    encodedText
  );

  const encryptedArray = new Uint8Array(encryptedBuffer);
  
  const ivHex = uint8ArrayToHex(iv);
  const dataHex = uint8ArrayToHex(encryptedArray);
  
  return `${ivHex}:${dataHex}`;
}

/**
 * Decrypts a string encrypted with the above encrypt function.
 */
export async function decrypt(hash: string): Promise<string> {
  const hexKey = process.env.ENCRYPTION_KEY;
  if (!hexKey || hexKey.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes).");
  }

  const parts = hash.split(":");
  let ivHex: string, dataHex: string;

  if (parts.length === 3) {
    // Old format: iv:tag:encrypted
    const [ivH, tagH, encH] = parts;
    ivHex = ivH;
    dataHex = encH + tagH; // Append tag to the end for Web Crypto
  } else if (parts.length === 2) {
    // New format: iv:data(encrypted+tag)
    [ivHex, dataHex] = parts;
  } else {
    throw new Error("Invalid encrypted format.");
  }

  const key = await getEncryptionKey(hexKey);
  const iv = hexToUint8Array(ivHex);
  const data = hexToUint8Array(dataHex);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: iv.buffer as ArrayBuffer, tagLength: TAG_LENGTH * 8 },
    key,
    data.buffer as ArrayBuffer
  );

  return new TextDecoder().decode(decryptedBuffer);
}
