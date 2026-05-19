// This file uses AI assistance (Copilot) to implement Bootstrap for styling. Also used for generating passwordRegex rules for user password entry validation.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [mfaSetup, setMfaSetup] = useState(false);

	const { register } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		const passwordRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{}|;:,.<>?]).{8,}$/;

		if (!passwordRegex.test(password)) {
			alert(
				"Master password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character.",
			);
			return;
		}

		if (password !== confirmPassword) {
			alert("Passwords do not match!");
			return;
		}

		const ok = await register(email, password);
		if (ok) {
			setMfaSetup(true);
		} else {
			alert("Registration failed");
		}
	};

	return (
		<div className="d-flex justify-content-center align-items-center vh-100 bg-light">
			<div className="card p-4 shadow" style={{ width: "400px" }}>
				{!mfaSetup ? (
					<>
						<h1 className="text-center mb-4">Register</h1>
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
								<label className="form-label">Password:</label>
								<input
									className="form-control"
									type="password"
									id="password"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									required
								/>
							</div>
							<div className="mb-3">
								<label className="form-label">
									Confirm Password:
								</label>
								<input
									className="form-control"
									type="password"
									id="confirmPassword"
									value={confirmPassword}
									onChange={(e) =>
										setConfirmPassword(e.target.value)
									}
									required
								/>
							</div>
							<button
								type="submit"
								className="btn btn-success w-100 mb-3"
							>
								Register
							</button>
						</form>
						<button
							className="btn btn-secondary w-100"
							onClick={() => navigate("/")}
						>
							Back
						</button>
					</>
				) : (
					/* NEW MFA REGISTRATION UX STEP */
					<div className="text-center">
						<h1 className="h3 mb-3">🔒 Setup Your MFA</h1>
						<p className="text-muted small">
							To keep your vault secure, we have automatically
							registered an **Email-based One-Time Password
							(OTP)** method for your account.
						</p>
						<div className="alert alert-info small text-start">
							<strong>How it works:</strong> Each time you attempt
							to unlock your vault, a unique security code will be
							dispatched directly to:
							<div className="text-break font-monospace mt-1">
								<strong>{email}</strong>
							</div>
						</div>
						<p className="small text-secondary">
							Please verify you have access to this inbox before
							proceeding.
						</p>
						<button
							className="btn btn-primary w-100 mt-3"
							onClick={() => navigate("/login")}
						>
							I Understand, Go to Login
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default RegisterPage;
