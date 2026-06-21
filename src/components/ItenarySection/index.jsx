export default function ItenarySection({
    trip,
    activeDay,
    setActiveDay,
    activeDayObj,
    showAddActForm,
    setShowAddActForm,
    actTime,
    setActTime,
    actTitle,
    setActTitle,
    actDesc,
    setActDesc,
    handleAddActivity,
    handleDeleteActivity,
    setShowRegenModal,
}) {
    return(
        <section className="itinerary-section">
            
            {/* Header with actions */}
            <div className="itinerary-header no-print">
                <h2 className="itinerary-title">Daily Itinerary</h2>

                <div className="itinerary-actions">
                    <button
                        className="regen-day-btn"
                        onClick={() => setShowRegenModal(true)}
                    >
                        Regenerate Day {activeDay}
                    </button>

                    <button
                        className="add-activity-btn"
                        onClick={() => setShowAddActForm(!showAddActForm)}
                    >
                        Add Activity
                    </button>
                </div>
            </div>

            {/* Days Tabs (Selector) */}
            <div className="day-tabs no-print">
                {trip.itinerary.map(dayObj => (
                    <button
                        key={dayObj.day}
                        className={`day-tab ${
                            activeDay === dayObj.day ? "active-day-tab" : ""
                        }`}
                        onClick={() => {
                            setActiveDay(dayObj.day);
                            setShowAddActForm(false);
                        }}
                    >
                        Day {dayObj.day}
                    </button>
                ))}
            </div>

            {/* PRINT ALL DAYS DIRECTLY */}
            <div className="print-only">
                {trip.itinerary.map(dayObj => (
                    <div
                        key={dayObj.day}
                        className="print-day-section"
                    >
                        <h2 className="print-day-title">
                            Day {dayObj.day}
                        </h2>

                        <div className="print-activities">
                            {dayObj.activities.map((act) => (
                                <div
                                    key={act._id}
                                    className="print-activity"
                                >
                                    <div className="print-activity-time">
                                        {act.time}
                                    </div>

                                    <div className="print-activity-content">
                                        <h3 className="print-activity-title">
                                            {act.title}
                                        </h3>

                                        <p className="print-activity-description">
                                            {act.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Render Active Day Timeline */}
            <div className="no-print">
                {activeDayObj && activeDayObj.activities.length > 0 ? (
                    <div className="timeline-container">

                        <div className="timeline-line"></div>

                        {activeDayObj.activities.map((act) => (
                            <div
                                key={act._id}
                                className="timeline-item"
                            >
                                {/* Timeline Node */}
                                <div
                                    className="timeline-node"
                                    title={act.time}
                                >
                                    {act.time.charAt(0)}
                                </div>

                                {/* Activity Card */}
                                <div className="activity-card">
                                    <div className="activity-content">
                                        <span className="activity-time-badge">
                                            {act.time}
                                        </span>

                                        <h4 className="activity-title">
                                            {act.title}
                                        </h4>

                                        <p className="activity-description">
                                            {act.description}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="delete-activity-btn btn-copy"
                                        onClick={() =>
                                            handleDeleteActivity(
                                                activeDay,
                                                act._id
                                            )
                                        }
                                        title="Delete Activity"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-day-state">
                        <p>
                            No activities planned for Day {activeDay}.
                        </p>

                        <button
                            className="add-first-activity-btn btn-copy"
                            onClick={() =>
                                setShowAddActForm(true)
                            }
                        >
                            Add Your First Activity
                        </button>
                    </div>
                )}
            </div>
            {/* ADD CUSTOM ACTIVITY FORM (DOCKABLE) */}
            {showAddActForm && (
              <div className="add-activity-form no-print">
                  <h3 className="add-activity-title">
                      Add Activity to Day {activeDay}
                  </h3>

                  <form onSubmit={handleAddActivity}>
                      {/* Time & Title */}
                      <div className="activity-input-grid">
                          <div className="form-group">
                              <label className="activity-label">
                                  Time of Day
                              </label>

                              <select
                                  value={actTime}
                                  onChange={(e) =>
                                      setActTime(e.target.value)
                                  }
                                  className="activity-select"
                              >
                                  <option value="Morning">
                                      Morning
                                  </option>
                                  <option value="Afternoon">
                                      Afternoon
                                  </option>
                                  <option value="Evening">
                                      Evening
                                  </option>
                              </select>
                          </div>

                          <div className="form-group">
                              <label className="activity-label">
                                  Activity Title
                              </label>

                              <input
                                  type="text"
                                  required
                                  placeholder="e.g. Louvre Museum Visit"
                                  value={actTitle}
                                  onChange={(e) =>
                                      setActTitle(e.target.value)
                                  }
                                  className="activity-input"
                              />
                          </div>
                      </div>

                      {/* Description */}
                      <div className="form-group activity-description-group">
                          <label className="activity-label">
                              Short Description
                          </label>

                          <textarea
                              placeholder="Write details about reservation numbers, local tips, or plans..."
                              value={actDesc}
                              onChange={(e) =>
                                  setActDesc(e.target.value)
                              }
                              className="activity-textarea"
                          />
                      </div>

                      <div className="activity-form-actions">
                          <button
                              type="button"
                              onClick={() =>
                                  setShowAddActForm(false)
                              }
                              className="activity-cancel-btn"
                          >
                              Cancel
                          </button>

                          <button
                              type="submit"
                              className="activity-submit-btn"
                          >
                              Add Activity
                          </button>
                      </div>
                  </form>
              </div>
           )}
          </section>
    )
}