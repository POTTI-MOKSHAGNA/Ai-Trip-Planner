import React, { useState } from "react";
import { Link } from "react-router-dom";
import './index.css';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="login-page">
            <div className="login-card">
                <h1 className="login-title">AI Trip Planner</h1>
                <p className="login-subtitle">
                    Sign in to access your personalized travel dashboard.
                </p>

                <form className="login-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            name="email"
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            id="password"
                            name="password"
                            className="form-input"
                            required
                        />
                    </div>

                    <button type="submit" className="login-button">
                        Sign In
                    </button>

                    <p className="login-footer">
                        Don't have an account?{" "}
                        <Link to="/signup" className="login-link">
                            Sign Up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;