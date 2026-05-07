import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from "./context/AuthContext";
import { VaultProvider } from "./context/VaultContext"; // <-- add this
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <VaultProvider>
        <App />
      </VaultProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
