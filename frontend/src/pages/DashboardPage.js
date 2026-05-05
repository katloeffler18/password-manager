// This file uses AI assistance (Copilot) to implement Bootstrap for styling.

import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useVault from "../hooks/useVault";

const DashboardPage = () => {
	const { isAuthenticated, user, logout } = useAuth();
	const navigate = useNavigate();
	const [search, setSearch] = useState("");

	const { items = [], loading, error } = useVault(true);

	useEffect(() => {
		if (!isAuthenticated) navigate("/login");
	}, [isAuthenticated, navigate]);

	const filteredItems = useMemo(() => {
		return (items || []).filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
	}, [items, search]);

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	if (!isAuthenticated) return null;

	return (
		<div className="min-vh-100 bg-light">
			<div className="container py-4">
				<div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
					<div>
						<h1 className="h3 mb-1">Vault</h1>
						<div className="text-muted">Welcome, {user?.email || "User"}</div>
					</div>

					<div className="d-flex gap-2">
						<button className="btn btn-outline-secondary" onClick={handleLogout}>
							Logout
						</button>
						<button className="btn btn-primary">Add Password</button>
					</div>
				</div>

				<div className="card shadow-sm border-0 mb-4">
					<div className="card-body">
						<div className="row g-3 align-items-center">
							<div className="col-12 col-md-8">
								<input className="form-control form-control-lg" placeholder="Search saved passwords" value={search} onChange={(e) => setSearch(e.target.value)} />
							</div>
							<div className="col-12 col-md-4 text-md-end">
								<small className="text-muted">{loading ? "Loading..." : `${filteredItems.length} items`}</small>
							</div>
						</div>
					</div>
				</div>

				{error ? <div className="alert alert-danger">Error loading vault: {error.message || String(error)}</div> : null}

				{filteredItems.length === 0 ? (
					<div className="card shadow-sm border-0">
						<div className="card-body text-center py-5">
							<h2 className="h5">No passwords yet</h2>
							<p className="text-muted mb-3">Add your first password to start organizing your vault.</p>
							<button className="btn btn-primary">Add password</button>
						</div>
					</div>
				) : (
					<div className="row g-3">
						{filteredItems.map((item) => (
							<div key={item.id} className="col-12 col-md-6 col-lg-4">
								<div className="card shadow-sm h-100 border-0">
									<div className="card-body d-flex flex-column">
										<div className="d-flex justify-content-between align-items-start mb-2">
											<h3 className="h5 mb-0">{item.title}</h3>
											{item.favorite ? <span className="badge text-bg-warning">Favorite</span> : null}
										</div>

										<div className="mt-auto d-flex gap-2">
											<button className="btn btn-sm btn-outline-primary">Edit</button>
											<button className="btn btn-sm btn-outline-secondary">Copy</button>
											<button className="btn btn-sm btn-outline-danger ms-auto">Delete</button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default DashboardPage;
