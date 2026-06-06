const jwt = require('jsonwebtoken');

function authMiddleware(role) {
  return (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token, 'secretkey', (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Unauthorized' });
      if (role && decoded.role !== role) return res.status(403).json({ message: 'Forbidden' });
      req.user = decoded;
      next();
    });
  };
}

module.exports = authMiddleware;
