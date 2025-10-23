

// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if(!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if(!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if(err) return res.status(403).json({ message: 'Invalid token' });
    req.user = payload; 
    next();
  });
}

function requireRole(role) {
  return (req, res, next) => {
    if(!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if(req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

module.exports = { authenticateToken, requireRole };
