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
        <section className="expense-tracker-section">
              <div className="expense-tracker-header">
                  <div>
                      <h2 className="expense-tracker-title">
                          Expense Tracker
                      </h2>

                      <p className="expense-tracker-subtitle">
                          Track real spending against AI predictions
                      </p>
                  </div>

              {/* Expense budget status highlights */}
              <div className="expense-total">
                <span className="expense-total-label">
                    Total Spend
                </span>

                <h3
                    className="expense-total-value"
                    style={{
                        color:
                            getActualTotal() >
                            (trip.estimatedBudget?.total || 0)
                                ? "var(--danger-color)"
                                : "var(--success-color)",
                    }}
                >
                    ${getActualTotal()}
                </h3>
              </div>
            </div>

            {/* COMPARATIVE PROGRESS BARS */}
            <div className="comparison-section">
                <h3 className="comparison-title">
                    Estimated vs. Actual Comparisons
                </h3>

                <div className="comparison-list">
                    {categories.map((cat) => {
                        const estAmt =
                            trip.estimatedBudget[cat.toLowerCase()] || 0;

                        const actAmt =
                            getExpensesByCategory(cat);

                        const isOver = actAmt > estAmt;
                        const diff = actAmt - estAmt;

                        const pct =
                            estAmt === 0
                                ? 0
                                : Math.round(
                                      (actAmt / estAmt) * 100
                                  );

                        return (
                            <div
                                key={cat}
                                className="comparison-item"
                            >
                                <div className="comparison-header">
                                    <span className="comparison-category">
                                        {cat}
                                    </span>

                                    <span className="comparison-values">
                                        Est: ${estAmt} vs. Act:
                                        <strong
                                            className={
                                                isOver
                                                    ? "comparison-over"
                                                    : "comparison-under"
                                            }
                                        >
                                            {" "}
                                            ${actAmt}
                                        </strong>
                                    </span>
                                </div>

                                <div className="comparison-bar">
                                    <div
                                        className={`comparison-fill ${
                                            isOver
                                                ? "comparison-fill-over"
                                                : "comparison-fill-under"
                                        }`}
                                        style={{
                                            width: `${Math.min(
                                                100,
                                                (actAmt /
                                                    (estAmt || 1)) *
                                                    100
                                            )}%`,
                                        }}
                                    ></div>

                                    <div className="comparison-target-line"></div>
                                </div>

                                <div className="comparison-footer">
                                    <span>
                                        {pct}% of prediction spent
                                    </span>

                                    <span>
                                        {diff === 0
                                            ? "On budget"
                                            : diff > 0
                                            ? `Over budget by $${diff}`
                                            : `Remaining: $${Math.abs(
                                                  diff
                                              )}`}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* EXPENSE LOGGING SPLIT */}
            <div className="details-split-grid no-print">
              
              {/* Form to log expense */}
              <div className="expense-form-card">
                  <h4 className="expense-form-title">
                      Log New Expense
                  </h4>

                  <form onSubmit={handleAddExpenseSubmit}>

                      {/* Category */}
                      <div className="form-group expense-form-group">
                          <label className="expense-label">
                              Category
                          </label>

                          <select
                              value={expCategory}
                              onChange={(e) =>
                                  setExpCategory(e.target.value)
                              }
                              className="expense-input"
                          >
                              <option value="Food">Food</option>
                              <option value="Accommodation">
                                  Accommodation
                              </option>
                              <option value="Flights">
                                  Flights
                              </option>
                              <option value="Activities">
                                  Activities
                              </option>
                              <option value="Misc">
                                  Misc (Shopping/Gifts)
                              </option>
                          </select>
                      </div>

                      {/* Amount */}
                      <div className="form-group expense-form-group">
                          <label className="expense-label">
                              Amount (USD)
                          </label>

                          <div className="expense-input-wrapper">
                              <input
                                  type="number"
                                  required
                                  min="1"
                                  placeholder="0"
                                  value={expAmount}
                                  onChange={(e) =>
                                      setExpAmount(e.target.value)
                                  }
                                  className="expense-input"
                              />
                          </div>
                      </div>

                      {/* Description */}
                      <div className="form-group expense-form-group">
                          <label className="expense-label">
                              Description
                          </label>

                          <input
                              type="text"
                              placeholder="e.g. Local sushi bar dinner"
                              value={expDesc}
                              onChange={(e) =>
                                  setExpDesc(e.target.value)
                              }
                              className="expense-input"
                          />
                      </div>

                      {/* Date */}
                      <div className="form-group expense-date-group">
                          <label className="expense-label">
                              Date
                          </label>

                          <input
                              type="date"
                              value={expDate}
                              onChange={(e) =>
                                  setExpDate(e.target.value)
                              }
                              className="expense-input"
                          />
                      </div>

                      <button
                          type="submit"
                          className="expense-submit-btn"
                      >
                          Log Cost
                      </button>
                  </form>
              </div>

              {/* Logged Expense History list */}
              <div className="expense-history">
                  <h4 className="expense-history-title">
                      Logged Expense History
                  </h4>

                  <div className="expense-history-list">
                      {trip.expenses && trip.expenses.length > 0 ? (
                          [...trip.expenses]
                              .reverse()
                              .map((exp) => (
                                  <div
                                      key={exp._id}
                                      className="expense-item"
                                  >
                                      <div>
                                          <p className="expense-item-title">
                                              {exp.description ||
                                                  `${exp.category} Expense`}
                                          </p>

                                          <p className="expense-item-meta">
                                              {exp.category} •{" "}
                                              {new Date(
                                                  exp.date
                                              ).toLocaleDateString()}
                                          </p>
                                      </div>

                                      <div className="expense-item-actions">
                                          <span className="expense-item-amount">
                                              ${exp.amount}
                                          </span>

                                          <button
                                              type="button"
                                              className="expense-delete-btn"
                                              onClick={() =>
                                                  handleDeleteExpense(
                                                      exp._id
                                                  )
                                              }
                                          >
                                              Delete
                                          </button>
                                      </div>
                                  </div>
                              ))
                      ) : (
                          <p className="expense-empty-state">
                              No expenses logged yet. Add costs
                              using the form to analyze your
                              budget.
                          </p>
                      )}
                  </div>
              </div>
            </div>
          </section>
    )
}