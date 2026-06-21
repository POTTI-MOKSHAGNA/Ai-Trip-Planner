import React from "react";
import "./index.css";

function DashboardHeader({ onCreateTrip }) {
    return (
        <section className="dashboard-header-section">
            <div className="dashboard-header-content">
                <h1 className="dashboard-title">
                    Your Travel Dashboard
                </h1>

                <p className="dashboard-subtitle">
                    Plan new destinations and manage your tailored
                    day-by-day itineraries.
                </p>
            </div>

            <button
                className="create-trip-btn"
                onClick={onCreateTrip}
            >
                Plan New Trip
            </button>
        </section>
    );
}

export default DashboardHeader;