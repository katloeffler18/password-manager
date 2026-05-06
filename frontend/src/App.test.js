import { render, screen } from '@testing-library/react';
import { AuthProvider } from './context/AuthContext';
import { VaultProvider } from './context/VaultContext';
import App from './App';

test('renders landing page heading', () => {
  render(
    <AuthProvider>
      <VaultProvider>
        <App />
      </VaultProvider>
    </AuthProvider>
  );

  expect(
    screen.getByText(/secure password manager/i)
  ).toBeInTheDocument();
});
