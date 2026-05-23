const prisma = require('../config/prisma');
const { formatDecimal } = require('../utils/formatBudget');
const { formatDateOnly } = require('../utils/formatTransaction');

function getMonthDateRange(month, year) {
  return {
    startDate: new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)),
    endDate: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
  };
}

function getPreviousMonthYear(month, year) {
  if (month === 1) return { month: 12, year: year - 1 };
  return { month: month - 1, year };
}

function buildTransactionWhere({ month, year, userId }) {
  const { startDate, endDate } = getMonthDateRange(month, year);

  return {
    ...(userId ? { userId } : {}),
    transactionDate: {
      gte: startDate,
      lte: endDate,
    },
  };
}

function groupByCategory(transactions, type, totalAmount) {
  const grouped = transactions
    .filter((transaction) => transaction.type === type)
    .reduce((acc, transaction) => {
      const amount = formatDecimal(transaction.amount);
      acc[transaction.category] = (acc[transaction.category] || 0) + amount;
      return acc;
    }, {});

  return Object.entries(grouped)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalAmount > 0 ? Number(((amount / totalAmount) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function formatTransactionForInsight(transaction) {
  if (!transaction) return null;

  return {
    id: transaction.id,
    type: transaction.type,
    amount: formatDecimal(transaction.amount),
    category: transaction.category,
    description: transaction.description,
    transactionDate: formatDateOnly(transaction.transactionDate),
  };
}

async function getPreviousMonthExpense({ month, year, userId }) {
  const previous = getPreviousMonthYear(month, year);
  const result = await prisma.transaction.aggregate({
    where: {
      ...buildTransactionWhere({ ...previous, userId }),
      type: 'expense',
    },
    _sum: {
      amount: true,
    },
  });

  return formatDecimal(result._sum.amount || 0);
}

async function getFinancialSummary({ month, year, userId }) {
  const where = buildTransactionWhere({ month, year, userId });
  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { transactionDate: 'desc' },
  });

  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + formatDecimal(transaction.amount), 0);

  const totalExpense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + formatDecimal(transaction.amount), 0);

  const expenseByCategory = groupByCategory(transactions, 'expense', totalExpense);
  const incomeByCategory = groupByCategory(transactions, 'income', totalIncome);
  const topExpenseCategory = expenseByCategory[0]?.category || null;
  const topIncomeCategory = incomeByCategory[0]?.category || null;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const averageDailyExpense = daysInMonth > 0 ? Math.round(totalExpense / daysInMonth) : 0;
  const highestExpenseTransaction = transactions
    .filter((transaction) => transaction.type === 'expense')
    .sort((a, b) => formatDecimal(b.amount) - formatDecimal(a.amount))[0] || null;
  const previousMonthExpense = await getPreviousMonthExpense({ month, year, userId });
  const expenseChangePercentage = previousMonthExpense > 0
    ? Number((((totalExpense - previousMonthExpense) / previousMonthExpense) * 100).toFixed(2))
    : null;

  return {
    period: { month, year },
    transactions,
    summary: {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: transactions.length,
      expenseByCategory,
      incomeByCategory,
      topExpenseCategory,
      topIncomeCategory,
      averageDailyExpense,
      highestExpenseTransaction: formatTransactionForInsight(highestExpenseTransaction),
      previousMonthExpense,
      expenseChangePercentage,
    },
  };
}

module.exports = {
  getFinancialSummary,
};
