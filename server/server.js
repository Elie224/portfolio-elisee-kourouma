const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

// DEBUG: Afficher toutes les variables d'environnement disponibles (sans valeurs sensibles)
// IMPORTANT: Ce debug doit être AU DÉBUT pour voir ce qui est disponible
console.log('🔍 Variables d\'environnement disponibles:');
const envKeys = Object.keys(process.env).filter(key => 
  key.includes('ADMIN') || key.includes('MONGODB') || key.includes('JWT') || key.includes('NODE')
);
envKeys.forEach(key => {
  const value = process.env[key];
  if (key.includes('PASSWORD') || key.includes('SECRET') || key.includes('URI')) {
    console.log(`  ${key}: ${value ? '✅ Présent (' + value.substring(0, 10) + '...)' : '❌ Absent'}`);
  } else {
    console.log(`  ${key}: ${value || '❌ Absent'}`);
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Activer trust proxy pour Fly.io (nécessaire pour rate limiting et IP correcte)
app.set('trust proxy', true);

// Middleware pour stocker le chemin de la requête (pour CORS - doit être avant /health)
app.use((req, res, next) => {
  global.currentPath = req.path;
  next();
});

// Route de health check (doit être tôt pour que Fly.io puisse vérifier)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Configuration de sécurité avec Helmet
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Pour permettre les images externes
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https:"],
    }
  }
}));

// Rate limiting (augmenté pour le développement)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limite augmentée à 1000 requêtes pour le développement
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Ignorer complètement le rate limiting en développement
    return process.env.NODE_ENV === 'development';
  },
  handler: (req, res) => {
    console.log(`🚫 Rate limit atteint pour IP: ${req.ip}`);
    res.status(429).json({
      error: 'Trop de requêtes',
      message: 'Veuillez réessayer dans 15 minutes'
    });
  }
});

// Rate limiting spécial pour les routes d'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 5, // 100 en dev, 5 en prod
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer plus tard.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true, // Ne pas compter les connexions réussies
  skip: (req) => {
    // Ignorer le rate limiting en développement
    return process.env.NODE_ENV === 'development';
  },
  handler: (req, res) => {
    console.log(`🚫 Trop de tentatives de connexion pour IP: ${req.ip}`);
    res.status(429).json({
      error: 'Trop de tentatives de connexion',
      message: 'Veuillez réessayer dans 15 minutes'
    });
  }
});

// Appliquer le rate limiting général
app.use(limiter);

// Rate limiting pour les routes d'auth (plus strict)
app.use('/api/portfolio/login', authLimiter);

// Configuration CORS sécurisée
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les health checks sans origin (pour Fly.io)
    // On utilise une variable globale temporaire définie par le middleware
    if (global.currentPath === '/health') {
      return callback(null, true);
    }
    
    // En développement, autoriser localhost
    if (process.env.NODE_ENV === 'development') {
      const allowedLocalOrigins = [
        'http://localhost:8000',
        'http://localhost:3000',
        'http://127.0.0.1:8000',
        'http://127.0.0.1:3000'
      ];
      
      // En développement, autoriser toutes les origines localhost
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || allowedLocalOrigins.includes(origin)) {
        return callback(null, true);
      }
    }
    
    // En production, liste stricte des origines autorisées
    // Les origines sont définies via la variable d'environnement ALLOWED_ORIGINS
    // Format: ALLOWED_ORIGINS=https://domain1.com,https://domain2.com
    const allowedOrigins = [];
    
    // Ajouter les origines depuis les variables d'environnement (obligatoire en production)
    if (process.env.ALLOWED_ORIGINS) {
      const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
      allowedOrigins.push(...envOrigins);
      console.log('🔍 CORS - Origines autorisées depuis ALLOWED_ORIGINS:', allowedOrigins);
    } else if (process.env.NODE_ENV === 'production') {
      // En production, ALLOWED_ORIGINS doit être défini
      console.warn('⚠️ ALLOWED_ORIGINS non défini en production - CORS peut être restrictif');
    }
    
    // Ajouter le domaine du portfolio par défaut si présent dans les variables d'environnement
    if (process.env.PORTFOLIO_DOMAIN) {
      allowedOrigins.push(process.env.PORTFOLIO_DOMAIN);
      console.log('🔍 CORS - Ajout PORTFOLIO_DOMAIN:', process.env.PORTFOLIO_DOMAIN);
    }
    
    console.log('🔍 CORS - Requête reçue - Origin:', origin || 'none', '| Path:', global.currentPath);
    console.log('🔍 CORS - Liste complète des origines autorisées:', allowedOrigins);
    
    // Vérification stricte des origines
    if (!origin) {
      // Autoriser les requêtes sans origin en développement uniquement
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      } else {
        console.warn('🚫 CORS: Requête sans origin bloquée en production');
        return callback(new Error('Origine requise en production'), false);
      }
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Origine autorisée:', origin);
      callback(null, true);
    } else {
      console.warn('🚫 CORS: Origine non autorisée:', origin);
      console.warn('🔍 Origines autorisées:', allowedOrigins);
      callback(new Error('Origine non autorisée par la politique CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-auth-token',
    'X-Requested-With'
  ],
  exposedHeaders: ['x-auth-token'],
  maxAge: 86400, // Cache preflight pour 24h
  optionsSuccessStatus: 200 // Pour IE11
};

// Middleware de logging pour debug
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Appliquer CORS avec le chemin stocké
app.use((req, res, next) => {
  global.currentPath = req.path;
  cors(corsOptions)(req, res, next);
});

app.use(express.json({ limit: '10mb' })); // Augmenter la limite pour les gros objets
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Gérer explicitement les requêtes OPTIONS (preflight) - exclure /health
app.options('*', (req, res, next) => {
  if (req.path === '/health') {
    return res.status(200).end();
  }
  return cors(corsOptions)(req, res, next);
});

// Routes
const portfolioRoutes = require('./routes/portfolio');
app.use('/api/portfolio', portfolioRoutes);

// Validation des variables d'environnement obligatoires
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes:', missingVars.join(', '));
  console.error('💡 Vérifiez votre fichier .env');
  process.exit(1);
}

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  console.log('✅ Connecté à MongoDB');
  
  // Initialiser les données par défaut uniquement si la collection est vide
  try {
    const Portfolio = require('./models/Portfolio');
    const existingPortfolio = await Portfolio.findOne();
    
    if (!existingPortfolio) {
      console.log('📋 Collection vide, création des données par défaut...');
      const defaultData = {
        personal: {
          fullName: "Nema Elisée Kourouma",
          email: process.env.ADMIN_EMAIL,
          phone: "",
          photo: "assets/photo.jpeg",
          currentEducation: "Master en Intelligence Artificielle",
          previousEducation: "Licence en mathématiques et informatique (USMBA Fès)",
          additionalInfo: []
        },
        projects: [],
        skills: [
          {
            category: 'Langages de programmation',
            icon: '💻',
            items: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++']
          },
          {
            category: 'Développement Web',
            icon: '🌐',
            items: ['React', 'Node.js', 'Express', 'HTML5', 'CSS3']
          },
          {
            category: 'Bases de données',
            icon: '🗄️',
            items: ['MongoDB', 'MySQL', 'PostgreSQL']
          },
          {
            category: 'Intelligence Artificielle',
            icon: '🤖',
            items: ['Machine Learning', 'Deep Learning', 'TensorFlow', 'Scikit-learn']
          },
          {
            category: 'Outils & Technologies',
            icon: '🛠️',
            items: ['Git', 'Docker', 'REST API', 'GraphQL', 'Linux']
          }
        ],
        links: { cv: "", cvFile: "", cvFileName: "", cvFileSize: 0, social: [] },
        about: { 
          heroDescription: "Master en Intelligence Artificielle",
          stats: { projects: 0, experience: 2, technologies: 10 }
        },
        timeline: [
          {
            date: '2024 - Présent',
            title: 'Master Intelligence Artificielle',
            subtitle: 'Formation en cours',
            description: 'Spécialisation en Intelligence Artificielle, Machine Learning et Deep Learning. Développement de projets avancés en IA et applications intelligentes.'
          },
          {
            date: '2021 - 2024',
            title: 'Licence en Mathématiques et Informatique',
            subtitle: 'USMBA Fès',
            description: 'Formation fondamentale en mathématiques appliquées et informatique. Acquisition de solides bases théoriques et pratiques en algorithmique, structures de données et programmation.'
          }
        ],
        services: [],
        certifications: [],
        contactMessages: [],
        faq: []
      };
      
      await Portfolio.create(defaultData);
      console.log('✅ Données par défaut créées');
    } else {
      console.log('📋 Données existantes trouvées, aucune initialisation nécessaire');
    }
  } catch (initError) {
    console.error('⚠️ Erreur lors de l\'initialisation:', initError.message);
  }
  
  // Démarrer le serveur
  // Écouter sur 0.0.0.0 pour être accessible depuis Fly.io
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📡 API disponible sur http://0.0.0.0:${PORT}/api/portfolio`);
  });
})
.catch((error) => {
  console.error('❌ Erreur de connexion à MongoDB:', error);
  console.log('💡 Assurez-vous que MongoDB est démarré ou utilisez MongoDB Atlas');
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
  
  // En développement, envoyer plus de détails
  if (process.env.NODE_ENV === 'development') {
    res.status(err.status || 500).json({ 
      error: 'Erreur serveur interne',
      message: err.message,
      stack: err.stack
    });
  } else {
    res.status(err.status || 500).json({ error: 'Erreur serveur interne' });
  }
});

module.exports = app;
