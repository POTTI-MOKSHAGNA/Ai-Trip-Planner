import { useState , useEffect } from "react";
import { useNavigate , Link } from "react-router-dom";
import Cookie from "js-cookie";
import {useAuth } from '../../context/AuthContext'
import "./index.css";

function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const token = Cookies.get('jwt_token');
    useEffect(() => {
        if (token) {
        navigate('/', { replace: true });
        }
    }, [token, navigate]);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password || !confirmPassword) {
        setError('Please fill in all fields.');
        return;
        }

        if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
        }

        if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
        }

        setLoading(true);
        const result = await register(email, password);
        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };


    return (
        <div className="signup-page">
            <div className="signup-card">
                <h1 className="signup-title">AI Trip Planner</h1>

                <p className="signup-subtitle">
                    Create an account to start planning your journeys.
                </p>
                {error && (
                    <div className="error-banner" role="alert">
                        {error}
                    </div>  
                )}

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
                        {loading ? 'Creating Account...' : 'Sign Up'}
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