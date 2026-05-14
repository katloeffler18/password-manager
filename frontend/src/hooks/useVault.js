// Utilized AI for help with logic of vault API calls and usage.

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../services/api";

export default function useVault(autoFetch = true) {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchVault = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const mockData = [
				{
					id: 1,
					title: "Gmail",
					data: "mock_encrypted_data",
					iv: "mock_iv",
					salt: "mock_salt",
				},
				{
					id: 2,
					title: "GitHub",
					data: "mock_encrypted_data",
					iv: "mock_iv",
					salt: "mock_salt",
				},
				{
					id: 3,
					title: "AWS Console",
					data: "mock_encrypted_data",
					iv: "mock_iv",
					salt: "mock_salt",
				},
				{
					id: 4,
					title: "Database Password",
					data: "mock_encrypted_data",
					iv: "mock_iv",
					salt: "mock_salt",
				},
				{
					id: 5,
					title: "Banking App",
					data: "mock_encrypted_data",
					iv: "mock_iv",
					salt: "mock_salt",
				},
				{
					id: 6,
					title: "Work VPN",
					data: "mock_encrypted_data",
					iv: "mock_iv",
					salt: "mock_salt",
				},
			];

			setItems(
				mockData.map((i) => ({
					id: i.id,
					title: i.title,
					favorite: i.id === 1,
					raw: i,
				})),
			);
			return;

			// Uncomment below to use real API:
			// const data = await apiFetch("/api/vault", { method: "GET" });
			// setItems(
			//   Array.isArray(data)
			//     ? data.map((i) => ({ id: i.id, title: i.title, raw: i }))
			//     : []
			// );
		} catch (err) {
			setError(err);
		} finally {
			setLoading(false);
		}
	}, []);

	const createItem = useCallback(
		async (payload) => {
			// payload: { title, data, iv, salt }
			const res = await apiFetch("/api/save", {
				method: "POST",
				body: JSON.stringify(payload),
			});
			// refresh list
			await fetchVault();
			return res;
		},
		[fetchVault],
	);

	const updateItem = useCallback(
		async (id, payload) => {
			const res = await apiFetch(`/api/update/${id}`, {
				method: "PUT",
				body: JSON.stringify(payload),
			});
			await fetchVault();
			return res;
		},
		[fetchVault],
	);

	const deleteItem = useCallback(
		async (id) => {
			const res = await apiFetch(`/api/delete/${id}`, {
				method: "DELETE",
			});
			await fetchVault();
			return res;
		},
		[fetchVault],
	);

	useEffect(() => {
		if (autoFetch) fetchVault();
	}, [autoFetch, fetchVault]);

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
