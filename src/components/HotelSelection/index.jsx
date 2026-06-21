export default function HotelSelection({hotels}){
    return <section style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '30px', backdropFilter: 'blur(16px)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '25px' }}>
              Suggested Hotels
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {hotels && hotels.length > 0 ? (
                hotels.map((hotel) => (
                  <div key={hotel._id || hotel.name} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '18px 20px', transition: 'var(--transition)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', background: hotel.tier === 'Luxury' ? 'rgba(139, 92, 246, 0.15)' : hotel.tier === 'Mid Range' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: hotel.tier === 'Luxury' ? '#a78bfa' : hotel.tier === 'Mid Range' ? '#f59e0b' : 'var(--success-color)' }}>
                        {hotel.tier}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {hotel.priceRange}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>{hotel.name}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>{hotel.description}</p>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No hotel suggestions compiled.</p>
              )}
            </div>
          </section>
}