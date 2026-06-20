import React, { useState , useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Cookies from 'js-cookie';
import { useAuth } from '../../context/AuthContext';
import "./index.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const {login} = useAuth();
    const token = Cookies.get('jwt_token');
    useEffect(() => {
        if (token) {
            navigate('/', { replace: true });
        }
    }, [token, navigate]);

    const handleSignIn = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        // Authentication logic will come later
        const result = await login(email, password);

        setTimeout(() => {
            setLoading(false);
        }, 1000);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1 className="login-title">AI Trip Planner</h1>
                <p className="login-subtitle">
                    Sign in to access your personalized travel dashboard.
                </p>

                <form className="login-form" onSubmit={handleSignIn}>
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

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

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? "Signing In..." : "Sign In"}
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