import "./index.css";

export default function CreateTripModal({
    onClose,
    onSubmit,
    creatingTrip,
    loadingMessage,
    destination,
    setDestination,
    days,
    setDays,
    budgetType,
    setBudgetType,
    interestOptions,
    selectedInterests,
    handleInterestChange,
}) {
    return (
        <div className="trip-modal-overlay">
            <div className="trip-modal">

                {creatingTrip && (
                    <div className="trip-modal-loading">
                        <div className="spinner large-spinner"></div>

                        <h2 className="loading-title">
                            Generating Trip Itinerary
                        </h2>

                        <p className="loading-message">
                            {loadingMessage}
                        </p>

                        <p className="loading-description">
                            This takes a few seconds as the AI curates coordinates,
                            activity descriptions, and local dining locations.
                        </p>
                    </div>
                )}

                <button
                    className="modal-close-btn"
                    onClick={onClose}
                >
                    ×
                </button>

                <h2 className="modal-title">
                    Plan a New AI Trip
                </h2>

                <p className="modal-subtitle">
                    Fill in your specifications and the AI travel agent
                    will draft your travel plan.
                </p>

                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            Where do you want to go?
                        </label>

                        <input
                            className="form-input"
                            type="text"
                            required
                            placeholder="e.g. Tokyo, Paris, Rome"
                            value={destination}
                            onChange={(e) =>
                                setDestination(e.target.value)
                            }
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">
                                Duration (Days)
                            </label>

                            <input
                                className="form-input"
                                type="number"
                                min="1"
                                max="14"
                                required
                                value={days}
                                onChange={(e) =>
                                    setDays(e.target.value)
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Budget Level
                            </label>

                            <select
                                className="form-input"
                                value={budgetType}
                                onChange={(e) =>
                                    setBudgetType(e.target.value)
                                }
                            >
                                <option value="Low">
                                    Low (Backpacker)
                                </option>

                                <option value="Medium">
                                    Medium (Balanced)
                                </option>

                                <option value="High">
                                    High (Luxury)
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Travel Interests
                        </label>

                        <div className="interest-list">
                            {interestOptions.map((interest) => {
                                const isSelected =
                                    selectedInterests.includes(
                                        interest
                                    );

                                return (
                                    <button
                                        key={interest}
                                        type="button"
                                        className={`interest-btn ${
                                            isSelected
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleInterestChange(
                                                interest
                                            )
                                        }
                                    >
                                        {interest}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="create-btn"
                        >
                            Create Plan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}