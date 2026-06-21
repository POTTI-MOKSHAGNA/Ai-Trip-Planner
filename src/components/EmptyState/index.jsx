import React from "react";
import "./index.css";

function EmptyState({ onCreateTrip }) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                ✈️
            </div>

            <h2 className="empty-state-title">
                No Trips Planned Yet
            </h2>

            <p className="empty-state-description">
                Where would you like to explore next? Enter your preferences and let our AI create a custom travel guide for you.
            </p>

            <button
                className="empty-state-button"
                onClick={onCreateTrip}
            >
                Plan Your First Trip
            </button>
        </div>
    );
}

export default EmptyState;