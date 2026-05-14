/*
 * Unit tests for password generator utility.
 * Verifies password length, character inclusion,
 * and validation/error handling behavior.
 */

import { generatePassword } from "./passwordGenerator";

describe("generatePassword", () => {

  // Uses default configuration when no options are provided
  test("generates a password with the default length", () => {
    const password = generatePassword();

    expect(password).toHaveLength(16);
  });

  // Supports custom password lengths
  test("generates a password with a custom length", () => {
    const password = generatePassword({ length: 20 });

    expect(password).toHaveLength(20);
  });

  // Ensures generated passwords contain all selected character types
  test("includes selected character types", () => {
    const password = generatePassword({
      length: 24,
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: true,
    });

    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/);
  });

  // Rejects insecure password lengths
  test("throws error if length is less than 8", () => {
    expect(() => generatePassword({ length: 6 })).toThrow(
      "Password length must be at least 8 characters."
    );
  });

  // Prevents password generation if no character sets are enabled
  test("throws error if no character types are selected", () => {
    expect(() =>
      generatePassword({
        includeLowercase: false,
        includeUppercase: false,
        includeNumbers: false,
        includeSymbols: false,
      })
    ).toThrow("At least one character type must be selected.");
  });
});