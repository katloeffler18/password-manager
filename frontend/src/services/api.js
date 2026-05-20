/*
 * Reusable API layer
 * Reduces fetch calls, so we can use apiFetch("/login") instead of fetch("http://localhost:5050/login")
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

export async function apiFetch(path, options = {}) {
	const token = localStorage.getItem("token");

	const headers = {
		"Content-Type": "application/json",
		...(options.headers || {}),
		...(token ? { Authorization: `Bearer ${token}` } : {}),
	};

	const base = API_BASE_URL.replace(/\/$/, "");
	const route = path.startsWith("/") ? path : `/${path}`;
	const url = `${base}${route}`;

	const response = await fetch(url, { headers, ...options });

	if (!response.ok) {
		const text = await response.text().catch(() => null);

		let body = null;

		try {
			body = text ? JSON.parse(text) : null;
		} catch {}

		/*
		* If authentication fails, clear persisted session state.
		* This prevents stale/invalid JWT tokens from remaining in localStorage.
		*/
		if (response.status === 401) {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
		}

		const error = new Error(`API request failed: ${response.status}`);

		error.status = response.status;
		error.body = body;

		throw error;
	}

	return response.json().catch(() => ({}));
}
