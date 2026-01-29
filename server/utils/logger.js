/**
 * Système de logging centralisé pour le serveur
 * 
 * Ce module fournit des fonctions de logging conditionnelles qui :
 * - Loggent uniquement en développement pour les logs normaux
 * - Loggent toujours les erreurs (même en production)
 * - Améliorent les performances en production
 * - Renforcent la sécurité en évitant les fuites d'information
 * 
 * @author Nema Elisée Kourouma
 * @date 2026
 */

// Déterminer si on est en mode développement
const estEnDeveloppement = process.env.NODE_ENV !== 'production';

/**
 * Logger pour les messages informatifs
 * Uniquement en développement pour éviter le spam en production
 */
const log = estEnDeveloppement 
  ? console.log.bind(console) 
  : () => {};

/**
 * Logger pour les erreurs
 * Toujours actif car les erreurs doivent être loggées même en production
 */
const logError = console.error.bind(console);

/**
 * Logger pour les avertissements
 * Uniquement en développement
 */
const logWarn = estEnDeveloppement 
  ? console.warn.bind(console) 
  : () => {};

/**
 * Logger pour les requêtes HTTP
 * Utile pour le debugging mais désactivé en production pour les performances
 */
const logRequest = estEnDeveloppement
  ? (method, path, origin) => {
      console.log(`📥 ${method} ${path} - Origin: ${origin || 'none'}`);
    }
  : () => {};

/**
 * Logger pour les opérations de sécurité
 * Toujours actif car la sécurité est critique
 */
const logSecurity = (message, details = {}) => {
  console.log(`🔒 [SECURITE] ${message}`, details);
};

/**
 * Logger pour les opérations réussies
 * Uniquement en développement
 */
const logSuccess = estEnDeveloppement
  ? (message, details = {}) => {
      console.log(`✅ ${message}`, details);
    }
  : () => {};

module.exports = {
  log,
  logError,
  logWarn,
  logRequest,
  logSecurity,
  logSuccess,
  estEnDeveloppement
};
