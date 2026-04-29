/**
 * Encryption/decryption utilities using Web Crypto API
 */


// Configuration constants
const ALGORITHM = "AES-GCM";     // Symmetric encryption algorithm
const KDF = "PBKDF2";            // Key derivation function
const HASH = "SHA-256";          // Hash used inside PBKDF2
const KEY_LENGTH = 256;          // AES-256
const IV_LENGTH = 12;            // Recommended length for AES-GCM 
const SALT_LENGTH = 16;          // Random salt size 
const ITERATIONS = 310_000;      // Work factor (slows down brute-force attacks)


// Check if Web Crypto API is available
function getCrypto() {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto API is not available. Use HTTPS or localhost.");
  }
  return globalThis.crypto;
}

// --- Encoding helpers ---

// Convert byte array → base64 string
function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

// Convert base64 string → byte array
function base64ToBytes(base64) {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

// Convert JS object → Uint8Array (for encryption)
function encodeData(data) {
  return new TextEncoder().encode(JSON.stringify(data));
}

// Convert Uint8Array → JS object (after decryption)
function decodeData(bytes) {
  return JSON.parse(new TextDecoder().decode(bytes));
}


// Key derivation function
async function deriveKey(password, salt) {
  const crypto = getCrypto();

  // Convert password into a "key-like" object
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    KDF,
    false,
    ["deriveKey"]
  );

  // Derive real encryption key using PBKDF2
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


// Encrypt data function
// Takes a JS object and password and returns a secure payload
export async function encryptData(data, password) {
  if (!password) {
    throw new Error("Password is required for encryption");
  }

  const crypto = getCrypto();

  // Generate random salt 
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  // Generate random IV 
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive encryption key from password + salt
  const key = await deriveKey(password, salt);

  // Convert data into bytes
  const encodedData = encodeData(data);

  // Perform encryption
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
    },
    key,
    encodedData
  );

  // Return everything needed to decrypt later
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


// Decrypt data function
// Takes encrypted payload and password and returns original data
export async function decryptData(payload, password) {
  if (!password) {
    throw new Error("Password is required for decryption");
  }

  // Validation of payload 
  if (!payload?.salt || !payload?.iv || !payload?.ciphertext) {
    throw new Error("Invalid encrypted payload");
  }

  const crypto = getCrypto();

  // Convert stored base64 values back into byte arrays
  const salt = base64ToBytes(payload.salt);
  const iv = base64ToBytes(payload.iv);
  const ciphertext = base64ToBytes(payload.ciphertext);

  // Re-derive the same key using password + salt
  const key = await deriveKey(password, salt);

  try {
    // Attempt decryption
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv,
      },
      key,
      ciphertext
    );

    // Convert decrypted bytes back into original object
    return decodeData(decrypted);

  } catch {
    throw new Error(
      "Unable to decrypt data. Password may be incorrect or payload may be corrupted."
    );
  }
}