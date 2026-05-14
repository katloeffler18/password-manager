/*
 * Generates a secure random password based on the provided options.
 *
 * Options:
 * - length: desired password length
 * - includeLowercase: include lowercase letters
 * - includeUppercase: include uppercase letters
 * - includeNumbers: include numeric characters
 * - includeSymbols: include special characters
 */

// Character sets used to build generated passwords
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export function generatePassword(options = {}) {
  // Default password configuration
  const {
    length = 16,
    includeLowercase = true,
    includeUppercase = true,
    includeNumbers = true,
    includeSymbols = true,
  } = options;

  // Validate password length
  // Require at least 8 characters for stronger security
  if (!Number.isInteger(length) || length < 8) {
    throw new Error("Password length must be at least 8 characters.");
  }

  // Store all enabled character sets
  const selectedSets = [];

  if (includeLowercase) selectedSets.push(LOWERCASE);
  if (includeUppercase) selectedSets.push(UPPERCASE);
  if (includeNumbers) selectedSets.push(NUMBERS);
  if (includeSymbols) selectedSets.push(SYMBOLS);

  // Prevent generating passwords with no available characters
  if (selectedSets.length === 0) {
    throw new Error("At least one character type must be selected.");
  }

  // Combine all selected character sets into one string
  const allCharacters = selectedSets.join("");

  // Array used to build the password
  const password = [];

  // Ensure at least one character from each selected category is included in the final password
  selectedSets.forEach((set) => {
    password.push(getRandomChar(set));
  });

  // Fill the remaining password length
  while (password.length < length) {
    password.push(getRandomChar(allCharacters));
  }

  return shuffleArray(password).join("");
}

/*
 * Returns a random character
 * from the provided character string.
 */
function getRandomChar(characters) {
  // Web Crypto API provides stronger randomness than Math.random()
  const randomIndex =
    crypto.getRandomValues(new Uint32Array(1))[0] % characters.length;

  return characters[randomIndex];
}

/*
 * Randomly shuffles the array using the Fisher-Yates algorithm.
 */
function shuffleArray(array) {
  // Create a copy to avoid mutating the original array
  const shuffled = [...array];

  // Shuffle elements from the end of the array to the beginning
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j =
      crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}