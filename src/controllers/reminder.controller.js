const reminderService = require('../services/reminder.service');
const { reminderQuerySchema } = require('../validators/reminder.validator');

function sendValidationError(res, validationResult) {
  return res.status(400).json({
    success: false,
    message: 'Invalid request',
    errors: validationResult.error.issues,
  });
}

async function getReminderSummary(req, res, next) {
  try {
    const validationResult = reminderQuerySchema.safeParse(req.query);

    if (!validationResult.success) {
      return sendValidationError(res, validationResult);
    }

    const result = await reminderService.getReminderSummary({
      ...validationResult.data,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getReminderSummary,
};
