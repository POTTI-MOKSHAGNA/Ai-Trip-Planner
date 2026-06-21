export default function BudgetSection({
    estimatedBudget,
    categories,
}) {
    return <section style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '30px', backdropFilter: 'blur(16px)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '25px' }}>
              Estimated Budget
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {categories.map((cat) => {
                const estAmt = estimatedBudget[cat.toLowerCase()] || 0;
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{cat}</span>
                      <span style={{ fontWeight: '600' }}>${estAmt}</span>
                    </div>
                    {/* Visual Meter bar */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ background: 'var(--accent-gradient)', height: '100%', width: `${Math.min(100, (estAmt / (estimatedBudget.total || 1)) * 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Total Estimated</span>
                <span style={{ fontWeight: '800', fontSize: '1.4rem', color: 'var(--accent-color)' }}>
                  ${estimatedBudget?.total || 0}
                </span>
              </div>
            </div>
          </section>
}