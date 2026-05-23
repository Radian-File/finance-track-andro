const prisma = require('../config/prisma');
const { formatBudget } = require('../utils/formatBudget');

function createHttpError(statusCode, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
}

function removeUndefined(data) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  );
}

function mapPrismaError(error) {
  if (error.code === 'P2003') {
    return createHttpError(400, 'Invalid userId reference');
  }

  return error;
}

function getMonthDateRange(month, year) {
  return {
    startDate: new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)),
    endDate: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
  };
}

async function calculateBudgetUsage(budget) {
  const { startDate, endDate } = getMonthDateRange(budget.month, budget.year);
  const where = {
    type: 'expense',
    category: budget.category,
    transactionDate: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (budget.userId) {
    where.userId = budget.userId;
  }

  const result = await prisma.transaction.aggregate({
    where,
    _sum: {
      amount: true,
    },
  });

  return {
    usedAmount: result._sum.amount || 0,
  };
}

async function formatBudgetWithUsage(budget) {
  const usage = await calculateBudgetUsage(budget);
  return formatBudget(budget, usage);
}

async function createBudget(data) {
  try {
    const budget = await prisma.budget.create({
      data: removeUndefined({
        userId: data.userId,
        category: data.category,
        limitAmount: data.limitAmount,
        month: data.month,
        year: data.year,
      }),
    });

    return formatBudgetWithUsage(budget);
  } catch (error) {
    throw mapPrismaError(error);
  }
}

function buildBudgetWhere(filters) {
  return removeUndefined({
    userId: filters.userId,
    category: filters.category,
    month: filters.month,
    year: filters.year,
  });
}

async function getBudgets(filters) {
  const budgets = await prisma.budget.findMany({
    where: buildBudgetWhere(filters),
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { category: 'asc' },
    ],
  });

  return Promise.all(budgets.map((budget) => formatBudgetWithUsage(budget)));
}

async function getBudgetById(id, userId) {
  const budget = await prisma.budget.findFirst({
    where: removeUndefined({ id, userId }),
  });

  if (!budget) {
    throw createHttpError(404, 'Budget not found');
  }

  return formatBudgetWithUsage(budget);
}

async function updateBudget(id, data, authenticatedUserId) {
  await getBudgetById(id, authenticatedUserId);

  try {
    const budget = await prisma.budget.update({
      where: { id },
      data: removeUndefined({
        userId: data.userId,
        category: data.category,
        limitAmount: data.limitAmount,
        month: data.month,
        year: data.year,
      }),
    });

    return formatBudgetWithUsage(budget);
  } catch (error) {
    throw mapPrismaError(error);
  }
}

async function deleteBudget(id, authenticatedUserId) {
  await getBudgetById(id, authenticatedUserId);

  await prisma.budget.delete({
    where: { id },
  });
}

module.exports = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
};
