const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
  try {
    // Vérifier l'en-tête Authorization (Bearer token)
    let token = req.headers.authorization?.split(' ')[1];
    
    // Si pas dans Authorization, vérifier dans x-auth-token
    if (!token) {
      token = req.headers['x-auth-token'];
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que l'email correspond à l'admin
    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    console.error('Erreur authentification:', error);
    return res.status(401).json({ error: 'Token invalide' });
  }
};

module.exports = { authenticateAdmin };
