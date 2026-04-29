// This file uses AI assistance (Copilot) to implement Bootstrap for styling.

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
	const { isAuthenticated, user, logout } = useAuth();
	const navigate = useNavigate();

	if (!isAuthenticated) {
		navigate("/login");
		return null;
	}

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<div className="container mt-5">
			<div className="row">
				<nav className="col-md-3 col-lg-2 d-md-block bg-light sidebar">
					<div className="position-sticky">
						<ul className="nav flex-column">
							<li className="nav-item">
								<a className="nav-link" href="#">
									Password Vault
								</a>
							</li>
							<li className="nav-item">
								<a className="nav-link" href="#">
									Add New Password
								</a>
							</li>
							<li className="nav-item">
								<a className="nav-link" href="#">
									Settings
								</a>
							</li>
							<li className="nav-item">
								<button
									className="btn btn-danger mt-3 w-100"
									onClick={handleLogout}
								>
									Logout
								</button>
							</li>
						</ul>
					</div>
				</nav>
				<main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
					<div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
						<h1 className="h2">
							Welcome, {user?.email || "User"}!
						</h1>
					</div>
					<div>
						<h3>Your Password Vault</h3>
						<p>
							Here you can view and manage your saved passwords.
						</p>
						{/* Add password management components here */}
					</div>
				</main>
			</div>
		</div>
	);
};

export default DashboardPage;
