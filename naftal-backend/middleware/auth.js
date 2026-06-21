const jwt = require('jsonwebtoken');
const JWT_SECRET = 'yourStrongSecretGoesHere';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Token can be Bearer <token> or just <token>
  const token = authHeader && (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // { id, email, role }
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token invalide ou expiré.' });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès interdit. Rôle insuffisant.' });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole, JWT_SECRET };
