const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  personal: {
    fullName: String,
    email: String,
    phone: String,
    photo: String,
    currentEducation: String,
    previousEducation: String,
    additionalInfo: [String]
  },
  projects: [{
    title: String,
    type: String,
    category: String,
    shortDesc: String,
    description: String,
    features: [String],
    tags: [String],
    link: String,
    demoLink: String,
    emailSubject: String,
    featured: Boolean,
    public: Boolean
  }],
  skills: [{
    icon: String,
    name: String,
    skills: [String]
  }],
  links: {
    cv: String,
    cvFile: String,
    cvFileName: String,
    cvFileSize: Number,
    social: [{
      name: String,
      url: String
    }]
  },
  about: {
    heroDescription: String,
    aboutDescription: String,
    stats: {
      projects: Number,
      experience: Number,
      technologies: Number
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