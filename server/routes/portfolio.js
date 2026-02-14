/**
 * Routes API pour le Portfolio
 * 
 * Ce fichier gère toutes les routes API pour :
 * - Récupérer les données du portfolio (GET)
 * - Mettre à jour les données (POST - authentifié)
 * - Authentification admin (POST /login)
 * 
 * @author Nema Elisée Kourouma
 * @date 2026
 */

const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const { authenticateAdmin, ADMIN_EMAIL, ADMIN_PASSWORD_HASH } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { 
  validatePortfolioData, 
  validateLoginData, 
  sanitizeData, 
  limitDataSize 
} = require('../middleware/validation');

// Importer le système de logging centralisé
const { log, logError, logWarn, logSecurity, logSuccess } = require('../utils/logger');

// Transport mail (SMTP)
let mailTransporter = null;
function getMailTransporter() {
  if (mailTransporter) return mailTransporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logWarn('✉️ SMTP non configuré : définir SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM');
    return null;
  }
  mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: !!process.env.SMTP_SECURE && process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  return mailTransporter;
}

function calculerTailleBase64(dataUrl = '') {
  if (!dataUrl || typeof dataUrl !== 'string') return 0;
  const base64 = dataUrl.split(',').pop() || '';
  return Math.floor((base64.length * 3) / 4); // taille en octets
}

function nettoyerProjetPublic(projet) {
  const clone = { ...projet._doc || projet };
  delete clone.docFile;
  delete clone.docPasswordHash;
  clone.docAvailable = !!projet.docFile;
  return clone;
}

function construireLienTelechargement(req, projectTitle, token) {
  const base = process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
  return `${base}/api/portfolio/projects/${encodeURIComponent(projectTitle)}/download?token=${token}`;
}

async function envoyerMailMotDePasse({ to, projectTitle, downloadLink }) {
  const transporter = getMailTransporter();
  if (!transporter) {
    logWarn('📧 Mail non envoyé (SMTP non configuré)', { to, projectTitle, downloadLink });
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `Accès au document du projet "${projectTitle}"`,
    html: `<p>Bonjour,</p>
           <p>Voici le lien pour télécharger le document du projet <strong>${projectTitle}</strong> (valable 1h):</p>
           <p><a href="${downloadLink}">${downloadLink}</a></p>
           <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>`
  });
}

/**
 * GET /api/portfolio - Récupérer les données du portfolio (public)
 * 
 * Cette route est accessible sans authentification et retourne toutes les données
 * du portfolio pour l'affichage sur le site web.
 * 
 * @route GET /api/portfolio
 * @access Public
 * @returns {Object} Données complètes du portfolio
 */
router.get('/', async (req, res) => {
  try {
    log('📥 GET /api/portfolio - Début de la requête');
    const portfolio = await Portfolio.getPortfolio();
    
    // Vérifier si des données existent (pour le logging en développement)
    const hasData = (portfolio.projects?.length > 0) || 
                   (portfolio.skills?.length > 0) || 
                   (portfolio.timeline?.length > 0) ||
                   (portfolio.personal?.photo);
    
    // Informations sur le CV (pour le debugging en développement uniquement)
    const cvInfo = portfolio.links ? {
      hasCv: !!portfolio.links.cv,
      hasCvFile: !!portfolio.links.cvFile,
      cvType: portfolio.links.cv ? (portfolio.links.cv.startsWith('data:') ? 'base64' : 'path') : 'none',
      cvFileType: portfolio.links.cvFile ? (portfolio.links.cvFile.startsWith('data:') ? 'base64' : 'path') : 'none',
      cvFileName: portfolio.links.cvFileName,
      cvSize: portfolio.links.cvFile ? portfolio.links.cvFile.length : 0
    } : { error: 'No links object' };
    
    // Informations sur les settings (pour le debugging en développement uniquement)
    const settingsInfo = portfolio.settings ? {
      hasSettings: true,
      maintenanceEnabled: portfolio.settings.maintenance?.enabled,
      maintenanceMessage: portfolio.settings.maintenance?.message
    } : { hasSettings: false };
    
    // Logger les informations (uniquement en développement)
    log('📊 GET /api/portfolio:', {
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
    // Si absentes, on ajoute des valeurs par défaut pour éviter les erreurs
    if (!portfolio.settings) {
      logWarn('⚠️ Aucune settings dans le portfolio, ajout des valeurs par défaut');
      portfolio.settings = {
        maintenance: { enabled: false, message: 'Le site est actuellement en maintenance. Nous serons bientôt de retour !' },
        seo: { title: '', description: '', keywords: '' },
        analytics: { googleAnalytics: '' }
      };
    }
    
    // Version publique : retirer les données sensibles (messages de contact, fichiers CV bruts)
    const publicPortfolio = JSON.parse(JSON.stringify(portfolio));
    delete publicPortfolio.contactMessages;
    if (publicPortfolio.links) {
      delete publicPortfolio.links.cvFile;
      delete publicPortfolio.links.cvFileName;
      delete publicPortfolio.links.cvFileSize;
    }

    // Nettoyer les projets publics (pas de doc, pas de hash)
    if (Array.isArray(publicPortfolio.projects)) {
      publicPortfolio.projects = publicPortfolio.projects.map(nettoyerProjetPublic);
    }

    // Ne renvoyer au public que les recherches marquées comme visibles
    if (Array.isArray(publicPortfolio.activeSearches)) {
      publicPortfolio.activeSearches = publicPortfolio.activeSearches.filter(item => item && item.visible !== false);
    }

    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=60');
    res.json(publicPortfolio);
  } catch (error) {
    // Log détaillé de l'erreur pour diagnostic
    // Les erreurs sont toujours loggées même en production pour le debugging
    logError('❌ Erreur lors de la récupération du portfolio:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      path: req.path,
      method: req.method,
      origin: req.headers.origin,
      timestamp: new Date().toISOString()
    });
    
    // Gestion d'erreurs spécifiques MongoDB
    // En cas d'erreur de connexion, on retourne un objet vide plutôt qu'une erreur 500
    // Cela évite d'écraser les données existantes dans le localStorage du client
    if (error.name === 'MongoServerError' || error.message.includes('MongoDB') || error.message.includes('connection')) {
      logError('❌ Erreur MongoDB - Retour d\'un objet vide pour éviter l\'écrasement du localStorage');
      // Retourner un objet vide plutôt qu'une erreur 500 pour éviter que le frontend écrase localStorage
      return res.json({
        personal: {},
        projects: [],
        skills: [],
        links: {},
        about: {},
        timeline: [],
        activeSearches: [],
        services: [],
        certifications: [],
        faq: [],
        settings: {
          maintenance: { enabled: false, message: 'Le site est actuellement en maintenance. Nous serons bientôt de retour !' },
          seo: { title: '', description: '', keywords: '' },
          analytics: { googleAnalytics: '' }
        }
      });
    }
    
    // Pour les autres erreurs, retourner un objet vide aussi (fallback)
    // Cela évite d'écraser les données existantes dans le localStorage du client
    logWarn('⚠️ Retour d\'un objet vide en cas d\'erreur pour éviter l\'écrasement du localStorage');
    res.json({
      personal: {},
      projects: [],
      skills: [],
      links: {},
      about: {},
      timeline: [],
      activeSearches: [],
      services: [],
      certifications: [],
      faq: [],
      settings: {
        maintenance: { enabled: false, message: 'Le site est actuellement en maintenance. Nous serons bientôt de retour !' },
        seo: { title: '', description: '', keywords: '' },
        analytics: { googleAnalytics: '' }
      }
    });
  }
});

// GET /api/portfolio/admin - Données complètes (protégées)
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const portfolio = await Portfolio.getPortfolio();
    res.json(portfolio);
  } catch (error) {
    logError('❌ Erreur lors de la récupération admin du portfolio:', {
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      origin: req.headers.origin,
      adminEmail: req.admin?.email,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération du portfolio',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/portfolio - Mettre à jour les données du portfolio (admin seulement)
 * 
 * Cette route nécessite une authentification admin valide et permet de mettre à jour
 * toutes les données du portfolio (projets, compétences, timeline, etc.)
 * 
 * @route POST /api/portfolio
 * @access Private (Admin uniquement)
 * @middleware authenticateAdmin, validatePortfolioData, sanitizeData, limitDataSize
 * @returns {Object} Portfolio mis à jour
 */
router.post('/', 
  limitDataSize,
  sanitizeData,
  authenticateAdmin, 
  validatePortfolioData,
  async (req, res) => {
  try {
    logSuccess('📥 Requête de mise à jour reçue de:', { email: req.admin.email });
    
    // Vérifier les settings reçues dans req.body (logging en développement uniquement)
    if (req.body.settings) {
      log('📥 Settings reçues dans req.body:', {
        hasSettings: true,
        maintenanceEnabled: req.body.settings.maintenance?.enabled,
        maintenanceMessage: req.body.settings.maintenance?.message,
        settingsKeys: Object.keys(req.body.settings)
      });
    } else {
      logWarn('⚠️ Aucune settings dans req.body');
    }
    
    // Préparation des données (la validation a déjà été faite par les middlewares)
    const updateData = {
      personal: req.body.personal || {},
      projects: Array.isArray(req.body.projects) ? req.body.projects : [],
      skills: Array.isArray(req.body.skills) ? req.body.skills : [],
      links: req.body.links || {},
      about: req.body.about || {},
      timeline: Array.isArray(req.body.timeline) ? req.body.timeline : [],
      activeSearches: Array.isArray(req.body.activeSearches) ? req.body.activeSearches : [],
      services: Array.isArray(req.body.services) ? req.body.services : [],
      certifications: Array.isArray(req.body.certifications) ? req.body.certifications : [],
      testimonials: Array.isArray(req.body.testimonials) ? req.body.testimonials : [],
      stages: Array.isArray(req.body.stages) ? req.body.stages : [],
      alternances: Array.isArray(req.body.alternances) ? req.body.alternances : [],
      techEvents: Array.isArray(req.body.techEvents) ? req.body.techEvents : [],
      contactMessages: Array.isArray(req.body.contactMessages) ? req.body.contactMessages : [],
      faq: Array.isArray(req.body.faq) ? req.body.faq : [],
      settings: req.body.settings || {}
    };
    
    // S'assurer que les settings sont bien présentes
    // Si absentes, on utilise des valeurs par défaut pour éviter les erreurs
    if (!updateData.settings || Object.keys(updateData.settings).length === 0) {
      logWarn('⚠️ Settings vides ou absentes, utilisation des valeurs par défaut');
      updateData.settings = {
        maintenance: { enabled: false, message: 'Le site est actuellement en maintenance. Nous serons bientôt de retour !' },
        seo: { title: '', description: '', keywords: '' },
        analytics: { googleAnalytics: '' }
      };
    }
    
    // Gestion des documents protégés sur les projets
    try {
      if (Array.isArray(updateData.projects)) {
        updateData.projects = updateData.projects.map((projet, idx) => {
          const copie = { ...projet };
          if (copie.docFile) {
            const taille = copie.docFileSize || calculerTailleBase64(copie.docFile);
            if (taille > 50 * 1024 * 1024) {
              throw new Error(`DOC_TOO_LARGE_${idx}`);
            }
            copie.docFileSize = taille;
          }
          if (copie.docPassword) {
            copie.docPasswordHash = bcrypt.hashSync(copie.docPassword, 10);
            delete copie.docPassword;
          }
          return copie;
        });
      }
    } catch (err) {
      if (err.message && err.message.startsWith('DOC_TOO_LARGE')) {
        return res.status(400).json({ error: 'Le document dépasse la limite de 50 Mo', code: 'DOC_TOO_LARGE' });
      }
      logError('❌ Erreur traitement document projet:', err);
      return res.status(400).json({ error: 'Erreur lors du traitement du document du projet' });
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
          // Protection contre l'écrasement accidentel du CV base64
          if (!updateData.links.cvFile && updateData.links.cv === 'assets/CV.pdf') {
            logSecurity('🛡️ Protection : Conservation du CV base64 existant (ignoré assets/CV.pdf)');
            updateData.links.cvFile = portfolioActuel.links.cvFile;
            updateData.links.cv = portfolioActuel.links.cvFile; // Utiliser le base64
            updateData.links.cvFileName = portfolioActuel.links.cvFileName;
            updateData.links.cvFileSize = portfolioActuel.links.cvFileSize;
          }
        }
        // Si les nouvelles données ont un CV base64, s'assurer qu'il remplace bien l'ancien
        else if (updateData.links.cvFile && updateData.links.cvFile.startsWith('data:')) {
          logSuccess('✅ Nouveau CV base64 détecté - Remplacement de l\'ancien');
          // S'assurer que cv contient aussi le base64
          if (!updateData.links.cv || !updateData.links.cv.startsWith('data:')) {
            updateData.links.cv = updateData.links.cvFile;
          }
        }
      }
    }
    
    // Informations sur le CV à sauvegarder (logging en développement uniquement)
    if (updateData.links) {
      log('📄 CV dans les données à sauvegarder:', {
        hasCv: !!updateData.links.cv,
        hasCvFile: !!updateData.links.cvFile,
        cvType: updateData.links.cv ? (updateData.links.cv.startsWith('data:') ? 'base64' : 'path') : 'none',
        cvFileType: updateData.links.cvFile ? (updateData.links.cvFile.startsWith('data:') ? 'base64' : 'path') : 'none',
        cvFileName: updateData.links.cvFileName,
        cvSize: updateData.links.cvFile ? updateData.links.cvFile.length : 0
      });
    }

    // Résumé des données à sauvegarder (logging en développement uniquement)
    log('📦 Données validées à sauvegarder:', {
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
    // Cette protection évite la perte de données importantes
    if (updateData.links && updateData.links.cvFile && updateData.links.cvFile.startsWith('data:')) {
      logSecurity('🔒 Protection CV base64 activée - Vérification avant sauvegarde:', {
        cvFileLength: updateData.links.cvFile.length,
        cvFileStartsWith: updateData.links.cvFile.substring(0, 30),
        cvFileName: updateData.links.cvFile,
        cvFileSize: updateData.links.cvFileSize
      });
      
      // S'assurer que cv contient aussi le base64 pour cohérence
      if (!updateData.links.cv || !updateData.links.cv.startsWith('data:')) {
        updateData.links.cv = updateData.links.cvFile;
        logSuccess('✅ cv mis à jour avec cvFile base64');
      }
    }
    
    // Vérification des settings avant sauvegarde (logging en développement uniquement)
    if (updateData.settings) {
      log('🔧 Settings reçues pour sauvegarde:', {
        hasSettings: true,
        maintenanceEnabled: updateData.settings.maintenance?.enabled,
        maintenanceMessage: updateData.settings.maintenance?.message
      });
    } else {
      logWarn('⚠️ Aucune settings reçue dans updateData');
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
    // Cette vérification est importante pour s'assurer que les données importantes ne sont pas perdues
    if (updateData.links && updateData.links.cvFile && updateData.links.cvFile.startsWith('data:')) {
      const cvSauvegarde = portfolio.links;
      if (!cvSauvegarde || !cvSauvegarde.cvFile || !cvSauvegarde.cvFile.startsWith('data:')) {
        logError('❌ ERREUR CRITIQUE: Le CV base64 n\'a PAS été sauvegardé dans MongoDB !');
        logError('CV envoyé:', {
          length: updateData.links.cvFile.length,
          startsWith: updateData.links.cvFile.substring(0, 30)
        });
        logError('CV dans portfolio après sauvegarde:', {
          hasLinks: !!cvSauvegarde,
          hasCvFile: !!cvSauvegarde?.cvFile,
          cvFileType: cvSauvegarde?.cvFile ? (cvSauvegarde.cvFile.startsWith('data:') ? 'base64' : 'other') : 'none'
        });
        
        // TENTATIVE DE RÉCUPÉRATION : Réessayer avec une mise à jour explicite du CV
        // Cette tentative permet de récupérer les données en cas d'échec initial
        log('🔄 Tentative de récupération - Mise à jour explicite du CV...');
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
          logSuccess('✅ CV base64 récupéré avec succès après tentative de récupération');
          portfolio = portfolioRecupere;
        } else {
          logError('❌ ÉCHEC: Impossible de sauvegarder le CV base64 même après tentative de récupération');
        }
      } else {
        logSuccess('✅ CV base64 confirmé sauvegardé dans MongoDB:', {
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
    
    // Confirmation de la mise à jour réussie (logging en développement uniquement)
    logSuccess('✅ Portfolio mis à jour avec succès:', {
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
    // Cette vérification garantit que les données importantes ne sont pas perdues
    if (updateData.settings) {
      if (!portfolioObj.settings) {
        logError('❌ ERREUR: Les settings n\'ont pas été sauvegardées dans MongoDB !');
        logError('Settings envoyées:', {
          maintenanceEnabled: updateData.settings.maintenance?.enabled,
          maintenanceMessage: updateData.settings.maintenance?.message
        });
        
        // Forcer les settings dans la réponse pour éviter la perte de données
        portfolioObj.settings = updateData.settings;
        logWarn('⚠️ Settings forcées dans la réponse (problème de sauvegarde MongoDB détecté)');
      } else {
        // Vérifier que les settings sont correctes
        // Double vérification pour s'assurer de la cohérence
        if (updateData.settings.maintenance?.enabled !== portfolioObj.settings.maintenance?.enabled) {
          logError('❌ ERREUR: Le mode maintenance ne correspond pas !');
          logError('Attendu:', updateData.settings.maintenance?.enabled);
          logError('Reçu:', portfolioObj.settings.maintenance?.enabled);
          
          // Forcer les settings correctes pour maintenir la cohérence
          portfolioObj.settings = updateData.settings;
          logWarn('⚠️ Settings corrigées dans la réponse');
        } else {
          logSuccess('✅ Settings confirmées dans la réponse:', {
            maintenanceEnabled: portfolioObj.settings.maintenance?.enabled,
            maintenanceMessage: portfolioObj.settings.maintenance?.message
          });
        }
      }
    }
    
    // Vérification critique : Si un CV base64 a été envoyé, il doit être dans la réponse
    // Cette vérification est cruciale car le CV est une donnée importante qui ne doit pas être perdue
    if (updateData.links && updateData.links.cvFile && updateData.links.cvFile.startsWith('data:')) {
      if (!portfolioObj.links || !portfolioObj.links.cvFile || !portfolioObj.links.cvFile.startsWith('data:')) {
        logError('❌ ERREUR CRITIQUE: Le CV base64 n\'est pas dans la réponse !');
        logError('CV envoyé (premiers 50 chars):', updateData.links.cvFile.substring(0, 50));
        logError('CV dans réponse:', portfolioObj.links?.cvFile ? portfolioObj.links.cvFile.substring(0, 50) : 'undefined');
        
        // Forcer le CV base64 dans la réponse même si MongoDB ne l'a pas sauvegardé
        // Cette correction permet de maintenir la cohérence même en cas de problème MongoDB
        if (!portfolioObj.links) portfolioObj.links = {};
        portfolioObj.links.cvFile = updateData.links.cvFile;
        portfolioObj.links.cv = updateData.links.cv;
        portfolioObj.links.cvFileName = updateData.links.cvFileName;
        portfolioObj.links.cvFileSize = updateData.links.cvFileSize;
        
        logWarn('⚠️ CV base64 forcé dans la réponse (problème de sauvegarde MongoDB détecté)');
      } else {
        logSuccess('✅ CV base64 confirmé dans la réponse:', {
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
    // Log détaillé de l'erreur pour diagnostic
    logError('❌ Erreur lors de la mise à jour:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
      path: req.path,
      method: req.method,
      origin: req.headers.origin,
      adminEmail: req.admin?.email,
      timestamp: new Date().toISOString()
    });
    
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
    } else if (error.name === 'MongoServerError') {
      if (error.code === 11000) {
        return res.status(409).json({
          error: 'Conflit de données',
          message: 'Une entrée avec ces données existe déjà',
          code: 'DUPLICATE_ERROR'
        });
      } else if (error.message.includes('connection') || error.message.includes('timeout')) {
        return res.status(503).json({
          error: 'Service temporairement indisponible',
          message: 'La base de données est temporairement indisponible. Veuillez réessayer dans quelques instants.',
          code: 'DATABASE_ERROR'
        });
      }
    }
    
    // Erreur générique
    return res.status(500).json({
      error: 'Erreur serveur lors de la mise à jour',
      message: 'Une erreur inattendue s\'est produite',
      code: 'SERVER_ERROR'
    });
  }
});

// POST /api/portfolio/login - Authentification admin sécurisée
router.post('/login', validateLoginData, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation des champs obligatoires
    // Vérification basique avant de faire des opérations coûteuses
    if (!email || !password) {
      logSecurity('❌ Tentative de connexion sans email ou mot de passe');
      return res.status(400).json({ 
        error: 'Email et mot de passe requis' 
      });
    }
    
    // Vérification de l'email admin
    // Comparaison stricte pour éviter les attaques par injection
    if (email !== ADMIN_EMAIL) {
      logSecurity('❌ Tentative de connexion avec email invalide:', { email: email });
      return res.status(401).json({ 
        error: 'Identifiants invalides' 
      });
    }
    
    // Vérification du mot de passe avec bcrypt
    // Utilisation de bcrypt pour comparer le hash de manière sécurisée
    const bcrypt = require('bcryptjs');
    let isValidPassword = false;

    if (ADMIN_PASSWORD_HASH) {
      isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    } else if (process.env.ADMIN_PASSWORD) {
      // Fallback si le hash n'est pas fourni mais le mot de passe clair est présent
      isValidPassword = password === process.env.ADMIN_PASSWORD;
    }

    // Fallback de développement : mot de passe par défaut si aucune variable n'est définie
    if (!ADMIN_PASSWORD_HASH && !process.env.ADMIN_PASSWORD) {
      isValidPassword = password === 'admin123';
    }
    
    if (!isValidPassword) {
      logSecurity('❌ Mot de passe incorrect pour:', { email: email });
      return res.status(401).json({ 
        error: 'Identifiants invalides' 
      });
    }
    
    // Génération du token JWT
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
    const token = jwt.sign(
      { 
        email: email,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      },
      secret,
      { expiresIn: '2h', audience: 'portfolio-admin', issuer: 'portfolio-backend' }
    );
    
    logSecurity('✅ Connexion admin réussie:', { email: email });
    res.json({ 
      success: true, 
      token,
      expiresIn: '24h',
      user: { email, role: 'admin' }
    });
    
  } catch (error) {
    // Log détaillé de l'erreur pour diagnostic
    // Les erreurs sont toujours loggées même en production
    logError('❌ Erreur lors de la connexion:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      path: req.path,
      method: req.method,
      origin: req.headers.origin,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'authentification',
      code: 'AUTH_ERROR'
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
        logSecurity('❌ Tentative de changement de mot de passe avec mot de passe actuel incorrect', {
          email: req.admin.email
        });
        return res.status(401).json({ 
          error: 'Mot de passe actuel incorrect' 
        });
      }
      
      // Générer le nouveau hash avec bcrypt
      // Utilisation de 12 rounds pour un bon équilibre sécurité/performance
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      
      // IMPORTANT: Le changement de mot de passe nécessite une modification du fichier .env
      // Pour une solution complète, il faudrait stocker les credentials dans MongoDB
      // Pour l'instant, on retourne le nouveau hash que l'admin devra ajouter manuellement
      logSecurity('✅ Nouveau hash de mot de passe généré pour:', { email: req.admin.email });
      logWarn('⚠️  IMPORTANT: Ajoutez cette ligne à votre fichier .env :');
      log(`ADMIN_PASSWORD_HASH=${newPasswordHash}`);
      logWarn('⚠️  Puis redémarrez le serveur pour que le changement prenne effet.');
      
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
      // Log détaillé de l'erreur pour diagnostic
      // Les erreurs sont toujours loggées même en production
      logError('❌ Erreur lors du changement de mot de passe:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        path: req.path,
        method: req.method,
        origin: req.headers.origin,
        adminEmail: req.admin?.email,
        timestamp: new Date().toISOString()
      });
      
      res.status(500).json({ 
        error: 'Erreur serveur lors du changement de mot de passe',
        code: 'PASSWORD_CHANGE_ERROR'
      });
    }
  }
);

// Demande d'accès : enregistre la demande et notifie l'admin, sans envoyer le document
router.post('/projects/:title/request-doc', limitDataSize, sanitizeData, async (req, res) => {
  try {
    const { title } = req.params;
    const { firstName, lastName, email, message, subject } = req.body;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Email invalide', code: 'INVALID_EMAIL' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio || !Array.isArray(portfolio.projects)) {
      return res.status(404).json({ error: 'Aucun projet', code: 'NO_PROJECT' });
    }

    const projet = portfolio.projects.find(p => (p.title || '').toLowerCase() === decodeURIComponent(title).toLowerCase());
    if (!projet || !projet.docFile || !projet.docPasswordHash) {
      return res.status(404).json({ error: 'Document introuvable pour ce projet', code: 'DOC_NOT_FOUND' });
    }

    // Enregistrer la demande dans contactMessages pour suivi admin
    const demande = {
      id: Date.now(),
      name: `${firstName || ''} ${lastName || ''}`.trim() || 'Demandeur',
      email: email.trim().toLowerCase(),
      subject: subject || `Demande mot de passe - ${projet.title}`,
      message: message || 'Demande de mot de passe pour document protégé',
      date: new Date().toISOString(),
      read: false
    };
    await Portfolio.findOneAndUpdate({}, { $push: { contactMessages: demande } }, { upsert: true });

    // Notifier l'admin par email si SMTP configuré
    const transporter = getMailTransporter();
    if (transporter && ADMIN_EMAIL) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: ADMIN_EMAIL,
        replyTo: email, // permet de répondre directement au demandeur
        subject: subject || `Demande mot de passe - ${projet.title}`,
        text: `Nouvelle demande pour le document du projet "${projet.title}"\n\nNom: ${firstName || ''} ${lastName || ''}\nEmail: ${email}\nObjet: ${subject || 'Voir/Télécharger le document'}\nMessage: ${message || ''}`
      }).catch(err => logWarn('⚠️ Notification admin non envoyée', err));
    }

    res.json({ success: true, message: 'Demande envoyée. Vous recevrez un mot de passe si votre demande est acceptée.' });
  } catch (error) {
    logError('❌ Erreur demande doc projet:', error);
    res.status(500).json({ error: 'Erreur serveur', code: 'DOC_REQUEST_ERROR' });
  }
});

// Validation du mot de passe pour obtenir un lien de téléchargement temporaire
router.post('/projects/:title/validate-password', limitDataSize, sanitizeData, async (req, res) => {
  try {
    const { title } = req.params;
    const { password } = req.body;

    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Mot de passe requis', code: 'PASSWORD_REQUIRED' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio || !Array.isArray(portfolio.projects)) {
      return res.status(404).json({ error: 'Aucun projet', code: 'NO_PROJECT' });
    }

    const projet = portfolio.projects.find(p => (p.title || '').toLowerCase() === decodeURIComponent(title).toLowerCase());
    if (!projet || !projet.docFile || !projet.docPasswordHash) {
      return res.status(404).json({ error: 'Document introuvable pour ce projet', code: 'DOC_NOT_FOUND' });
    }

    const ok = await bcrypt.compare(password, projet.docPasswordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Mot de passe incorrect', code: 'INVALID_PASSWORD' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Configuration JWT manquante', code: 'MISSING_JWT' });
    }

    const token = jwt.sign({ projectTitle: projet.title }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const downloadLink = construireLienTelechargement(req, projet.title, token);
    res.json({ success: true, downloadLink });
  } catch (error) {
    logError('❌ Erreur validation mot de passe doc:', error);
    res.status(500).json({ error: 'Erreur serveur', code: 'DOC_PASSWORD_ERROR' });
  }
});

// Téléchargement du document protégé via token temporaire
router.get('/projects/:title/download', async (req, res) => {
  try {
    const { title } = req.params;
    const { token } = req.query;
    if (!token) return res.status(401).json({ error: 'Token manquant' });
    if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'Configuration JWT manquante' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio || !Array.isArray(portfolio.projects)) {
      return res.status(404).json({ error: 'Aucun projet', code: 'NO_PROJECT' });
    }
    const projet = portfolio.projects.find(p => (p.title || '').toLowerCase() === decodeURIComponent(title).toLowerCase());
    if (!projet || !projet.docFile) {
      return res.status(404).json({ error: 'Document introuvable', code: 'DOC_NOT_FOUND' });
    }

    if (payload.projectTitle !== projet.title) {
      return res.status(403).json({ error: 'Token non valide pour ce projet', code: 'TOKEN_PROJECT_MISMATCH' });
    }

    const dataUrl = projet.docFile;
    const base64 = dataUrl.split(',').pop();
    const buffer = Buffer.from(base64, 'base64');
    const fileName = projet.docFileName || 'document';
    let contentType = 'application/octet-stream';
    if (fileName.toLowerCase().endsWith('.pdf')) contentType = 'application/pdf';
    if (fileName.toLowerCase().endsWith('.doc')) contentType = 'application/msword';
    if (fileName.toLowerCase().endsWith('.docx')) contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (fileName.toLowerCase().endsWith('.zip')) contentType = 'application/zip';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (error) {
    logError('❌ Erreur téléchargement doc projet:', error);
    res.status(500).json({ error: 'Erreur serveur', code: 'DOC_DOWNLOAD_ERROR' });
  }
});

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
    const portfolioUpdate = await Portfolio.findOneAndUpdate(
      {},
      { $push: { contactMessages: newMessage } },
      { new: true, upsert: true }
    );
    
    // Vérification que le message a bien été ajouté
    if (!portfolioUpdate) {
      throw new Error('Impossible de sauvegarder le message dans la base de données');
    }
    
    // Vérifier que le message est bien présent
    const portfolioVerifie = await Portfolio.findOne();
    const messageVerifie = portfolioVerifie?.contactMessages?.find(m => m.id === newMessageId);
    
    if (!messageVerifie) {
      throw new Error('Le message n\'a pas été correctement sauvegardé');
    }
    
    logSuccess('✅ Message de contact reçu et sauvegardé:', {
      id: newMessageId,
      email: email,
      subject: subject || 'Sans objet',
      totalMessages: portfolioVerifie.contactMessages?.length || 0
    });

    // Envoyer un email de notification à l'admin si SMTP est configuré
    const transporter = getMailTransporter();
    if (transporter && ADMIN_EMAIL) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: ADMIN_EMAIL,
          replyTo: email,
          subject: subject || 'Nouveau message de contact',
          text: `Nouveau message de contact\n\nNom: ${name}\nEmail: ${email}\nSujet: ${subject || 'Sans objet'}\n\nMessage:\n${message}`
        });
      } catch (err) {
        logWarn('⚠️ Notification email contact non envoyée', err);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Message envoyé et sauvegardé avec succès',
      messageId: newMessageId,
      saved: true
    });
    
  } catch (error) {
    // Log détaillé de l'erreur pour diagnostic
    // Les erreurs sont toujours loggées même en production
    logError('❌ Erreur lors de l\'envoi du message:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      path: req.path,
      method: req.method,
      origin: req.headers.origin,
      timestamp: new Date().toISOString()
    });
    
    // Gestion d'erreurs spécifiques
    if (error.name === 'MongoServerError' || error.message.includes('MongoDB') || error.message.includes('connection')) {
      logError('❌ Erreur MongoDB détectée');
      return res.status(503).json({ 
        error: 'Service temporairement indisponible',
        message: 'La base de données est temporairement indisponible. Veuillez réessayer dans quelques instants.',
        code: 'DATABASE_ERROR'
      });
    }
    
    // Erreur de validation MongoDB
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Données invalides',
        message: 'Les données du message ne sont pas valides',
        code: 'VALIDATION_ERROR'
      });
    }
    
    // Erreur générique
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'envoi du message',
      message: 'Une erreur est survenue. Veuillez réessayer plus tard.',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
