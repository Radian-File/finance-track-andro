const prisma = require('../config/prisma');
const { parseTransactionMessage } = require('./openrouter.service');
const { formatTransaction } = require('../utils/formatTransaction');

function createHttpError(statusCode, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
}

function getTodayDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function toDateOnly(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toEndOfDay(value) {
  return new Date(`${value}T23:59:59.999Z`);
}

function removeUndefined(data) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  );
}

function mapPrismaError(error) {
  if (error.code === 'P2003') {
    return createHttpError(400, 'Invalid userId or walletId reference');
  }

  return error;
}

function normalizeTransactionInput(data) {
  return removeUndefined({
    userId: data.userId,
    walletId: data.walletId,
    type: data.type,
    amount: data.amount,
    category: data.category,
    description: data.description,
    paymentMethod: data.paymentMethod,
    transactionDate: toDateOnly(data.transactionDate || getTodayDate()),
    source: data.source || 'manual',
    rawMessage: data.rawMessage,
    confidence: data.confidence,
  });
}

function normalizeTransactionUpdate(data) {
  return removeUndefined({
    userId: data.userId,
    walletId: data.walletId,
    type: data.type,
    amount: data.amount,
    category: data.category,
    description: data.description,
    paymentMethod: data.paymentMethod,
    transactionDate: data.transactionDate ? toDateOnly(data.transactionDate) : undefined,
    source: data.source,
    rawMessage: data.rawMessage,
    confidence: data.confidence,
  });
}

async function createTransaction(data) {
  try {
    const transaction = await prisma.transaction.create({
      data: normalizeTransactionInput(data),
    });

    return formatTransaction(transaction);
  } catch (error) {
    throw mapPrismaError(error);
  }
}

function buildTransactionWhere(filters) {
  const where = {};

  if (filters.userId) where.userId = filters.userId;
  if (filters.type) where.type = filters.type;
  if (filters.category) where.category = filters.category;
  if (filters.source) where.source = filters.source;

  if (filters.startDate || filters.endDate) {
    where.transactionDate = {};
    if (filters.startDate) where.transactionDate.gte = toDateOnly(filters.startDate);
    if (filters.endDate) where.transactionDate.lte = toEndOfDay(filters.endDate);
  }

  if (filters.search) {
    where.OR = [
      { description: { contains: filters.search, mode: 'insensitive' } },
      { rawMessage: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
}

async function getTransactions(filters) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;
  const where = buildTransactionWhere(filters);
  const orderBy = { [filters.sortBy || 'transactionDate']: filters.sortOrder || 'desc' };

  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    data: transactions.map((transaction) => formatTransaction(transaction)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getTransactionById(id, userId) {
  const transaction = await prisma.transaction.findFirst({
    where: removeUndefined({ id, userId }),
  });

  if (!transaction) {
    throw createHttpError(404, 'Transaction not found');
  }

  return formatTransaction(transaction, { includeTimestamps: true });
}

async function updateTransaction(id, data, authenticatedUserId) {
  await getTransactionById(id, authenticatedUserId);

  try {
    const transaction = await prisma.transaction.update({
      where: { id },
      data: normalizeTransactionUpdate(data),
    });

    return formatTransaction(transaction);
  } catch (error) {
    throw mapPrismaError(error);
  }
}

async function deleteTransaction(id, authenticatedUserId) {
  await getTransactionById(id, authenticatedUserId);

  await prisma.transaction.delete({
    where: { id },
  });
}

async function parseAndSaveTransaction({ message, userId, walletId }) {
  const parsed = await parseTransactionMessage(message);

  const transaction = await createTransaction({
    userId,
    walletId,
    type: parsed.type,
    amount: parsed.amount,
    category: parsed.category,
    description: parsed.description,
    paymentMethod: parsed.payment_method,
    transactionDate: parsed.transaction_date,
    source: 'ai_parser',
    rawMessage: message,
    confidence: parsed.confidence,
  });

  return {
    transaction,
    parsed,
  };
}

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  parseAndSaveTransaction,
};
