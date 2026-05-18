/*
 * Provides global authentication state and session management.
 *
 * Important security behavior:
 * - JWT token is stored in localStorage so the user can stay logged in.
 * - The vault password is NEVER stored in localStorage.
 * - The vault password only exists in React memory after successful OTP verification.
 * - If the page refreshes, vaultPassword is lost and the user should log in again.
 */

import { createContext, useContext, useState } from "react";
import { apiFetch } from "../services/api";

const AuthContext = createContext();

function getLocalJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }) {
  // User metadata is safe to persist. Do not store sensitive vault data here.
  const [user, setUser] = useState(() => getLocalJSON("user", null));

  // JWT is persisted so authenticated API requests can continue after refresh.
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  /*
   * Stores email/password only between login and OTP verification.
   * This lets us avoid asking the user for a separate vault password.
   * Do not persist this to localStorage or sessionStorage.
   */
  const [pendingLogin, setPendingLogin] = useState(null);

  /*
   * This password is used by frontend crypto utilities to encrypt/decrypt vault data.
   * It only exists in memory and is cleared on logout or page refresh.
   */
  const [vaultPassword, setVaultPassword] = useState(null);

  const isAuthenticated = !!token;

  async function register(email, password) {
    await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    return true;
  }

  async function login(email, password) {
    /*
     * Backend verifies email/password and sends OTP.
     * This does NOT fully authenticate the user yet.
     */
    await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Temporarily keep credentials until OTP is verified.
    setPendingLogin({ email, password });

    return true;
  }

  async function verifyOtp(otp) {
    if (!pendingLogin) {
      throw new Error("No pending login found. Please log in again.");
    }

    const response = await apiFetch("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        email: pendingLogin.email,
        otp,
      }),
    });

    const authToken = response.token;

    if (!authToken) {
      throw new Error("No token returned from server.");
    }

    // Store auth state.
    setToken(authToken);
    setUser({ email: pendingLogin.email });

    // Store vault password only in memory for encryption/decryption.
    setVaultPassword(pendingLogin.password);

    // Persist only non-vault-sensitive auth/session metadata.
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify({ email: pendingLogin.email }));

    // Clear temporary login state after OTP succeeds.
    setPendingLogin(null);

    return true;
  }

  function logout() {
    // Clear React memory.
    setUser(null);
    setToken(null);
    setPendingLogin(null);
    setVaultPassword(null);

    // Clear persisted session metadata.
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Defensive cleanup.
    sessionStorage.clear();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        pendingLogin,
        vaultPassword,
        register,
        login,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}