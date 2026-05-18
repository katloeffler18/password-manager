import { render, screen } from '@testing-library/react';
import { AuthProvider } from './context/AuthContext';
import App from './App';

test('renders landing page heading', () => {
  render(
    <AuthProvider>
        <App />
    </AuthProvider>
  );

  expect(
    screen.getByText(/secure password manager/i)
  ).toBeInTheDocument();
});
