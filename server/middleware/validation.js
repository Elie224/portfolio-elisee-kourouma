const { body, validationResult } = require('express-validator');

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
                         bodyString.includes('data:image/') ||
                         (req.body.links && req.body.links.cvFile && req.body.links.cvFile.startsWith('data:'));
    
    if (isBase64Data) {
      console.log('📄 Données base64 détectées - Validation de sécurité assouplie pour les fichiers');
      // Pour les données base64, on vérifie seulement les patterns vraiment dangereux
      const criticalPatterns = [
        /<script.*?>/gi,                  // Script tags
        /javascript:/gi,                  // Javascript protocol
        /eval\s*\(/g,                     // Eval calls
        /document\.write/gi               // Document write
      ];
      
      for (const pattern of criticalPatterns) {
        if (pattern.test(bodyString)) {
          console.log('🚨 Code JavaScript malveillant détecté dans base64:', pattern);
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
    const dangerousPatterns = [
      /`.*`/g,                           // Backticks
      /\$\{.*\}/g,                      // Template literals
      /function\s*\(/g,                 // Function declarations
      /=>\s*{/g,                        // Arrow functions
      /eval\s*\(/g,                     // Eval calls
      /document\./g,                    // DOM access
      /window\./g,                      // Window object
      /console\./g,                     // Console calls
      /<script.*?>/gi,                  // Script tags
      /javascript:/gi,                  // Javascript protocol
      /on(click|load|error|mouse)/gi,   // Event handlers
      /innerHTML/gi,                    // DOM manipulation
      /\[\\n['"].*?\+/g,               // Concatenation patterns
      /"\\n['"].*?\+/g                 // Concatenation patterns
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(bodyString)) {
        console.log('🚨 Code JavaScript malveillant détecté:', pattern);
        console.log('📋 Aperçu:', bodyString.substring(0, 200));
        
        return res.status(400).json({
          error: 'Code JavaScript détecté dans les données',
          message: 'Les données contiennent du code non autorisé',
          code: 'MALICIOUS_CODE_DETECTED'
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('❌ Erreur dans sanitizeData:', error);
    next(); // Continuer en cas d'erreur dans la validation
  }
};

// Middleware pour limiter la taille des données
const limitDataSize = (req, res, next) => {
  try {
    const bodySize = JSON.stringify(req.body).length;
    const maxSize = 5 * 1024 * 1024; // 5MB
    
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

module.exports = {
  validatePortfolioData,
  validateLoginData,
  sanitizeData,
  limitDataSize
};