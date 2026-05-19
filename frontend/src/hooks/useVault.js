// Utilized AI for help with logic of vault API calls and usage.

/*
 * Centralized vault hook responsible for:
 * - Fetching encrypted vault records from backend
 * - Decrypting vault records in frontend memory
 * - Encrypting records before transmission
 * - CRUD operations for vault items
 *
 * Security model:
 * - Backend never receives plaintext credential data
 * - Decryption only occurs client-side
 * - vaultPassword comes from AuthContext memory only
 */

import { useEffect, useState, useCallback } from "react";

import { apiFetch } from "../services/api";
import { encryptData, decryptData } from "../utils/crypto";
import { useAuth } from "../context/AuthContext";

export default function useVault(autoFetch = true) {
  const { vaultPassword } = useAuth();

  // Plaintext vault items used by the UI after decryption.
  const [items, setItems] = useState([]);

  // Loading/error state for async API operations.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /*
   * Fetch encrypted vault data from backend,
   * then decrypt it in frontend memory.
   */
  const fetchVault = useCallback(async () => {
    // Cannot decrypt without vault password.
    if (!vaultPassword) return;

    setLoading(true);
    setError(null);

    try {
      // Backend returns encrypted records only.
      const encryptedItems = await apiFetch("/api/vault", {
        method: "GET",
      });

      // Decrypt each vault item individually.
      const decryptedItems = await Promise.all(
        encryptedItems.map(async (item) => {
          const decrypted = await decryptData(
            {
              ciphertext: item.data,
              iv: item.iv,
              salt: item.salt,
            },
            vaultPassword
          );

          return {
            id: item.id,
            title: item.title,

            // Spread decrypted credential fields into UI object.
            ...decrypted,
          };
        })
      );

      setItems(decryptedItems);

    } catch (err) {
      console.error("Vault fetch/decrypt failed:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [vaultPassword]);

  /*
   * Encrypt and save a new vault item.
   */
  const createItem = useCallback(
    async (formValues) => {
      if (!vaultPassword) {
        throw new Error("Vault is locked.");
      }

      /*
       * Encrypt entire credential payload client-side.
       * Backend only receives ciphertext.
       */
      const encrypted = await encryptData(
        formValues,
        vaultPassword
      );

      const payload = {
        title: formValues.title,

        // Backend field naming
        data: encrypted.ciphertext,
        iv: encrypted.iv,
        salt: encrypted.salt,
      };

      await apiFetch("/api/save", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Refresh vault after save.
      await fetchVault();
    },
    [vaultPassword, fetchVault]
  );

  /*
   * Encrypt and update an existing vault item.
   */
  const updateItem = useCallback(
    async (id, formValues) => {
      if (!vaultPassword) {
        throw new Error("Vault is locked.");
      }

      const encrypted = await encryptData(
        formValues,
        vaultPassword
      );

      const payload = {
        title: formValues.title,
        data: encrypted.ciphertext,
        iv: encrypted.iv,
        salt: encrypted.salt,
      };

      await apiFetch(`/api/update/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      await fetchVault();
    },
    [vaultPassword, fetchVault]
  );

  /*
   * Delete vault item by ID.
   */
  const deleteItem = useCallback(
    async (id) => {
      await apiFetch(`/api/delete/${id}`, {
        method: "DELETE",
      });

      await fetchVault();
    },
    [fetchVault]
  );

  /*
   * Automatically fetch vault after login/authentication.
   */
  useEffect(() => {
    if (autoFetch && vaultPassword) {
      fetchVault();
    }
  }, [autoFetch, vaultPassword, fetchVault]);

  return {
    items,
    loading,
    error,
    fetchVault,
    createItem,
    updateItem,
    deleteItem,
  };
}