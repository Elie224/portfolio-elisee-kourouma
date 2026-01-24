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
      console.log('❌ Token manquant dans la requête');
      return res.status(401).json({ 
        error: 'Token d\'authentification manquant',
        code: 'MISSING_TOKEN'
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que le token n'est pas expiré (double vérification)
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      console.log('❌ Token expiré pour:', decoded.email);
      return res.status(401).json({ 
        error: 'Token expiré',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    // Vérifier que l'email correspond à l'admin
    if (decoded.email !== process.env.ADMIN_EMAIL) {
      console.log('❌ Email non autorisé dans le token:', decoded.email);
      return res.status(403).json({ 
        error: 'Accès refusé - Email non autorisé',
        code: 'UNAUTHORIZED_EMAIL'
      });
    }

    // Ajouter les informations admin à la requête
    req.admin = {
      email: decoded.email,
      role: decoded.role || 'admin',
      iat: decoded.iat
    };
    
    console.log('✅ Authentification réussie pour:', decoded.email);
    next();
    
  } catch (error) {
    console.error('❌ Erreur d\'authentification:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expiré',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token invalide',
        code: 'INVALID_TOKEN'
      });
    } else {
      return res.status(500).json({ 
        error: 'Erreur lors de l\'authentification',
        code: 'AUTH_ERROR'
      });
    }
  }
};

module.exports = { authenticateAdmin };
