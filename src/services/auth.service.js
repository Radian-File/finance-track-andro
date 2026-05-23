const bcrypt = require('bcryptjs');

const prisma = require('../config/prisma');
const { sanitizeUser } = require('../utils/sanitizeUser');
const { signAccessToken } = require('../utils/token');

function createHttpError(statusCode, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
}

async function register({ name, email, password }) {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw createHttpError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      password: passwordHash,
    },
  });

  return {
    user: sanitizeUser(user),
    token: signAccessToken(user),
  };
}

async function login({ email, password }) {
  const normalizedEmail = email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.password) {
    throw createHttpError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid email or password');
  }

  return {
    user: sanitizeUser(user),
    token: signAccessToken(user),
  };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  return sanitizeUser(user);
}

module.exports = {
  register,
  login,
  getMe,
};
