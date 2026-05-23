const insightService = require('../services/insight.service');
const { insightQuerySchema } = require('../validators/insight.validator');

function sendValidationError(res, validationResult) {
  return res.status(400).json({
    success: false,
    message: 'Invalid request',
    errors: validationResult.error.issues,
  });
}

async function getMonthlyInsight(req, res, next) {
  try {
    const validationResult = insightQuerySchema.safeParse(req.query);

    if (!validationResult.success) {
      return sendValidationError(res, validationResult);
    }

    const filters = {
      ...validationResult.data,
      ...(req.user ? { userId: req.user.id } : {}),
    };

    const result = await insightService.getMonthlyInsight(filters);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMonthlyInsight,
};
