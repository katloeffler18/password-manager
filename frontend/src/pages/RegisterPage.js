// This file uses AI assistance (Copilot) to implement Bootstrap for styling. Also used for generating passwordRegex rules for user password entry validation.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errorMsg, setErrorMsg] = useState("");

	const [mfaSetup, setMfaSetup] = useState(false);
	const [secretKey, setSecretKey] = useState("");

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

		try {
			const secret = await register(email, password);
			setSecretKey(secret);
			setMfaSetup(true);
		} catch (err) {
			if (err.body && err.body.error) {
				setErrorMsg(err.body.error);
			} else {
				setErrorMsg("Registration failed. Please try again.");
			}
		}
	};

	return (
		<div className="d-flex justify-content-center align-items-center vh-100 bg-light">
			<div className="card p-4 shadow" style={{ width: "400px" }}>
				{!mfaSetup ? (
					<>
						<h1 className="text-center mb-4">Register</h1>

						{errorMsg && (
							<div
								className="alert alert-danger py-2 small"
								role="alert"
							>
								⚠️ {errorMsg}
							</div>
						)}

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
							To keep your vault secure, please add our account to
							your chosen authenticator app (e.g., Google
							Authenticator).
						</p>
						<div className="alert alert-info small text-start">
							<strong>Your Secret Key:</strong>
							<div className="text-break font-monospace p-2 bg-dark text-white rounded mt-1 text-center select-all">
								<strong>{secretKey}</strong>
							</div>
						</div>
						<p className="small text-secondary">
							Copy this key and paste it into your authenticator
							application to begin tracking login codes.
						</p>
						<button
							className="btn btn-primary w-100 mt-3"
							onClick={() => navigate("/login")}
						>
							Key Added, Go to Login
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default RegisterPage;
