// This file uses AI assistance (Copilot) to implement
// Bootstrap styling and OTP authentication flow integration.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  // Login credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // OTP state
  const [otp, setOtp] = useState("");

  // Tracks whether the backend has already accepted credentials
  // and sent an OTP email.
  const [otpStep, setOtpStep] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    login,
    verifyOtp,
    isAuthenticated,
  } = useAuth();

  const navigate = useNavigate();

  // Redirect authenticated users directly into vault
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/vault");
    }
  }, [isAuthenticated, navigate]);

  async function handleLoginSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      /*
       * Step 1:
       * Send email/password to backend.
       * Backend verifies credentials and emails OTP.
       */
      await login(email, password);

      // Move UI into OTP entry mode
      setOtpStep(true);

    } catch (err) {
      setError(
        err?.body?.error ||
        "Unable to log in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      /*
       * Step 2:
       * Verify OTP and receive JWT token.
       * AuthContext also stores vaultPassword in memory here.
       */
      await verifyOtp(otp, email);

      navigate("/vault");

    } catch (err) {
      setError(
        err?.body?.error ||
        "Invalid or expired OTP."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ width: "400px" }}>

        <h1 className="text-center mb-4">
          {otpStep ? "Enter OTP" : "Login"}
        </h1>

        {error ? (
          <div className="alert alert-danger">
            {error}
          </div>
        ) : null}

        {!otpStep ? (
          /*
           * LOGIN FORM
           */
          <form onSubmit={handleLoginSubmit}>

            <div className="mb-3">
              <label className="form-label">
                Email:
              </label>

              <input
                className="form-control"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Password:
              </label>

              <input
                className="form-control"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Login"}
            </button>

          </form>
        ) : (
          /*
           * OTP FORM
           */
          <form onSubmit={handleOtpSubmit}>

            <div className="mb-3">
              <label className="form-label">
                One-Time Password
              </label>

              <input
                className="form-control"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP from email"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-success w-100 mb-3"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

          </form>
        )}

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
