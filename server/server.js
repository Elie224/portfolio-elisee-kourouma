const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS - Configuration complète pour gérer les preflight requests
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Liste des origines autorisées
    const allowedOrigins = [
      'http://localhost:8000',
      'http://localhost:3000',
      'https://mon-portfolio-sdlk.onrender.com',
      'https://portfolio-sdlk.onrender.com',
      /^https:\/\/.*\.onrender\.com$/, // Tous les sous-domaines Render
    ];
    
    // Vérifier si l'origine est autorisée
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      // En développement, on peut être plus permissif
      callback(null, true); // Autoriser toutes les origines pour le moment
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  exposedHeaders: ['x-auth-token']
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

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio')
.then(async () => {
  console.log('✅ Connecté à MongoDB');
  
  // Nettoyer COMPLETEMENT la base de données MongoDB au démarrage
  try {
    const Portfolio = require('./models/Portfolio');
    console.log('🧹 NETTOYAGE COMPLET de la base MongoDB...');
    
    // 1. Supprimer tous les documents
    const deleteResult = await Portfolio.deleteMany({});
    console.log(`🗑️ ${deleteResult.deletedCount} document(s) supprimé(s)`);
    
    // 2. Supprimer complètement la collection
    try {
      await Portfolio.collection.drop();
      console.log('💥 Collection Portfolio supprimée complètement');
    } catch (dropError) {
      console.log('ℹ️ Collection déjà vide ou inexistante');
    }
    
    // 3. Recréer la collection avec des données propres
    console.log('🔧 Création de nouvelles données propres...');
    const cleanData = {
      personal: {
        fullName: "Nema Elisée Kourouma",
        email: "kouroumaelisee@gmail.com",
        phone: "",
        photo: "assets/photo.jpeg",
        currentEducation: "Master 1 en Intelligence Artificielle à l'École Supérieure d'Informatique de Paris",
        previousEducation: "Licence en mathématiques et informatique (USMBA Fès)",
        additionalInfo: []
      },
      projects: [],  // Vide pour éviter tout problème
      skills: [],    // Vide pour éviter tout problème  
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
    
    const newPortfolio = await Portfolio.create(cleanData);
    console.log('✅ Portfolio minimal créé avec succès:', newPortfolio._id);
    
    console.log('🎉 NETTOYAGE COMPLET terminé - Base MongoDB réinitialisée');
  } catch (cleanupError) {
    console.error('⚠️ Erreur lors du nettoyage complet:', cleanupError.message);
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
