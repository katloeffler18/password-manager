# Frontend Encryption Architecture

## Overview

The frontend of the Secure Password Manager uses client-side encryption to protect user vault data before it is sent to the backend API. Sensitive credential fields are encrypted in the browser using the Web Crypto API. The backend stores encrypted vault records only and does not receive plaintext credential data.

This design means that vault data is encrypted before create and update requests are sent to the server, and decrypted only after encrypted records are retrieved by the frontend.

Relevant frontend files:

* `frontend/src/utils/crypto.js`
* `frontend/src/hooks/useVault.js`
* `frontend/src/context/AuthContext.js`
* `frontend/src/services/api.js`
* `frontend/src/components/VaultModal.js`

---

## Authentication and Vault Password Flow

The application uses the user's login password as the vault master password. This avoids requiring the user to maintain a separate password for encryption.

The authentication flow works as follows:

1. The user enters an email and password on login.
2. The backend verifies the email/password combination.
3. The frontend temporarily stores the email/password in React memory as `pendingLogin`.
4. The user enters a two-factor authentication code from an authenticator app.
5. After the authenticator code is verified, the backend returns a JWT token.
6. The JWT token and user email are stored in `localStorage` for authenticated API requests.
7. The login password is stored only in React memory as `vaultPassword`.
8. `vaultPassword` is used by the frontend encryption utilities to encrypt and decrypt vault data.

The JWT token is used for authentication with the backend API. The `vaultPassword` is used only for client-side encryption and decryption.

The authenticator app code is used only to complete the login process. It is not used for encryption, decryption, or key derivation.


---

## Why the Vault Password Is Stored Only in Frontend Memory

The vault password is intentionally not stored in `localStorage`, `sessionStorage`, cookies, or the backend database. It only exists in React state during the active frontend session.

This is handled in `AuthContext.js`:

* `token` is persisted in `localStorage`
* `user` metadata is persisted in `localStorage`
* `vaultPassword` is stored only in React memory
* `pendingLogin` is stored only temporarily between login and OTP verification

When the user logs out, the app clears:

* `user`
* `token`
* `pendingLogin`
* `vaultPassword`
* persisted `localStorage` session metadata
* `sessionStorage`

This design reduces the risk of exposing the vault password through browser storage. The tradeoff is that refreshing the page clears `vaultPassword`, so the user must log in again before vault data can be decrypted.

---

## Cryptographic Configuration

Encryption and decryption are implemented in `crypto.js` using the browser's Web Crypto API.

The current configuration is:

```js
const ALGORITHM = "AES-GCM";
const KDF = "PBKDF2";
const HASH = "SHA-256";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const ITERATIONS = 310_000;
```

The application uses:

* AES-GCM for authenticated encryption
* PBKDF2 for deriving an encryption key from the user's login password
* SHA-256 as the PBKDF2 hash function
* 310,000 PBKDF2 iterations
* 256-bit AES key length
* 12-byte initialization vectors
* 16-byte salts

The Web Crypto API requires HTTPS or localhost. If `window.crypto.subtle` is unavailable, the frontend throws an error.

---

## Key Derivation Workflow

The `deriveKey(password, salt)` function derives an AES-GCM key from the user's login password.

The function:

1. Validates that a password was provided.
2. Validates that the salt is a non-empty `Uint8Array`.
3. Imports the raw password as PBKDF2 key material.
4. Uses PBKDF2 with SHA-256, the provided salt, and 310,000 iterations.
5. Returns a non-extractable AES-GCM key that can be used for encryption and decryption.

The salt must be saved with the encrypted vault record. Without the same salt, the frontend cannot derive the same key during decryption.

---

## Encryption Workflow

Vault item encryption occurs in `useVault.js` before create and update requests are sent to the backend.

When a user creates or updates a vault item:

1. The form values are normalized using `normalizeVaultItem`.
2. Optional fields are converted to empty strings instead of `undefined` or `null`.
3. The normalized vault item is passed to `encryptData`.
4. `encryptData` generates a new random salt.
5. `encryptData` generates a new random IV.
6. The frontend derives an AES-GCM key from `vaultPassword` and the salt.
7. The vault item is serialized to JSON.
8. The serialized data is encrypted with AES-GCM.
9. The encrypted result is Base64 encoded.
10. The frontend sends the encrypted payload to the backend.

The encrypted backend payload uses this structure:

```js
const payload = {
  title: normalizedItem.title,
  data: encrypted.ciphertext,
  iv: encrypted.iv,
  salt: encrypted.salt,
};
```

The backend receives the `title`, encrypted `data`, `iv`, and `salt`.

---

## Decryption Workflow

Vault item decryption occurs in `useVault.js` after encrypted records are retrieved from the backend.

When the frontend fetches vault data:

1. `fetchVault` calls `GET /api/vault`.
2. The backend returns encrypted vault records.
3. Each encrypted record is passed to `decryptData`.
4. `decryptData` validates the encrypted payload.
5. The salt, IV, and ciphertext are decoded from Base64.
6. The frontend derives the AES-GCM key again using `vaultPassword` and the stored salt.
7. AES-GCM decrypts the ciphertext.
8. The decrypted JSON is parsed back into a JavaScript object.
9. The decrypted fields are merged with the record ID and title for display in the UI.

The frontend reconstructs the encrypted payload for decryption like this:

```js
const decrypted = await decryptData(
  {
    ciphertext: item.data,
    iv: item.iv,
    salt: item.salt,
  },
  vaultPassword
);
```

If the password is incorrect or the encrypted payload is corrupted, decryption fails and the app throws a user-safe error:

```js
"Unable to decrypt data. Password may be incorrect or payload may be corrupted."
```

---

## Encrypted Payload Structure

The `encryptData` function returns the following structure:

```json
{
  "algorithm": "AES-GCM",
  "kdf": "PBKDF2",
  "hash": "SHA-256",
  "iterations": 310000,
  "salt": "...",
  "iv": "...",
  "ciphertext": "..."
}
```

However, the payload sent to the backend currently uses these fields:

```json
{
  "title": "...",
  "data": "...",
  "iv": "...",
  "salt": "..."
}
```

Field descriptions:

* `title`: plaintext display title used for listing vault items
* `data`: Base64-encoded encrypted vault item data
* `iv`: Base64-encoded AES-GCM initialization vector
* `salt`: Base64-encoded PBKDF2 salt

The encrypted `data` field contains the serialized vault item fields, including:

```json
{
  "title": "...",
  "service": "...",
  "username": "...",
  "password": "...",
  "notes": "..."
}
```

Each encryption operation generates a new salt and IV.

---

## API Authentication

Authenticated API requests are handled through `apiFetch` in `api.js`.

The JWT token is stored in `localStorage` and attached to API requests using the `Authorization` header:

```js
Authorization: `Bearer ${token}`
```

If the backend returns a `401 Unauthorized` response, `apiFetch` clears the persisted token and user metadata from `localStorage`. This prevents stale or invalid authentication state from remaining in the browser.

The JWT token authenticates API requests, but it is not used for vault encryption or decryption.

---

## Vault UI Flow

The `VaultModal.js` component handles the form used to create and edit vault items. The user can enter:

* title
* service
* username
* password
* notes

The modal also includes a password generator. Generated passwords are placed directly into the password input field before the vault item is saved.

When the form is submitted, the modal passes the plaintext form values to the vault hook. The vault hook encrypts the values before sending them to the backend.

Plaintext vault data exists only temporarily in frontend memory while the user is actively viewing or editing vault items.

---

## Security Considerations and Limitations

This frontend follows a client-side encryption model. The backend stores encrypted vault data and does not receive plaintext credential fields.

Important security behaviors:

* Vault data is encrypted before transmission.
* Vault data is decrypted only in the browser.
* The login password functions as the vault master password.
* The vault password is stored only in React memory.
* The vault password is cleared on logout or page refresh.
* The JWT token is used only for API authentication.
* Each encrypted record receives a new salt and IV.

Known limitations:

* If the user refreshes the page, the vault password is lost and the user must log in again.
* If the active browser session or device is compromised, decrypted vault data may be exposed while the user is logged in.
* The vault item title is currently sent separately as plaintext for display/listing purposes.
* The application depends on HTTPS or localhost because the Web Crypto API requires a secure browser context.

---

## AI Assistance

ChatGPT was used to assist with drafting and refining documentation language. All technical content was reviewed and verified by the author.

