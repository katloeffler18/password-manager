// This file uses AI assistance (Copilot) to implement Bootstrap for styling.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { login, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/vault");
		}
	}, [isAuthenticated, navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const ok = await login(email, password);
		if (!ok) {
			alert("Invalid email or password");
		}
	};

	return (
		<div className="d-flex justify-content-center align-items-center vh-100 bg-light">
			<div className="card p-4 shadow" style={{ width: "400px" }}>
				<h1 className="text-center mb-4">Login</h1>
				<form onSubmit={handleSubmit}>
					<div className="mb-3">
						<label className="form-label">Email:</label>
						<input
							className="form-control"
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className="mb-3">
						<label>Password:</label>
						<input
							className="form-control"
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					<button
						type="submit"
						className="btn btn-primary w-100 mb-3"
					>
						Login
					</button>
				</form>
				<button
					className="btn btn-secondary w-100"
					onClick={() => navigate("/")}
				>
					Back
				</button>
			</div>
		</div>
	);
};

export default LoginPage;
