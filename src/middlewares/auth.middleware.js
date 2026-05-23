const prisma = require('../config/prisma');
const { verifyAccessToken } = require('../utils/token');
const { sanitizeUser } = require('../utils/sanitizeUser');

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function extractBearerToken(req) {
  const header = req.headers.authorization;

  if (!header) return null;
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw createHttpError(401, 'Invalid authorization header');
  }

  return token;
}

async function attachUserFromToken(req) {
  const token = extractBearerToken(req);

  if (!token) return null;

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    throw createHttpError(401, 'Invalid or expired token');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  req.user = sanitizeUser(user);
  return req.user;
}

async function requireAuth(req, res, next) {
  try {
    await attachUserFromToken(req);

    if (!req.user) {
      throw createHttpError(401, 'Authentication required');
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

async function optionalAuth(req, res, next) {
  try {
    await attachUserFromToken(req);
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  requireAuth,
  optionalAuth,
};
