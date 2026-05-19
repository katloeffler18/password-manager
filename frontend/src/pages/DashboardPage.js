// This file uses AI assistance (Copilot/ChatGPT) to implement Bootstrap styling
// and connect dashboard actions to encrypted vault CRUD operations.

import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useVault from "../hooks/useVault";
import VaultModal from "../components/VaultModal";

const DashboardPage = () => {
	const { isAuthenticated, user, logout, vaultPassword } = useAuth();
	const navigate = useNavigate();

	const [search, setSearch] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState("create");
	const [selectedItem, setSelectedItem] = useState(null);
	const [copiedId, setCopiedId] = useState(null);
	const [helpOpen, setHelpOpen] = useState(false);

	/*
	 * useVault handles all vault API communication:
	 * - fetch encrypted vault data
	 * - decrypt records on the frontend
	 * - encrypt records before save/update
	 * - delete records by ID
	 */
	const {
		items = [],
		loading,
		error,
		createItem,
		updateItem,
		deleteItem,
	} = useVault(true);

	/*
	 * If auth token exists but vault password is missing,
	 * the encrypted vault can no longer be accessed safely.
	 * Force logout to maintain a clean authenticated state.
	 */
	useEffect(() => {
		if (!isAuthenticated || !vaultPassword) {
			logout();
			navigate("/login");
		}
	}, [isAuthenticated, vaultPassword, logout, navigate]);

	const filteredItems = useMemo(() => {
		return (items || []).filter((item) =>
			item.title.toLowerCase().includes(search.toLowerCase()),
		);
	}, [items, search]);

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const openCreateModal = () => {
		setSelectedItem(null);
		setModalMode("create");
		setModalOpen(true);
	};

	const openEditModal = (item) => {
		setSelectedItem(item);
		setModalMode("edit");
		setModalOpen(true);
	};

	/*
	 * Handles both create and edit form submissions.
	 * The form values are plaintext here only briefly in frontend memory.
	 * Encryption happens inside useVault before anything is sent to the backend.
	 */
	const handleModalSave = async (formValues) => {
		try {
			if (modalMode === "edit" && formValues.id) {
				await updateItem(formValues.id, formValues);
			} else {
				await createItem(formValues);
			}

			setModalOpen(false);
		} catch (err) {
			console.error("Vault save failed:", err);
			alert(err?.message || "Unable to save vault item.");
		}
	};

	/*
	 * Deletes the selected vault item from the backend.
	 * The backend verifies ownership using the authenticated user ID from JWT.
	 */
	const handleDelete = async (itemId) => {
		try {
			await deleteItem(itemId);
		} catch (err) {
			console.error("Delete failed:", err);
			alert(err?.message || "Unable to delete vault item.");
		}
	};

	if (!isAuthenticated) return null;

	return (
		<div className="min-vh-100 bg-light">
			<div className="container py-4">
				<div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
					<div>
						<h1 className="h3 mb-1">Vault</h1>
						<div className="text-muted">
							Welcome, {user?.email || "User"}
						</div>
					</div>

					<div className="d-flex gap-2 align-items-center">
						<button
							className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
							style={{
								width: "38px",
								height: "38px",
								fontWeight: "bold",
							}}
							onClick={() => setHelpOpen(true)}
							title="View Help Guide"
						>
							?
						</button>
						<button
							className="btn btn-outline-secondary"
							onClick={handleLogout}
						>
							Logout
						</button>
						<button
							className="btn btn-primary"
							onClick={openCreateModal}
						>
							Add Password
						</button>
					</div>
				</div>

				<div className="card shadow-sm border-0 mb-4">
					<div className="card-body">
						<div className="row g-3 align-items-center">
							<div className="col-12 col-md-8">
								<input
									className="form-control form-control-lg"
									placeholder="Search saved passwords"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</div>

							<div className="col-12 col-md-4 text-md-end">
								<small className="text-muted">
									{loading
										? "Loading..."
										: `${filteredItems.length} items`}
								</small>
							</div>
						</div>
					</div>
				</div>

				{error ? (
					<div className="alert alert-danger">
						Error loading vault: {error.message || String(error)}
					</div>
				) : null}

				{filteredItems.length === 0 ? (
					<div className="card shadow-sm border-0">
						<div className="card-body text-center py-5">
							{search ? (
								<>
									<h2 className="h5 text-danger">
										No matching results found
									</h2>
									<p className="text-muted mb-0">
										We couldn't find any credentials
										matching "<strong>{search}</strong>".
										Check your spelling or try another
										keyword.
									</p>
								</>
							) : (
								<>
									<h2 className="h5">No passwords yet</h2>
									<p className="text-muted mb-3">
										Add your first password to start
										organizing your vault.
									</p>
									<button
										className="btn btn-primary"
										onClick={openCreateModal}
									>
										Add password
									</button>
								</>
							)}
						</div>
					</div>
				) : (
					<div className="row g-3">
						{filteredItems.map((item) => (
							<div
								key={item.id}
								className="col-12 col-md-6 col-lg-4"
							>
								<div className="card shadow-sm h-100 border-0">
									<div className="card-body d-flex flex-column">
										<div className="d-flex justify-content-between align-items-start mb-2">
											<h3 className="h5 mb-0">
												{item.title}
											</h3>
										</div>

										{/* Show non-sensitive identifying info if available. */}
										{item.username ? (
											<p className="text-muted mb-1">
												Username: {item.username}
											</p>
										) : null}

										{item.service ? (
											<p className="text-muted mb-1">
												Service: {item.service}
											</p>
										) : null}

										<div className="mt-auto d-flex gap-2">
											<button
												className="btn btn-sm btn-outline-primary"
												onClick={() =>
													openEditModal(item)
												}
											>
												Edit
											</button>

											<button
												className={`btn btn-sm ${copiedId === item.id ? "btn-success" : "btn-outline-secondary"}`}
												onClick={() => {
													if (item.password) {
														navigator.clipboard.writeText(
															item.password,
														);
														setCopiedId(item.id);

														setTimeout(() => {
															setCopiedId(null);
														}, 2000);
													}
												}}
											>
												{copiedId === item.id
													? "Copied!"
													: "Copy Password"}
											</button>

											<button
												className="btn btn-sm btn-outline-danger ms-auto"
												onClick={() =>
													handleDelete(item.id)
												}
											>
												Delete
											</button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			<VaultModal
				show={modalOpen}
				mode={modalMode}
				initialValue={selectedItem}
				onClose={() => setModalOpen(false)}
				onSave={handleModalSave}
			/>

			{helpOpen && (
				<div
					className="modal fade show d-block"
					tabIndex="-1"
					style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
				>
					<div className="modal-dialog modal-dialog-centered">
						<div className="modal-content">
							<div className="modal-header d-flex justify-content-between">
								<h5 className="modal-title">
									User Guide & Help Center
								</h5>
								<button
									type="button"
									className="btn-close"
									onClick={() => setHelpOpen(false)}
								></button>
							</div>
							<div className="modal-body">
								<div className="mb-3">
									<h6>🔑 How does vault security work?</h6>
									<p className="text-muted small">
										Your passwords are locked and unlocked
										directly inside your web browser.
										Plaintext passwords are never stored or
										transmitted, meaning only you have
										access to your credentials.
									</p>
								</div>

								<div className="mb-3">
									<h6>
										🔄 Why did my vault lock on page
										refresh?
									</h6>
									<p className="text-muted small">
										For your security, closing or refreshing
										the browser tab instantly clears your
										session and locks the vault. This
										ensures no one can access your passwords
										if you leave your device unattended.
									</p>
								</div>

								<div className="mb-3">
									<h6>📋 Using the Copy Button</h6>
									<p className="text-muted small">
										Clicking <strong>Copy Password</strong>{" "}
										safely adds the password to your
										device's clipboard so you can paste it
										directly into login forms. The button
										turns green to confirm it was copied
										successfully.
									</p>
								</div>

								<div>
									<h6>🛠️ Missing Fields on Cards?</h6>
									<p className="text-muted small">
										Fields like "Username", "Service Link",
										or "Notes" are entirely optional. If you
										leave them blank when creating or
										editing an entry, the layout
										automatically cleans itself up to save
										screen space.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DashboardPage;
