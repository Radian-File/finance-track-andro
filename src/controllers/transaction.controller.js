const transactionService = require('../services/transaction.service');
const {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  parseAndSaveTransactionSchema,
} = require('../validators/transaction.validator');

function sendValidationError(res, validationResult) {
  return res.status(400).json({
    success: false,
    message: 'Invalid request',
    errors: validationResult.error.issues,
  });
}

async function createTransaction(req, res, next) {
  try {
    const validationResult = createTransactionSchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendValidationError(res, validationResult);
    }

    const payload = {
      ...validationResult.data,
      ...(req.user ? { userId: req.user.id } : {}),
    };

    const transaction = await transactionService.createTransaction(payload);

    return res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  } catch (error) {
    return next(error);
  }
}

async function getTransactions(req, res, next) {
  try {
    const validationResult = transactionQuerySchema.safeParse(req.query);

    if (!validationResult.success) {
      return sendValidationError(res, validationResult);
    }

    const filters = {
      ...validationResult.data,
      ...(req.user ? { userId: req.user.id } : {}),
    };

    const result = await transactionService.getTransactions(filters);

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
}

async function getTransactionById(req, res, next) {
  try {
    const transaction = await transactionService.getTransactionById(
      req.params.id,
      req.user?.id,
    );

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateTransaction(req, res, next) {
  try {
    const validationResult = updateTransactionSchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendValidationError(res, validationResult);
    }

    const payload = {
      ...validationResult.data,
      ...(req.user ? { userId: req.user.id } : {}),
    };

    const transaction = await transactionService.updateTransaction(
      req.params.id,
      payload,
      req.user?.id,
    );

    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteTransaction(req, res, next) {
  try {
    await transactionService.deleteTransaction(req.params.id, req.user?.id);

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
}

async function parseAndSaveTransaction(req, res, next) {
  try {
    const validationResult = parseAndSaveTransactionSchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendValidationError(res, validationResult);
    }

    const payload = {
      ...validationResult.data,
      ...(req.user ? { userId: req.user.id } : {}),
    };

    const result = await transactionService.parseAndSaveTransaction(payload);

    return res.status(201).json({
      success: true,
      message: 'Transaction parsed and saved successfully',
      data: result.transaction,
      parsed: result.parsed,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  parseAndSaveTransaction,
};
