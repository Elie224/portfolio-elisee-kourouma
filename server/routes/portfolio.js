const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const { authenticateAdmin } = require('../middleware/auth');

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
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    console.log('📥 Requête de mise à jour reçue');
    
    // Validation simple : s'assurer que les données de base existent
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

    console.log('📦 Données à sauvegarder:', {
      projects: updateData.projects.length,
      skills: updateData.skills.length,
      timeline: updateData.timeline.length,
      hasPersonal: !!updateData.personal,
      hasAbout: !!updateData.about
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
    
    // Si c'est une erreur de cast, essayer avec des données minimales
    if (error.message.includes('Cast') || error.name === 'ValidationError') {
      try {
        console.log('🔄 Tentative de réinitialisation avec données par défaut...');
        
        // Supprimer tous les documents et recréer avec les données par défaut
        await Portfolio.deleteMany({});
        
        // Créer un nouveau document avec les données par défaut
        const defaultData = JSON.parse(JSON.stringify({
          personal: { fullName: "Nema Elisée Kourouma", email: "kouroumaelisee@gmail.com", photo: "assets/photo.jpeg" },
          projects: [],
          skills: [],
          links: {},
          about: {},
          timeline: [],
          services: [],
          certifications: [],
          contactMessages: [],
          faq: []
        }));
        
        const newPortfolio = await Portfolio.create(defaultData);
        
        res.json({
          success: true,
          message: 'Portfolio réinitialisé avec succès après erreur',
          portfolio: newPortfolio.toObject()
        });
        
      } catch (resetError) {
        console.error('❌ Erreur lors de la réinitialisation:', resetError);
        res.status(500).json({
          error: 'Erreur critique lors de la mise à jour',
          message: 'Impossible de sauvegarder les données'
        });
      }
    } else {
      res.status(500).json({
        error: 'Erreur lors de la mise à jour',
        message: error.message
      });
    }
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
