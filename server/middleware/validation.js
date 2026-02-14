/**
 * Middlewares de validation et sanitization
 * 
 * Ce fichier contient tous les middlewares de validation et de sécurité
 * pour protéger l'API contre les attaques XSS, injection, et données malformées.
 * 
 * @author Nema Elisée Kourouma
 * @date 2026
 */

const { body, param, validationResult } = require('express-validator');
const { logSecurity, logError, logWarn } = require('../utils/logger');

// Validation pour les données portfolio
const validatePortfolioData = [
  body('personal')
    .optional()
    .isObject()
    .withMessage('Personal doit être un objet'),
  
  body('personal.fullName')
    .optional()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom complet doit contenir entre 2 et 100 caractères'),
  
  body('personal.email')
    .optional()
    .isEmail()
    .withMessage('Email invalide'),
  
  body('personal.phone')
    .optional()
    .isString()
    .isLength({ max: 20 })
    .withMessage('Numéro de téléphone invalide'),
  
  body('projects')
    .optional()
    .isArray()
    .withMessage('Projects doit être un tableau'),
  
  body('projects.*')
    .optional()
    .isObject()
    .withMessage('Chaque projet doit être un objet'),
  
  body('projects.*.title')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Le titre du projet doit contenir entre 1 et 200 caractères'),
  
  body('projects.*.description')
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage('La description du projet ne peut pas dépasser 2000 caractères'),

  // Document protégé
  body('projects.*.docFile')
    .optional()
    .isString()
    .withMessage('Le document doit être encodé en base64'),
  body('projects.*.docFileName')
    .optional()
    .isString()
    .isLength({ max: 150 })
    .withMessage('Le nom du document est trop long (150 caractères max)'),
  body('projects.*.docFileSize')
    .optional()
    .isInt({ min: 0, max: 50 * 1024 * 1024 })
    .withMessage('La taille du document est limitée à 50 Mo'),
  body('projects.*.docPassword')
    .optional()
    .isString()
    .isLength({ min: 4, max: 200 })
    .withMessage('Le mot de passe du document doit contenir au moins 4 caractères'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills doit être un tableau'),
  
  body('skills.*')
    .optional()
    .isObject()
    .withMessage('Chaque compétence doit être un objet'),
  
  body('timeline')
    .optional()
    .isArray()
    .withMessage('Timeline doit être un tableau'),

  body('activeSearches')
    .optional()
    .isArray()
    .withMessage('ActiveSearches doit être un tableau'),

  body('activeSearches.*')
    .optional()
    .isObject()
    .withMessage('Chaque recherche active doit être un objet'),

  body('activeSearches.*.title')
    .optional()
    .isString()
    .isLength({ min: 1, max: 150 })
    .withMessage('Le titre de la recherche est requis (max 150 caractères)'),

  body('activeSearches.*.status')
    .optional()
    .isIn(['active', 'paused'])
    .withMessage('Le statut de la recherche doit être "active" ou "paused"'),

  body('activeSearches.*.location')
    .optional()
    .isString()
    .isLength({ max: 150 })
    .withMessage('La localisation est trop longue (max 150 caractères)'),

  body('activeSearches.*.link')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Le lien de recherche est trop long (max 500 caractères)'),

  body('activeSearches.*.notes')
    .optional()
    .isString()
    .isLength({ max: 800 })
    .withMessage('Les notes de recherche sont trop longues (max 800 caractères)'),

  body('activeSearches.*.visible')
    .optional()
    .isBoolean()
    .withMessage('Le champ visible doit être un booléen'),

  body('testimonials')
    .optional()
    .isArray()
    .withMessage('Testimonials doit être un tableau'),

  body('testimonials.*')
    .optional()
    .isObject()
    .withMessage('Chaque témoignage doit être un objet'),

  body('testimonials.*.text')
    .optional()
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Le texte du témoignage est requis (max 1000 caractères)'),

  body('testimonials.*.author')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('L\'auteur du témoignage est requis'),

  body('testimonials.*.role')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Le rôle du témoignage est trop long'),

  body('testimonials.*.rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La note doit être comprise entre 1 et 5'),
  
  body('services')
    .optional()
    .isArray()
    .withMessage('Services doit être un tableau'),
  
  body('certifications')
    .optional()
    .isArray()
    .withMessage('Certifications doit être un tableau'),
  
  body('contactMessages')
    .optional()
    .isArray()
    .withMessage('ContactMessages doit être un tableau'),
  
  body('faq')
    .optional()
    .isArray()
    .withMessage('FAQ doit être un tableau'),
  
  // Middleware pour traiter les erreurs de validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Erreurs de validation:', errors.array());
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }
    next();
  }
];

// Validation pour les données de connexion
const validateLoginData = [
  body('email')
    .isEmail()
    .withMessage('Email valide requis')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 1 })
    .withMessage('Mot de passe requis'),
  
  // Middleware pour traiter les erreurs
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Erreurs de validation login:', errors.array());
      return res.status(400).json({
        error: 'Données de connexion invalides',
        details: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }
    next();
  }
];

// Middleware pour détecter et rejeter le code JavaScript malveillant
const sanitizeData = (req, res, next) => {
  try {
    const bodyString = JSON.stringify(req.body);
    
    // EXCEPTION : Autoriser les données base64 (data:application/pdf;base64,...)
    // Les données base64 peuvent contenir des caractères qui ressemblent à du code mais qui sont valides
    const isBase64Data = bodyString.includes('data:application/pdf') ||
           bodyString.includes('data:application/msword') ||
           bodyString.includes('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
           bodyString.includes('data:application/zip') ||
           bodyString.includes('data:image/') ||
           (req.body.links && req.body.links.cvFile && req.body.links.cvFile.startsWith('data:'));
    
    // EXCEPTION : Autoriser les données base64 (data:application/pdf;base64,...)
    // Les données base64 peuvent contenir des caractères qui ressemblent à du code mais qui sont valides
    // On assouplit la validation pour les fichiers, mais on vérifie quand même les patterns vraiment dangereux
    if (isBase64Data) {
      logSecurity('📄 Données base64 détectées - Validation de sécurité assouplie pour les fichiers');
      
      // Pour les données base64, on vérifie seulement les patterns vraiment dangereux
      // Les patterns moins dangereux sont autorisés car ils font partie du fichier encodé
      const criticalPatterns = [
        /<script.*?>/gi,                  // Script tags HTML
        /javascript:/gi,                  // Protocole JavaScript dans les URLs
        /eval\s*\(/g,                     // Appels à eval() (très dangereux)
        /document\.write/gi,              // Écriture directe dans le DOM
        /data:text\/html/gi,              // Données inline HTML
        /on(click|load|error|mouse)/gi     // Handlers inline
      ];
      
      for (const pattern of criticalPatterns) {
        if (pattern.test(bodyString)) {
          logSecurity('🚨 Code JavaScript malveillant détecté dans base64:', { pattern: pattern.toString() });
          return res.status(400).json({
            error: 'Code JavaScript détecté dans les données',
            message: 'Les données contiennent du code non autorisé',
            code: 'MALICIOUS_CODE_DETECTED'
          });
        }
      }
      
      next();
      return;
    }
    
    // Patterns dangereux à détecter (pour les données non-base64)
    // Cette liste est exhaustive et couvre les principales techniques d'injection XSS
    const dangerousPatterns = [
      /`.*`/g,                           // Backticks (template literals)
      /\$\{.*\}/g,                       // Template literals avec interpolation
      /function\s*\(/g,                  // Déclarations de fonction
      /=>\s*{/g,                         // Fonctions fléchées
      /eval\s*\(/g,                      // Appels à eval()
      /document\./g,                     // Accès au DOM
      /window\./g,                       // Accès à l'objet window
      /console\./g,                      // Appels à console
      /<script.*?>/gi,                   // Balises script HTML
      /javascript:/gi,                    // Protocole JavaScript
      /on(click|load|error|mouse)/gi,    // Gestionnaires d'événements inline
      /innerHTML/gi,                     // Manipulation du DOM via innerHTML
      /\[\\n['"].*?\+/g,                 // Patterns de concaténation suspecte
      /"\\n['"].*?\+/g                   // Patterns de concaténation suspecte
    ];
    
    // Vérifier chaque pattern dangereux
    for (const pattern of dangerousPatterns) {
      if (pattern.test(bodyString)) {
        logSecurity('🚨 Code JavaScript malveillant détecté:', {
          pattern: pattern.toString(),
          preview: bodyString.substring(0, 200)
        });
        
        return res.status(400).json({
          error: 'Code JavaScript détecté dans les données',
          message: 'Les données contiennent du code non autorisé',
          code: 'MALICIOUS_CODE_DETECTED'
        });
      }
    }
    
    // Si aucune menace détectée, continuer vers le prochain middleware
    next();
  } catch (error) {
    // En cas d'erreur dans la validation, logger l'erreur mais continuer
    // Cela évite de bloquer toutes les requêtes en cas de bug dans le middleware
    logError('❌ Erreur dans sanitizeData:', { message: error.message, stack: error.stack });
    next(); // Continuer en cas d'erreur dans la validation
  }
};

// Middleware pour limiter la taille des données
const limitDataSize = (req, res, next) => {
  try {
    const bodySize = JSON.stringify(req.body).length;
    // Autoriser des payloads plus grands (docs base64 ~50 Mo => ~70 Mo en JSON)
    const maxSize = 80 * 1024 * 1024; // 80MB
    
    if (bodySize > maxSize) {
      console.log('❌ Données trop volumineuses:', bodySize, 'bytes');
      return res.status(413).json({
        error: 'Données trop volumineuses',
        message: `Taille maximum autorisée: ${Math.floor(maxSize / 1024 / 1024)}MB`,
        actualSize: Math.floor(bodySize / 1024),
        code: 'PAYLOAD_TOO_LARGE'
      });
    }
    
    next();
  } catch (error) {
    console.error('❌ Erreur dans limitDataSize:', error);
    next();
  }
};

// Middleware générique pour renvoyer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array({ onlyFirstError: true });
    logSecurity('❌ Erreurs de validation', details);
    return res.status(400).json({
      error: 'Données invalides',
      code: 'VALIDATION_ERROR',
      details
    });
  }
  next();
};

// Validation message de contact public
const validateContactMessage = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Nom requis (2-120)'),
  body('email').trim().isEmail().withMessage('Email invalide').isLength({ max: 180 }).normalizeEmail({ gmail_remove_dots: false }),
  body('subject').optional().trim().isLength({ max: 180 }).withMessage('Sujet trop long'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message requis (10-2000)'),
  handleValidationErrors
];

// Validation demande de doc protégé
const validateRequestDoc = [
  param('title').trim().isLength({ min: 1, max: 200 }).withMessage('Projet invalide'),
  body('firstName').optional().trim().isLength({ max: 120 }).withMessage('Prénom trop long'),
  body('lastName').optional().trim().isLength({ max: 120 }).withMessage('Nom trop long'),
  body('email').trim().isEmail().withMessage('Email invalide').isLength({ max: 180 }).normalizeEmail({ gmail_remove_dots: false }),
  body('subject').optional().trim().isLength({ max: 180 }).withMessage('Sujet trop long'),
  body('message').optional().trim().isLength({ max: 2000 }).withMessage('Message trop long (2000 max)'),
  handleValidationErrors
];

// Validation mot de passe doc
const validateDocPassword = [
  param('title').trim().isLength({ min: 1, max: 200 }).withMessage('Projet invalide'),
  body('password').isLength({ min: 4, max: 200 }).withMessage('Mot de passe requis (4-200)'),
  handleValidationErrors
];

module.exports = {
  validatePortfolioData,
  validateLoginData,
  sanitizeData,
  limitDataSize,
  handleValidationErrors,
  validateContactMessage,
  validateRequestDoc,
  validateDocPassword
};