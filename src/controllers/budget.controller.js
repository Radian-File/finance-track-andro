const budgetService = require('../services/budget.service');
const {
  createBudgetSchema,
  updateBudgetSchema,
  budgetQuerySchema,
} = require('../validators/budget.validator');

function sendValidationError(res, validationResult) {
  return res.status(400).json({
    success: false,
    message: 'Invalid request',
    errors: validationResult.error.issues,
  });
}

async function createBudget(req, res, next) {
  try {
    const validationResult = createBudgetSchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendValidationError(res, validationResult);
    }

    const budget = await budgetService.createBudget(validationResult.data);

    return res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: budget,
    });
  } catch (error) {
    return next(error);
  }
}

async function getBudgets(req, res, next) {
  try {
    const validationResult = budgetQuerySchema.safeParse(req.query);

    if (!validationResult.success) {
      return sendValidationError(res, validationResult);
    }

    const budgets = await budgetService.getBudgets(validationResult.data);

    return res.status(200).json({
      success: true,
      data: budgets,
    });
  } catch (error) {
    return next(error);
  }
}

async function getBudgetById(req, res, next) {
  try {
    const budget = await budgetService.getBudgetById(req.params.id);

    return res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateBudget(req, res, next) {
  try {
    const validationResult = updateBudgetSchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendValidationError(res, validationResult);
    }

    const budget = await budgetService.updateBudget(req.params.id, validationResult.data);

    return res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: budget,
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteBudget(req, res, next) {
  try {
    await budgetService.deleteBudget(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
};
