const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'employee_mgmt_secret_key_change_in_production';

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function authMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token required. Login first.' });
    }
    try {
      const decoded = verifyToken(header.slice(7));
      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Allowed roles: ${allowedRoles.join(', ')}`,
        });
      }
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
  };
}

module.exports = {
  signToken,
  verifyToken,
  hashPassword,
  comparePassword,
  authMiddleware,
};
