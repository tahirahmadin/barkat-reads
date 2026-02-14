const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

/**
 * Verify JWT and attach req.user (userId).
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = { userId: decoded.userId };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authMiddleware };
