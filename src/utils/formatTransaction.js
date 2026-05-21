function formatDateOnly(value) {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 10);
}

function formatDateTime(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function formatDecimal(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'number') return value;
  if (typeof value.toNumber === 'function') return value.toNumber();
  return Number(value);
}

function formatTransaction(transaction, options = {}) {
  if (!transaction) return null;

  const formatted = {
    id: transaction.id,
    userId: transaction.userId,
    walletId: transaction.walletId,
    type: transaction.type,
    amount: formatDecimal(transaction.amount),
    category: transaction.category,
    description: transaction.description,
    paymentMethod: transaction.paymentMethod,
    transactionDate: formatDateOnly(transaction.transactionDate),
    source: transaction.source,
    rawMessage: transaction.rawMessage,
    confidence: transaction.confidence,
  };

  if (options.includeTimestamps) {
    formatted.createdAt = formatDateTime(transaction.createdAt);
    formatted.updatedAt = formatDateTime(transaction.updatedAt);
  }

  return formatted;
}

module.exports = {
  formatTransaction,
  formatDateOnly,
};
