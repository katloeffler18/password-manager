/**
 * Encryption/decryption utilities using Web Crypto API
 */

// Configuration constants
const ALGORITHM = "AES-GCM";
const KDF = "PBKDF2";
const HASH = "SHA-256";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const ITERATIONS = 310_000;

// Check if Web Crypto API is available
function getCrypto() {
  if (!window.crypto?.subtle) {
    throw new Error("Web Crypto API is not available. Use HTTPS or localhost.");
  }

  return window.crypto;
}

// Convert byte array → base64 string
function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

// Convert base64 string → byte array
function base64ToBytes(base64) {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

// Convert JS object → Uint8Array for encryption
function encodeData(data) {
  return new TextEncoder().encode(JSON.stringify(data));
}

// Convert Uint8Array → JS object after decryption
function decodeData(bytes) {
  return JSON.parse(new TextDecoder().decode(bytes));
}

/*
 * Derives an AES-GCM encryption key from the user's login password.
 *
 * In this app, the login password functions as the vault master password.
 * The salt must be saved with the encrypted payload so the same key can be
 * derived again during decryption.
 */
export async function deriveKey(password, salt) {
  if (!password || typeof password !== "string") {
    throw new Error("Password is required for key derivation");
  }

  if (!(salt instanceof Uint8Array)) {
    throw new Error("Salt must be a Uint8Array");
  }

  if (salt.length === 0) {
    throw new Error("Salt cannot be empty");
  }

  const crypto = getCrypto();

  // Import the raw password so PBKDF2 can use it as key material.
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    KDF,
    false,
    ["deriveKey"]
  );

  // Derive a real AES-GCM key from the password + salt.
  return crypto.subtle.deriveKey(
    {
      name: KDF,
      salt,
      iterations: ITERATIONS,
      hash: HASH,
    },
    passwordKey,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt data and return a payload that can be safely stored by the backend.
export async function encryptData(data, password) {
  if (!password) {
    throw new Error("Password is required for encryption");
  }

  const crypto = getCrypto();

  // Generate a unique salt for this encrypted vault record.
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  // Generate a unique IV for AES-GCM encryption.
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const key = await deriveKey(password, salt);
  const encodedData = encodeData(data);

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
    },
    key,
    encodedData
  );

  return {
    algorithm: ALGORITHM,
    kdf: KDF,
    hash: HASH,
    iterations: ITERATIONS,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(ciphertext),
  };
}

// Decrypt an encrypted payload back into the original JS object.
export async function decryptData(payload, password) {
  if (!password) {
    throw new Error("Password is required for decryption");
  }

  if (!payload?.salt || !payload?.iv || !payload?.ciphertext) {
    throw new Error("Invalid encrypted payload");
  }

  const salt = base64ToBytes(payload.salt);
  const iv = base64ToBytes(payload.iv);
  const ciphertext = base64ToBytes(payload.ciphertext);

  const crypto = getCrypto();
  const key = await deriveKey(password, salt);

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv,
      },
      key,
      ciphertext
    );

    return decodeData(decrypted);
  } catch {
    throw new Error(
      "Unable to decrypt data. Password may be incorrect or payload may be corrupted."
    );
  }
}