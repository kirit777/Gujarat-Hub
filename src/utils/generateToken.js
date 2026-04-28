const jwt = require('jsonwebtoken');

function generateToken(payload, options = {}) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    ...options
  });
}

module.exports = generateToken;
