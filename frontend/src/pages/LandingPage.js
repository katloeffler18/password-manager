import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="text-center">
                <h1>Secure Password Manager</h1>
                <p>Your Passwords. Secure and Accessible.</p>
                <div className="mt-4">
                    <Link to="/login" className="btn btn-primary me-3">
                        Login
                    </Link>
                    <Link to="/register" className="btn btn-success">
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LandingPage
