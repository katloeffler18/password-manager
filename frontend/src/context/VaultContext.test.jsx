/*
 * Test suite for VaultContext 
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { VaultProvider, useVault } from "./VaultContext";

function TestComponent() {
  const {
    encryptedVault,
    decryptedVault,
    isVaultUnlocked,
    storeEncryptedVault,
    unlockVault,
    lockVault,
    clearVaultState,
  } = useVault();

  const encryptedSample = {
    id: 1,
    data: "encrypted-data-goes-here",
    iv: "sample-iv",
  };

  const decryptedSample = {
    id: 1,
    title: "Gmail",
    username: "kat@example.com",
    password: "plaintext-password",
  };

  return (
    <div>
      <p data-testid="encrypted">
        {encryptedVault ? encryptedVault.data : "no encrypted vault"}
      </p>

      <p data-testid="decrypted">
        {decryptedVault ? decryptedVault.password : "no decrypted vault"}
      </p>

      <p data-testid="unlocked">
        {isVaultUnlocked ? "unlocked" : "locked"}
      </p>

      <button onClick={() => storeEncryptedVault(encryptedSample)}>
        Store encrypted
      </button>

      <button onClick={() => unlockVault(decryptedSample)}>
        Unlock vault
      </button>

      <button onClick={lockVault}>Lock vault</button>

      <button onClick={clearVaultState}>Clear vault</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <VaultProvider>
      <TestComponent />
    </VaultProvider>
  );
}

test("stores encrypted vault data in React state", () => {
  renderWithProvider();

  fireEvent.click(screen.getByText("Store encrypted"));

  expect(screen.getByTestId("encrypted")).toHaveTextContent(
    "encrypted-data-goes-here"
  );
});

test("holds decrypted vault data only after unlocking", () => {
  renderWithProvider();

  expect(screen.getByTestId("decrypted")).toHaveTextContent(
    "no decrypted vault"
  );
  expect(screen.getByTestId("unlocked")).toHaveTextContent("locked");

  fireEvent.click(screen.getByText("Unlock vault"));

  expect(screen.getByTestId("decrypted")).toHaveTextContent(
    "plaintext-password"
  );
  expect(screen.getByTestId("unlocked")).toHaveTextContent("unlocked");
});

test("lockVault clears decrypted data but keeps encrypted data", () => {
  renderWithProvider();

  fireEvent.click(screen.getByText("Store encrypted"));
  fireEvent.click(screen.getByText("Unlock vault"));
  fireEvent.click(screen.getByText("Lock vault"));

  expect(screen.getByTestId("encrypted")).toHaveTextContent(
    "encrypted-data-goes-here"
  );
  expect(screen.getByTestId("decrypted")).toHaveTextContent(
    "no decrypted vault"
  );
  expect(screen.getByTestId("unlocked")).toHaveTextContent("locked");
});

test("clearVaultState clears encrypted and decrypted vault data", () => {
  renderWithProvider();

  fireEvent.click(screen.getByText("Store encrypted"));
  fireEvent.click(screen.getByText("Unlock vault"));
  fireEvent.click(screen.getByText("Clear vault"));

  expect(screen.getByTestId("encrypted")).toHaveTextContent(
    "no encrypted vault"
  );
  expect(screen.getByTestId("decrypted")).toHaveTextContent(
    "no decrypted vault"
  );
  expect(screen.getByTestId("unlocked")).toHaveTextContent("locked");
});

test("does not persist plaintext vault data to localStorage or sessionStorage", () => {
  renderWithProvider();

  const localStorageSpy = jest.spyOn(Storage.prototype, "setItem");

  fireEvent.click(screen.getByText("Unlock vault"));

  expect(localStorageSpy).not.toHaveBeenCalledWith(
    expect.any(String),
    expect.stringContaining("plaintext-password")
  );

  expect(localStorage.getItem("decryptedVault")).toBeNull();
  expect(sessionStorage.getItem("decryptedVault")).toBeNull();

  localStorageSpy.mockRestore();
});