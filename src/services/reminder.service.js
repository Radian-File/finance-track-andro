const prisma = require('../config/prisma');
const { formatDecimal } = require('../utils/formatBudget');

function getDateOnlyInJakarta(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function toStartOfDay(dateString) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function toEndOfDay(dateString) {
  return new Date(`${dateString}T23:59:59.999Z`);
}

function getMonthDateRange(month, year) {
  return {
    startDate: new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)),
    endDate: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
  };
}

function getBudgetStatus(usagePercentage) {
  if (usagePercentage >= 100) return 'exceeded';
  if (usagePercentage >= 80) return 'warning';
  return 'safe';
}

async function getTodayTransactionCount(userId) {
  const today = getDateOnlyInJakarta();

  return prisma.transaction.count({
    where: {
      userId,
      transactionDate: {
        gte: toStartOfDay(today),
        lte: toEndOfDay(today),
      },
    },
  });
}

async function calculateBudgetWarning(budget) {
  const { startDate, endDate } = getMonthDateRange(budget.month, budget.year);
  const result = await prisma.transaction.aggregate({
    where: {
      userId: budget.userId,
      type: 'expense',
      category: budget.category,
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const limitAmount = formatDecimal(budget.limitAmount);
  const usedAmount = formatDecimal(result._sum.amount || 0);
  const usagePercentage = limitAmount > 0 ? Math.round((usedAmount / limitAmount) * 100) : 0;
  const status = getBudgetStatus(usagePercentage);

  if (usagePercentage < 80) return null;

  return {
    budgetId: budget.id,
    category: budget.category,
    limitAmount,
    usedAmount,
    usagePercentage,
    status,
    message: status === 'exceeded'
      ? `Budget ${budget.category} sudah terlewati ${usagePercentage}%.`
      : `Budget ${budget.category} sudah terpakai ${usagePercentage}%.`,
  };
}

async function getBudgetWarnings(userId, month, year) {
  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      month,
      year,
    },
    orderBy: { category: 'asc' },
  });

  const warnings = await Promise.all(budgets.map(calculateBudgetWarning));
  return warnings.filter(Boolean);
}

async function getReminderSummary({ userId, month, year }) {
  const todayTransactionCount = await getTodayTransactionCount(userId);
  const hasLoggedToday = todayTransactionCount > 0;
  const budgetWarnings = await getBudgetWarnings(userId, month, year);

  return {
    todayTransactionCount,
    hasLoggedToday,
    dailyReminder: {
      shouldRemind: !hasLoggedToday,
      message: hasLoggedToday
        ? 'Kamu sudah mencatat transaksi hari ini. Pertahankan kebiasaan baik ini.'
        : 'Hari ini kamu belum mencatat transaksi. Yuk catat pengeluaran atau pemasukan hari ini.',
    },
    budgetWarnings,
  };
}

module.exports = {
  getReminderSummary,
};
