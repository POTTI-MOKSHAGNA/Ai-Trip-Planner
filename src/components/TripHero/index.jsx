export default function TripHero({trip}){

return <section style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '30px', marginBottom: '35px', backdropFilter: 'blur(16px)', animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-color)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                 <span>Itinerary</span>
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '8px' }}>{trip.destination}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <span>{trip.days} Days Trip</span>
                <span>•</span>
                <span style={{ fontSize: '0.9rem', padding: '3px 10px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '20px', color: 'var(--accent-color)', fontWeight: '500' }}>
                  {trip.budgetType} Budget
                </span>
              </p>
            </div>
            {/* Interests checklist summary */}
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>Selected Focus</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {trip.interests && trip.interests.length > 0 ? (
                  trip.interests.map(interest => (
                    <span key={interest} style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                      {interest}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sightseeing</span>
                )}
              </div>
            </div>
          </div>
        </section>
}