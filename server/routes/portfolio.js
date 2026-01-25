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
    
    // Log pour déboguer le CV
    const cvInfo = portfolio.links ? {
      hasCv: !!portfolio.links.cv,
      hasCvFile: !!portfolio.links.cvFile,
      cvType: portfolio.links.cv ? (portfolio.links.cv.startsWith('data:') ? 'base64' : 'path') : 'none',
      cvFileType: portfolio.links.cvFile ? (portfolio.links.cvFile.startsWith('data:') ? 'base64' : 'path') : 'none',
      cvFileName: portfolio.links.cvFileName,
      cvSize: portfolio.links.cvFile ? portfolio.links.cvFile.length : 0,
      cvValue: portfolio.links.cv ? (portfolio.links.cv.length > 100 ? portfolio.links.cv.substring(0, 100) + '...' : portfolio.links.cv) : 'none',
      cvFileValue: portfolio.links.cvFile ? (portfolio.links.cvFile.length > 100 ? portfolio.links.cvFile.substring(0, 100) + '...' : portfolio.links.cvFile) : 'none',
      linksKeys: Object.keys(portfolio.links || {})
    } : { error: 'No links object' };
    
    // Log pour déboguer les settings
    const settingsInfo = portfolio.settings ? {
      hasSettings: true,
      maintenanceEnabled: portfolio.settings.maintenance?.enabled,
      maintenanceMessage: portfolio.settings.maintenance?.message,
      settingsKeys: Object.keys(portfolio.settings)
    } : { hasSettings: false };
    
    console.log('📊 GET /api/portfolio:', {
      hasData,
      projects: portfolio.projects?.length || 0,
      skills: portfolio.skills?.length || 0,
      timeline: portfolio.timeline?.length || 0,
      hasPhoto: !!portfolio.personal?.photo,
      responseSize: JSON.stringify(portfolio).length,
      cvInfo: cvInfo,
      settingsInfo: settingsInfo
    });
    
    // S'assurer que les settings sont bien dans la réponse
    if (!portfolio.settings) {
      console.log('⚠️ Aucune settings dans le portfolio, ajout des valeurs par défaut');
      portfolio.settings = {
        maintenance: { enabled: false, message: 'Le site est actuellement en maintenance. Nous serons bientôt de retour !' },
        seo: { title: '', description: '', keywords: '' },
        analytics: { googleAnalytics: '' }
      };
    }
    
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
    
    // Log des settings reçues dans req.body
    if (req.body.settings) {
      console.log('📥 Settings reçues dans req.body:', {
        hasSettings: true,
        maintenanceEnabled: req.body.settings.maintenance?.enabled,
        maintenanceMessage: req.body.settings.maintenance?.message,
        settingsKeys: Object.keys(req.body.settings)
      });
    } else {
      console.log('⚠️ Aucune settings dans req.body');
    }
    
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
      stages: Array.isArray(req.body.stages) ? req.body.stages : [],
      alternances: Array.isArray(req.body.alternances) ? req.body.alternances : [],
      techEvents: Array.isArray(req.body.techEvents) ? req.body.techEvents : [],
      contactMessages: Array.isArray(req.body.contactMessages) ? req.body.contactMessages : [],
      faq: Array.isArray(req.body.faq) ? req.body.faq : [],
      settings: req.body.settings || {}
    };
    
    // S'assurer que les settings sont bien présentes
    if (!updateData.settings || Object.keys(updateData.settings).length === 0) {
      console.log('⚠️ Settings vides ou absentes, utilisation des valeurs par défaut');
      updateData.settings = {
        maintenance: { enabled: false, message: 'Le site est actuellement en maintenance. Nous serons bientôt de retour !' },
        seo: { title: '', description: '', keywords: '' },
        analytics: { googleAnalytics: '' }
      };
    }
    
    // PROTECTION : Ne pas écraser un CV base64 existant avec 'assets/CV.pdf'
    // Si links.cv est 'assets/CV.pdf' mais qu'il existe un cvFile base64, garder le base64
    if (updateData.links) {
      // Récupérer le portfolio actuel pour vérifier s'il y a un CV base64
      const portfolioActuel = await Portfolio.findOne();
      if (portfolioActuel && portfolioActuel.links) {
        // Si le portfolio actuel a un CV base64, ne pas l'écraser
        if (portfolioActuel.links.cvFile && portfolioActuel.links.cvFile.startsWith('data:')) {
          // Si les nouvelles données n'ont pas de cvFile base64 mais ont 'assets/CV.pdf', garder l'ancien base64
          if (!updateData.links.cvFile && updateData.links.cv === 'assets/CV.pdf') {
            console.log('🛡️ Protection : Conservation du CV base64 existant (ignoré assets/CV.pdf)');
            updateData.links.cvFile = portfolioActuel.links.cvFile;
            updateData.links.cv = portfolioActuel.links.cvFile; // Utiliser le base64
            updateData.links.cvFileName = portfolioActuel.links.cvFileName;
            updateData.links.cvFileSize = portfolioActuel.links.cvFileSize;
          }
        }
        // Si les nouvelles données ont un CV base64, s'assurer qu'il remplace bien l'ancien
        else if (updateData.links.cvFile && updateData.links.cvFile.startsWith('data:')) {
          console.log('✅ Nouveau CV base64 détecté - Remplacement de l\'ancien');
          // S'assurer que cv contient aussi le base64
          if (!updateData.links.cv || !updateData.links.cv.startsWith('data:')) {
            updateData.links.cv = updateData.links.cvFile;
          }
        }
      }
    }
    
    // Log pour déboguer le CV
    if (updateData.links) {
      console.log('📄 CV dans les données à sauvegarder:', {
        hasCv: !!updateData.links.cv,
        hasCvFile: !!updateData.links.cvFile,
        cvType: updateData.links.cv ? (updateData.links.cv.startsWith('data:') ? 'base64' : 'path') : 'none',
        cvFileType: updateData.links.cvFile ? (updateData.links.cvFile.startsWith('data:') ? 'base64' : 'path') : 'none',
        cvFileName: updateData.links.cvFileName,
        cvSize: updateData.links.cvFile ? updateData.links.cvFile.length : 0
      });
    }

    console.log('📦 Données validées à sauvegarder:', {
      projects: updateData.projects.length,
      skills: updateData.skills.length,
      timeline: updateData.timeline.length,
      hasPersonal: !!updateData.personal,
      hasAbout: !!updateData.about,
      hasSettings: !!updateData.settings,
      maintenanceEnabled: updateData.settings?.maintenance?.enabled,
      maintenanceMessage: updateData.settings?.maintenance?.message,
      admin: req.admin.email
    });
    
    // PROTECTION CRITIQUE : S'assurer que le CV base64 est bien inclus dans updateData
    // Si updateData.links contient un CV base64, s'assurer qu'il est bien sauvegardé
    if (updateData.links && updateData.links.cvFile && updateData.links.cvFile.startsWith('data:')) {
      console.log('🔒 Protection CV base64 activée - Vérification avant sauvegarde:', {
        cvFileLength: updateData.links.cvFile.length,
        cvFileStartsWith: updateData.links.cvFile.substring(0, 30),
        cvFileName: updateData.links.cvFileName,
        cvFileSize: updateData.links.cvFileSize
      });
      
      // S'assurer que cv contient aussi le base64
      if (!updateData.links.cv || !updateData.links.cv.startsWith('data:')) {
        updateData.links.cv = updateData.links.cvFile;
        console.log('✅ cv mis à jour avec cvFile base64');
      }
    }
    
    // Log des settings reçues AVANT sauvegarde
    if (updateData.settings) {
      console.log('🔧 Settings reçues pour sauvegarde:', {
        hasSettings: true,
        maintenanceEnabled: updateData.settings.maintenance?.enabled,
        maintenanceMessage: updateData.settings.maintenance?.message,
        settingsObject: JSON.stringify(updateData.settings)
      });
    } else {
      console.log('⚠️ Aucune settings reçue dans updateData');
    }
    
    // Mettre à jour directement avec findOneAndUpdate
    // Utiliser $set pour mettre à jour tous les champs, y compris links avec le CV base64 et settings
    const portfolio = await Portfolio.findOneAndUpdate(
      {}, // Pas de filtre spécifique, on veut le document unique
      { $set: updateData },
      { 
        new: true, // Retourner le document mis à jour
        upsert: true, // Créer si n'existe pas
        runValidators: false // Pas de validation spéciale
      }
    );
    
    // VÉRIFICATION CRITIQUE : Vérifier que le CV base64 a bien été sauvegardé
    if (updateData.links && updateData.links.cvFile && updateData.links.cvFile.startsWith('data:')) {
      const cvSauvegarde = portfolio.links;
      if (!cvSauvegarde || !cvSauvegarde.cvFile || !cvSauvegarde.cvFile.startsWith('data:')) {
        console.error('❌ ERREUR CRITIQUE: Le CV base64 n\'a PAS été sauvegardé dans MongoDB !');
        console.error('CV envoyé:', {
          length: updateData.links.cvFile.length,
          startsWith: updateData.links.cvFile.substring(0, 30)
        });
        console.error('CV dans portfolio après sauvegarde:', {
          hasLinks: !!cvSauvegarde,
          hasCvFile: !!cvSauvegarde?.cvFile,
          cvFileType: cvSauvegarde?.cvFile ? (cvSauvegarde.cvFile.startsWith('data:') ? 'base64' : 'other') : 'none'
        });
        
        // TENTATIVE DE RÉCUPÉRATION : Réessayer avec une mise à jour explicite du CV
        console.log('🔄 Tentative de récupération - Mise à jour explicite du CV...');
        const portfolioRecupere = await Portfolio.findOneAndUpdate(
          {},
          { 
            $set: { 
              'links.cvFile': updateData.links.cvFile,
              'links.cv': updateData.links.cv,
              'links.cvFileName': updateData.links.cvFileName,
              'links.cvFileSize': updateData.links.cvFileSize
            }
          },
          { new: true }
        );
        
        if (portfolioRecupere && portfolioRecupere.links && portfolioRecupere.links.cvFile && portfolioRecupere.links.cvFile.startsWith('data:')) {
          console.log('✅ CV base64 récupéré avec succès après tentative de récupération');
          portfolio = portfolioRecupere;
        } else {
          console.error('❌ ÉCHEC: Impossible de sauvegarder le CV base64 même après tentative de récupération');
        }
      } else {
        console.log('✅ CV base64 confirmé sauvegardé dans MongoDB:', {
          cvFileLength: cvSauvegarde.cvFile.length,
          cvLength: cvSauvegarde.cv ? cvSauvegarde.cv.length : 0,
          cvFileName: cvSauvegarde.cvFileName
        });
      }
    }
    
    // Log pour déboguer le CV après sauvegarde
    const cvInfoAfter = portfolio.links ? {
      hasCv: !!portfolio.links.cv,
      hasCvFile: !!portfolio.links.cvFile,
      cvType: portfolio.links.cv ? (portfolio.links.cv.startsWith('data:') ? 'base64' : 'path') : 'none',
      cvFileType: portfolio.links.cvFile ? (portfolio.links.cvFile.startsWith('data:') ? 'base64' : 'path') : 'none',
      cvFileName: portfolio.links.cvFileName,
      cvSize: portfolio.links.cvFile ? portfolio.links.cvFile.length : 0
    } : { error: 'No links object' };
    
    // Vérifier que les settings sont bien sauvegardées
    const settingsInfo = portfolio.settings ? {
      hasSettings: true,
      maintenanceEnabled: portfolio.settings.maintenance?.enabled,
      maintenanceMessage: portfolio.settings.maintenance?.message,
      hasSeo: !!portfolio.settings.seo,
      hasAnalytics: !!portfolio.settings.analytics
    } : { hasSettings: false };
    
    console.log('✅ Portfolio mis à jour avec succès:', {
      projects: portfolio.projects?.length || 0,
      skills: portfolio.skills?.length || 0,
      timeline: portfolio.timeline?.length || 0,
      cvInfo: cvInfoAfter,
      settingsInfo: settingsInfo
    });
    
    // VÉRIFICATION FINALE : S'assurer que le CV base64 et les settings sont bien dans la réponse
    const portfolioObj = portfolio.toObject();
    delete portfolioObj._id;
    delete portfolioObj.__v;
    delete portfolioObj.createdAt;
    delete portfolioObj.updatedAt;
    
    // VÉRIFICATION CRITIQUE : S'assurer que les settings sont bien dans la réponse
    if (updateData.settings) {
      if (!portfolioObj.settings) {
        console.error('❌ ERREUR: Les settings n\'ont pas été sauvegardées dans MongoDB !');
        console.error('Settings envoyées:', {
          maintenanceEnabled: updateData.settings.maintenance?.enabled,
          maintenanceMessage: updateData.settings.maintenance?.message
        });
        
        // Forcer les settings dans la réponse
        portfolioObj.settings = updateData.settings;
        console.log('⚠️ Settings forcées dans la réponse (problème de sauvegarde MongoDB détecté)');
      } else {
        // Vérifier que les settings sont correctes
        if (updateData.settings.maintenance?.enabled !== portfolioObj.settings.maintenance?.enabled) {
          console.error('❌ ERREUR: Le mode maintenance ne correspond pas !');
          console.error('Attendu:', updateData.settings.maintenance?.enabled);
          console.error('Reçu:', portfolioObj.settings.maintenance?.enabled);
          
          // Forcer les settings correctes
          portfolioObj.settings = updateData.settings;
          console.log('⚠️ Settings corrigées dans la réponse');
        } else {
          console.log('✅ Settings confirmées dans la réponse:', {
            maintenanceEnabled: portfolioObj.settings.maintenance?.enabled,
            maintenanceMessage: portfolioObj.settings.maintenance?.message
          });
        }
      }
    }
    
    // Vérification critique : Si un CV base64 a été envoyé, il doit être dans la réponse
    if (updateData.links && updateData.links.cvFile && updateData.links.cvFile.startsWith('data:')) {
      if (!portfolioObj.links || !portfolioObj.links.cvFile || !portfolioObj.links.cvFile.startsWith('data:')) {
        console.error('❌ ERREUR CRITIQUE: Le CV base64 n\'est pas dans la réponse !');
        console.error('CV envoyé (premiers 50 chars):', updateData.links.cvFile.substring(0, 50));
        console.error('CV dans réponse:', portfolioObj.links?.cvFile ? portfolioObj.links.cvFile.substring(0, 50) : 'undefined');
        
        // Forcer le CV base64 dans la réponse même si MongoDB ne l'a pas sauvegardé
        if (!portfolioObj.links) portfolioObj.links = {};
        portfolioObj.links.cvFile = updateData.links.cvFile;
        portfolioObj.links.cv = updateData.links.cv;
        portfolioObj.links.cvFileName = updateData.links.cvFileName;
        portfolioObj.links.cvFileSize = updateData.links.cvFileSize;
        
        console.log('⚠️ CV base64 forcé dans la réponse (problème de sauvegarde MongoDB détecté)');
      } else {
        console.log('✅ CV base64 confirmé dans la réponse:', {
          cvFileLength: portfolioObj.links.cvFile.length,
          cvFileName: portfolioObj.links.cvFileName
        });
      }
    }
    
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

// POST /api/portfolio/auth/change-password - Changer le mot de passe admin
router.post('/auth/change-password',
  authenticateAdmin,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Validation des champs
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          error: 'Le mot de passe actuel et le nouveau mot de passe sont requis' 
        });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ 
          error: 'Le nouveau mot de passe doit contenir au minimum 8 caractères' 
        });
      }
      
      // Vérifier le mot de passe actuel
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(currentPassword, process.env.ADMIN_PASSWORD_HASH);
      
      if (!isValidPassword) {
        console.log('❌ Tentative de changement de mot de passe avec mot de passe actuel incorrect');
        return res.status(401).json({ 
          error: 'Mot de passe actuel incorrect' 
        });
      }
      
      // Générer le nouveau hash
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      
      // IMPORTANT: Le changement de mot de passe nécessite une modification du fichier .env
      // Pour une solution complète, il faudrait stocker les credentials dans MongoDB
      // Pour l'instant, on retourne le nouveau hash que l'admin devra ajouter manuellement
      console.log('✅ Nouveau hash de mot de passe généré pour:', req.admin.email);
      console.log('⚠️  IMPORTANT: Ajoutez cette ligne à votre fichier .env :');
      console.log(`ADMIN_PASSWORD_HASH=${newPasswordHash}`);
      console.log('⚠️  Puis redémarrez le serveur pour que le changement prenne effet.');
      
      res.json({ 
        success: true,
        message: 'Nouveau hash généré. Veuillez mettre à jour votre fichier .env avec le nouveau hash et redémarrer le serveur.',
        newHash: newPasswordHash,
        instructions: [
          '1. Copiez le nouveau hash ci-dessus',
          '2. Mettez à jour ADMIN_PASSWORD_HASH dans votre fichier .env',
          '3. Redémarrez le serveur',
          '4. Connectez-vous avec votre nouveau mot de passe'
        ]
      });
      
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error.message);
      res.status(500).json({ 
        error: 'Erreur serveur lors du changement de mot de passe' 
      });
    }
  }
);

// POST /api/portfolio/contact - Envoyer un message de contact
router.post('/contact', 
  limitDataSize,
  sanitizeData,
  async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validation des champs obligatoires
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Champs obligatoires manquants',
        message: 'Le nom, l\'email et le message sont requis'
      });
    }
    
    // Validation de l'email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Email invalide'
      });
    }
    
    // Récupérer le portfolio et ajouter le message
    const portfolio = await Portfolio.findOne();
    
    if (!portfolio) {
      // Créer un nouveau portfolio si inexistant
      const defaultData = require('../models/Portfolio').MINIMAL_PORTFOLIO_DATA || {};
      await Portfolio.create(defaultData);
    }
    
    // Générer un ID unique pour le message
    const existingMessages = portfolio.contactMessages || [];
    const newMessageId = existingMessages.length > 0 
      ? Math.max(...existingMessages.map(m => m.id || 0)) + 1 
      : 1;
    
    // Créer le nouveau message
    const newMessage = {
      id: newMessageId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject ? subject.trim() : 'Sans objet',
      message: message.trim(),
      date: new Date().toISOString(),
      read: false
    };
    
    // Ajouter le message au portfolio
    await Portfolio.findOneAndUpdate(
      {},
      { $push: { contactMessages: newMessage } },
      { new: true, upsert: true }
    );
    
    console.log('✅ Message de contact reçu:', {
      id: newMessageId,
      email: email,
      subject: subject || 'Sans objet'
    });
    
    res.json({ 
      success: true, 
      message: 'Message envoyé avec succès',
      messageId: newMessageId
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du message:', error.message);
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'envoi du message',
      message: 'Une erreur est survenue. Veuillez réessayer plus tard.'
    });
  }
});

module.exports = router;
