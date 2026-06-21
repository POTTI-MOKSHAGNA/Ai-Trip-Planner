import "./index.css";

export default function HotelSelection({ hotels }) {
    return (
        <section className="hotel-section">
            <h2 className="hotel-section-title">
                Suggested Hotels
            </h2>

            <div className="hotel-list">
                {hotels && hotels.length > 0 ? (
                    hotels.map((hotel) => (
                        <div
                            key={hotel._id || hotel.name}
                            className="hotel-card"
                        >
                            <div className="hotel-card-header">
                                <span
                                    className={`hotel-tier hotel-tier-${hotel.tier
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")}`}
                                >
                                    {hotel.tier}
                                </span>

                                <span className="hotel-price">
                                    {hotel.priceRange}
                                </span>
                            </div>

                            <h4 className="hotel-name">
                                {hotel.name}
                            </h4>

                            <p className="hotel-description">
                                {hotel.description}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="hotel-empty">
                        No hotel suggestions compiled.
                    </p>
                )}
            </div>
        </section>
    );
}