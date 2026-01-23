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
    let portfolio = await Portfolio.findOne();
    
    if (!portfolio) {
      portfolio = new Portfolio(req.body);
    } else {
      // Mettre à jour tous les champs
      Object.assign(portfolio, req.body);
    }
    
    await portfolio.save();
    
    console.log('✅ Portfolio mis à jour avec succès');
    res.json({ 
      success: true, 
      message: 'Portfolio mis à jour avec succès',
      portfolio 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du portfolio:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
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
      
      res.json({ 
        success: true, 
        token,
        expiresIn: '24h'
      });
    } else {
      res.status(401).json({ error: 'Email invalide' });
    }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
