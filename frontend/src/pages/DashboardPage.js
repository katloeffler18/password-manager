import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
	const { isAuthenticated, logout } = useAuth();
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
				<div className="col-12 text-center">
					<h1>Welcome to Your Dashboard</h1>
					<p>Here you can manage your passwords securely.</p>
					<button
						className="btn btn-danger mt-3"
						onClick={handleLogout}
					>
						Logout
					</button>
				</div>
			</div>
		</div>
	);
};

export default DashboardPage
