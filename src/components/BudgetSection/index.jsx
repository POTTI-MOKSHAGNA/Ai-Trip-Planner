import "./index.css";

export default function BudgetSection({
    estimatedBudget,
    categories,
}) {
    return (
        <section className="budget-section">
            <h2 className="budget-title">
                Estimated Budget
            </h2>

            <div className="budget-list">
                {categories.map((cat) => {
                    const estAmt =
                        estimatedBudget[cat.toLowerCase()] || 0;

                    return (
                        <div
                            key={cat}
                            className="budget-item"
                        >
                            <div className="budget-item-header">
                                <span className="budget-category">
                                    {cat}
                                </span>

                                <span className="budget-amount">
                                    ${estAmt}
                                </span>
                            </div>

                            <div className="budget-bar">
                                <div
                                    className="budget-bar-fill"
                                    style={{
                                        width: `${Math.min(
                                            100,
                                            (estAmt /
                                                (estimatedBudget.total ||
                                                    1)) *
                                                100
                                        )}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    );
                })}

                <div className="budget-total">
                    <span className="budget-total-label">
                        Total Estimated
                    </span>

                    <span className="budget-total-value">
                        ${estimatedBudget?.total || 0}
                    </span>
                </div>
            </div>
        </section>
    );
}