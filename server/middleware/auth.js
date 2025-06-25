import jwt from 'jsonwebtoken';
import { users } from '../data/initialize.js';

const JWT_SECRET = 'your-super-secret-jwt-key-in-production-use-env-variable';

// Authentication middleware
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    req.user = decoded;
    next();
  });
}

// Authorization middleware factory
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
}

// Ownership verification middleware
export function verifyOwnershipOrRole(allowedRoles, getItemUserId) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has required role
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    // Check if user owns the resource
    const itemUserId = getItemUserId(req);
    if (itemUserId && itemUserId === req.user.id) {
      return next();
    }

    return res.status(403).json({ message: 'Insufficient permissions' });
  };
}

export { JWT_SECRET };