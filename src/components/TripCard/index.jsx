import React from "react";
import "./index.css";

function TripCard(props) {
    const { trip, onDelete, onView } = props;

    return (
        <div
            className="trip-card"
            onClick={onView}
        >
            {/* Header */}
            <div className="trip-card-header">
                <span
                    className={`budget-badge budget-${trip.budgetType.toLowerCase()}`}
                >
                    {trip.budgetType} Budget
                </span>

                <h3 className="trip-destination">
                    {trip.destination}
                </h3>

                <div className="trip-duration">
                    <span>{trip.days} Days</span>
                </div>
            </div>

            {/* Body */}
            <div className="trip-card-body">
                <div>
                    <p className="trip-section-title">
                        Interests
                    </p>

                    <div className="trip-interests">
                        {trip.interests &&
                        trip.interests.length > 0 ? (
                            trip.interests.map(
                                (interest) => (
                                    <span
                                        key={interest}
                                        className="trip-tag"
                                    >
                                        {interest}
                                    </span>
                                )
                            )
                        ) : (
                            <span className="trip-tag">
                                General Sightseeing
                            </span>
                        )}
                    </div>
                </div>

                <div className="trip-footer">
                    <div>
                        <p className="cost-label">
                            Estimated Cost
                        </p>

                        <p className="cost-value">
                            ${trip.estimatedBudget?.total || 0}
                        </p>
                    </div>

                    <button
                        className="delete-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(e, trip._id);
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TripCard;