import { Link } from "react-router-dom";
import "./index.css";

function Navbar({ handleLogout }) {
    return (
        <header className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    ✈️ AI Trip Planner
                </Link>

                <button
                    type="button"
                    className="navbar-logout-btn"
                    onClick={handleLogout}
                >
                    Log Out
                </button>
            </div>
        </header>
    );
}

export default Navbar;