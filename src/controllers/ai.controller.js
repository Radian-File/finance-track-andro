const { z } = require('zod');

const { parseTransactionMessage } = require('../services/openrouter.service');

const parseTransactionRequestSchema = z.object({
  message: z.string({
    required_error: 'message is required',
    invalid_type_error: 'message must be a string',
  }).trim().min(1, 'message cannot be empty'),
});

async function parseTransaction(req, res, next) {
  try {
    const validationResult = parseTransactionRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body',
        errors: validationResult.error.issues,
      });
    }

    const parsedTransaction = await parseTransactionMessage(validationResult.data.message);

    return res.status(200).json({
      success: true,
      data: parsedTransaction,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  parseTransaction,
};
