/*
 * Test suite for encryption/decryption utilities 
 */

import { encryptData, decryptData } from "./crypto";

describe("crypto utilities", () => {

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