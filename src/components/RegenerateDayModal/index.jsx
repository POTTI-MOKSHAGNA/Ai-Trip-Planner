import "./index.css";

export default function RegenerateDayModal({
    activeDay,
    regenRequest,
    setRegenRequest,
    handleRegenerateDaySubmit,
    regenerating,
    onClose,
}) {
    return (
        <div className="regen-modal-overlay">
            <div className="regen-modal">

                {regenerating && (
                    <div className="regen-loading-overlay">
                        <div className="spinner"></div>

                        <h3 className="regen-loading-title">
                            Regenerating Day {activeDay}
                        </h3>

                        <p className="regen-loading-text">
                            Re-planning activities using AI...
                        </p>
                    </div>
                )}

                <h3 className="regen-modal-title">
                    Modify Itinerary: Day {activeDay}
                </h3>

                <p className="regen-modal-description">
                    Tell our AI travel agent how you'd like to adjust this day's activities
                    (e.g. "Regenerate Day {activeDay} with more outdoor exploration"
                    or "Make this a museum day").
                </p>

                <form onSubmit={handleRegenerateDaySubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            Your Modification Request
                        </label>

                        <textarea
                            required
                            placeholder="e.g. Include a sushi-making workshop and visit local temple parks instead of shopping centers"
                            value={regenRequest}
                            onChange={(e) => setRegenRequest(e.target.value)}
                            className="regen-textarea"
                        />
                    </div>

                    <div className="regen-modal-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="regen-cancel-btn"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="regen-submit-btn"
                        >
                            Regenerate Day
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}