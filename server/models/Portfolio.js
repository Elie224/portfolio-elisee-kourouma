/**
 * Modèle MongoDB pour le Portfolio
 * 
 * Ce modèle définit la structure des données du portfolio stockées dans MongoDB.
 * Il inclut des méthodes statiques pour faciliter l'accès aux données.
 * 
 * @author Nema Elisée Kourouma
 * @date 2026
 */

const mongoose = require('mongoose');
const { log, logError, logSuccess, logWarn } = require('../utils/logger');

const portfolioSchema = new mongoose.Schema({
  personal: {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
    phone: { type: String, trim: true, maxlength: 20 },
    photo: { type: String, trim: true },
    currentEducation: { type: String, trim: true, maxlength: 200 },
    previousEducation: { type: String, trim: true, maxlength: 200 },
    additionalInfo: [{ type: String, trim: true, maxlength: 500 }]
  },
  projects: [{
    title: { type: String, required: true, trim: true, maxlength: 100 },
    type: { type: String, trim: true, maxlength: 50 },
    category: { type: String, trim: true, maxlength: 50 },
    shortDesc: { type: String, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },
    features: [{ type: String, trim: true, maxlength: 100 }],
    tags: [{ type: String, trim: true, maxlength: 50 }],
    link: { type: String, trim: true, match: /^https?:\/\/.+/ },
    demoLink: { type: String, trim: true, match: /^https?:\/\/.+/ },
    emailSubject: { type: String, trim: true, maxlength: 100 },
    featured: { type: Boolean, default: false },
    public: { type: Boolean, default: true }
  }],
  skills: [{
    icon: { type: String, trim: true, maxlength: 50 },
    name: { type: String, required: true, trim: true, maxlength: 50 },
    skills: [{ type: String, trim: true, maxlength: 100 }]
  }],
  links: {
    cv: { type: String }, // Pas de trim pour préserver le base64 complet
    cvFile: { type: String }, // Pas de trim pour préserver le base64 complet
    cvFileName: { type: String, trim: true, maxlength: 100 },
    cvFileSize: { type: Number, min: 0, max: 10000000 }, // Max 10MB
    social: [{
      name: { type: String, required: true, trim: true, maxlength: 50 },
      url: { type: String, required: true, trim: true, match: /^https?:\/\/.+/ }
    }]
  },
  about: {
    heroDescription: { type: String, trim: true, maxlength: 200 },
    aboutDescription: { type: String, trim: true, maxlength: 1000 },
    stats: {
      projects: { type: Number, min: 0, default: 0 },
      experience: { type: Number, min: 0, default: 0 },
      technologies: { type: Number, min: 0, default: 0 }
    }
  },
  timeline: [{
    date: String,
    title: String,
    subtitle: String,
    description: String
  }],
  services: [{
    icon: String,
    title: String,
    description: String,
    features: [String]
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: String,
    description: String,
    link: String
  }],
  internships: [{
    title: String,
    company: String,
    location: String,
    type: { type: String, enum: ['stage', 'alternance'] },
    date: String,
    description: String,
    technologies: [String],
    link: String
  }],
  techEvents: [{
    name: String,
    title: String,
    type: { type: String, enum: ['conference', 'hackathon', 'workshop', 'meetup', 'webinar', 'competition'] },
    organizer: String,
    location: String,
    date: String,
    description: String,
    link: String
  }],
  contactMessages: [{
    id: Number,
    name: String,
    email: String,
    subject: String,
    message: String,
    date: String,
    read: Boolean
  }],
  faq: [{
    question: String,
    answer: String
  }],
  settings: {
    maintenance: {
      enabled: { type: Boolean, default: false },
      message: { type: String, trim: true, maxlength: 500 }
    },
    seo: {
      title: { type: String, trim: true, maxlength: 200 },
      description: { type: String, trim: true, maxlength: 500 },
      keywords: { type: String, trim: true, maxlength: 200 }
    },
    analytics: {
      googleAnalytics: { type: String, trim: true, maxlength: 50 }
    }
  }
}, {
  timestamps: true
});

// Données par défaut pour initialiser le portfolio
// SOLUTION ULTIME : Données statiques HARDCODÉES (pas de fonction dynamique)
const MINIMAL_PORTFOLIO_DATA = {
  personal: {
    fullName: "Nema Elisée Kourouma",
    email: "smartshift12@gmail.com",
    phone: "",
    photo: "assets/photo.jpeg",
    currentEducation: "Master IA",
    previousEducation: "Licence",
    additionalInfo: []
  },
  projects: [],
  skills: [],
  links: { cv: "", cvFile: "", cvFileName: "", cvFileSize: 0, social: [] },
  about: { heroDescription: "Master IA", stats: { projects: 0, experience: 2, technologies: 10 } },
  timeline: [],
  services: [],
  certifications: [],
  internships: [],
  techEvents: [],
  contactMessages: [],
  faq: []
};

// FONCTION WRAPPER simple qui retourne les données statiques
function getDefaultPortfolioData() {
  return JSON.parse(JSON.stringify(MINIMAL_PORTFOLIO_DATA));
}

// Il n'y aura qu'un seul document portfolio
portfolioSchema.statics.getPortfolio = async function() {
  try {
    console.log('📥 GET Portfolio - Recherche du document existant...');
    let portfolio = await this.findOne();
    
    if (!portfolio) {
      log('📦 Aucun document trouvé, création avec les données par défaut');
      // Utiliser la fonction pour éviter tout problème avec les références
      const dataToCreate = getDefaultPortfolioData();
      portfolio = await this.create(dataToCreate);
      logSuccess('✅ Portfolio créé avec succès:', {
        projects: portfolio.projects?.length || 0,
        skills: portfolio.skills?.length || 0,
        timeline: portfolio.timeline?.length || 0
      });
    } else {
      // Vérifier si le document a des données utiles
      const projectsCount = Array.isArray(portfolio.projects) ? portfolio.projects.length : 0;
      const skillsCount = Array.isArray(portfolio.skills) ? portfolio.skills.length : 0;
      const timelineCount = Array.isArray(portfolio.timeline) ? portfolio.timeline.length : 0;
      
      console.log('🔍 Portfolio existant trouvé:', {
        projects: projectsCount,
        skills: skillsCount,
        timeline: timelineCount,
        hasPhoto: !!portfolio.personal?.photo
      });
      
      // Vérifier si le portfolio contient un CV base64 (dans cvFile ou cv)
      const hasCvBase64 = portfolio.links && (
        (portfolio.links.cvFile && portfolio.links.cvFile.startsWith('data:')) ||
        (portfolio.links.cv && portfolio.links.cv.startsWith('data:'))
      );
      
      // Vérification détaillée pour décider si on doit réinitialiser (logging en développement uniquement)
      log('🔍 Vérification CV avant décision de réinitialisation:', {
        hasLinks: !!portfolio.links,
        cvExists: !!portfolio.links?.cv,
        cvFileExists: !!portfolio.links?.cvFile,
        cvValue: portfolio.links?.cv ? (portfolio.links.cv.substring(0, 50) + '...') : 'none',
        cvFileValue: portfolio.links?.cvFile ? (portfolio.links.cvFile.substring(0, 50) + '...') : 'none',
        cvLength: portfolio.links?.cv ? portfolio.links.cv.length : 0,
        cvFileLength: portfolio.links?.cvFile ? portfolio.links.cvFile.length : 0,
        hasCvBase64: hasCvBase64,
        projectsCount,
        skillsCount,
        timelineCount
      });
      
      // Si toutes les données importantes sont vides MAIS qu'il y a un CV, NE PAS réinitialiser
      // Ne réinitialiser que si vraiment vide ET sans CV
      if (projectsCount === 0 && skillsCount === 0 && timelineCount === 0 && !hasCvBase64) {
        console.log('📦 Portfolio vide détecté (sans CV), réinitialisation...');
        await this.deleteOne({ _id: portfolio._id });
        const dataToCreate = getDefaultPortfolioData();
        portfolio = await this.create(dataToCreate);
        console.log('✅ Portfolio réinitialisé avec succès');
      } else if (projectsCount === 0 && skillsCount === 0 && timelineCount === 0 && hasCvBase64) {
        console.log('✅ Portfolio avec CV base64 conservé (projets/skills/timeline vides mais CV présent)');
      }
    }
    
    // Vérifier le CV AVANT conversion
    const cvAvantConversion = portfolio.links ? {
      hasCv: !!portfolio.links.cv,
      hasCvFile: !!portfolio.links.cvFile,
      cvLength: portfolio.links.cv ? portfolio.links.cv.length : 0,
      cvFileLength: portfolio.links.cvFile ? portfolio.links.cvFile.length : 0,
      cvType: portfolio.links.cv ? (portfolio.links.cv.startsWith('data:') ? 'base64' : 'path') : 'none',
      cvFileType: portfolio.links.cvFile ? (portfolio.links.cvFile.startsWith('data:') ? 'base64' : 'path') : 'none'
    } : { error: 'No links before conversion' };
    log('🔍 CV AVANT conversion toObject():', cvAvantConversion);
    
    // Convertir en objet propre
    const portfolioObj = portfolio.toObject();
    delete portfolioObj._id;
    delete portfolioObj.__v;
    delete portfolioObj.createdAt;
    delete portfolioObj.updatedAt;
    
    // Vérifier le CV APRÈS conversion
    const cvApresConversion = portfolioObj.links ? {
      hasCv: !!portfolioObj.links.cv,
      hasCvFile: !!portfolioObj.links.cvFile,
      cvLength: portfolioObj.links.cv ? portfolioObj.links.cv.length : 0,
      cvFileLength: portfolioObj.links.cvFile ? portfolioObj.links.cvFile.length : 0,
      cvType: portfolioObj.links.cv ? (portfolioObj.links.cv.startsWith('data:') ? 'base64' : 'path') : 'none',
      cvFileType: portfolioObj.links.cvFile ? (portfolioObj.links.cvFile.startsWith('data:') ? 'base64' : 'path') : 'none'
    } : { error: 'No links after conversion' };
    log('🔍 CV APRÈS conversion toObject():', cvApresConversion);
    
    console.log('📤 Portfolio renvoyé avec succès:', {
      projects: portfolioObj.projects?.length || 0,
      skills: portfolioObj.skills?.length || 0,
      timeline: portfolioObj.timeline?.length || 0,
      size: JSON.stringify(portfolioObj).length,
      cvPresent: cvApresConversion.hasCv || cvApresConversion.hasCvFile
    });
    
    return portfolioObj;
    
  } catch (error) {
    logError('❌ Erreur critique dans getPortfolio:', { message: error.message, stack: error.stack });
    
    // En cas d'erreur critique, retourner une copie propre des données par défaut
    return getDefaultPortfolioData();
  }
};

module.exports = mongoose.model('Portfolio', portfolioSchema);