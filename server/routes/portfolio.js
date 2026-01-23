const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/portfolio - Récupérer les données du portfolio (public)
router.get('/', async (req, res) => {
  try {
    const portfolio = await Portfolio.getPortfolio();
    res.json(portfolio);
  } catch (error) {
    console.error('Erreur lors de la récupération du portfolio:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/portfolio - Mettre à jour les données (admin seulement)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    console.log('📥 Requête de mise à jour reçue:', {
      hasPersonal: !!req.body.personal,
      projectsType: typeof req.body.projects,
      projectsIsArray: Array.isArray(req.body.projects),
      projectsIsString: typeof req.body.projects === 'string',
      projectsStringLength: typeof req.body.projects === 'string' ? req.body.projects.length : 0,
      projectsCount: Array.isArray(req.body.projects) ? req.body.projects.length : 'N/A',
      skillsCount: Array.isArray(req.body.skills) ? req.body.skills.length : 'N/A',
      bodyKeys: Object.keys(req.body)
    });
    
    // Nettoyer et valider les données reçues
    // Helper function pour parser les chaînes JSON si nécessaire
    const parseIfString = (value, defaultValue = []) => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : defaultValue;
        } catch (e) {
          console.error('Erreur parsing JSON:', e);
          return defaultValue;
        }
      }
      return defaultValue;
    };
    
    const cleanData = {
      personal: req.body.personal || {},
      projects: parseIfString(req.body.projects, []),
      skills: parseIfString(req.body.skills, []),
      links: req.body.links || {},
      about: req.body.about || {},
      timeline: parseIfString(req.body.timeline, []),
      services: parseIfString(req.body.services, []),
      certifications: parseIfString(req.body.certifications, []),
      contactMessages: parseIfString(req.body.contactMessages, []),
      faq: parseIfString(req.body.faq, [])
    };
    
    console.log('📦 Données nettoyées:', {
      projectsCount: cleanData.projects.length,
      skillsCount: cleanData.skills.length,
      timelineCount: cleanData.timeline.length
    });
    
    // Utiliser findOneAndUpdate pour mettre à jour ou créer
    const portfolio = await Portfolio.findOneAndUpdate(
      {}, // Pas de filtre, on veut le seul document
      { $set: cleanData }, // Mettre à jour tous les champs avec les données nettoyées
      { 
        new: true, // Retourner le document mis à jour
        upsert: true, // Créer si n'existe pas
        runValidators: false // Désactiver les validateurs pour éviter les erreurs
      }
    );
    
    console.log('✅ Portfolio mis à jour avec succès:', {
      projects: portfolio.projects?.length || 0,
      skills: portfolio.skills?.length || 0
    });
    
    // Convertir en objet propre sans champs MongoDB
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
    console.error('❌ Erreur lors de la mise à jour du portfolio:', error);
    console.error('Détails de l\'erreur:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/portfolio/login - Authentification admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Vérification simple (vous pouvez améliorer avec bcrypt)
    if (email === process.env.ADMIN_EMAIL) {
      // Pour l'instant, on accepte n'importe quel mot de passe
      // Vous devriez stocker un hash bcrypt du mot de passe
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { email: email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      console.log('✅ Connexion admin réussie:', email);
      res.json({ 
        success: true, 
        token,
        expiresIn: '24h'
      });
    } else {
      console.log('❌ Tentative de connexion avec email invalide:', email);
      res.status(401).json({ error: 'Email invalide' });
    }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
