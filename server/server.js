const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite de 100 requêtes par IP par fenêtre
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
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
  max: 5, // Maximum 5 tentatives de connexion par IP
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer plus tard.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true, // Ne pas compter les connexions réussies
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
    // En développement, autoriser localhost
    if (process.env.NODE_ENV === 'development') {
      const allowedLocalOrigins = [
        'http://localhost:8000',
        'http://localhost:3000',
        'http://127.0.0.1:8000',
        'http://127.0.0.1:3000'
      ];
      
      if (!origin || allowedLocalOrigins.includes(origin)) {
        return callback(null, true);
      }
    }
    
    // En production, liste stricte des origines autorisées
    const allowedOrigins = [
      'https://mon-portfolio-sdlk.onrender.com',
      'https://portfolio-sdlk.onrender.com'
    ];
    
    // Ajouter les origines depuis les variables d'environnement si définies
    if (process.env.ALLOWED_ORIGINS) {
      const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
      allowedOrigins.push(...envOrigins);
    }
    
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

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Augmenter la limite pour les gros objets
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Gérer explicitement les requêtes OPTIONS (preflight)
app.options('*', cors(corsOptions));

// Routes
const portfolioRoutes = require('./routes/portfolio');
app.use('/api/portfolio', portfolioRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur actif' });
});

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
          currentEducation: "Master 1 en Intelligence Artificielle à l'École Supérieure d'Informatique de Paris",
          previousEducation: "Licence en mathématiques et informatique (USMBA Fès)",
          additionalInfo: []
        },
        projects: [],
        skills: [],
        links: { cv: "assets/CV.pdf", social: [] },
        about: { 
          heroDescription: "Master 1 en Intelligence Artificielle",
          stats: { projects: 0, experience: 2, technologies: 10 }
        },
        timeline: [],
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
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📡 API disponible sur http://localhost:${PORT}/api/portfolio`);
  });
})
.catch((error) => {
  console.error('❌ Erreur de connexion à MongoDB:', error);
  console.log('💡 Assurez-vous que MongoDB est démarré ou utilisez MongoDB Atlas');
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

module.exports = app;
