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
const DEFAULT_PORTFOLIO_DATA = {
  personal: {
    fullName: 'Nema Elisée Kourouma',
    email: 'kouroumaelisee@gmail.com',
    phone: '',
    photo: 'assets/photo.jpeg',
    currentEducation: 'Master 1 en Intelligence Artificielle à l\'École Supérieure d\'Informatique de Paris',
    previousEducation: 'Licence en mathématiques et informatique (USMBA Fès)',
    additionalInfo: []
  },
  projects: [
    {
      title: 'Analyse de sentiments des tweets en temps réel',
      type: 'PFE Licence',
      category: 'Intelligence Artificielle',
      shortDesc: 'Projet de fin d\'étude (PFE) de Licence · Analyse des sentiments des tweets en temps réel avec ChatGPT et MongoDB',
      description: 'Ce projet vise à intégrer Chat GPT, une intelligence artificielle avancée, avec MongoDB, une base de données NoSQL, pour analyser les sentiments des tweets en temps réel.',
      features: [
        'Extraction temps réel de tweets avec Selenium',
        'Analyse de sentiments avec OpenAI (ChatGPT)',
        'Classification en catégories : positif, neutre, négatif',
        'Stockage et indexation dans MongoDB',
        'API REST avec Flask pour l\'accès aux données'
      ],
      tags: ['Python', 'Flask', 'MongoDB', 'OpenAI', 'ChatGPT', 'Selenium', 'NLP'],
      link: '',
      demoLink: '',
      emailSubject: 'Demande d\'infos: Analyse de sentiments des tweets',
      featured: true,
      public: true
    },
    {
      title: 'Kairos - Application Web',
      type: 'Projet Personnel',
      category: 'Application Web',
      shortDesc: 'Application d\'apprentissage immersive avec support de cours, TD, TP, examens, quiz et IA conversationnelle',
      description: 'Kairos est une application web d\'apprentissage immersive développée comme projet personnel.',
      features: [
        'Plateforme d\'apprentissage immersive complète',
        'Intelligence artificielle conversationnelle intégrée',
        'Support pédagogique personnalisé et en temps réel'
      ],
      tags: ['Web', 'Frontend', 'Application Web', 'IA', 'Intelligence Artificielle'],
      link: 'https://kairos-frontend-hjg9.onrender.com',
      demoLink: '',
      emailSubject: 'Demande d\'infos: Application Kairos',
      featured: true,
      public: true
    },
    {
      title: 'Fylor - Application Web',
      type: 'Projet Personnel',
      category: 'Application Web',
      shortDesc: 'Plateforme de stockage cloud avec 20 Go d\'espace · Application web et mobile complète',
      description: 'Fylor est une plateforme de stockage cloud développée comme projet personnel.',
      features: [
        'Gestionnaire de fichiers complet',
        'Connexion standard et OAuth2',
        'Quota généreux de 20 Go par utilisateur'
      ],
      tags: ['Web', 'Mobile', 'Application Web', 'Cloud Storage', 'API REST', 'Docker'],
      link: 'https://fylor-frontend.onrender.com/',
      demoLink: '',
      emailSubject: 'Demande d\'infos: Application Fylor',
      featured: true,
      public: true
    },
    {
      title: 'Supfile - Application Web',
      type: 'PFA',
      category: 'Application Web',
      shortDesc: 'Projet de fin d\'année à SUPINFO · Plateforme de stockage cloud concurrente de Dropbox et Google Drive',
      description: 'SUPFile est un projet de fin d\'année développé dans le cadre du Master 1 en Intelligence Artificielle.',
      features: [
        'Gestionnaire de fichiers complet',
        'Connexion standard et OAuth2',
        'Quota de 30 Go par utilisateur'
      ],
      tags: ['Web', 'Mobile', 'Application Web', 'Cloud Storage', 'API REST', 'Docker', 'SUPINFO', 'PFA'],
      link: 'https://supfile-frontend.onrender.com/',
      demoLink: '',
      emailSubject: 'Demande d\'infos: Application Supfile',
      featured: true,
      public: true
    }
  ],
  skills: [
    { icon: '🌐', name: 'Développement Web', skills: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Responsive'] },
    { icon: '🐍', name: 'Backend & DevOps', skills: ['Python', 'Node.js', 'Django', 'Flask', 'API REST', 'Docker'] },
    { icon: '🤖', name: 'IA & Données', skills: ['MongoDB', 'NLP', 'OpenAI', 'Selenium', 'Analyse Exploratoire de Données'] }
  ],
  links: {
    cv: 'assets/CV.pdf',
    cvFile: null,
    cvFileName: null,
    cvFileSize: null,
    social: [
      { name: 'WhatsApp', url: 'https://wa.me/33689306432' },
      { name: 'Facebook', url: 'https://www.facebook.com/share/17xGVe29cL/' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/' },
      { name: 'GitHub', url: 'https://github.com/' }
    ]
  },
  about: {
    heroDescription: 'Master 1 en Intelligence Artificielle à l\'École Supérieure d\'Informatique de Paris. Titulaire d\'une licence en mathématiques et informatique (USMBA Fès).',
    aboutDescription: 'Master 1 en Intelligence Artificielle à l\'École Supérieure d\'Informatique de Paris. Titulaire d\'une licence en mathématiques et informatique (USMBA Fès).',
    stats: {
      projects: 4,
      experience: 2,
      technologies: 15
    }
  },
  timeline: [
    {
      date: '2025 - Présent',
      title: 'Master 1 en Intelligence Artificielle',
      subtitle: 'École Supérieure d\'Informatique de Paris (SUPINFO)',
      description: 'Spécialisation en IA, Machine Learning et traitement du langage naturel. Réalisation de projets majeurs incluant SUPFile (plateforme cloud) et Kairos (assistant pédagogique IA).'
    },
    {
      date: '2021 - 2024',
      title: 'Licence en Mathématiques et Informatique',
      subtitle: 'Université Sidi Mohamed Ben Abdellah, Fès',
      description: 'Formation solide en mathématiques appliquées et informatique fondamentale. Acquisition de compétences en algorithmique, structures de données et développement logiciel.'
    }
  ],
  services: [
    {
      icon: '💻',
      title: 'Développement Web',
      description: 'Création d\'applications web modernes et responsives avec les dernières technologies.',
      features: ['Applications React/Vue.js', 'APIs REST & GraphQL', 'Architecture microservices']
    },
    {
      icon: '🤖',
      title: 'Intelligence Artificielle',
      description: 'Solutions IA personnalisées pour automatiser et optimiser vos processus.',
      features: ['Machine Learning', 'NLP & Chatbots', 'Analyse de données']
    },
    {
      icon: '☁️',
      title: 'Cloud & DevOps',
      description: 'Déploiement et gestion d\'infrastructures cloud scalables et sécurisées.',
      features: ['Docker & Kubernetes', 'CI/CD Pipelines', 'Cloud Architecture']
    }
  ],
  certifications: [],
  contactMessages: [],
  faq: []
};

// Il n'y aura qu'un seul document portfolio
portfolioSchema.statics.getPortfolio = async function() {
  let portfolio = await this.findOne();
  if (!portfolio) {
    // Créer un document avec les données par défaut si aucun n'existe
    console.log('📦 Initialisation du portfolio avec les données par défaut');
    portfolio = new this(DEFAULT_PORTFOLIO_DATA);
    await portfolio.save();
  } else {
    // Vérifier si le document est vide et l'initialiser si nécessaire
    const hasData = (portfolio.projects && Array.isArray(portfolio.projects) && portfolio.projects.length > 0) ||
                   (portfolio.skills && Array.isArray(portfolio.skills) && portfolio.skills.length > 0) ||
                   (portfolio.timeline && Array.isArray(portfolio.timeline) && portfolio.timeline.length > 0) ||
                   (portfolio.personal && portfolio.personal.photo);
    
    if (!hasData) {
      console.log('📦 Portfolio vide détecté, initialisation avec les données par défaut');
      console.log('🔍 État actuel:', {
        hasProjects: portfolio.projects?.length || 0,
        hasSkills: portfolio.skills?.length || 0,
        hasTimeline: portfolio.timeline?.length || 0,
        hasPhoto: !!portfolio.personal?.photo
      });
      // Mettre à jour avec les données par défaut en utilisant findOneAndUpdate
      portfolio = await this.findOneAndUpdate(
        { _id: portfolio._id },
        { $set: DEFAULT_PORTFOLIO_DATA },
        { new: true, runValidators: false }
      );
      console.log('✅ Portfolio initialisé avec les données par défaut:', {
        projects: portfolio.projects?.length || 0,
        skills: portfolio.skills?.length || 0,
        timeline: portfolio.timeline?.length || 0
      });
    }
  }
  // Convertir en objet JavaScript simple et supprimer les champs MongoDB
  const portfolioObj = portfolio.toObject();
  delete portfolioObj._id;
  delete portfolioObj.__v;
  delete portfolioObj.createdAt;
  delete portfolioObj.updatedAt;
  return portfolioObj;
};

module.exports = mongoose.model('Portfolio', portfolioSchema);
