const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/portfolio - Récupérer les données du portfolio (public)
router.get('/', async (req, res) => {
  try {
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
      if (Array.isArray(value)) {
        // Vérifier que tous les éléments sont des objets, pas des chaînes
        return value.map(item => {
          if (typeof item === 'string') {
            try {
              return JSON.parse(item);
            } catch (e) {
              console.error('Erreur parsing élément du tableau:', e);
              return null;
            }
          }
          return item;
        }).filter(item => item !== null);
      }
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            return parsed.map(item => {
              if (typeof item === 'string') {
                try {
                  return JSON.parse(item);
                } catch (e) {
                  return null;
                }
              }
              return item;
            }).filter(item => item !== null);
          }
          return defaultValue;
        } catch (e) {
          // Si le parsing JSON échoue, c'est peut-être du code JavaScript
          // Dans ce cas, on retourne un tableau vide pour éviter l'erreur
          console.error('Erreur parsing JSON (peut-être du code JS):', value.substring(0, 100));
          return defaultValue;
        }
      }
      return defaultValue;
    };
    
    // Helper pour nettoyer un objet et s'assurer qu'il est valide
    const cleanObject = (obj) => {
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
      const cleaned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          
          // Si c'est un tableau, le nettoyer
          if (Array.isArray(value)) {
            cleaned[key] = value.map(item => {
              if (typeof item === 'string' && (item.includes('`') || item.includes(' + '))) {
                return item.replace(/`/g, '').replace(/\s*\+\s*/g, ' ').trim();
              }
              return item;
            });
          }
          // Si c'est une chaîne avec du code JavaScript, la nettoyer
          else if (typeof value === 'string' && (value.includes('`') || value.includes(' + '))) {
            console.warn(`⚠️ Valeur suspecte détectée pour ${key}, nettoyée`);
            cleaned[key] = value.replace(/`/g, '').replace(/\s*\+\s*/g, ' ').trim();
          }
          // Si c'est un objet, le nettoyer récursivement
          else if (value && typeof value === 'object' && !Array.isArray(value)) {
            cleaned[key] = cleanObject(value);
          }
          // Sinon, garder la valeur telle quelle
          else {
            cleaned[key] = value;
          }
        }
      }
      return cleaned;
    };
    
    const cleanData = {
      personal: cleanObject(req.body.personal),
      projects: parseIfString(req.body.projects, []),
      skills: parseIfString(req.body.skills, []),
      links: cleanObject(req.body.links),
      about: cleanObject(req.body.about),
      timeline: parseIfString(req.body.timeline, []),
      services: parseIfString(req.body.services, []),
      certifications: parseIfString(req.body.certifications, []),
      contactMessages: parseIfString(req.body.contactMessages, []),
      faq: parseIfString(req.body.faq, [])
    };
    
    // Fonction pour nettoyer une chaîne de code JavaScript
    const cleanStringValue = (str) => {
      if (typeof str !== 'string') return str;
      return str.replace(/`/g, '').replace(/\s*\+\s*/g, ' ').replace(/\\n/g, '\n').trim();
    };
    
    // Validation finale : s'assurer que tous les projets sont des objets valides
    cleanData.projects = cleanData.projects
      .map(project => {
        if (!project || typeof project !== 'object' || Array.isArray(project)) {
          console.warn('⚠️ Projet invalide (pas un objet), ignoré');
          return null;
        }
        
        // Nettoyer chaque projet récursivement
        const cleanedProject = cleanObject(project);
        
        // Nettoyer toutes les chaînes du projet
        for (const key in cleanedProject) {
          if (typeof cleanedProject[key] === 'string') {
            cleanedProject[key] = cleanStringValue(cleanedProject[key]);
          } else if (Array.isArray(cleanedProject[key])) {
            cleanedProject[key] = cleanedProject[key].map(item => {
              if (typeof item === 'string') {
                return cleanStringValue(item);
              }
              return item;
            });
          }
        }
        
        // Vérifier que les propriétés essentielles existent
        if (!cleanedProject.title || typeof cleanedProject.title !== 'string') {
          console.warn('⚠️ Projet sans titre valide, ignoré');
          return null;
        }
        
        // Vérifier qu'il n'y a pas de code JavaScript restant
        const projectStr = JSON.stringify(cleanedProject);
        if (projectStr.includes('`') || projectStr.includes(' + ')) {
          console.warn(`⚠️ Projet "${cleanedProject.title}" contient encore du code JS, ignoré`);
          return null;
        }
        
        // S'assurer que les tableaux sont bien des tableaux
        if (cleanedProject.features && !Array.isArray(cleanedProject.features)) {
          cleanedProject.features = [];
        }
        if (cleanedProject.tags && !Array.isArray(cleanedProject.tags)) {
          cleanedProject.tags = [];
        }
        
        return cleanedProject;
      })
      .filter(project => project !== null);
    
    // Validation similaire pour les skills
    cleanData.skills = cleanData.skills
      .map(skill => {
        if (!skill || typeof skill !== 'object' || Array.isArray(skill)) return null;
        
        const cleanedSkill = cleanObject(skill);
        
        // Nettoyer toutes les chaînes
        for (const key in cleanedSkill) {
          if (typeof cleanedSkill[key] === 'string') {
            cleanedSkill[key] = cleanStringValue(cleanedSkill[key]);
          } else if (Array.isArray(cleanedSkill[key])) {
            cleanedSkill[key] = cleanedSkill[key].map(item => {
              if (typeof item === 'string') {
                return cleanStringValue(item);
              }
              return item;
            });
          }
        }
        
        if (!cleanedSkill.name || typeof cleanedSkill.name !== 'string') {
          console.warn('⚠️ Skill sans nom valide, ignoré');
          return null;
        }
        
        if (cleanedSkill.skills && !Array.isArray(cleanedSkill.skills)) {
          cleanedSkill.skills = [];
        }
        
        return cleanedSkill;
      })
      .filter(skill => skill !== null);
    
    console.log('📦 Données nettoyées:', {
      projectsCount: cleanData.projects.length,
      skillsCount: cleanData.skills.length,
      timelineCount: cleanData.timeline.length,
      hasPersonal: !!cleanData.personal,
      hasAbout: !!cleanData.about,
      projectsSample: cleanData.projects.length > 0 ? {
        title: cleanData.projects[0].title,
        type: typeof cleanData.projects[0],
        hasTitle: !!cleanData.projects[0].title
      } : null
    });
    
    // Validation finale : s'assurer qu'on a au moins des données minimales
    if (!cleanData.personal) cleanData.personal = {};
    if (!cleanData.about) cleanData.about = {};
    if (!cleanData.links) cleanData.links = {};
    
    // Vérification finale avant sauvegarde MongoDB
    console.log('🔍 Validation finale avant MongoDB:', {
      projectsAreArray: Array.isArray(cleanData.projects),
      projectsLength: cleanData.projects.length,
      firstProjectType: cleanData.projects.length > 0 ? typeof cleanData.projects[0] : 'N/A',
      firstProjectIsObject: cleanData.projects.length > 0 ? (typeof cleanData.projects[0] === 'object' && !Array.isArray(cleanData.projects[0])) : false,
      firstProjectTitle: cleanData.projects.length > 0 ? cleanData.projects[0].title : 'N/A'
    });
    
    // Utiliser findOneAndUpdate pour mettre à jour ou créer
    let portfolio;
    try {
      portfolio = await Portfolio.findOneAndUpdate(
        {}, // Pas de filtre, on veut le seul document
        { $set: cleanData }, // Mettre à jour tous les champs avec les données nettoyées
        { 
          new: true, // Retourner le document mis à jour
          upsert: true, // Créer si n'existe pas
          runValidators: false, // Désactiver les validateurs pour éviter les erreurs
          setDefaultsOnInsert: true // Utiliser les valeurs par défaut du schéma si création
        }
      );
    } catch (mongoError) {
      console.error('❌ Erreur MongoDB:', mongoError.message);
      console.error('Stack:', mongoError.stack);
      // Essayer de sauvegarder avec des données minimales si l'erreur persiste
      if (mongoError.message.includes('Cast')) {
        console.log('🔄 Tentative de sauvegarde avec données minimales...');
        const minimalData = {
          personal: cleanData.personal || {},
          projects: [],
          skills: [],
          links: cleanData.links || {},
          about: cleanData.about || {},
          timeline: [],
          services: [],
          certifications: [],
          contactMessages: cleanData.contactMessages || [],
          faq: []
        };
        portfolio = await Portfolio.findOneAndUpdate(
          {},
          { $set: minimalData },
          { new: true, upsert: true, runValidators: false }
        );
        throw new Error('Données corrompues détectées. Portfolio réinitialisé avec données minimales.');
      }
      throw mongoError;
    }
    
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
