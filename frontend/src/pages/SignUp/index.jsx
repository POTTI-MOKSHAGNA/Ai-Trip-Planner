import { useState } from "react";
import { Link } from "react-router-dom";
import "./index.css";

function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    return (
        <div className="signup-page">
            <div className="signup-card">
                <h1 className="signup-title">AI Trip Planner</h1>

                <p className="signup-subtitle">
                    Create an account to start planning your journeys.
                </p>

                <form className="signup-form">
                    <div className="signup-field">
                        <label htmlFor="email" className="signup-label">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            name="email"
                            className="signup-input"
                            required
                        />
                    </div>

                    <div className="signup-field">
                        <label htmlFor="password" className="signup-label">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            id="password"
                            name="password"
                            className="signup-input"
                            required
                        />
                    </div>

                    <div className="signup-field">
                        <label
                            htmlFor="confirmPassword"
                            className="signup-label"
                        >
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            id="confirmPassword"
                            name="confirmPassword"
                            className="signup-input"
                            required
                        />
                    </div>

                    <button type="submit" className="signup-button">
                        Sign Up
                    </button>

                    <p className="signup-footer">
                        Already have an account?{" "}
                        <Link to="/login" className="signup-link">
                            Sign In
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default SignUp;