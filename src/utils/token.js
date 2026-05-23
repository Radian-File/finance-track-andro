const jwt = require('jsonwebtoken');

const env = require('../config/env');

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    env.jwt.secret,
    {
      expiresIn: env.jwt.expiresIn,
    },
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.secret);
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
};
