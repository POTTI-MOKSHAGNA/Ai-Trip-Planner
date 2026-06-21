import "./index.css";

export default function TripHero({ trip }) {
    return (
        <section className="trip-hero">
            <div className="trip-hero-content">
                <div className="trip-hero-left">
                    <div className="trip-hero-label">
                        <span>Itinerary</span>
                    </div>

                    <h1 className="trip-hero-title">
                        {trip.destination}
                    </h1>

                    <p className="trip-hero-info">
                        <span>{trip.days} Days Trip</span>

                        <span>•</span>

                        <span className="trip-budget-badge">
                            {trip.budgetType} Budget
                        </span>
                    </p>
                </div>

                <div className="trip-hero-right">
                    <p className="trip-focus-title">
                        Selected Focus
                    </p>

                    <div className="trip-focus-list">
                        {trip.interests &&
                        trip.interests.length > 0 ? (
                            trip.interests.map((interest) => (
                                <span
                                    key={interest}
                                    className="trip-focus-tag"
                                >
                                    {interest}
                                </span>
                            ))
                        ) : (
                            <span className="trip-focus-empty">
                                Sightseeing
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}