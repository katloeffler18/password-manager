## Research: Client-Side Encryption Approaches

### Overview
This doc details my comparison of two client-side cryptography options for encrypting and decrypting vault data within our React frontend before it is transmitted to the backend.

The goal is to select a library or approach that supports:
- Encryption/decryption in the browser
- Password-based key derivation (from master password)
- Secure handling of sensitive data
- Integration with a React application

---

## Options Evaluated

### 1. Web Crypto API (`window.crypto.subtle`)
Link: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API

**Description:**  
The Web Crypto API is a native browser API that provides operations like encryption, decryption, hashing, and key derivation.

**Pros:**
- Built-in to modern browsers
- Actively maintained and is the current standard for web cryptography
- Supports the functionality that we need (encryption, decryption, key derivation, hashing)
- Aligns well with client-side encryption architecture

**Cons:**
- More complex and lower-level API
- Requires handling of `ArrayBuffer`, `CryptoKey`, and async operations
- Uses binary data, special key objects, Promises instead of simple strings like normal JavaScript
- Steeper learning curve for implementation

**Integration Considerations:**
- Will require a utility wrapper (e.g., `utils/crypto.js`) to simplify usage
- Must handle encoding/decoding between strings and binary formats
- Best suited for long-term, production-ready architecture

---

### 2. CryptoJS
Link: https://www.npmjs.com/package/crypto-js

**Description:**  
CryptoJS is an unmaintained JavaScript library that provides cryptographic algorithms (AES, DES, etc.) for client-side or server-side encryption. It is used to encrypt, decrypt, and hash data in browsers or Node.js.

**Pros:**
- Easier to use 
- Simpler API than Web Crypto API, with string-based inputs/outputs 
- Has some functionality we need (encrypt, decrypt, and hashing)

**Cons:**
- No longer actively maintained
- Not ideal for new applications concerned with security
- Introduces external dependency risk
- Slower performance

**Integration Considerations:**
- Could be used for prototyping
- Not ideal for long-term use in our password manager

---

## Recommendation

I recommend we use the **Web Crypto API** for this project.

**Reasoning:**
- It is the current browser standard for cryptography
- Avoids using an unmaintained, third-party library
- Aligns with our priority for a secure, client-side encryption model
- Supports all of the required cryptographic operations for the password manager that we need

Although it may be harder to implement, this can be reduced by creating a reusable utility layer in the frontend.


