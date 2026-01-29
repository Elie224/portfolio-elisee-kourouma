/**
 * Middleware d'authentification admin
 * 
 * Ce middleware vérifie que la requête contient un token JWT valide
 * et que l'utilisateur est bien l'administrateur autorisé.
 * 
 * @author Nema Elisée Kourouma
 * @date 2026
 */

const jwt = require('jsonwebtoken');
const { logSecurity, logError } = require('../utils/logger');

/**
 * Middleware pour authentifier les requêtes admin
 * 
 * Vérifie la présence et la validité du token JWT dans les headers.
 * Le token peut être dans 'Authorization: Bearer <token>' ou 'x-auth-token'.
 * 
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante dans la chaîne middleware
 */
const authenticateAdmin = (req, res, next) => {
  try {
    // Vérifier l'en-tête Authorization (Bearer token)
    // Format standard : "Authorization: Bearer <token>"
    let token = req.headers.authorization?.split(' ')[1];
    
    // Si pas dans Authorization, vérifier dans x-auth-token (fallback)
    // Cela permet une flexibilité pour différents clients
    if (!token) {
      token = req.headers['x-auth-token'];
    }
    
    // Vérifier que le token existe
    if (!token) {
      logSecurity('❌ Token manquant dans la requête', {
        path: req.path,
        method: req.method,
        origin: req.headers.origin
      });
      return res.status(401).json({ 
        error: 'Token d\'authentification manquant',
        code: 'MISSING_TOKEN'
      });
    }

    // Vérifier et décoder le token avec la clé secrète
    // Si le token est invalide, jwt.verify lancera une exception
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que le token n'est pas expiré (double vérification)
    // Même si jwt.verify vérifie déjà l'expiration, on double la vérification pour sécurité
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      logSecurity('❌ Token expiré pour:', { email: decoded.email });
      return res.status(401).json({ 
        error: 'Token expiré',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    // Vérifier que l'email correspond à l'admin autorisé
    // Comparaison stricte pour éviter les attaques par injection
    if (decoded.email !== process.env.ADMIN_EMAIL) {
      logSecurity('❌ Email non autorisé dans le token:', { email: decoded.email });
      return res.status(403).json({ 
        error: 'Accès refusé - Email non autorisé',
        code: 'UNAUTHORIZED_EMAIL'
      });
    }

    // Ajouter les informations admin à la requête
    // Ces informations seront disponibles dans les routes suivantes
    req.admin = {
      email: decoded.email,
      role: decoded.role || 'admin',
      iat: decoded.iat
    };
    
    logSecurity('✅ Authentification réussie pour:', { email: decoded.email });
    next();
    
  } catch (error) {
    // Les erreurs d'authentification sont toujours loggées pour la sécurité
    logError('❌ Erreur d\'authentification:', { message: error.message, name: error.name });
    
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
