export default function Expensetracker({
    trip,
    categories,
    expCategory,
    setExpCategory,
    expAmount,
    setExpAmount,
    expDesc,
    setExpDesc,
    expDate,
    setExpDate,
    handleAddExpenseSubmit,
    handleDeleteExpense,
    getExpensesByCategory,
    getActualTotal,
}) {
    return (
        <section style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '30px', backdropFilter: 'blur(16px)' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', gap: '15px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Expense Tracker</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Creative Feature: Track real spending against AI predictions</p>
              </div>

              {/* Expense budget status highlights */}
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Spend</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: getActualTotal() > (trip.estimatedBudget?.total || 0) ? 'var(--danger-color)' : 'var(--success-color)' }}>
                  ${getActualTotal()}
                </h3>
              </div>
            </div>

            {/* COMPARATIVE PROGRESS BARS */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '15px' }}>Estimated vs. Actual Comparisons</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {categories.map((cat) => {
                  const estAmt = trip.estimatedBudget[cat.toLowerCase()] || 0;
                  const actAmt = getExpensesByCategory(cat);
                  const isOver = actAmt > estAmt;
                  const diff = actAmt - estAmt;
                  // Percentage of estimate
                  const pct = estAmt === 0 ? 0 : Math.round((actAmt / estAmt) * 100);

                  return (
                    <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: '600' }}>{cat}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Est: ${estAmt} vs. Act: <strong style={{ color: isOver ? 'var(--danger-color)' : 'var(--success-color)' }}>${actAmt}</strong>
                        </span>
                      </div>
                      
                      {/* Comparative Meter Bar */}
                      <div style={{ background: 'rgba(255, 255, 255, 0.05)', height: '12px', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ background: isOver ? 'var(--danger-color)' : 'var(--success-color)', height: '100%', width: `${Math.min(100, (actAmt / (estAmt || 1)) * 100)}%`, transition: 'width 0.4s ease' }}></div>
                        {/* Target line for Estimated */}
                        <div style={{ position: 'absolute', top: '0', bottom: '0', left: '100%', transform: 'translateX(-2px)', width: '2px', background: '#fff', opacity: '0.5' }}></div>
                      </div>

                      {/* Variance Indicator */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>{pct}% of prediction spent</span>
                        <span>
                          {diff === 0 ? 'On budget' : diff > 0 ? `Over budget by $${diff}` : `Remaining: $${Math.abs(diff)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EXPENSE LOGGING SPLIT */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }} className="details-split-grid no-print">
              
              {/* Form to log expense */}
              <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '18px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>Log New Expense</h4>
                <form onSubmit={handleAddExpenseSubmit}>
                  
                  {/* Category select */}
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Category</label>
                    <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '0.9rem' }}>
                      <option value="Food">Food</option>
                      <option value="Accommodation">Accommodation</option>
                      <option value="Flights">Flights</option>
                      <option value="Activities">Activities</option>
                      <option value="Misc">Misc (Shopping/Gifts)</option>
                    </select>
                  </div>

                  {/* Amount input */}
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Amount (USD)</label>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <input type="number" required placeholder="0" min="1" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 8px 8px 28px', color: '#fff', fontSize: '0.9rem' }} />
                    </div>
                  </div>

                  {/* Description input */}
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Description</label>
                    <input type="text" placeholder="e.g. Local sushi bar dinner" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '0.9rem' }} />
                  </div>

                  {/* Date Input */}
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Date</label>
                    <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '0.9rem' }} />
                  </div>

                  <button type="submit" style={{ width: '100%', padding: '10px', background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                    Log Cost
                  </button>
                </form>
              </div>

              {/* Logged Expense History list */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>Logged Expense History</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
                  {trip.expenses && trip.expenses.length > 0 ? (
                    [...trip.expenses].reverse().map((exp) => (
                      <div key={exp._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 14px' }}>
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {exp.description || `${exp.category} Expense`}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {exp.category} • {new Date(exp.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            ${exp.amount}
                          </span>
                          <button type = "button" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }} className="btn-copy" onClick={() => handleDeleteExpense(exp._id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '30px 0' }}>
                      No expenses logged yet. Add costs using the form to analyze your budget.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
    )
}