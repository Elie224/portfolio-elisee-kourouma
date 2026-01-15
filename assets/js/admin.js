// Admin Authentication and Portfolio Management System
document.addEventListener('DOMContentLoaded', () => {
  const ADMIN_EMAIL = 'kouroumaelisee@gmail.com';
  const ADMIN_PASSWORD = 'admin123';
  
  // Initialize default data structure
  const DEFAULT_DATA = {
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
        description: 'Ce projet vise à intégrer Chat GPT, une intelligence artificielle avancée, avec MongoDB, une base de données NoSQL, pour analyser les sentiments des tweets en temps réel. Dans un contexte où les données générées quotidiennement sont massives, l\'analyse des sentiments devient cruciale pour comprendre les émotions humaines à grande échelle.\n\nLes réseaux sociaux, en particulier Twitter, offrent une source riche d\'informations en temps réel. Cependant, la collecte et l\'analyse de ces données posent des défis en raison de leur volume et de leur nature dynamique. Les tweets contiennent souvent des langages informels, des abréviations, des emojis et des références contextuelles.\n\nLes objectifs spécifiques du projet incluent l\'utilisation de Chat GPT pour analyser et classifier les sentiments des tweets en catégories positives, neutres et négatives, la configuration de MongoDB pour stocker efficacement les tweets et les résultats des analyses, et la création d\'un système robuste capable de traiter des flux de données continus et de fournir des insights en temps réel.',
        features: [
          'Extraction temps réel de tweets avec Selenium',
          'Analyse de sentiments avec OpenAI (ChatGPT)',
          'Classification en catégories : positif, neutre, négatif',
          'Stockage et indexation dans MongoDB',
          'API REST avec Flask pour l\'accès aux données',
          'Visualisation des tendances et filtres dynamiques',
          'Traitement de flux de données continus',
          'Interface utilisateur interactive pour la visualisation'
        ],
        tags: ['Python', 'Flask', 'MongoDB', 'OpenAI', 'ChatGPT', 'Selenium', 'NLP', 'Analyse de sentiments', 'Traitement du langage naturel', 'Temps réel'],
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
            description: 'Kairos est une application web d\'apprentissage immersive développée comme projet personnel.\n\nL\'application offre un support complet pour tous les types de contenus pédagogiques : cours, travaux dirigés (TD), travaux pratiques (TP), examens et quiz. Chaque format est pris en charge de manière optimale, permettant aux étudiants d\'accéder facilement à leurs ressources éducatives.\n\nKairos intègre une intelligence artificielle conversationnelle avancée qui permet aux utilisateurs d\'échanger directement avec l\'application. Cette IA est incorporée au cœur de la plateforme et offre une interaction naturelle, répondant aux questions, fournissant des explications détaillées sur les cours et les exercices, et proposant un support pédagogique personnalisé en temps réel.\n\nL\'application est hébergée sur Render et démontre l\'intégration réussie de technologies modernes d\'intelligence artificielle dans une plateforme éducative, créant une expérience d\'apprentissage véritablement immersive.',
            features: [
              'Plateforme d\'apprentissage immersive complète',
              'Gestion et organisation des cours magistraux',
              'Support dédié pour les travaux dirigés (TD)',
              'Support dédié pour les travaux pratiques (TP)',
              'Système d\'examens interactifs',
              'Création et gestion de quiz personnalisés',
              'Intelligence artificielle conversationnelle intégrée',
              'Échange interactif avec l\'utilisateur via IA',
              'Support pédagogique personnalisé et en temps réel',
              'Interface utilisateur moderne et intuitive',
              'Navigation structurée des contenus pédagogiques',
              'Déploiement professionnel sur Render',
              'Expérience utilisateur optimisée pour l\'apprentissage'
            ],
            tags: ['Web', 'Frontend', 'Application Web', 'IA', 'Intelligence Artificielle', 'Apprentissage', 'Éducation', 'IA Conversationnelle', 'Cours', 'TD', 'TP', 'Examens', 'Quiz', 'Render', 'Responsive', 'Déploiement'],
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
            shortDesc: 'Plateforme de stockage cloud avec 50 Go d\'espace · Application web et mobile complète',
            description: 'Fylor est une plateforme de stockage cloud développée comme projet personnel, similaire à Supfile. Cette application permet aux utilisateurs de stocker, sécuriser et partager leurs fichiers personnels dans le cloud, avec un quota de 50 Go par utilisateur (contrairement à Supfile qui offre 30 Go).\n\nLe projet comprend le développement d\'une application web complète et d\'une application mobile, avec une architecture basée sur une API REST, des clients distincts et une base de données pour les métadonnées. L\'application offre les mêmes fonctionnalités avancées que Supfile, avec un espace de stockage plus généreux de 50 Go.\n\nL\'accent est mis sur la gestion performante des flux de données (upload/download), la navigation fluide dans une arborescence de dossiers, l\'ergonomie, la prévisualisation instantanée des fichiers et la synchronisation entre les clients web et mobile.',
            features: [
              'Gestionnaire de fichiers complet avec navigation intuitive',
              'Connexion standard et OAuth2 (Google, GitHub, Microsoft)',
              'Upload/Download avec barre de progression et drag & drop',
              'Prévisualisation instantanée (PDF, images, audio, vidéo)',
              'Partage sécurisé avec liens uniques, expiration et mot de passe',
              'Recherche et filtres avancés par type et date',
              'Dashboard avec visualisation de l\'utilisation du stockage',
              'Gestion des dossiers (création, renommage, déplacement, suppression)',
              'Corbeille avec restauration possible',
              'Téléchargement de dossiers complets en archive ZIP',
              'Paramètres utilisateurs (avatar, email, mot de passe, thème)',
              'Architecture microservices avec API Gateway',
              'Containérisation Docker avec docker-compose',
              'Base de données pour les métadonnées',
              'Quota généreux de 50 Go par utilisateur',
              'Sécurité : JWT, hachage des mots de passe, gestion des secrets'
            ],
            tags: ['Web', 'Mobile', 'Application Web', 'Cloud Storage', 'API REST', 'Docker', 'OAuth2', 'JWT', '50 Go', 'Stockage Cloud', 'Déploiement'],
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
            description: 'SUPFile est un projet de fin d\'année développé dans le cadre du Master 1 en Intelligence Artificielle à l\'École Supérieure d\'Informatique de Paris (SUPINFO). Ce projet consiste à développer une plateforme de stockage cloud grand public concurrente de Dropbox ou Google Drive pour la société "SUPFile", spécialisée dans l\'infrastructure de stockage distribué.\n\nLe projet comprend le développement d\'une application web complète et d\'une application mobile, avec une architecture basée sur une API REST, des clients distincts et une base de données pour les métadonnées. L\'application permet aux utilisateurs de stocker, sécuriser et partager leurs fichiers personnels dans le cloud, avec un quota de 30 Go par utilisateur.\n\nL\'accent est mis sur la gestion performante des flux de données (upload/download), la navigation fluide dans une arborescence de dossiers, l\'ergonomie, la prévisualisation instantanée des fichiers et la synchronisation entre les clients web et mobile.',
            features: [
              'Gestionnaire de fichiers complet avec navigation intuitive',
              'Connexion standard et OAuth2 (Google, GitHub, Microsoft)',
              'Upload/Download avec barre de progression et drag & drop',
              'Prévisualisation instantanée (PDF, images, audio, vidéo)',
              'Partage sécurisé avec liens uniques, expiration et mot de passe',
              'Recherche et filtres avancés par type et date',
              'Dashboard avec visualisation de l\'utilisation du stockage',
              'Gestion des dossiers (création, renommage, déplacement, suppression)',
              'Corbeille avec restauration possible',
              'Téléchargement de dossiers complets en archive ZIP',
              'Paramètres utilisateurs (avatar, email, mot de passe, thème)',
              'Architecture microservices avec API Gateway',
              'Containérisation Docker avec docker-compose',
              'Base de données pour les métadonnées',
              'Sécurité : JWT, hachage des mots de passe, gestion des secrets'
            ],
            tags: ['Web', 'Mobile', 'Application Web', 'Cloud Storage', 'API REST', 'Docker', 'OAuth2', 'JWT', 'SUPINFO', 'PFA', 'Projet de Fin d\'Année', 'Dropbox', 'Google Drive', 'Déploiement'],
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
      { icon: '🤖', name: 'IA & Données', skills: ['MongoDB', 'NLP', 'OpenAI', 'Selenium', 'Analyse Exploratoire de Données', 'Apprentissage automatique supervisé', 'Apprentissage automatique non supervisé'] }
    ],
    links: {
      cv: 'assets/CV.pdf',
      cvFile: null, // Base64 encoded PDF file
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
    testimonials: [],
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
      },
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

  // Initialize data if not exists
  function initData() {
    const existingData = localStorage.getItem('portfolioData');
    if (!existingData) {
      localStorage.setItem('portfolioData', JSON.stringify(DEFAULT_DATA));
    } else {
      // Migrate old paths to new paths
      try {
        const data = JSON.parse(existingData);
        let updated = false;
        
        // Force update flag - increment this when project descriptions change
        const LAST_UPDATE_VERSION = '1.0.1'; // Increment this to force update
        const lastUpdate = localStorage.getItem('portfolioUpdateVersion');
        const shouldForceUpdate = !lastUpdate || lastUpdate !== LAST_UPDATE_VERSION;
        
        // Migrate old photo path
        if (data.personal && data.personal.photo === 'assets/ma photo.jpeg') {
          data.personal.photo = 'assets/photo.jpeg';
          updated = true;
        }
        
        // Migrate old CV path
        if (data.links && data.links.cv === 'assets/Mon_CV.pdf') {
          data.links.cv = 'assets/CV.pdf';
          updated = true;
        }
        
        // Migrate projects: if projects array is empty, add default projects
        if (!data.projects || data.projects.length === 0) {
          data.projects = DEFAULT_DATA.projects.slice(); // Copy default projects
          updated = true;
        } else {
          // Check if new default projects need to be added
          const existingTitles = data.projects.map(p => p.title);
          const defaultProjectsToAdd = DEFAULT_DATA.projects.filter(p => !existingTitles.includes(p.title));
          
          if (defaultProjectsToAdd.length > 0) {
            console.log(`📦 Ajout de ${defaultProjectsToAdd.length} nouveau(x) projet(s) par défaut:`, defaultProjectsToAdd.map(p => p.title));
            data.projects = [...data.projects, ...defaultProjectsToAdd];
            updated = true;
          }
          
          // Migrate existing projects: update descriptions and features for projects that match titles in DEFAULT_DATA
          DEFAULT_DATA.projects.forEach(defaultProject => {
            const existingProjectIndex = data.projects.findIndex(p => p.title === defaultProject.title);
            if (existingProjectIndex !== -1) {
              const existingProject = data.projects[existingProjectIndex];
              // Update description and features if they don't match or if force update is needed
              const oldDesc = existingProject.description || '';
              const oldShortDesc = existingProject.shortDesc || '';
              const newDesc = defaultProject.description || '';
              const newShortDesc = defaultProject.shortDesc || '';
              
              // Check if description needs updating (compare with old generic description or if it's different)
              const needsUpdate = shouldForceUpdate ||
                                  oldDesc.includes('Application web moderne et responsive') || 
                                  oldDesc.includes('Application web moderne développée') ||
                                  oldDesc.includes('démontre les compétences en développement frontend') ||
                                  oldDesc.includes('met en avant les compétences en développement web') ||
                                  oldDesc !== newDesc ||
                                  oldShortDesc !== newShortDesc ||
                                  JSON.stringify(existingProject.features || []) !== JSON.stringify(defaultProject.features || []);
              
              if (needsUpdate) {
                console.log(`🔄 Mise à jour du projet "${defaultProject.title}" avec la nouvelle description`);
                // Preserve user data (like public status, but update descriptions)
                data.projects[existingProjectIndex] = {
                  ...existingProject,
                  description: defaultProject.description,
                  shortDesc: defaultProject.shortDesc,
                  features: defaultProject.features,
                  tags: defaultProject.tags
                };
                updated = true;
              }
            }
          });
        }
        
        // Migrate timeline: remove "2023 - 2024" date from entries and update Master 1 date
        if (data.timeline && Array.isArray(data.timeline)) {
          data.timeline.forEach(item => {
            if (item.date === '2023 - 2024' || item.date === '2023-2024') {
              console.log(`🔄 Suppression de la date "2023 - 2024" de l'entrée timeline: "${item.title}"`);
              item.date = '';
              updated = true;
            }
            // Also check if title contains "Développeur Full-Stack" and remove date
            if (item.title && item.title.includes('Développeur Full-Stack') && (item.date === '2023 - 2024' || item.date === '2023-2024')) {
              console.log(`🔄 Suppression de la date "2023 - 2024" de l'entrée "Développeur Full-Stack"`);
              item.date = '';
              updated = true;
            }
            // Update Master 1 date from 2024 to 2025
            if (item.title && item.title.includes('Master 1 en Intelligence Artificielle') && item.date === '2024 - Présent') {
              console.log(`🔄 Mise à jour de la date du Master 1: 2024 → 2025`);
              item.date = '2025 - Présent';
              // Also update description if it's the old one
              if (item.description === 'Spécialisation en IA, Machine Learning et traitement du langage naturel.') {
                item.description = 'Spécialisation en IA, Machine Learning et traitement du langage naturel. Réalisation de projets majeurs incluant SUPFile (plateforme cloud) et Kairos (assistant pédagogique IA).';
              }
              updated = true;
            }
          });
        }
        
        // Ensure contactMessages exists and is preserved
        const existingMessagesCount = data.contactMessages ? data.contactMessages.length : 0;
        if (!data.contactMessages || !Array.isArray(data.contactMessages)) {
          console.log('⚠️ contactMessages manquant ou invalide, initialisation d\'un tableau vide');
          data.contactMessages = [];
          updated = true;
        } else {
          console.log(`✅ contactMessages préservé: ${existingMessagesCount} message(s) existant(s)`);
        }
        
        // Save all updates at once
        if (updated) {
          // Vérifier qu'on ne perd pas les messages
          const messagesBeforeSave = data.contactMessages ? data.contactMessages.length : 0;
          localStorage.setItem('portfolioData', JSON.stringify(data));
          
          // Vérification après sauvegarde
          const verifyData = localStorage.getItem('portfolioData');
          if (verifyData) {
            const verifyParsed = JSON.parse(verifyData);
            const messagesAfterSave = verifyParsed.contactMessages ? verifyParsed.contactMessages.length : 0;
            console.log(`✅ Données mises à jour. Messages: ${messagesBeforeSave} → ${messagesAfterSave}`);
            if (messagesBeforeSave !== messagesAfterSave) {
              console.error(`❌ ERREUR: Perte de messages! ${messagesBeforeSave} → ${messagesAfterSave}`);
            }
          }
        }
        
        // Save update version to prevent unnecessary updates
        if (shouldForceUpdate) {
          localStorage.setItem('portfolioUpdateVersion', LAST_UPDATE_VERSION);
        }
      } catch (e) {
        // If parsing fails, initialize with default data
        localStorage.setItem('portfolioData', JSON.stringify(DEFAULT_DATA));
      }
    }
  }

  // Get portfolio data
  function getPortfolioData() {
    const data = localStorage.getItem('portfolioData');
    if (!data) {
      console.log('⚠️ Aucune donnée dans localStorage, utilisation des données par défaut');
      return DEFAULT_DATA;
    }
    try {
      const parsed = JSON.parse(data);
      console.log('📦 Données récupérées de localStorage:', {
        hasContactMessages: !!parsed.contactMessages,
        messagesCount: parsed.contactMessages ? parsed.contactMessages.length : 0
      });
      return parsed;
    } catch (e) {
      console.error('❌ Erreur lors du parsing des données:', e);
      return DEFAULT_DATA;
    }
  }

  // Save portfolio data
  function savePortfolioData(data) {
    const oldData = localStorage.getItem('portfolioData');
    localStorage.setItem('portfolioData', JSON.stringify(data));
    localStorage.setItem('portfolioLastUpdate', new Date().toISOString());
    
    // Trigger storage event for other tabs/windows
    try {
      const storageEvent = new StorageEvent('storage', {
        key: 'portfolioData',
        newValue: JSON.stringify(data),
        oldValue: oldData,
        url: window.location.href,
        storageArea: localStorage
      });
      window.dispatchEvent(storageEvent);
      
      // Also trigger a custom event
      window.dispatchEvent(new CustomEvent('portfolioDataUpdated', { 
        detail: { projects: data.projects } 
      }));
      
      console.log('📤 Événement de stockage déclenché pour mettre à jour les autres pages');
    } catch (e) {
      console.error('Erreur lors du déclenchement de l\'événement:', e);
    }
    
    showSuccess('Données sauvegardées avec succès !');
  }

  // Authentication
  const loginContainer = document.getElementById('login-container');
  const adminDashboard = document.getElementById('admin-dashboard');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');
  const adminEmailDisplay = document.getElementById('admin-email-display');

  function checkAdminSession() {
    const session = localStorage.getItem('adminSession');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const now = new Date().getTime();
        if (sessionData.expires && now < sessionData.expires && sessionData.email === ADMIN_EMAIL) {
          showDashboard(sessionData.email);
          return true;
        } else {
          localStorage.removeItem('adminSession');
        }
      } catch (e) {
        localStorage.removeItem('adminSession');
      }
    }
    return false;
  }

  function showLogin() {
    if (loginContainer) loginContainer.style.display = 'block';
    if (adminDashboard) adminDashboard.classList.remove('active');
  }

  function showDashboard(email) {
    initData();
    if (loginContainer) loginContainer.style.display = 'none';
    if (adminDashboard) adminDashboard.classList.add('active');
    if (adminEmailDisplay) adminEmailDisplay.textContent = email;
    loadAllData();
    setupTabs();
    updateStats();
    initPhotoUpload();
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-email').value.trim();
      const password = document.getElementById('admin-password').value;

      loginError.classList.remove('active');
      loginError.textContent = '';

      if (email !== ADMIN_EMAIL) {
        showError('Email incorrect. Accès refusé.');
        return;
      }

      if (password !== ADMIN_PASSWORD) {
        showError('Mot de passe incorrect. Accès refusé.');
        return;
      }

      const expires = new Date().getTime() + (24 * 60 * 60 * 1000);
      const sessionData = { email, expires, loginTime: new Date().getTime() };
      localStorage.setItem('adminSession', JSON.stringify(sessionData));

      // Trigger storage event to update other tabs/pages
      try {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'adminSession',
          newValue: JSON.stringify(sessionData),
          oldValue: null,
          url: window.location.href,
          storageArea: localStorage
        }));
        // Also dispatch custom event
        window.dispatchEvent(new CustomEvent('adminLoggedIn'));
      } catch (e) {
        console.error('Erreur lors du déclenchement de l\'événement de connexion:', e);
      }

      showDashboard(email);
      loginForm.reset();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        localStorage.removeItem('adminSession');
        showLogin();
        // Trigger storage event to update other tabs/pages
        try {
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'adminSession',
            newValue: null,
            oldValue: localStorage.getItem('adminSession'),
            url: window.location.href,
            storageArea: localStorage
          }));
          // Also dispatch custom event
          window.dispatchEvent(new CustomEvent('adminLoggedOut'));
        } catch (e) {
          console.error('Erreur lors du déclenchement de l\'événement de déconnexion:', e);
        }
        window.location.href = 'admin.html';
      }
    });
  }

  function showError(message) {
    if (loginError) {
      loginError.textContent = message;
      loginError.classList.add('active');
      setTimeout(() => loginError.classList.remove('active'), 5000);
    }
  }

  function showSuccess(message) {
    const successEl = document.getElementById('success-message');
    if (successEl) {
      successEl.textContent = message;
      successEl.classList.add('active');
      setTimeout(() => successEl.classList.remove('active'), 3000);
    }
  }

  // Toast notification function
  function showToast(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
      document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    toast.style.cssText = `
      background: ${bgColor};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      pointer-events: auto;
      cursor: pointer;
      max-width: 400px;
      animation: slideInRight 0.3s ease-out;
    `;
    toast.textContent = message;

    // Add close functionality
    toast.addEventListener('click', () => {
      toast.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    });

    // Add toast to container
    toastContainer.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  // Add toast animations if not already in styles
  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Make showToast available globally
  window.showToast = showToast;

  // Tab Management
  function setupTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        console.log('📑 Onglet cliqué:', targetTab);
        
        // Remove active class from all tabs and contents
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and content
        tab.classList.add('active');
        const content = document.getElementById(`tab-${targetTab}`);
        if (content) content.classList.add('active');
        
        // Si c'est l'onglet messages, recharger les messages
        if (targetTab === 'messages') {
          console.log('📬 Onglet Messages ouvert - rechargement des messages');
          setTimeout(() => {
            renderMessages();
          }, 100);
        }
      });
    });
  }

  // Load all data into forms
  function loadAllData() {
    const data = getPortfolioData();
    
    // Load personal info
    if (data.personal) {
      document.getElementById('full-name').value = data.personal.fullName || '';
      document.getElementById('email').value = data.personal.email || '';
      document.getElementById('phone').value = data.personal.phone || '';
      document.getElementById('photo').value = data.personal.photo || '';
      document.getElementById('current-education').value = data.personal.currentEducation || '';
      document.getElementById('previous-education').value = data.personal.previousEducation || '';
      
      // Load photo preview
      loadPhotoPreview();
      
      // Load additional personal info
      renderPersonalInfo(data.personal.additionalInfo || []);
    }

    // Load projects
    renderProjects(data.projects || []);

    // Load skills
    renderSkills(data.skills || []);

    // Load links
    if (data.links) {
      const cvPathInput = document.getElementById('cv-path');
      if (cvPathInput) cvPathInput.value = data.links.cv || '';
      
      // Load uploaded CV if exists
      if (data.links.cvFile) {
        showCVPreview(data.links.cvFileName || 'CV.pdf', data.links.cvFileSize || 0, data.links.cvFile);
        switchCVMethod('upload');
      } else {
        switchCVMethod('path');
      }
      
      renderSocialLinks(data.links.social || []);
    }

    // Load messages
    console.log('🔄 Chargement des messages au démarrage de l\'admin');
    // Attendre un peu pour s'assurer que le DOM est prêt
    setTimeout(() => {
      renderMessages();
    }, 200);

    // Load about
    if (data.about) {
      document.getElementById('hero-description').value = data.about.heroDescription || '';
      document.getElementById('about-description').value = data.about.aboutDescription || '';
      if (data.about.stats) {
        document.getElementById('stats-projects').value = data.about.stats.projects || 0;
        document.getElementById('stats-experience').value = data.about.stats.experience || 0;
        document.getElementById('stats-technologies').value = data.about.stats.technologies || 0;
        // Also load in stats tab
        const statsProjectsDisplay = document.getElementById('stats-projects-display');
        const statsExperienceDisplay = document.getElementById('stats-experience-display');
        const statsTechnologiesDisplay = document.getElementById('stats-technologies-display');
        if (statsProjectsDisplay) statsProjectsDisplay.value = data.about.stats.projects || 0;
        if (statsExperienceDisplay) statsExperienceDisplay.value = data.about.stats.experience || 0;
        if (statsTechnologiesDisplay) statsTechnologiesDisplay.value = data.about.stats.technologies || 0;
      }
    }

    // Load testimonials
    renderTestimonials(data.testimonials || []);

    // Load timeline
    renderTimeline(data.timeline || []);

    // Load services
    renderServices(data.services || []);

    // Load certifications
    renderCertifications(data.certifications || []);

    // Load FAQ
    renderFAQ(data.faq || []);

    // Load settings
    if (typeof loadSettings === 'function') {
      loadSettings();
    }
  }

  // Photo Management - Simple and Clean
  function initPhotoUpload() {
    const photoFileInput = document.getElementById('photo-file-input');
    const photoPreview = document.getElementById('photo-preview');
    const photoPreviewPlaceholder = document.getElementById('photo-preview-placeholder');
    const photoHiddenInput = document.getElementById('photo');
    
    if (!photoFileInput) return;
    
    photoFileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      // Validate image type
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image (jpg, png, gif, etc.)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image est trop grande. Maximum 5MB.');
        return;
      }
      
      // Read file as base64
      const reader = new FileReader();
      reader.onload = function(e) {
        const base64 = e.target.result;
        
        // Save to hidden input
        if (photoHiddenInput) {
          photoHiddenInput.value = base64;
        }
        
        // Update preview
        if (photoPreview) {
          photoPreview.src = base64;
          photoPreview.style.display = 'block';
        }
        if (photoPreviewPlaceholder) {
          photoPreviewPlaceholder.style.display = 'none';
        }
        
        showSuccess('Photo chargée avec succès ! N\'oubliez pas d\'enregistrer les informations.');
      };
      reader.onerror = function() {
        alert('Erreur lors du chargement de l\'image.');
      };
      reader.readAsDataURL(file);
    });
  }
  
  function loadPhotoPreview() {
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photo-preview');
    const photoPreviewPlaceholder = document.getElementById('photo-preview-placeholder');
    
    if (!photoInput || !photoPreview) return;
    
    const photoValue = photoInput.value.trim();
    if (photoValue) {
      photoPreview.src = photoValue;
      photoPreview.style.display = 'block';
      if (photoPreviewPlaceholder) photoPreviewPlaceholder.style.display = 'none';
    } else {
      photoPreview.style.display = 'none';
      if (photoPreviewPlaceholder) photoPreviewPlaceholder.style.display = 'block';
    }
  }
  
  window.clearPhotoPreview = function() {
    const photoFileInput = document.getElementById('photo-file-input');
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photo-preview');
    const photoPreviewPlaceholder = document.getElementById('photo-preview-placeholder');
    
    if (photoFileInput) photoFileInput.value = '';
    if (photoInput) photoInput.value = '';
    if (photoPreview) photoPreview.style.display = 'none';
    if (photoPreviewPlaceholder) photoPreviewPlaceholder.style.display = 'block';
  };

  // Personal Info Form
  const personalForm = document.getElementById('personal-info-form');
  if (personalForm) {
    personalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = getPortfolioData();
      if (!data.personal.additionalInfo) {
        data.personal.additionalInfo = [];
      }
      data.personal = {
        ...data.personal,
        fullName: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        photo: document.getElementById('photo').value,
        currentEducation: document.getElementById('current-education').value,
        previousEducation: document.getElementById('previous-education').value,
        additionalInfo: data.personal.additionalInfo || []
      };
      savePortfolioData(data);
    });
  }

  // Personal Additional Info Management
  let editingPersonalInfoId = null;

  function renderPersonalInfo(additionalInfo) {
    const container = document.getElementById('personal-info-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!additionalInfo || additionalInfo.length === 0) {
      container.innerHTML = '<p class="muted">Aucune information additionnelle. Cliquez sur "Ajouter une information" pour commencer.</p>';
      updatePersonalInfoSelectionUI();
      return;
    }

    additionalInfo.forEach((info, index) => {
      const card = document.createElement('div');
      card.className = 'item-card';
      const typeLabels = {
        formation: '📚 Formation',
        certification: '🏆 Certification',
        langue: '🌍 Langue',
        experience: '💼 Expérience',
        autre: 'ℹ️ Autre'
      };
      card.innerHTML = `
        <input type="checkbox" class="select-checkbox personal-info-checkbox" data-index="${index}" onchange="updatePersonalInfoSelectionUI()" />
        <h4>${info.label}</h4>
        <div class="item-meta">${typeLabels[info.type] || 'ℹ️ Autre'}</div>
        <p style="font-size: 14px; margin-top: 8px;">${info.value}</p>
        <div class="item-actions">
          <button class="btn secondary" onclick="editPersonalInfo(${index})">✏️ Modifier</button>
          <button class="btn btn-danger" onclick="deletePersonalInfo(${index})">🗑️ Supprimer</button>
        </div>
      `;
      container.appendChild(card);
    });
    
    updatePersonalInfoSelectionUI();
  }

  window.toggleSelectAllPersonalInfo = function() {
    const selectAll = document.getElementById('select-all-personal-info');
    const checkboxes = document.querySelectorAll('.personal-info-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
    updatePersonalInfoSelectionUI();
  };

  window.updatePersonalInfoSelectionUI = function() {
    const checkboxes = Array.from(document.querySelectorAll('.personal-info-checkbox'));
    const selected = checkboxes.filter(cb => cb.checked);
    const bulkActions = document.getElementById('bulk-actions-personal-info');
    const selectedCount = document.getElementById('selected-count-personal-info');
    const selectAll = document.getElementById('select-all-personal-info');
    
    if (selectedCount) {
      selectedCount.textContent = selected.length > 0 ? `${selected.length} sélectionnée(s)` : '';
    }
    
    if (bulkActions) {
      bulkActions.classList.toggle('active', selected.length > 0);
    }
    
    if (selectAll) {
      selectAll.checked = checkboxes.length > 0 && selected.length === checkboxes.length;
      selectAll.indeterminate = selected.length > 0 && selected.length < checkboxes.length;
    }
  };

  window.deleteSelectedPersonalInfo = function() {
    const selected = Array.from(document.querySelectorAll('.personal-info-checkbox:checked'));
    if (selected.length === 0) {
      alert('Aucune information sélectionnée.');
      return;
    }
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selected.length} information(s) ? Cette action est irréversible.`)) {
      const data = getPortfolioData();
      if (!data.personal.additionalInfo) data.personal.additionalInfo = [];
      const indices = selected.map(cb => parseInt(cb.dataset.index)).sort((a, b) => b - a); // Sort descending
      
      indices.forEach(index => {
        data.personal.additionalInfo.splice(index, 1);
      });
      
      savePortfolioData(data);
      renderPersonalInfo(data.personal.additionalInfo);
      showSuccess(`${selected.length} information(s) supprimée(s) avec succès !`);
    }
  };

  window.showPersonalInfoForm = function(infoId = null) {
    editingPersonalInfoId = infoId;
    const modal = document.getElementById('personal-info-form-modal');
    const formTitle = document.getElementById('personal-info-form-title');
    const form = document.getElementById('personal-info-item-form');
    
    if (modal) modal.style.display = 'block';
    if (formTitle) formTitle.textContent = infoId !== null ? 'Modifier l\'information' : 'Ajouter une information';
    
    if (infoId !== null) {
      const data = getPortfolioData();
      if (!data.personal.additionalInfo) data.personal.additionalInfo = [];
      const info = data.personal.additionalInfo[infoId];
      if (info) {
        document.getElementById('personal-info-id').value = infoId;
        document.getElementById('info-label').value = info.label || '';
        document.getElementById('info-value').value = info.value || '';
        document.getElementById('info-type').value = info.type || 'autre';
      }
    } else {
      form.reset();
    }
    
    modal?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.hidePersonalInfoForm = function() {
    document.getElementById('personal-info-form-modal').style.display = 'none';
    editingPersonalInfoId = null;
    document.getElementById('personal-info-item-form').reset();
  };

  window.editPersonalInfo = function(index) {
    showPersonalInfoForm(index);
  };

  window.deletePersonalInfo = function(index) {
    const data = getPortfolioData();
    if (!data.personal.additionalInfo) data.personal.additionalInfo = [];
    const info = data.personal.additionalInfo[index];
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'information "${info.label}" ? Cette action est irréversible.`)) {
      data.personal.additionalInfo.splice(index, 1);
      savePortfolioData(data);
      renderPersonalInfo(data.personal.additionalInfo);
      showSuccess('Information supprimée avec succès !');
    }
  };

  const personalInfoItemForm = document.getElementById('personal-info-item-form');
  if (personalInfoItemForm) {
    personalInfoItemForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = getPortfolioData();
      if (!data.personal.additionalInfo) data.personal.additionalInfo = [];
      
      const info = {
        label: document.getElementById('info-label').value,
        value: document.getElementById('info-value').value,
        type: document.getElementById('info-type').value
      };

      if (editingPersonalInfoId !== null) {
        data.personal.additionalInfo[editingPersonalInfoId] = info;
        showSuccess('Information modifiée avec succès !');
      } else {
        data.personal.additionalInfo.push(info);
        showSuccess('Information ajoutée avec succès !');
      }

      savePortfolioData(data);
      renderPersonalInfo(data.personal.additionalInfo);
      hidePersonalInfoForm();
    });
  }

  // Projects Management
  let editingProjectId = null;

  function renderProjects(projects) {
    const container = document.getElementById('projects-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (projects.length === 0) {
      container.innerHTML = '<p class="muted">Aucun projet ajouté. Cliquez sur "Ajouter un projet" pour commencer.</p>';
      updateProjectSelectionUI();
      return;
    }

    projects.forEach((project, index) => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <input type="checkbox" class="select-checkbox project-checkbox" data-index="${index}" onchange="updateProjectSelectionUI()" />
        <h4>${project.title}</h4>
        <div class="item-meta">${project.type || 'Projet Personnel'} ${project.featured ? '⭐ Featured' : ''} ${project.public === false ? '🔒 Privé' : '🌐 Public'}</div>
        <p class="muted" style="font-size: 14px;">${project.shortDesc || ''}</p>
        <div class="item-actions">
          <button class="btn secondary" onclick="editProject(${index})">✏️ Modifier</button>
          <button class="btn btn-danger" onclick="deleteProject(${index})">🗑️ Supprimer</button>
        </div>
      `;
      container.appendChild(card);
    });
    
    updateProjectSelectionUI();
  }

  window.toggleSelectAllProjects = function() {
    const selectAll = document.getElementById('select-all-projects');
    const checkboxes = document.querySelectorAll('.project-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
    updateProjectSelectionUI();
  };

  window.updateProjectSelectionUI = function() {
    const checkboxes = Array.from(document.querySelectorAll('.project-checkbox'));
    const selected = checkboxes.filter(cb => cb.checked);
    const bulkActions = document.getElementById('bulk-actions-projects');
    const selectedCount = document.getElementById('selected-count-projects');
    const selectAll = document.getElementById('select-all-projects');
    
    if (selectedCount) {
      selectedCount.textContent = selected.length > 0 ? `${selected.length} sélectionné(s)` : '';
    }
    
    if (bulkActions) {
      bulkActions.classList.toggle('active', selected.length > 0);
    }
    
    if (selectAll) {
      selectAll.checked = checkboxes.length > 0 && selected.length === checkboxes.length;
      selectAll.indeterminate = selected.length > 0 && selected.length < checkboxes.length;
    }
  };

  window.deleteSelectedProjects = function() {
    const selected = Array.from(document.querySelectorAll('.project-checkbox:checked'));
    if (selected.length === 0) {
      alert('Aucun projet sélectionné.');
      return;
    }
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selected.length} projet(s) ? Cette action est irréversible.`)) {
      const data = getPortfolioData();
      const indices = selected.map(cb => parseInt(cb.dataset.index)).sort((a, b) => b - a); // Sort descending
      
      indices.forEach(index => {
        data.projects.splice(index, 1);
      });
      
      savePortfolioData(data);
      renderProjects(data.projects);
      updateStats();
      showSuccess(`${selected.length} projet(s) supprimé(s) avec succès !`);
    }
  };

  window.showProjectForm = function(projectId = null) {
    editingProjectId = projectId;
    const modal = document.getElementById('project-form-modal');
    const formTitle = document.getElementById('project-form-title');
    const form = document.getElementById('project-form');
    
    if (modal) modal.style.display = 'block';
    if (formTitle) formTitle.textContent = projectId !== null ? 'Modifier le projet' : 'Ajouter un projet';
    
    if (projectId !== null) {
      const data = getPortfolioData();
      const project = data.projects[projectId];
      if (project) {
        document.getElementById('project-id').value = projectId;
        document.getElementById('project-title').value = project.title || '';
        document.getElementById('project-type').value = project.type || 'Projet Personnel';
        document.getElementById('project-category').value = project.category || '';
        document.getElementById('project-short-desc').value = project.shortDesc || '';
        document.getElementById('project-description').value = project.description || '';
        document.getElementById('project-features').value = project.features ? project.features.join('\n') : '';
        document.getElementById('project-tags').value = project.tags ? project.tags.join(', ') : '';
        document.getElementById('project-link').value = project.link || '';
        document.getElementById('project-demo-link').value = project.demoLink || '';
        document.getElementById('project-featured').checked = project.featured || false;
        const publicCheckbox = document.getElementById('project-public');
        if (publicCheckbox) {
          // Si project.public est false, décocher. Sinon, cocher (true, undefined, null = public par défaut)
          // Forcer explicitement la valeur
          const shouldBeChecked = project.public !== false && project.public !== 'false' && project.public !== 0;
          publicCheckbox.checked = shouldBeChecked;
          
          console.log('📝 Chargement du projet dans le formulaire:', {
            title: project.title,
            public: project.public,
            publicType: typeof project.public,
            publicValue: JSON.stringify(project.public),
            checkboxChecked: publicCheckbox.checked,
            shouldBeChecked: shouldBeChecked
          });
        }
        renderTags();
      }
    } else {
      form.reset();
      // Réinitialiser la case à cocher public à true par défaut pour les nouveaux projets
      const publicCheckbox = document.getElementById('project-public');
      if (publicCheckbox) {
        publicCheckbox.checked = true;
      }
      document.getElementById('project-tags-display').innerHTML = '';
    }
    
    modal?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.hideProjectForm = function() {
    document.getElementById('project-form-modal').style.display = 'none';
    editingProjectId = null;
    document.getElementById('project-form').reset();
  };

  window.editProject = function(index) {
    showProjectForm(index);
  };

  window.deleteProject = function(index) {
    const data = getPortfolioData();
    const project = data.projects[index];
    if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.title}" ? Cette action est irréversible.`)) {
      data.projects.splice(index, 1);
      savePortfolioData(data);
      renderProjects(data.projects);
      updateStats();
      showSuccess('Projet supprimé avec succès !');
    }
  };

  const projectForm = document.getElementById('project-form');
  if (projectForm) {
    projectForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = getPortfolioData();
      // Lire la valeur de la checkbox AVANT de créer l'objet projet
      const checkbox = document.getElementById('project-public');
      const checkboxChecked = checkbox ? checkbox.checked : true;
      
      const project = {
        title: document.getElementById('project-title').value,
        type: document.getElementById('project-type').value,
        category: document.getElementById('project-category').value,
        shortDesc: document.getElementById('project-short-desc').value,
        description: document.getElementById('project-description').value,
        features: document.getElementById('project-features').value.split('\n').filter(f => f.trim()),
        tags: document.getElementById('project-tags').value.split(',').map(t => t.trim()).filter(t => t),
        link: document.getElementById('project-link').value,
        demoLink: document.getElementById('project-demo-link').value,
        featured: document.getElementById('project-featured').checked,
        public: checkboxChecked // Utiliser directement la valeur de la checkbox
      };
      
      console.log('💾 Sauvegarde du projet:', {
        title: project.title,
        public: project.public,
        publicType: typeof project.public,
        checkboxChecked: checkboxChecked,
        checkboxElement: checkbox ? 'trouvé' : 'non trouvé',
        checkboxValue: checkbox ? checkbox.checked : 'N/A'
      });

      if (editingProjectId !== null) {
        data.projects[editingProjectId] = project;
      } else {
        data.projects.push(project);
      }

      savePortfolioData(data);
      
      // Log pour vérifier la sauvegarde
      const savedProject = data.projects[editingProjectId !== null ? editingProjectId : data.projects.length - 1];
      if (savedProject) {
        console.log('✅ Projet sauvegardé:', {
          title: savedProject.title,
          public: savedProject.public,
          publicType: typeof savedProject.public,
          publicValue: savedProject.public
        });
      }
      
      renderProjects(data.projects);
      hideProjectForm();
      updateStats();
    });
  }

  // Tags rendering
  function renderTags() {
    const tagsInput = document.getElementById('project-tags');
    const tagsDisplay = document.getElementById('project-tags-display');
    if (!tagsInput || !tagsDisplay) return;

    tagsInput.addEventListener('input', () => {
      const tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t);
      tagsDisplay.innerHTML = '';
      tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag-item';
        tagEl.innerHTML = `${tag} <span class="remove-tag" onclick="removeTag('${tag}')">×</span>`;
        tagsDisplay.appendChild(tagEl);
      });
    });
  }
  renderTags();

  window.removeTag = function(tag) {
    const tagsInput = document.getElementById('project-tags');
    const tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t && t !== tag);
    tagsInput.value = tags.join(', ');
    renderTags();
  };

  // Skills Management
  function renderSkills(skills) {
    const container = document.getElementById('skills-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (skills.length === 0) {
      container.innerHTML = '<p class="muted">Aucune catégorie de compétences ajoutée. Utilisez le formulaire ci-dessus pour en ajouter une.</p>';
      updateSkillSelectionUI();
      return;
    }
    
    skills.forEach((skill, index) => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <input type="checkbox" class="select-checkbox skill-checkbox" data-index="${index}" onchange="updateSkillSelectionUI()" />
        <h4>${skill.icon} ${skill.name}</h4>
        <div style="margin-top: 12px;">
          <strong style="font-size: 12px; color: var(--muted);">Compétences :</strong>
          <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px;">
            ${skill.skills.map((s, skillIndex) => `
              <span class="skill-item">
                ${s}
                <span class="remove-skill" onclick="removeSkillFromCategory(${index}, ${skillIndex})" title="Supprimer cette compétence">×</span>
              </span>
            `).join('')}
          </div>
        </div>
        <div class="item-actions">
          <button class="btn secondary" onclick="editSkillCategory(${index})">✏️ Modifier</button>
          <button class="btn btn-danger" onclick="deleteSkill(${index})">🗑️ Supprimer la catégorie</button>
        </div>
      `;
      container.appendChild(card);
    });
    
    updateSkillSelectionUI();
  }

  window.toggleSelectAllSkills = function() {
    const selectAll = document.getElementById('select-all-skills');
    const checkboxes = document.querySelectorAll('.skill-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
    updateSkillSelectionUI();
  };

  window.updateSkillSelectionUI = function() {
    const checkboxes = Array.from(document.querySelectorAll('.skill-checkbox'));
    const selected = checkboxes.filter(cb => cb.checked);
    const bulkActions = document.getElementById('bulk-actions-skills');
    const selectedCount = document.getElementById('selected-count-skills');
    const selectAll = document.getElementById('select-all-skills');
    
    if (selectedCount) {
      selectedCount.textContent = selected.length > 0 ? `${selected.length} sélectionnée(s)` : '';
    }
    
    if (bulkActions) {
      bulkActions.classList.toggle('active', selected.length > 0);
    }
    
    if (selectAll) {
      selectAll.checked = checkboxes.length > 0 && selected.length === checkboxes.length;
      selectAll.indeterminate = selected.length > 0 && selected.length < checkboxes.length;
    }
  };

  window.deleteSelectedSkills = function() {
    const selected = Array.from(document.querySelectorAll('.skill-checkbox:checked'));
    if (selected.length === 0) {
      alert('Aucune catégorie sélectionnée.');
      return;
    }
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selected.length} catégorie(s) de compétences ? Cette action est irréversible.`)) {
      const data = getPortfolioData();
      const indices = selected.map(cb => parseInt(cb.dataset.index)).sort((a, b) => b - a); // Sort descending
      
      indices.forEach(index => {
        data.skills.splice(index, 1);
      });
      
      savePortfolioData(data);
      renderSkills(data.skills);
      updateStats();
      showSuccess(`${selected.length} catégorie(s) supprimée(s) avec succès !`);
    }
  };

  window.deleteSkill = function(index) {
    const data = getPortfolioData();
    const skill = data.skills[index];
    if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${skill.name}" ? Toutes les compétences de cette catégorie seront également supprimées. Cette action est irréversible.`)) {
      data.skills.splice(index, 1);
      savePortfolioData(data);
      renderSkills(data.skills);
      updateStats();
      showSuccess('Catégorie supprimée avec succès !');
    }
  };

  window.removeSkillFromCategory = function(categoryIndex, skillIndex) {
    const data = getPortfolioData();
    const category = data.skills[categoryIndex];
    const skillName = category.skills[skillIndex];
    
    if (confirm(`Supprimer la compétence "${skillName}" de la catégorie "${category.name}" ?`)) {
      category.skills.splice(skillIndex, 1);
      
      // Si la catégorie n'a plus de compétences, la supprimer
      if (category.skills.length === 0) {
        if (confirm('Cette catégorie n\'aura plus de compétences. Voulez-vous supprimer la catégorie entière ?')) {
          data.skills.splice(categoryIndex, 1);
        } else {
          return; // Annuler si l'utilisateur ne veut pas supprimer la catégorie vide
        }
      }
      
      savePortfolioData(data);
      renderSkills(data.skills);
      updateStats();
      showSuccess('Compétence supprimée avec succès !');
    }
  };

  let editingSkillIndex = null;

  window.editSkillCategory = function(index) {
    const data = getPortfolioData();
    const skill = data.skills[index];
    
    editingSkillIndex = index;
    document.getElementById('skill-category-name').value = skill.name;
    document.getElementById('skill-category-icon').value = skill.icon;
    document.getElementById('skill-category-skills').value = skill.skills.join(', ');
    
    // Scroll to form
    document.getElementById('skill-category-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Change submit button text
    const submitBtn = document.querySelector('#skill-category-form button[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = 'Modifier la catégorie';
      submitBtn.classList.add('btn');
    }
  };

  const skillForm = document.getElementById('skill-category-form');
  if (skillForm) {
    skillForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const data = getPortfolioData();
      const skill = {
        icon: document.getElementById('skill-category-icon').value,
        name: document.getElementById('skill-category-name').value,
        skills: document.getElementById('skill-category-skills').value.split(',').map(s => s.trim()).filter(s => s)
      };
      
      // Check if editing
      if (editingSkillIndex !== null) {
        data.skills[editingSkillIndex] = skill;
        editingSkillIndex = null;
        showSuccess('Catégorie modifiée avec succès !');
      } else {
        data.skills.push(skill);
        showSuccess('Catégorie ajoutée avec succès !');
      }
      
      savePortfolioData(data);
      renderSkills(data.skills);
      skillForm.reset();
      
      // Reset button text
      const submitBtn = skillForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Ajouter la catégorie';
      }
      
      updateStats();
    });
  }

  // Links Management
  function renderSocialLinks(links) {
    const container = document.getElementById('social-links-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    links.forEach((link, index) => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <h4>${link.name}</h4>
        <div class="item-meta"><a href="${link.url}" target="_blank">${link.url}</a></div>
        <div class="item-actions">
          <button class="btn btn-danger" onclick="deleteSocialLink(${index})">🗑️ Supprimer</button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  window.deleteSocialLink = function(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) {
      const data = getPortfolioData();
      data.links.social.splice(index, 1);
      savePortfolioData(data);
      renderSocialLinks(data.links.social);
      updateStats();
    }
  };

  // CV Upload functionality - Make available globally
  window.switchCVMethod = function(method) {
    const uploadSection = document.getElementById('cv-upload-section');
    const pathSection = document.getElementById('cv-path-section');
    const uploadTab = document.getElementById('cv-upload-tab');
    const pathTab = document.getElementById('cv-path-tab');
    
    if (!uploadSection || !pathSection || !uploadTab || !pathTab) return;
    
    if (method === 'upload') {
      uploadSection.style.display = 'block';
      pathSection.style.display = 'none';
      uploadTab.classList.add('active');
      pathTab.classList.remove('active');
    } else {
      uploadSection.style.display = 'none';
      pathSection.style.display = 'block';
      uploadTab.classList.remove('active');
      pathTab.classList.add('active');
    }
  };

  function showCVPreview(fileName, fileSize, base64Data) {
    const previewSection = document.getElementById('cv-preview-section');
    const fileNameEl = document.getElementById('cv-file-name');
    const fileSizeEl = document.getElementById('cv-file-size');
    const previewLink = document.getElementById('cv-preview-link');
    
    if (previewSection && fileNameEl && fileSizeEl && previewLink) {
      fileNameEl.textContent = fileName;
      fileSizeEl.textContent = `Taille : ${formatFileSize(fileSize)}`;
      previewLink.href = base64Data;
      previewSection.style.display = 'block';
    }
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  window.clearCVUpload = function() {
    const data = getPortfolioData();
    data.links.cvFile = null;
    data.links.cvFileName = null;
    data.links.cvFileSize = null;
    savePortfolioData(data);
    
    // Mark CV as updated with timestamp
    localStorage.setItem('cvLastUpdate', new Date().getTime().toString());
    
    // Trigger custom event for other pages
    try {
      window.dispatchEvent(new CustomEvent('cvUpdated'));
    } catch (e) {
      // Fallback: trigger storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'portfolioData',
        newValue: JSON.stringify(data)
      }));
    }
    
    const previewSection = document.getElementById('cv-preview-section');
    const fileInput = document.getElementById('cv-file-input');
    if (previewSection) previewSection.style.display = 'none';
    if (fileInput) fileInput.value = '';
    
    showToast('CV supprimé avec succès ! Rafraîchissez les autres pages.', 'success');
    updateStats();
  };

  function clearCVUpload() {
    window.clearCVUpload();
  }

  // CV Upload Form
  const cvUploadForm = document.getElementById('cv-upload-form');
  if (cvUploadForm) {
    cvUploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('cv-file-input');
      const file = fileInput.files[0];
      
      if (!file) {
        showToast('Veuillez sélectionner un fichier PDF', 'error');
        return;
      }
      
      if (file.type !== 'application/pdf') {
        showToast('Veuillez sélectionner un fichier PDF valide', 'error');
        return;
      }
      
      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        showToast('Le fichier est trop volumineux (max 10 MB)', 'error');
        return;
      }
      
      // Convert to base64
      const reader = new FileReader();
      reader.onload = function(e) {
        const base64Data = e.target.result;
        const data = getPortfolioData();
        data.links.cvFile = base64Data;
        data.links.cvFileName = file.name;
        data.links.cvFileSize = file.size;
        // Keep the original cv path as fallback
        if (!data.links.cv) {
          data.links.cv = 'assets/CV.pdf';
        }
        savePortfolioData(data);
        
        // Mark CV as updated with timestamp
        const timestamp = new Date().getTime().toString();
        localStorage.setItem('cvLastUpdate', timestamp);
        
        // Force update portfolioData to trigger storage events
        localStorage.setItem('portfolioData', JSON.stringify(data));
        
        // Trigger custom event for other pages
        try {
          window.dispatchEvent(new CustomEvent('cvUpdated', { detail: { fileName: file.name } }));
          // Also trigger on all windows (if in same origin)
          window.dispatchEvent(new Event('cvUpdated'));
        } catch (e) {
          console.error('Erreur lors de l\'envoi de l\'événement:', e);
        }
        
        // Try to trigger storage event manually (works across tabs)
        try {
          const event = new StorageEvent('storage', {
            key: 'cvLastUpdate',
            newValue: timestamp,
            oldValue: localStorage.getItem('cvLastUpdate'),
            url: window.location.href,
            storageArea: localStorage
          });
          window.dispatchEvent(event);
        } catch (e) {
          console.error('Erreur lors de l\'envoi de l\'événement storage:', e);
        }
        
        showCVPreview(file.name, file.size, base64Data);
        showToast('✅ CV importé avec succès ! Le nouveau CV sera utilisé automatiquement dans toutes les pages.', 'success');
        updateStats();
        
        console.log('✅ CV sauvegardé:', {
          fileName: file.name,
          fileSize: file.size,
          hasBase64: !!base64Data,
          timestamp: timestamp
        });
      };
      reader.onerror = function() {
        showToast('Erreur lors de la lecture du fichier', 'error');
      };
      reader.readAsDataURL(file);
    });
  }

  // CV Path Form
  const cvForm = document.getElementById('cv-form');
  if (cvForm) {
    cvForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = getPortfolioData();
      const cvPath = document.getElementById('cv-path').value;
      
      if (!cvPath.trim()) {
        showToast('Veuillez entrer un chemin ou une URL pour le CV', 'error');
        return;
      }
      
      data.links.cv = cvPath.trim();
      // Clear uploaded CV if using path/URL
      data.links.cvFile = null;
      data.links.cvFileName = null;
      data.links.cvFileSize = null;
      savePortfolioData(data);
      
      // Mark CV as updated with timestamp
      localStorage.setItem('cvLastUpdate', new Date().getTime().toString());
      
      // Trigger custom event for other pages
      try {
        window.dispatchEvent(new CustomEvent('cvUpdated'));
      } catch (e) {
        // Fallback: trigger storage event
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'portfolioData',
          newValue: JSON.stringify(data)
        }));
      }
      
      // Hide upload preview
      const previewSection = document.getElementById('cv-preview-section');
      if (previewSection) previewSection.style.display = 'none';
      
      showToast('Chemin du CV enregistré avec succès ! Rafraîchissez les autres pages pour voir le changement.', 'success');
      updateStats();
    });
  }

  const socialForm = document.getElementById('social-link-form');
  if (socialForm) {
    socialForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = getPortfolioData();
      if (!data.links.social) data.links.social = [];
      data.links.social.push({
        name: document.getElementById('social-name').value,
        url: document.getElementById('social-url').value
      });
      savePortfolioData(data);
      renderSocialLinks(data.links.social);
      socialForm.reset();
      updateStats();
    });
  }

  // About Management
  window.saveAboutInfo = function() {
    const data = getPortfolioData();
    data.about = {
      heroDescription: document.getElementById('hero-description').value,
      aboutDescription: document.getElementById('about-description').value,
      stats: {
        projects: parseInt(document.getElementById('stats-projects').value) || 0,
        experience: parseFloat(document.getElementById('stats-experience').value) || 0,
        technologies: parseInt(document.getElementById('stats-technologies').value) || 0
      }
    };
    savePortfolioData(data);
  };

  // Save stats from Stats tab
  window.saveStatsInfo = function() {
    const statsProjectsInput = document.getElementById('stats-projects-display');
    const statsExperienceInput = document.getElementById('stats-experience-display');
    const statsTechnologiesInput = document.getElementById('stats-technologies-display');
    
    if (!statsProjectsInput || !statsExperienceInput || !statsTechnologiesInput) {
      showSuccess('Erreur: Les champs de statistiques ne sont pas trouvés');
      console.error('❌ Champs de statistiques non trouvés:', {
        statsProjectsInput: !!statsProjectsInput,
        statsExperienceInput: !!statsExperienceInput,
        statsTechnologiesInput: !!statsTechnologiesInput
      });
      return;
    }
    
    const data = getPortfolioData();
    if (!data.about) {
      data.about = {
        heroDescription: '',
        aboutDescription: '',
        stats: { projects: 0, experience: 0, technologies: 0 }
      };
    }
    
    const projects = parseInt(statsProjectsInput.value) || 0;
    const experience = parseFloat(statsExperienceInput.value) || 0;
    const technologies = parseInt(statsTechnologiesInput.value) || 0;
    
    data.about.stats = {
      projects: projects,
      experience: experience,
      technologies: technologies
    };
    
    console.log('💾 Sauvegarde des statistiques:', data.about.stats);
    
    // Also update the Descriptions tab fields if they exist
    const statsProjects = document.getElementById('stats-projects');
    const statsExperience = document.getElementById('stats-experience');
    const statsTechnologies = document.getElementById('stats-technologies');
    if (statsProjects) statsProjects.value = projects;
    if (statsExperience) statsExperience.value = experience;
    if (statsTechnologies) statsTechnologies.value = technologies;
    
    savePortfolioData(data);
    showSuccess(`Statistiques enregistrées avec succès ! (Projets: ${projects}, Expérience: ${experience}, Technologies: ${technologies})`);
    
    // Trigger storage event to update public pages
    try {
      localStorage.setItem('portfolioLastUpdate', new Date().toISOString());
      window.dispatchEvent(new CustomEvent('portfolioDataUpdated', { 
        detail: { stats: data.about.stats, about: data.about } 
      }));
      console.log('📤 Événement de mise à jour des statistiques déclenché:', data.about.stats);
      
      // Also dispatch storage event manually (for same-tab updates)
      const storageEvent = new StorageEvent('storage', {
        key: 'portfolioData',
        newValue: JSON.stringify(data),
        url: window.location.href,
        storageArea: localStorage
      });
      window.dispatchEvent(storageEvent);
    } catch (e) {
      console.error('Erreur lors du déclenchement de l\'événement:', e);
    }
  };

  // Export/Import
  window.exportAllData = function() {
    const data = getPortfolioData();
    const exportData = {
      ...data,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Données exportées avec succès !');
  };

  window.handleFileImport = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importedData = JSON.parse(e.target.result);
        if (confirm('Voulez-vous remplacer toutes les données actuelles par les données importées ?')) {
          localStorage.setItem('portfolioData', JSON.stringify(importedData));
          loadAllData();
          updateStats();
          showSuccess('Données importées avec succès !');
        }
      } catch (error) {
        alert('Erreur lors de l\'importation. Vérifiez que le fichier est un JSON valide.');
      }
    };
    reader.readAsText(file);
  };

  window.clearAllData = function() {
    if (confirm('⚠️ ATTENTION : Cette action va supprimer toutes les données. Êtes-vous absolument sûr ?')) {
      if (confirm('Dernière confirmation : Supprimer toutes les données ?')) {
        const session = localStorage.getItem('adminSession');
        localStorage.clear();
        if (session) localStorage.setItem('adminSession', session);
        initData();
        loadAllData();
        updateStats();
        showSuccess('Toutes les données ont été réinitialisées.');
      }
    }
  };

  // Apply changes to portfolio (update HTML pages dynamically)
  window.applyChangesToPortfolio = function() {
    showSuccess('Les modifications seront visibles après rafraîchissement des pages. Note: Pour une persistance complète, vous devrez modifier les fichiers HTML manuellement ou utiliser un système backend.');
    // In a real implementation, this would update the HTML files or make API calls
  };

  // Update Statistics
  function updateStats() {
    const data = getPortfolioData();
    
    document.getElementById('stat-projects').textContent = (data.projects || []).length;
    document.getElementById('dashboard-stat-projects').textContent = (data.projects || []).length;
    document.getElementById('dashboard-stat-skills').textContent = (data.skills || []).length;
    document.getElementById('dashboard-stat-links').textContent = (data.links?.social || []).length;
    
    const lastUpdate = localStorage.getItem('portfolioLastUpdate');
    const lastUpdateEl = document.getElementById('stat-last-update');
    if (lastUpdateEl && lastUpdate) {
      const date = new Date(lastUpdate);
      const now = new Date();
      const diff = Math.floor((now - date) / (1000 * 60));
      if (diff < 60) {
        lastUpdateEl.textContent = `Il y a ${diff} min`;
      } else if (diff < 1440) {
        lastUpdateEl.textContent = `Il y a ${Math.floor(diff / 60)}h`;
      } else {
        lastUpdateEl.textContent = date.toLocaleDateString('fr-FR');
      }
    }

    let visitors = parseInt(localStorage.getItem('portfolioVisitors') || '0');
    visitors++;
    localStorage.setItem('portfolioVisitors', visitors.toString());
    const visitorsEl = document.getElementById('stat-visitors');
    if (visitorsEl) visitorsEl.textContent = visitors.toLocaleString('fr-FR');
  }

  // Testimonials Management
  let editingTestimonialId = null;

  function renderTestimonials(testimonials) {
    const container = document.getElementById('testimonials-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!testimonials || testimonials.length === 0) {
      container.innerHTML = '<p class="muted">Aucun témoignage. Cliquez sur "Ajouter un témoignage" pour commencer.</p>';
      return;
    }

    testimonials.forEach((testimonial, index) => {
      const card = document.createElement('div');
      card.className = 'item-card';
      const stars = '⭐'.repeat(testimonial.rating || 5);
      card.innerHTML = `
        <h4>${testimonial.author}</h4>
        <div class="item-meta">${testimonial.role || ''} • ${stars}</div>
        <p style="font-size: 14px; margin-top: 8px;">${testimonial.text}</p>
        <div class="item-actions">
          <button class="btn secondary" onclick="editTestimonial(${index})">✏️ Modifier</button>
          <button class="btn btn-danger" onclick="deleteTestimonial(${index})">🗑️ Supprimer</button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  window.showTestimonialForm = function(id = null) {
    editingTestimonialId = id;
    const modal = document.getElementById('testimonial-form-modal');
    const formTitle = document.getElementById('testimonial-form-title');
    
    if (modal) modal.style.display = 'block';
    if (formTitle) formTitle.textContent = id !== null ? 'Modifier le témoignage' : 'Ajouter un témoignage';
    
    if (id !== null) {
      const data = getPortfolioData();
      const testimonial = data.testimonials[id];
      if (testimonial) {
        document.getElementById('testimonial-id').value = id;
        document.getElementById('testimonial-text').value = testimonial.text || '';
        document.getElementById('testimonial-author').value = testimonial.author || '';
        document.getElementById('testimonial-role').value = testimonial.role || '';
        document.getElementById('testimonial-rating').value = testimonial.rating || 5;
      }
    } else {
      document.getElementById('testimonial-form').reset();
    }
    modal?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.hideTestimonialForm = function() {
    document.getElementById('testimonial-form-modal').style.display = 'none';
    editingTestimonialId = null;
    document.getElementById('testimonial-form').reset();
  };

  window.editTestimonial = function(index) { showTestimonialForm(index); };

  window.deleteTestimonial = function(index) {
    const data = getPortfolioData();
    const testimonial = data.testimonials[index];
    if (confirm(`Supprimer le témoignage de "${testimonial.author}" ?`)) {
      data.testimonials.splice(index, 1);
      savePortfolioData(data);
      renderTestimonials(data.testimonials);
      showSuccess('Témoignage supprimé !');
    }
  };

  const testimonialForm = document.getElementById('testimonial-form');
  if (testimonialForm) {
    testimonialForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = getPortfolioData();
      if (!data.testimonials) data.testimonials = [];
      
      const testimonial = {
        text: document.getElementById('testimonial-text').value,
        author: document.getElementById('testimonial-author').value,
        role: document.getElementById('testimonial-role').value,
        rating: parseInt(document.getElementById('testimonial-rating').value) || 5
      };

      if (editingTestimonialId !== null) {
        data.testimonials[editingTestimonialId] = testimonial;
        showSuccess('Témoignage modifié !');
      } else {
        data.testimonials.push(testimonial);
        showSuccess('Témoignage ajouté !');
      }

      savePortfolioData(data);
      renderTestimonials(data.testimonials);
      hideTestimonialForm();
    });
  }

  // Timeline Management
  let editingTimelineId = null;

  function renderTimeline(timeline) {
    const container = document.getElementById('timeline-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!timeline || timeline.length === 0) {
      container.innerHTML = '<p class="muted">Aucun événement. Cliquez sur "Ajouter un événement" pour commencer.</p>';
      return;
    }

    timeline.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <div class="item-meta">${item.date}</div>
        <h4>${item.title}</h4>
        <p class="muted" style="font-size: 14px; margin-top: 4px;">${item.subtitle || ''}</p>
        <p style="font-size: 14px; margin-top: 8px;">${item.description}</p>
        <div class="item-actions">
          <button class="btn secondary" onclick="editTimelineItem(${index})">✏️ Modifier</button>
          <button class="btn btn-danger" onclick="deleteTimelineItem(${index})">🗑️ Supprimer</button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  window.showTimelineForm = function(id = null) {
    editingTimelineId = id;
    const modal = document.getElementById('timeline-form-modal');
    const formTitle = document.getElementById('timeline-form-title');
    
    if (modal) modal.style.display = 'block';
    if (formTitle) formTitle.textContent = id !== null ? 'Modifier l\'événement' : 'Ajouter un événement';
    
    if (id !== null) {
      const data = getPortfolioData();
      const item = data.timeline[id];
      if (item) {
        document.getElementById('timeline-id').value = id;
        document.getElementById('timeline-date').value = item.date || '';
        document.getElementById('timeline-title').value = item.title || '';
        document.getElementById('timeline-subtitle').value = item.subtitle || '';
        document.getElementById('timeline-description').value = item.description || '';
      }
    } else {
      document.getElementById('timeline-form').reset();
    }
    modal?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.hideTimelineForm = function() {
    document.getElementById('timeline-form-modal').style.display = 'none';
    editingTimelineId = null;
    document.getElementById('timeline-form').reset();
  };

  window.editTimelineItem = function(index) { showTimelineForm(index); };

  window.deleteTimelineItem = function(index) {
    const data = getPortfolioData();
    const item = data.timeline[index];
    if (confirm(`Supprimer l'événement "${item.title}" ?`)) {
      data.timeline.splice(index, 1);
      savePortfolioData(data);
      renderTimeline(data.timeline);
      showSuccess('Événement supprimé !');
    }
  };

  const timelineForm = document.getElementById('timeline-form');
  if (timelineForm) {
    timelineForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = getPortfolioData();
      if (!data.timeline) data.timeline = [];
      
      const item = {
        date: document.getElementById('timeline-date').value,
        title: document.getElementById('timeline-title').value,
        subtitle: document.getElementById('timeline-subtitle').value,
        description: document.getElementById('timeline-description').value
      };

      if (editingTimelineId !== null) {
        data.timeline[editingTimelineId] = item;
        showSuccess('Événement modifié !');
      } else {
        data.timeline.push(item);
        showSuccess('Événement ajouté !');
      }

      savePortfolioData(data);
      renderTimeline(data.timeline);
      hideTimelineForm();
    });
  }

  // Services Management
  let editingServiceId = null;

  function renderServices(services) {
    const container = document.getElementById('services-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!services || services.length === 0) {
      container.innerHTML = '<p class="muted">Aucun service. Cliquez sur "Ajouter un service" pour commencer.</p>';
      return;
    }

    services.forEach((service, index) => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <h4>${service.icon} ${service.title}</h4>
        <p style="font-size: 14px; margin-top: 8px;">${service.description}</p>
        ${service.features && service.features.length > 0 ? `
          <ul style="margin-top: 12px; font-size: 14px;">
            ${service.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
        ` : ''}
        <div class="item-actions">
          <button class="btn secondary" onclick="editService(${index})">✏️ Modifier</button>
          <button class="btn btn-danger" onclick="deleteService(${index})">🗑️ Supprimer</button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  window.showServiceForm = function(id = null) {
    editingServiceId = id;
    const modal = document.getElementById('service-form-modal');
    const formTitle = document.getElementById('service-form-title');
    
    if (modal) modal.style.display = 'block';
    if (formTitle) formTitle.textContent = id !== null ? 'Modifier le service' : 'Ajouter un service';
    
    if (id !== null) {
      const data = getPortfolioData();
      const service = data.services[id];
      if (service) {
        document.getElementById('service-id').value = id;
        document.getElementById('service-icon').value = service.icon || '';
        document.getElementById('service-title').value = service.title || '';
        document.getElementById('service-description').value = service.description || '';
        document.getElementById('service-features').value = service.features ? service.features.join('\n') : '';
      }
    } else {
      document.getElementById('service-form').reset();
    }
    modal?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.hideServiceForm = function() {
    document.getElementById('service-form-modal').style.display = 'none';
    editingServiceId = null;
    document.getElementById('service-form').reset();
  };

  window.editService = function(index) { showServiceForm(index); };

  window.deleteService = function(index) {
    const data = getPortfolioData();
    const service = data.services[index];
    if (confirm(`Supprimer le service "${service.title}" ?`)) {
      data.services.splice(index, 1);
      savePortfolioData(data);
      renderServices(data.services);
      showSuccess('Service supprimé !');
    }
  };

  const serviceForm = document.getElementById('service-form');
  if (serviceForm) {
    serviceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = getPortfolioData();
      if (!data.services) data.services = [];
      
      const service = {
        icon: document.getElementById('service-icon').value,
        title: document.getElementById('service-title').value,
        description: document.getElementById('service-description').value,
        features: document.getElementById('service-features').value.split('\n').filter(f => f.trim())
      };

      if (editingServiceId !== null) {
        data.services[editingServiceId] = service;
        showSuccess('Service modifié !');
      } else {
        data.services.push(service);
        showSuccess('Service ajouté !');
      }

      savePortfolioData(data);
      renderServices(data.services);
      hideServiceForm();
    });
  }

  // Certifications Management
  let editingCertificationId = null;

  function renderCertifications(certifications) {
    const container = document.getElementById('certifications-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!certifications || certifications.length === 0) {
      container.innerHTML = '<p class="muted">Aucune certification. Cliquez sur "Ajouter une certification" pour commencer.</p>';
      return;
    }

    certifications.forEach((cert, index) => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        ${cert.image ? `<img src="${cert.image}" alt="${cert.name}" style="width: 80px; height: 80px; object-fit: contain; margin-bottom: 12px; border-radius: 8px;" />` : ''}
        <h4>${cert.name}</h4>
        <div class="item-meta">${cert.issuer}${cert.date ? ` • ${cert.date}` : ''}</div>
        ${cert.url ? `<a href="${cert.url}" target="_blank" style="font-size: 12px; color: var(--accent);">Voir la certification →</a>` : ''}
        <div class="item-actions">
          <button class="btn secondary" onclick="editCertification(${index})">✏️ Modifier</button>
          <button class="btn btn-danger" onclick="deleteCertification(${index})">🗑️ Supprimer</button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  window.showCertificationForm = function(id = null) {
    editingCertificationId = id;
    const modal = document.getElementById('certification-form-modal');
    const formTitle = document.getElementById('certification-form-title');
    
    if (modal) modal.style.display = 'block';
    if (formTitle) formTitle.textContent = id !== null ? 'Modifier la certification' : 'Ajouter une certification';
    
    if (id !== null) {
      const data = getPortfolioData();
      const cert = data.certifications[id];
      if (cert) {
        document.getElementById('certification-id').value = id;
        document.getElementById('cert-name').value = cert.name || '';
        document.getElementById('cert-issuer').value = cert.issuer || '';
        document.getElementById('cert-date').value = cert.date || '';
        document.getElementById('cert-url').value = cert.url || '';
        document.getElementById('cert-image').value = cert.image || '';
      }
    } else {
      document.getElementById('certification-form').reset();
    }
    modal?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.hideCertificationForm = function() {
    document.getElementById('certification-form-modal').style.display = 'none';
    editingCertificationId = null;
    document.getElementById('certification-form').reset();
  };

  window.editCertification = function(index) { showCertificationForm(index); };

  window.deleteCertification = function(index) {
    const data = getPortfolioData();
    const cert = data.certifications[index];
    if (confirm(`Supprimer la certification "${cert.name}" ?`)) {
      data.certifications.splice(index, 1);
      savePortfolioData(data);
      renderCertifications(data.certifications);
      showSuccess('Certification supprimée !');
    }
  };

  const certificationForm = document.getElementById('certification-form');
  if (certificationForm) {
    certificationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = getPortfolioData();
      if (!data.certifications) data.certifications = [];
      
      const cert = {
        name: document.getElementById('cert-name').value,
        issuer: document.getElementById('cert-issuer').value,
        date: document.getElementById('cert-date').value,
        url: document.getElementById('cert-url').value,
        image: document.getElementById('cert-image').value
      };

      if (editingCertificationId !== null) {
        data.certifications[editingCertificationId] = cert;
        showSuccess('Certification modifiée !');
      } else {
        data.certifications.push(cert);
        showSuccess('Certification ajoutée !');
      }

      savePortfolioData(data);
      renderCertifications(data.certifications);
      hideCertificationForm();
    });
  }

  // Settings Management
  window.toggleMaintenanceModeDisplay = function() {
    const checkbox = document.getElementById('maintenance-mode');
    const messageGroup = document.getElementById('maintenance-message-group');
    if (messageGroup) {
      messageGroup.style.display = checkbox.checked ? 'block' : 'none';
    }
  };

  window.saveSettings = function() {
    const data = getPortfolioData();
    if (!data.settings) data.settings = {};
    
    data.settings = {
      maintenanceMode: document.getElementById('maintenance-mode').checked,
      maintenanceMessage: document.getElementById('maintenance-message').value,
      metaTitle: document.getElementById('meta-title').value,
      metaDescription: document.getElementById('meta-description').value,
      metaKeywords: document.getElementById('meta-keywords').value,
      googleAnalytics: document.getElementById('google-analytics').value
    };

    savePortfolioData(data);
    showSuccess('Paramètres enregistrés !');
  };

  // Load settings
  function loadSettings() {
    const data = getPortfolioData();
    if (data.settings) {
      document.getElementById('maintenance-mode').checked = data.settings.maintenanceMode || false;
      document.getElementById('maintenance-message').value = data.settings.maintenanceMessage || '';
      document.getElementById('meta-title').value = data.settings.metaTitle || '';
      document.getElementById('meta-description').value = data.settings.metaDescription || '';
      document.getElementById('meta-keywords').value = data.settings.metaKeywords || '';
      document.getElementById('google-analytics').value = data.settings.googleAnalytics || '';
      toggleMaintenanceModeDisplay();
    }
  }


  // Initialize settings loading on page load
  setTimeout(() => {
    if (typeof loadSettings === 'function') {
      loadSettings();
    }
  }, 500);

  // Contact Messages Management
  function renderMessages() {
    console.log('🔄 renderMessages() appelée');
    const container = document.getElementById('messages-list');
    if (!container) {
      console.error('❌ Container messages-list non trouvé dans le DOM');
      console.log('🔍 Recherche de tous les éléments avec id contenant "message":', 
        Array.from(document.querySelectorAll('[id*="message"]')).map(el => el.id));
      return;
    }
    console.log('✅ Container messages-list trouvé');

    const data = getPortfolioData();
    console.log('📊 Données complètes:', data);
    console.log('🔍 Vérification contactMessages:', {
      exists: !!data.contactMessages,
      isArray: Array.isArray(data.contactMessages),
      length: data.contactMessages ? data.contactMessages.length : 0,
      content: data.contactMessages
    });
    let messages = data.contactMessages || [];
    console.log(`📬 Messages trouvés: ${messages.length}`, messages);
    
    // Si messages est vide mais qu'on devrait en avoir, vérifier localStorage directement
    if (messages.length === 0) {
      try {
        const directData = localStorage.getItem('portfolioData');
        if (directData) {
          const directParsed = JSON.parse(directData);
          const directMessages = directParsed.contactMessages || [];
          if (directMessages.length > 0) {
            console.warn('⚠️ Messages trouvés directement dans localStorage mais pas dans getPortfolioData()!', directMessages);
            messages = directMessages;
            // Corriger les données
            data.contactMessages = directMessages;
            // Sauvegarder la correction
            localStorage.setItem('portfolioData', JSON.stringify(data));
            console.log('✅ Données corrigées avec les messages manquants');
          }
        }
      } catch (e) {
        console.error('❌ Erreur lors de la vérification directe:', e);
      }
    }

    container.innerHTML = '';

    if (messages.length === 0) {
      console.log('ℹ️ Aucun message à afficher');
      container.innerHTML = '<p class="muted">Aucun message reçu pour le moment.</p>';
      return;
    }

    // Trier les messages par date décroissante (plus récents en premier)
    messages = messages.sort((a, b) => {
      const dateA = new Date(a.date || a.id || 0);
      const dateB = new Date(b.date || b.id || 0);
      return dateB - dateA;
    });

    // Compter les messages non lus
    const unreadCount = messages.filter(m => !m.read).length;
    if (unreadCount > 0) {
      const header = document.createElement('div');
      header.style.cssText = 'margin-bottom: 16px; padding: 12px; background: rgba(91, 124, 250, 0.1); border: 1px solid rgba(91, 124, 250, 0.3); border-radius: 8px;';
      header.innerHTML = `<strong>📬 ${unreadCount} message${unreadCount > 1 ? 's' : ''} non lu${unreadCount > 1 ? 's' : ''}</strong>`;
      container.appendChild(header);
    }

    messages.forEach((message, index) => {
      // Trouver l'index réel dans le tableau original pour les fonctions de modification
      const realIndex = data.contactMessages.findIndex(m => 
        (m.id && message.id && m.id === message.id) || 
        (m.date && message.date && m.date === message.date && m.email === message.email)
      );
      const displayIndex = realIndex !== -1 ? realIndex : index;

      const card = document.createElement('div');
      card.className = 'item-card';
      card.style.opacity = message.read ? '0.7' : '1';
      card.style.borderLeft = message.read ? '3px solid var(--line)' : '3px solid var(--accent)';
      
      const date = new Date(message.date || message.id || Date.now());
      const dateStr = date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const subject = message.subject || '';
      const replySubject = subject ? `Re: ${subject}` : `Re: ${message.name || 'Contact'}`;

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div style="flex: 1;">
            <h4 style="margin: 0;">${message.name || 'Anonyme'}</h4>
            <div class="item-meta">${message.email || ''} • ${dateStr}</div>
            ${subject ? `<div style="margin-top: 4px; font-size: 13px; color: var(--accent); font-weight: 500;">📌 ${subject}</div>` : ''}
          </div>
          ${!message.read ? '<span style="background: var(--accent); color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; white-space: nowrap; margin-left: 12px;">Nouveau</span>' : ''}
        </div>
        <p style="font-size: 14px; margin-top: 12px; white-space: pre-wrap; line-height: 1.6;">${message.message || ''}</p>
        <div class="item-actions">
          <a href="mailto:${message.email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(`Bonjour ${message.name},\n\n\n\n---\nMessage original:\n${message.message || ''}`)}" class="btn secondary">📧 Répondre</a>
          ${!message.read ? `<button class="btn secondary" onclick="markMessageAsRead(${displayIndex})">✓ Marquer comme lu</button>` : ''}
          <button class="btn btn-danger" onclick="deleteMessage(${displayIndex})">🗑️ Supprimer</button>
        </div>
      `;
      container.appendChild(card);
      console.log(`✅ Message ${index + 1} ajouté au DOM:`, message.name);
    });
    console.log(`✅ Total de ${messages.length} message(s) affiché(s) dans le conteneur`);
  }

  window.markMessageAsRead = function(index) {
    const data = getPortfolioData();
    if (data.contactMessages && data.contactMessages[index]) {
      data.contactMessages[index].read = true;
      savePortfolioData(data);
      renderMessages();
      showSuccess('Message marqué comme lu');
    }
  };

  window.deleteMessage = function(index) {
    const data = getPortfolioData();
    if (data.contactMessages && data.contactMessages[index]) {
      const message = data.contactMessages[index];
      if (confirm(`Supprimer le message de "${message.name}" ?`)) {
        data.contactMessages.splice(index, 1);
        savePortfolioData(data);
        renderMessages();
        showSuccess('Message supprimé');
      }
    }
  };

  // Load messages when messages tab is opened
  const messagesTab = document.querySelector('[data-tab="messages"]');
  if (messagesTab) {
    messagesTab.addEventListener('click', () => {
      console.log('📬 Onglet Messages ouvert - rechargement des messages');
      setTimeout(() => {
        renderMessages();
      }, 100);
    });
  } else {
    console.warn('⚠️ Onglet Messages non trouvé');
  }

  // Auto-refresh messages every 5 seconds when on messages tab
  let messagesRefreshInterval = null;
  const setupMessagesAutoRefresh = () => {
    // Clear existing interval
    if (messagesRefreshInterval) {
      clearInterval(messagesRefreshInterval);
    }
    
    // Check if messages tab is active
    const messagesTabContent = document.getElementById('tab-messages');
    if (messagesTabContent && messagesTabContent.classList.contains('active')) {
      // Refresh messages every 5 seconds
      messagesRefreshInterval = setInterval(() => {
        renderMessages();
      }, 5000);
    }
  };

  // Listen for tab changes
  const allTabs = document.querySelectorAll('.admin-tab');
  allTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      setTimeout(setupMessagesAutoRefresh, 200);
    });
  });

  // Also listen for storage events to detect new messages from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'portfolioData') {
      const messagesTabContent = document.getElementById('tab-messages');
      if (messagesTabContent && messagesTabContent.classList.contains('active')) {
        renderMessages();
        // Show notification if there are new unread messages
        const data = getPortfolioData();
        const unreadCount = (data.contactMessages || []).filter(m => !m.read).length;
        if (unreadCount > 0) {
          showSuccess(`📬 ${unreadCount} nouveau${unreadCount > 1 ? 'x' : ''} message${unreadCount > 1 ? 's' : ''} reçu${unreadCount > 1 ? 's' : ''} !`);
        }
      }
    }
  });

  // Listen for custom newContactMessage event
  window.addEventListener('newContactMessage', (e) => {
    const messagesTabContent = document.getElementById('tab-messages');
    if (messagesTabContent && messagesTabContent.classList.contains('active')) {
      renderMessages();
      showSuccess('📬 Nouveau message reçu !');
    }
  });

  // Initial setup
  setupMessagesAutoRefresh();

  // FAQ Management
  let editingFAQId = null;

  function renderFAQ(faqs) {
    const container = document.getElementById('faq-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!faqs || faqs.length === 0) {
      container.innerHTML = '<p class="muted">Aucune question FAQ. Cliquez sur "Ajouter une question" pour commencer.</p>';
      return;
    }

    faqs.forEach((faq, index) => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <h4>${faq.question || ''}</h4>
        <p style="font-size: 14px; margin-top: 8px; color: var(--muted);">${(faq.answer || '').substring(0, 100)}${faq.answer && faq.answer.length > 100 ? '...' : ''}</p>
        <div class="item-actions">
          <button class="btn secondary" onclick="editFAQ(${index})">✏️ Modifier</button>
          <button class="btn btn-danger" onclick="deleteFAQ(${index})">🗑️ Supprimer</button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  window.showFAQForm = function(id = null) {
    editingFAQId = id;
    const modal = document.getElementById('faq-form-modal');
    const formTitle = document.getElementById('faq-form-title');
    
    if (modal) modal.style.display = 'block';
    if (formTitle) formTitle.textContent = id !== null ? 'Modifier la question FAQ' : 'Ajouter une question FAQ';
    
    if (id !== null) {
      const data = getPortfolioData();
      const faq = data.faq[id];
      if (faq) {
        document.getElementById('faq-id').value = id;
        document.getElementById('faq-question').value = faq.question || '';
        document.getElementById('faq-answer').value = faq.answer || '';
      }
    } else {
      document.getElementById('faq-form').reset();
    }
    modal?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.hideFAQForm = function() {
    document.getElementById('faq-form-modal').style.display = 'none';
    editingFAQId = null;
    document.getElementById('faq-form').reset();
  };

  window.editFAQ = function(index) { showFAQForm(index); };

  window.deleteFAQ = function(index) {
    const data = getPortfolioData();
    const faq = data.faq[index];
    if (confirm(`Supprimer la question "${faq.question}" ?`)) {
      data.faq.splice(index, 1);
      savePortfolioData(data);
      renderFAQ(data.faq);
      showSuccess('Question FAQ supprimée !');
    }
  };

  const faqForm = document.getElementById('faq-form');
  if (faqForm) {
    faqForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = getPortfolioData();
      if (!data.faq) data.faq = [];
      
      const faq = {
        question: document.getElementById('faq-question').value,
        answer: document.getElementById('faq-answer').value
      };

      if (editingFAQId !== null) {
        data.faq[editingFAQId] = faq;
        showSuccess('Question FAQ modifiée !');
      } else {
        data.faq.push(faq);
        showSuccess('Question FAQ ajoutée !');
      }

      savePortfolioData(data);
      renderFAQ(data.faq);
      hideFAQForm();
    });
  }

  // Initialize
  if (!checkAdminSession()) {
    showLogin();
  } else {
    initData();
  }
});
