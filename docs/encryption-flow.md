## High-Level Vault Encryption and Decryption Flow

### Overview
The password manager encrypts sensitive vault data in the React frontend before transmitting it to the Flask backend. The same user password is used both for account authentication and for deriving the client-side encryption key. To support search functionality, each credential entry will also include a plaintext 'label', while sensitive fields like username, password, and notes are encrypted in the browser.

---

## When Encryption Occurs

Encryption occurs in the React frontend when a user creates or updates a vault entry.

### Save and Create Flow
1. The user logs in and completes MFA.
2. The user enters a credential label, username, password, and optional website and notes.
3. The frontend keeps the credential label in plaintext for search/display purposes.
4. The frontend groups the sensitive fields (username, password, notes, etc.) into an object.
5. The frontend derives an encryption key from the user’s password using the Web Crypto API.
6. The frontend encrypts the sensitive credential object before transmission.
7. The frontend sends the plaintext label and encrypted payload to the backend API.

### Update Flow
1. The user edits an existing credential entry.
2. The frontend re-encrypts the updated sensitive fields in the browser.
3. The updated encrypted payload is sent to the backend API.

---

## When Decryption Occurs

Decryption occurs in the React frontend after the user has successfully completed the MFA, and encrypted vault data has been retrieved from the backend.

### Load and View Flow
1. The user logs in with their password.
2. The backend verifies the hashed password and completes MFA verification.
3. The frontend requests stored vault entries from the backend.
4. The backend returns plaintext labels and encrypted vault payloads.
5. The frontend derives the encryption key from the same user password.
6. The frontend decrypts the sensitive credential data locally in the browser.
7. The decrypted data is displayed to the user during the active session.

---

## Data Movement Between Frontend, Backend, and Database

### Frontend
The React frontend is responsible for:
- deriving the encryption key from the user password
- encrypting sensitive vault fields before transmission
- decrypting encrypted vault fields after retrieval
- displaying plaintext data only during an authenticated session

### Backend
The Flask backend is responsible for:
- authenticating the user
- verifying MFA
- receiving plaintext labels and encrypted vault payloads
- storing and retrieving encrypted vault data
  
### Database
The database stores:
- user account and authentication data
- MFA-related data
- credential label (plaintext)
- encrypted sensitive vault data
- encryption metadata such as IV and salt

---

## Example of a Vault Record

```json
{
  "label": "GitHub",
  "ciphertext": "...",  # encrypted data
  "iv": "...",          # random value used to start an encryption algorithm 
  "salt": "...",        # random value used during key derivation
  "user_id": 1
}
```

