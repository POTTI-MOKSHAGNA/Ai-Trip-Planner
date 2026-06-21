export default function RegenerateDayModal({
    activeDay,
    regenRequest,
    setRegenRequest,
    handleRegenerateDaySubmit,
    regenerating,
    onClose,
}) {
    return(
        <div style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(5, 7, 12, 0.85)', backdropFilter: 'blur(8px)', zIndex: '100', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#111827', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-lg)', borderRadius: '24px', width: '100%', maxWidth: '480px', padding: '32px', position: 'relative' }}>
            
            {/* Spinner Cover */}
            {regenerating && (
              <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(17, 24, 39, 0.95)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', textAlign: 'center', zIndex: '10' }}>
                <div className="spinner" style={{ marginBottom: '20px' }}></div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '8px' }}>Regenerating Day {activeDay}</h3>
                <p style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Re-planning activities using AI...</p>
              </div>
            )}

            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>Modify Itinerary: Day {activeDay}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Tell our AI travel agent how you'd like to adjust this day's activities (e.g. "Regenerate Day {activeDay} with more outdoor exploration" or "Make this a museum day").
            </p>

            <form onSubmit={handleRegenerateDaySubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Your Modification Request</label>
                <textarea required placeholder="e.g. Include a sushi-making workshop and visit local temple parks instead of shopping centers" value={regenRequest} onChange={(e) => setRegenRequest(e.target.value)} style={{ width: '100%', minHeight: '80px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', color: '#fff', resize: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.95rem' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} style={{ padding: '10px 18px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 22px', border: 'none', background: 'var(--accent-gradient)', color: '#fff', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Regenerate Day
                </button>
              </div>
            </form>
          </div>
        </div>
    )
}