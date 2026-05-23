function formatDecimal(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'number') return value;
  if (typeof value.toNumber === 'function') return value.toNumber();
  return Number(value);
}

function calculateBudgetStatus(usagePercentage) {
  if (usagePercentage >= 100) return 'exceeded';
  if (usagePercentage >= 80) return 'warning';
  return 'safe';
}

function formatBudget(budget, usage = {}) {
  if (!budget) return null;

  const limitAmount = formatDecimal(budget.limitAmount);
  const usedAmount = formatDecimal(usage.usedAmount || 0);
  const remainingAmount = limitAmount - usedAmount;
  const usagePercentage = limitAmount > 0 ? Math.round((usedAmount / limitAmount) * 100) : 0;

  return {
    id: budget.id,
    userId: budget.userId,
    category: budget.category,
    limitAmount,
    month: budget.month,
    year: budget.year,
    usedAmount,
    remainingAmount,
    usagePercentage,
    status: calculateBudgetStatus(usagePercentage),
  };
}

module.exports = {
  formatBudget,
  calculateBudgetStatus,
  formatDecimal,
};
