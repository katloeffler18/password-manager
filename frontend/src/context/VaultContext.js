/*
 * Provides secure frontend state management for vault data in the password manager application.
 * This context separates encrypted and decrypted vault data to minimize exposure of sensitive
 * information while maintaining a responsive user experience.
 *
 * Responsibilities:
 * - Store encrypted vault data retrieved from the backend
 * - Temporarily hold decrypted vault data in memory after user unlock
 * - Provide methods to lock/unlock the vault
 * - Ensure complete clearing of sensitive state when required
 *
 * Usage:
 * Must be used within <VaultProvider>. Access via the useVault() hook.
 *
 * AI Assistance Disclosure:
 * Portions of this implementation and documentation were developed with the assistance of
 * ChatGPT (OpenAI), and subsequently reviewed and adapted for this project.
 */

import { createContext, useContext, useState } from "react";

const VaultContext = createContext(null);

export function VaultProvider({ children }) {
  // Stores encrypted vault data received from the backend.
  const [encryptedVault, setEncryptedVault] = useState(null);

  // Stores decrypted vault data only while the vault is unlocked.
  const [decryptedVault, setDecryptedVault] = useState(null);

  // Tracks whether the user currently has access to decrypted vault contents.
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);

  // Save encrypted vault data in app memory after fetching it from the backend.
  function storeEncryptedVault(vaultData) {
    setEncryptedVault(vaultData);
  }

  // Temporarily hold decrypted vault data in memory after successful decryption.
  function unlockVault(plainVaultData) {
    setDecryptedVault(plainVaultData);
    setIsVaultUnlocked(true);
  }

  // Clear only plaintext data while keeping encrypted data available.
  function lockVault() {
    setDecryptedVault(null);
    setIsVaultUnlocked(false);
  }

  // Clear all vault-related state.
  // This should be called on logout or session expiration.
  function clearVaultState() {
    setEncryptedVault(null);
    setDecryptedVault(null);
    setIsVaultUnlocked(false);
  }

  return (
    <VaultContext.Provider
      value={{
        encryptedVault,
        decryptedVault,
        isVaultUnlocked,
        storeEncryptedVault,
        unlockVault,
        lockVault,
        clearVaultState,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);

  // Prevents confusing errors if a component tries to use vault state
  // outside of the VaultProvider.
  if (!context) {
    throw new Error("useVault must be used within a VaultProvider");
  }

  return context;
}