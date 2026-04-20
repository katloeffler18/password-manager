/*
* Reusable API layer
* Reduces fetch calls, so we can use apiFetch("/login") instead of fetch("http://localhost:5050/login")
*/

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}