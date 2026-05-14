/*
 * Provides global authentication state and session management for the application.
 * This context is responsible for tracking the logged-in user and authentication status,
 * and exposing login/logout functionality to the rest of the app.
 *
 * Responsibilities:
 * - Manage authenticated user state (user object)
 * - Track authentication status (isAuthenticated)
 * - Handle login and logout logic
 * - Persist minimal session metadata across page refreshes using localStorage
 *
 * Integration with VaultContext:
 * - On logout, vault state should also be cleared via clearVaultState() to ensure
 *   no decrypted credential data remains in memory
 *
 * Usage:
 * Wrap the application in <AuthProvider> and access values via the useAuth() hook.
 *
 * AI Assistance Disclosure:
 * Portions of this implementation and documentation were developed with the assistance of
 * ChatGPT (OpenAI) and have been reviewed and adapted for this project.
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
  const [user, setUser] = useState(() => getLocalJSON("user", null));
	const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("token")
  );

  const register = (email, password) => {
    // TODO: API call to register a user into the backend
    setIsAuthenticated(true);
  };

  const login = (email, password) => {
    // Test dummy example account for development purposes.
    // TODO: Replace with backend authentication.
    if (email === "test@example.com" && password === "password") {
      setIsAuthenticated(true);
      setUser({ email });

      // Only auth/session metadata is persisted here.
      // Plaintext vault data should never be persisted.
      localStorage.setItem("isAuthenticated", JSON.stringify(true));
      localStorage.setItem("user", JSON.stringify({ email }));
    } else {
      alert("Invalid email or password");
    }
  };

  const logout = () => {
    // Clear auth state from React memory.
    setUser(null);
		setToken(null);
    setIsAuthenticated(false);

    // Clear persisted auth metadata.
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");

    // Defensive cleanup in case anything session-based is added later.
    sessionStorage.clear();
		localStorage.removeItem("user");
		localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
			value={{ user, token, isAuthenticated, login, logout, register }}
		>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
