const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const { authenticateAdmin } = require('../middleware/auth');
const { 
  validatePortfolioData, 
  validateLoginData, 
  sanitizeData, 
  limitDataSize 
} = require('../middleware/validation');

// GET /api/portfolio - Récupérer les données du portfolio (public)
router.get('/', async (req, res) => {
  try {
    console.log('📥 GET /api/portfolio - Début de la requête');
    const portfolio = await Portfolio.getPortfolio();
    
    // Log pour debug
    const hasData = (portfolio.projects?.length > 0) || 
                   (portfolio.skills?.length > 0) || 
                   (portfolio.timeline?.length > 0) ||
                   (portfolio.personal?.photo);
    
    console.log('📊 GET /api/portfolio:', {
      hasData,
      projects: portfolio.projects?.length || 0,
      skills: portfolio.skills?.length || 0,
      timeline: portfolio.timeline?.length || 0,
      hasPhoto: !!portfolio.personal?.photo,
      responseSize: JSON.stringify(portfolio).length
    });
    
    res.json(portfolio);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du portfolio:', error);
    console.error('Stack trace:', error.stack);
    
    // En cas d'erreur, retourner un objet vide plutôt qu'une erreur 500
    // pour éviter que le frontend écrase localStorage avec une erreur
    console.log('⚠️ Retour d\'un objet vide en cas d\'erreur pour éviter l\'écrasement du localStorage');
    res.json({
      personal: {},
      projects: [],
      skills: [],
      links: {},
      about: {},
      timeline: [],
      services: [],
      certifications: [],
      contactMessages: [],
      faq: []
    });
  }
});

// POST /api/portfolio - Mettre à jour les données (admin seulement)
router.post('/', 
  limitDataSize,
  sanitizeData,
  authenticateAdmin, 
  validatePortfolioData,
  async (req, res) => {
  try {
    console.log('📥 Requête de mise à jour reçue de:', req.admin.email);
    
    // Préparation des données (la validation a déjà été faite par les middlewares)
    const updateData = {
      personal: req.body.personal || {},
      projects: Array.isArray(req.body.projects) ? req.body.projects : [],
      skills: Array.isArray(req.body.skills) ? req.body.skills : [],
      links: req.body.links || {},
      about: req.body.about || {},
      timeline: Array.isArray(req.body.timeline) ? req.body.timeline : [],
      services: Array.isArray(req.body.services) ? req.body.services : [],
      certifications: Array.isArray(req.body.certifications) ? req.body.certifications : [],
      contactMessages: Array.isArray(req.body.contactMessages) ? req.body.contactMessages : [],
      faq: Array.isArray(req.body.faq) ? req.body.faq : []
    };

    console.log('📦 Données validées à sauvegarder:', {
      projects: updateData.projects.length,
      skills: updateData.skills.length,
      timeline: updateData.timeline.length,
      hasPersonal: !!updateData.personal,
      hasAbout: !!updateData.about,
      admin: req.admin.email
    });
    
    // Mettre à jour directement avec findOneAndUpdate
    const portfolio = await Portfolio.findOneAndUpdate(
      {}, // Pas de filtre spécifique, on veut le document unique
      { $set: updateData },
      { 
        new: true, // Retourner le document mis à jour
        upsert: true, // Créer si n'existe pas
        runValidators: false // Pas de validation spéciale
      }
    );
    
    console.log('✅ Portfolio mis à jour avec succès:', {
      projects: portfolio.projects?.length || 0,
      skills: portfolio.skills?.length || 0,
      timeline: portfolio.timeline?.length || 0
    });
    
    // Retourner une réponse propre
    const portfolioObj = portfolio.toObject();
    delete portfolioObj._id;
    delete portfolioObj.__v;
    delete portfolioObj.createdAt;
    delete portfolioObj.updatedAt;
    
    res.json({ 
      success: true, 
      message: 'Portfolio mis à jour avec succès',
      portfolio: portfolioObj
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error.message);
    console.error('Type:', error.name);
    console.error('Stack:', error.stack);
    
    // Gestion d'erreurs spécifiques
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Erreur de validation des données',
        message: 'Les données fournies ne respectent pas le schéma requis',
        details: error.errors,
        code: 'VALIDATION_ERROR'
      });
    } else if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Erreur de format des données',
        message: 'Un ou plusieurs champs ont un format incorrect',
        field: error.path,
        code: 'CAST_ERROR'
      });
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(409).json({
        error: 'Conflit de données',
        message: 'Une entrée avec ces données existe déjà',
        code: 'DUPLICATE_ERROR'
      });
    } else {
      return res.status(500).json({
        error: 'Erreur serveur lors de la mise à jour',
        message: 'Une erreur inattendue s\'est produite',
        code: 'SERVER_ERROR'
      });
    }
  }
});

// POST /api/portfolio/login - Authentification admin sécurisée
router.post('/login', validateLoginData, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation des champs obligatoires
    if (!email || !password) {
      console.log('❌ Email ou mot de passe manquant');
      return res.status(400).json({ 
        error: 'Email et mot de passe requis' 
      });
    }
    
    // Vérification de l'email admin
    if (email !== process.env.ADMIN_EMAIL) {
      console.log('❌ Tentative de connexion avec email invalide:', email);
      return res.status(401).json({ 
        error: 'Identifiants invalides' 
      });
    }
    
    // Vérification du mot de passe avec bcrypt
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    
    if (!isValidPassword) {
      console.log('❌ Mot de passe incorrect pour:', email);
      return res.status(401).json({ 
        error: 'Identifiants invalides' 
      });
    }
    
    // Génération du token JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        email: email,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('✅ Connexion admin réussie:', email);
    res.json({ 
      success: true, 
      token,
      expiresIn: '24h',
      user: { email, role: 'admin' }
    });
    
  } catch (error) {
    console.error('Erreur lors de la connexion:', error.message);
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'authentification' 
    });
  }
});

module.exports = router;
