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
        <section style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '30px', backdropFilter: 'blur(16px)', position: 'relative' }}>
            
            {/* Header with actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '25px' }} className="no-print">
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Daily Itinerary</h2>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-color)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)', fontWeight: '600', cursor: 'pointer' }} onClick={() => setShowRegenModal(true)}>
                   Regenerate Day {activeDay}
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: '600', cursor: 'pointer' }} onClick={() => setShowAddActForm(!showAddActForm)}>
                   Add Activity
                </button>
              </div>
            </div>

            {/* Days Tabs (Selector) */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '25px', borderBottom: '1px solid var(--border-color)' }} className="no-print">
              {trip.itinerary.map(dayObj => (
                <button key={dayObj.day} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid', borderColor: activeDay === dayObj.day ? 'var(--accent-color)' : 'var(--border-color)', background: activeDay === dayObj.day ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.01)', color: '#fff', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'var(--transition)', flexShrink: '0' }} onClick={() => {
                  setActiveDay(dayObj.day);
                  setShowAddActForm(false);
                }}>
                  Day {dayObj.day}
                </button>
              ))}
            </div>

            {/* PRINT ALL DAYS DIRECTLY */}
            <div className="print-only" style={{ display: 'none' }}>
              {trip.itinerary.map(dayObj => (
                <div key={dayObj.day} style={{ pageBreakAfter: 'always', marginBottom: '40px' }}>
                  <h2 style={{ fontSize: '1.6rem', borderBottom: '1px solid #ddd', paddingBottom: '8px', color: '#111827', marginBottom: '20px' }}>
                    Day {dayObj.day}
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {dayObj.activities.map((act) => (
                      <div key={act._id} style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ minWidth: '100px', fontWeight: 'bold', color: 'var(--accent-color)' }}>{act.time}</div>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', margin: '0 0 5px 0', color: '#111827' }}>{act.title}</h3>
                          <p style={{ margin: '0', color: '#4b5563' }}>{act.description}</p>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
                  {/* Timeline connecting line */}
                  <div style={{ position: 'absolute', top: '15px', bottom: '15px', left: '23px', width: '2px', background: 'var(--border-color)', zIndex: '0' }}></div>

                  {activeDayObj.activities.map((act) => (
                    <div key={act._id} style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: '1' }}>
                      
                      {/* Timeline Node Icon/Bullet */}
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--card-bg-solid)', border: '2px solid var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem', color: 'var(--accent-color)', flexShrink: '0' }} title={act.time}>
                        {act.time.charAt(0)}
                      </div>

                      {/* Card Content */}
                      <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '18px 22px', flexGrow: '1', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'inline-block' }}>
                            {act.time}
                          </span>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>{act.title}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.4' }}>{act.description}</p>
                        </div>
                        
                        {/* Delete Activity */}
                        <button type="button" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '4px', transition: 'var(--transition)' }} className="btn-copy" onClick={() => handleDeleteActivity(activeDay, act._id)} title="Delete Activity">
                            Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <p>No activities planned for Day {activeDay}.</p>
                  <button className="btn-copy" style={{ background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', marginTop: '15px', cursor: 'pointer' }} onClick={() => setShowAddActForm(true)}>
                    Add Your First Activity
                  </button>
                </div>
              )}
            </div>
            {/* ADD CUSTOM ACTIVITY FORM (DOCKABLE) */}
            {showAddActForm && (
              <div style={{ marginTop: '25px', padding: '20px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '16px', animation: 'fadeIn 0.3s ease-out' }} className="no-print">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '15px' }}>Add Activity to Day {activeDay}</h3>
                <form onSubmit={handleAddActivity}>
                  
                  {/* Time Option & Title inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginBottom: '15px' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Time of Day</label>
                      <select value={actTime} onChange={(e) => setActTime(e.target.value)} style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', color: '#fff' }}>
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Activity Title</label>
                      <input type="text" required placeholder="e.g. Louvre Museum Visit" value={actTitle} onChange={(e) => setActTitle(e.target.value)} style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', color: '#fff' }} />
                    </div>
                  </div>

                  {/* Description input */}
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Short Description</label>
                    <textarea placeholder="Write details about reservation numbers, local tips, or plans..." value={actDesc} onChange={(e) => setActDesc(e.target.value)} style={{ width: '100%', minHeight: '60px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', color: '#fff', resize: 'none', fontFamily: 'var(--font-sans)' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setShowAddActForm(false)} style={{ padding: '8px 16px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button type="submit" style={{ padding: '8px 20px', background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                      Add Activity
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
    )
}