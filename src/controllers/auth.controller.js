const authService = require('../services/auth.service');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

function sendValidationError(res, validationResult) {
  return res.status(400).json({
    success: false,
    message: 'Invalid request',
    errors: validationResult.error.issues,
  });
}

async function register(req, res, next) {
  try {
    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendValidationError(res, validationResult);
    }

    const result = await authService.register(validationResult.data);

    return res.status(201).json({
      success: true,
      message: 'Register successful',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendValidationError(res, validationResult);
    }

    const result = await authService.login(validationResult.data);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}

function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
}

module.exports = {
  register,
  login,
  me,
  logout,
};
