/*
 * Test suite for encryption/decryption utilities 
 */

import { deriveKey, encryptData, decryptData } from "./crypto";

describe("crypto utilities", () => {

    // Confirms deriveKey creates a key that is compatible with AES-GCM encryption
  it("derives a usable AES-GCM key", async () => {
    const salt = new Uint8Array(16).fill(1);

    const key = await deriveKey("master-password", salt);

    expect(key).toBeDefined();
    expect(key.type).toBe("secret");
    expect(key.algorithm.name).toBe("AES-GCM");
  });

  // Ensures missing password input is rejected during key derivation
  it("rejects missing password during key derivation", async () => {
    const salt = new Uint8Array(16);

    await expect(
      deriveKey("", salt)
    ).rejects.toThrow("Password is required");
  });

  // Ensures invalid salt input is rejected during key derivation
  it("rejects invalid salt during key derivation", async () => {
    await expect(
      deriveKey("master-password", "not-a-salt")
    ).rejects.toThrow("Salt must be a Uint8Array");
  });

  // Ensures empty salt input is rejected during key derivation
  it("rejects empty salt during key derivation", async () => {
    await expect(
      deriveKey("master-password", new Uint8Array(0))
    ).rejects.toThrow("Salt cannot be empty");
  });
  
  // Confirms that round trip use of encryptData and decryptData results in same data
  it("encrypts and decrypts data", async () => {
    const data = {
      credentials: [
        {
          site: "example.com",
          username: "kat",
          password: "secret-password",
        },
      ],
    };

    const password = "master-password";

    const encrypted = await encryptData(data, password);
    const decrypted = await decryptData(encrypted, password);

    expect(decrypted).toEqual(data);
  });

  // Ensures that encryptData truly encrypts the data (no plaintext)
  it("does not store plaintext in ciphertext", async () => {
    const data = { password: "secret-password" };
    const encrypted = await encryptData(data, "master-password");

    expect(encrypted.ciphertext).not.toContain("secret-password");
  });

  // Ensures decryption won't occur with the wrong password
  it("fails with the wrong password", async () => {
    const data = { password: "secret-password" };
    const encrypted = await encryptData(data, "correct-password");

    await expect(
      decryptData(encrypted, "wrong-password")
    ).rejects.toThrow();
  });

  // Ensures empty optional credential fields are safely encrypted/decrypted
  it("handles empty optional fields during encryption and decryption", async () => {
    const data = {
      title: "Gmail",
      service: "",
      username: "",
      password: "secret-password",
      notes: "",
    };

    const encrypted = await encryptData(data, "master-password");
    const decrypted = await decryptData(encrypted, "master-password");

    expect(decrypted).toEqual(data);
  });

  // Simulates editing a credential and confirms the full updated payload is re-encrypted
  it("re-encrypts the full updated credential payload", async () => {
    const original = {
      title: "Gmail",
      service: "gmail.com",
      username: "kat",
      password: "old-password",
      notes: "old notes",
    };

    const updated = {
      ...original,
      password: "new-password",
      notes: "updated notes",
    };

    const encryptedOriginal = await encryptData(original, "master-password");
    const encryptedUpdated = await encryptData(updated, "master-password");

    const decryptedUpdated = await decryptData(
      encryptedUpdated,
      "master-password"
    );

    expect(encryptedUpdated.ciphertext).not.toBe(encryptedOriginal.ciphertext);
    expect(decryptedUpdated).toEqual(updated);
  });

  // Ensures corrupted encrypted payloads produce a clear error
  it("shows a clear error for corrupted encrypted payloads", async () => {
    const encrypted = await encryptData(
      { title: "Gmail", password: "secret-password" },
      "master-password"
    );

    const corruptedPayload = {
      ...encrypted,
      ciphertext: "not-valid-ciphertext",
    };

    await expect(
      decryptData(corruptedPayload, "master-password")
    ).rejects.toThrow(
      "Unable to decrypt data. Password may be incorrect or payload may be corrupted."
    );
  });

  // ensures that encryptData creates different ciphertext with the same data
  it("creates different ciphertext for the same data", async () => {
    const data = { password: "secret-password" };
    const password = "master-password";

    const encryptedOne = await encryptData(data, password);
    const encryptedTwo = await encryptData(data, password);

    expect(encryptedOne.ciphertext).not.toBe(encryptedTwo.ciphertext);
    expect(encryptedOne.iv).not.toBe(encryptedTwo.iv);
    expect(encryptedOne.salt).not.toBe(encryptedTwo.salt);
  });
});