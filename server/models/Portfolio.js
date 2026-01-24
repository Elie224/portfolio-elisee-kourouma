const mongoose = require('mongoose');

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
    cv: { type: String, trim: true },
    cvFile: { type: String },
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
  }]
}, {
  timestamps: true
});

// Données par défaut pour initialiser le portfolio
// SOLUTION ULTIME : Données statiques HARDCODÉES (pas de fonction dynamique)
const MINIMAL_PORTFOLIO_DATA = {
  personal: {
    fullName: "Nema Elisée Kourouma",
    email: "kouroumaelisee@gmail.com",
    phone: "",
    photo: "assets/photo.jpeg",
    currentEducation: "Master IA",
    previousEducation: "Licence",
    additionalInfo: []
  },
  projects: [],
  skills: [],
  links: { cv: "assets/CV.pdf", social: [] },
  about: { heroDescription: "Master IA", stats: { projects: 0, experience: 2, technologies: 10 } },
  timeline: [],
  services: [],
  certifications: [],
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
      console.log('📦 Aucun document trouvé, création avec les données par défaut');
      // Utiliser la fonction pour éviter tout problème avec les références
      const dataToCreate = getDefaultPortfolioData();
      portfolio = await this.create(dataToCreate);
      console.log('✅ Portfolio créé avec succès:', {
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
      
      // Si toutes les données importantes sont vides, réinitialiser
      if (projectsCount === 0 && skillsCount === 0 && timelineCount === 0) {
        console.log('📦 Portfolio vide détecté, réinitialisation...');
        await this.deleteOne({ _id: portfolio._id });
        const dataToCreate = getDefaultPortfolioData();
        portfolio = await this.create(dataToCreate);
        console.log('✅ Portfolio réinitialisé avec succès');
      }
    }
    
    // Convertir en objet propre
    const portfolioObj = portfolio.toObject();
    delete portfolioObj._id;
    delete portfolioObj.__v;
    delete portfolioObj.createdAt;
    delete portfolioObj.updatedAt;
    
    console.log('📤 Portfolio renvoyé avec succès:', {
      projects: portfolioObj.projects?.length || 0,
      skills: portfolioObj.skills?.length || 0,
      timeline: portfolioObj.timeline?.length || 0,
      size: JSON.stringify(portfolioObj).length
    });
    
    return portfolioObj;
    
  } catch (error) {
    console.error('❌ Erreur critique dans getPortfolio:', error.message);
    console.error('Stack:', error.stack);
    
    // En cas d'erreur critique, retourner une copie propre des données par défaut
    return getDefaultPortfolioData();
  }
};

module.exports = mongoose.model('Portfolio', portfolioSchema);