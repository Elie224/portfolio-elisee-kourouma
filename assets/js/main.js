document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // NETTOYAGE PRÉVENTIF DU LOCALSTORAGE POUR MAIN.JS
  function preventiveCleanLocalStorage() {
    const portfolioData = localStorage.getItem('portfolioData');
    if (portfolioData && (portfolioData.includes("'\\n' +") || portfolioData.includes('`') || portfolioData.includes("+ '"))) {
      console.log('🧹 localStorage contient du code JavaScript, suppression préventive...');
      localStorage.removeItem('portfolioData');
      localStorage.removeItem('projects');
      localStorage.removeItem('skills');
      localStorage.removeItem('timeline');
      console.log('✅ localStorage nettoyé côté main.js');
    }
  }
  
  // Nettoyer au démarrage
  preventiveCleanLocalStorage();

  // Configuration API
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://portfolio-backend-x47u.onrender.com/api';
  
  // Vérifier si les données sont vraiment vides (pas juste un objet avec des tableaux vides)
  function isDataEmpty(data) {
    if (!data) return true;
    
    // Vérifier chaque type de donnée
    const hasProjects = data.projects && Array.isArray(data.projects) && data.projects.length > 0;
    const hasSkills = data.skills && Array.isArray(data.skills) && data.skills.length > 0;
    const hasTimeline = data.timeline && Array.isArray(data.timeline) && data.timeline.length > 0;
    const hasPersonal = data.personal && data.personal.photo;
    
    // Si aucune donnée significative, considérer comme vide
    const isEmpty = !hasProjects && !hasSkills && !hasTimeline && !hasPersonal;
    
    if (isEmpty) {
      console.log('🔍 Données détectées comme vides:', {
        hasProjects,
        hasSkills,
        hasTimeline,
        hasPersonal,
        projectsCount: data.projects?.length || 0,
        skillsCount: data.skills?.length || 0,
        timelineCount: data.timeline?.length || 0,
        hasPhoto: !!data.personal?.photo
      });
    }
    
    return isEmpty;
  }

  // Load portfolio data from API
  async function loadPortfolioFromAPI() {
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio`);
      if (response.ok) {
        const data = await response.json();
        
        // Vérifier si les données sont vraiment vides
        if (isDataEmpty(data)) {
          console.log('⚠️ API retourne un document vide, vérification localStorage...');
          // Vérifier localStorage
          const existingDataStr = localStorage.getItem('portfolioData');
          if (existingDataStr) {
            try {
              const existingData = JSON.parse(existingDataStr);
              // Vérifier si les données locales sont valides
              const hasValidData = (existingData.projects?.length > 0) || 
                                 (existingData.skills?.length > 0) || 
                                 (existingData.timeline?.length > 0) || 
                                 (existingData.personal?.photo);
              
              if (hasValidData) {
                console.log('✅ Utilisation des données locales valides (API vide)');
                return existingData; // Utiliser les données locales valides
              } else {
                console.log('⚠️ localStorage aussi vide, initialisation des données par défaut');
                // Réinitialiser avec données par défaut
                initDefaultData();
                return null; // Ne pas écraser, les données par défaut sont déjà dans localStorage
              }
            } catch (e) {
              console.log('📦 Erreur parsing localStorage, initialisation des données par défaut');
              initDefaultData();
              return null;
            }
          } else {
            console.log('📦 localStorage vide, initialisation des données par défaut');
            initDefaultData();
            return null;
          }
        }
        
        // Supprimer les champs MongoDB (_id, __v, etc.)
        const cleanData = {
          personal: data.personal || {},
          projects: data.projects || [],
          skills: data.skills || [],
          links: data.links || {},
          about: data.about || {},
          timeline: data.timeline || [],
          services: data.services || [],
          certifications: data.certifications || [],
          contactMessages: data.contactMessages || [],
          faq: data.faq || []
        };
        
        // TOUJOURS accepter et sauvegarder les données de l'API
        // Cela permet la synchronisation admin → public même avec des données partielles
        console.log('🔄 Mise à jour localStorage avec données API (même si partielles)');
        
        // Vérifier quand même si on a au moins des données de base
        const hasMinimalData = cleanData.personal?.fullName || 
                              cleanData.personal?.email ||
                              cleanData.projects?.length >= 0 || // 0 est valide (portfolio vide)
                              cleanData.skills?.length >= 0;    // 0 est valide (compétences vides)
        
        if (!hasMinimalData) {
          console.warn('⚠️ API retourne vraiment rien, fallback localStorage');
          const existingDataStr = localStorage.getItem('portfolioData');
          if (existingDataStr) {
            try {
              return JSON.parse(existingDataStr);
            } catch (e) {
              console.log('🔧 localStorage corrompu, initialisation défaut');
              initDefaultData();
              return null;
            }
          }
        }
        
        // SYNCHRONISATION FORCÉE : Toujours sauvegarder les données API dans localStorage
        // Cela permet aux compétences ajoutées via admin d'être visibles publiquement
        console.log('💾 Synchronisation forcée API → localStorage pour affichage public');
        
        // Sauvegarder dans localStorage comme cache seulement si les données sont valides
        localStorage.setItem('portfolioData', JSON.stringify(cleanData));
        localStorage.setItem('portfolioLastUpdate', new Date().toISOString());
        
        console.log('✅ Données chargées depuis l\'API:', {
          projects: cleanData.projects.length,
          skills: cleanData.skills.length,
          timeline: cleanData.timeline.length
        });
        return cleanData;
    } else {
        console.log('⚠️ Impossible de charger depuis l\'API, utilisation du cache local');
        return null;
      }
    } catch (error) {
      console.log('⚠️ Erreur réseau, utilisation du cache local:', error);
      return null;
    }
  }
  
  // Fonction pour recharger toutes les données
  function reloadAllData() {
    setTimeout(() => {
      if (typeof loadProjects === 'function') loadProjects();
      if (typeof loadTimeline === 'function') loadTimeline();
      if (typeof loadSkills === 'function') loadSkills();
      if (typeof loadAboutPageContent === 'function') loadAboutPageContent();
      if (typeof loadHomepageProjects === 'function') loadHomepageProjects();
      if (typeof loadHomepageSkills === 'function') loadHomepageSkills();
    }, 100);
  }

  // Initialize default data if localStorage is empty (for first-time visitors on Render)
  function initDefaultData() {
    // DONNÉES PAR DÉFAUT COMPLETES POUR LE PORTFOLIO
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
          title: 'Portfolio Personnel',
          type: 'Projet Personnel',
          category: 'Application Web',
          shortDesc: 'Site web portfolio avec interface d\'administration complète et gestion de contenu dynamique',
          description: 'Portfolio personnel développé avec HTML, CSS et JavaScript vanilla. Le site comprend une interface d\'administration complète permettant de gérer dynamiquement tous les contenus : projets, compétences, parcours, témoignages, services, certifications et FAQ.\n\nLe système utilise localStorage pour la persistance des données côté client et offre une expérience utilisateur moderne avec des animations fluides, un design responsive et une navigation intuitive. L\'interface d\'administration permet d\'ajouter, modifier et supprimer du contenu sans connaissances techniques.\n\nLe portfolio démontre les compétences en développement front-end, UX/UI design, et gestion d\'état d\'application.',
          features: [
            'Interface d\'administration complète (CRUD)',
            'Gestion dynamique des projets avec filtres et recherche',
            'Système de compétences organisées par catégories',
            'Timeline interactive du parcours professionnel',
            'Gestion des témoignages et avis clients',
            'Section services et certifications',
            'FAQ dynamique',
            'Design responsive et moderne',
            'Animations et transitions fluides',
            'Persistance des données avec localStorage',
            'Optimisation SEO et performance'
          ],
          tags: ['HTML5', 'CSS3', 'JavaScript', 'Responsive', 'Portfolio', 'Admin Panel', 'CRUD', 'localStorage', 'Animations', 'SEO'],
          link: '',
          demoLink: '',
          emailSubject: 'Demande d\'infos: Portfolio Personnel',
          featured: true,
          public: true
        }
      ],
      skills: [
        {
          name: 'Développement Web',
          icon: '🌐',
          skills: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Node.js', 'Responsive Design', 'SCSS/SASS', 'TypeScript']
        },
        {
          name: 'Backend & DevOps',
          icon: '🐍',
          skills: ['Python', 'Django', 'Flask', 'FastAPI', 'MongoDB', 'PostgreSQL', 'Docker', 'Git', 'CI/CD']
        },
        {
          name: 'IA & Données',
          icon: '🤖',
          skills: ['Machine Learning', 'NLP', 'OpenAI API', 'TensorFlow', 'Pandas', 'NumPy', 'Scikit-learn', 'Data Analysis']
        },
        {
          name: 'Outils & Méthodologies',
          icon: '🛠️',
          skills: ['Agile/Scrum', 'Git/GitHub', 'VS Code', 'Postman', 'Figma', 'Adobe XD', 'Jira', 'Trello']
        }
      ],
      links: {
        cv: 'assets/CV.pdf',
        social: []
      },
      about: {
        heroDescription: 'Master 1 en Intelligence Artificielle à l\'École Supérieure d\'Informatique de Paris. Titulaire d\'une licence en mathématiques et informatique (USMBA Fès).',
        aboutDescription: 'Passionné par le développement web et l\'intelligence artificielle, je crée des applications modernes et performantes qui résolvent des problèmes réels. Mon expertise couvre le développement full-stack, l\'IA, et le DevOps.\n\nAvec une formation solide en mathématiques et informatique, combinée à une expérience pratique dans divers projets, je suis capable de transformer des idées complexes en solutions technologiques concrètes. Mon approche méthodique et ma curiosité constante me permettent de rester à la pointe des technologies émergentes.',
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
          description: 'Spécialisation en IA, Machine Learning et traitement du langage naturel. Réalisation de projets majeurs incluant des applications cloud et des assistants pédagogiques IA.'
        },
        {
          date: '2021 - 2025',
          title: 'Licence en Mathématiques et Informatique',
          subtitle: 'Université Sidi Mohamed Ben Abdallah (USMBA) - Fès',
          description: 'Formation complète en mathématiques appliquées et informatique. Développement de compétences solides en algorithmique, structures de données, et programmation orientée objet.'
        },
        {
          date: '2023 - 2024',
          title: 'Projet de Fin d\'Études (Licence)',
          subtitle: 'Analyse de sentiments des tweets en temps réel',
          description: 'Développement d\'un système d\'analyse de sentiments utilisant ChatGPT et MongoDB pour traiter des flux de tweets en temps réel. Projet récompensé pour son innovation technique.'
        },
        {
          date: '2024',
          title: 'Développement d\'Applications Web',
          subtitle: 'Projets personnels - Kairos & Fylor',
          description: 'Création de deux applications web complètes : Kairos (plateforme d\'apprentissage avec IA) et Fylor (stockage cloud 50Go). Démonstration des compétences en développement full-stack.'
        }
      ],
      services: [],
      certifications: [],
      contactMessages: [],
      faq: []
    };

    try {
      console.log('📦 Initialisation portfolio avec données complètes...');
      localStorage.setItem('portfolioData', JSON.stringify(DEFAULT_DATA));
      localStorage.setItem('portfolioLastUpdate', new Date().toISOString());
      console.log('✅ Portfolio avec données d\'exemple initialisé !');
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      return false;
    }
  }

  // Portfolio VIDE maintenant valide - pas d'initialisation automatique

  // Mobile Menu Toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

  // Ensure body overflow is reset on page load (in case of previous error)
  if (document.body) {
    document.body.style.overflow = '';
  }

  if (mobileMenuToggle && navLinks) {
    function toggleMobileMenu() {
      const isOpen = navLinks.classList.contains('active');
      navLinks.classList.toggle('active');
      mobileMenuToggle.classList.toggle('active');
      if (mobileMenuOverlay) mobileMenuOverlay.classList.toggle('active');
      mobileMenuToggle.setAttribute('aria-expanded', !isOpen);
    }

    mobileMenuToggle.addEventListener('click', toggleMobileMenu);

    // Close mobile menu when clicking outside
    if (mobileMenuOverlay) {
      mobileMenuOverlay.addEventListener('click', function() {
        if (navLinks.classList.contains('active')) {
          toggleMobileMenu();
        }
      });
    }
  }

  // FONCTIONS D'AFFICHAGE RESTAURÉES
  
  // Load projects into projects grid
  function loadProjects() {
    const data = JSON.parse(localStorage.getItem('portfolioData') || '{}');
    const projects = data.projects || [];
    
    const projectsGrid = document.getElementById('projects-grid');
    if (projectsGrid) {
      if (projects.length === 0) {
        projectsGrid.innerHTML = '<div class="card" style="text-align: center; padding: 32px; grid-column: 1/-1;"><h3>Aucun projet pour le moment</h3><p class="muted">Les projets ajoutés via l\'admin apparaîtront ici.</p></div>';
      } else {
        projectsGrid.innerHTML = projects.map(project => `
          <div class="card project-card" data-scroll-reveal="bottom">
            <h3>${project.title}</h3>
            <p class="muted">${project.shortDesc || project.description}</p>
            <div class="tech-tags">
              ${(project.tags || []).map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
            </div>
          </div>
        `).join('');
      }
    }
    
    // Update project stats
    document.getElementById('total-projects-count')?.setAttribute('data-count', projects.length);
    document.getElementById('featured-projects-count')?.setAttribute('data-count', projects.filter(p => p.featured).length);
    document.getElementById('visible-projects-count')?.setAttribute('data-count', projects.filter(p => p.public !== false).length);
  }

  // Load skills into about page
  function loadSkills() {
    const data = JSON.parse(localStorage.getItem('portfolioData') || '{}');
    const skills = data.skills || [];
    
    const skillsContainer = document.getElementById('about-skills');
    if (skillsContainer) {
      if (skills.length === 0) {
        skillsContainer.innerHTML = '<div class="card" style="text-align: center; padding: 32px; grid-column: 1/-1;"><h3>Aucune compétence ajoutée</h3><p class="muted">Les compétences ajoutées via l\'admin apparaîtront ici.</p></div>';
      } else {
        skillsContainer.innerHTML = skills.map(skill => `
          <div class="card skill-card" data-scroll-reveal="bottom">
            <div style="text-align: center; font-size: 48px; margin-bottom: 16px;">${skill.icon || '💻'}</div>
            <h3 style="text-align: center; margin-bottom: 12px;">${skill.name}</h3>
            <div class="skill-list">
              ${(skill.skills || []).map(s => `<span class="tech-tag">${s}</span>`).join('')}
            </div>
          </div>
        `).join('');
      }
    }
  }

  // Load timeline into about page
  function loadTimeline() {
    const data = JSON.parse(localStorage.getItem('portfolioData') || '{}');
    const timeline = data.timeline || [];
    
    const timelineContainer = document.getElementById('about-timeline');
    if (timelineContainer) {
      if (timeline.length === 0) {
        timelineContainer.innerHTML = '<div class="card" style="text-align: center; padding: 32px;"><h3>Aucun élément de parcours</h3><p class="muted">Le parcours ajouté via l\'admin apparaîtra ici.</p></div>';
      } else {
        timelineContainer.innerHTML = timeline.map((item, index) => `
          <div class="timeline-item" data-scroll-reveal="left" style="animation-delay: ${index * 0.1}s">
            <div class="timeline-content">
              <div class="timeline-date">${item.date}</div>
              <h3>${item.title}</h3>
              <h4 class="muted">${item.subtitle}</h4>
              <p>${item.description}</p>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // Load about page content
  function loadAboutPageContent() {
    const data = JSON.parse(localStorage.getItem('portfolioData') || '{}');
    
    // Update about description
    const aboutDesc = document.getElementById('about-description-content');
    if (aboutDesc && data.about?.aboutDescription) {
      aboutDesc.innerHTML = `<p>${data.about.aboutDescription}</p>`;
    }
    
    // Load skills and timeline
    loadSkills();
    loadTimeline();
  }

  // Load recent projects on homepage
  function loadHomepageProjects() {
    const data = JSON.parse(localStorage.getItem('portfolioData') || '{}');
    const projects = data.projects || [];
    
    const homepageProjectsContainer = document.getElementById('homepage-projects');
    if (homepageProjectsContainer) {
      if (projects.length === 0) {
        homepageProjectsContainer.innerHTML = '<div class="card" style="text-align: center; padding: 32px; grid-column: 1/-1;"><h3>Mes projets apparaîtront ici</h3><p class="muted">Les projets ajoutés via l\'admin seront affichés dynamiquement.</p><a href="projects.html" class="btn secondary" style="margin-top: 16px;">Voir tous les projets</a></div>';
      } else {
        // Show only first 4 projects on homepage
        const recentProjects = projects.slice(0, 4);
        let projectsHtml = recentProjects.map(project => `
          <div class="card project-card" data-scroll-reveal="bottom">
            <h3>${project.title}</h3>
            <p class="muted">${project.shortDesc || project.description}</p>
            <div class="tech-tags">
              ${(project.tags || []).map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
            </div>
          </div>
        `).join('');
        
        // Add "See all projects" button if there are more than 4 projects
        if (projects.length > 4) {
          projectsHtml += '<div class="card" style="display: flex; align-items: center; justify-content: center; text-align: center; padding: 32px;"><a href="projects.html" class="btn">Voir tous les projets</a></div>';
        } else if (projects.length > 0) {
          // Add link to projects page even if we show all projects
          projectsHtml += '<div class="card" style="display: flex; align-items: center; justify-content: center; text-align: center; padding: 32px; grid-column: span 2;"><a href="projects.html" class="btn secondary">Gérer mes projets</a></div>';
        }
        
        homepageProjectsContainer.innerHTML = projectsHtml;
      }
    }
  }

  // Load skills on homepage
  function loadHomepageSkills() {
    const data = JSON.parse(localStorage.getItem('portfolioData') || '{}');
    const skills = data.skills || [];
    
    const homepageSkillsContainer = document.getElementById('homepage-skills');
    if (homepageSkillsContainer) {
      if (skills.length === 0) {
        homepageSkillsContainer.innerHTML = '<div class="card" style="text-align: center; padding: 32px; grid-column: 1/-1;"><h3>Mes compétences apparaîtront ici</h3><p class="muted">Les compétences ajoutées via l\'admin seront affichées dynamiquement.</p></div>';
      } else {
        // Show only first 3 skills on homepage
        const recentSkills = skills.slice(0, 3);
        let skillsHtml = recentSkills.map(skill => `
          <div class="card skill-card" data-scroll-reveal="bottom">
            <div style="text-align: center; font-size: 48px; margin-bottom: 16px;">${skill.icon || '💻'}</div>
            <h3 style="text-align: center; margin-bottom: 12px;">${skill.name}</h3>
            <div class="skill-list">
              ${(skill.skills || []).map(s => `<span class="tech-tag">${s}</span>`).join('')}
            </div>
          </div>
        `).join('');
        
        // Add "See all skills" button if needed
        if (skills.length > 3) {
          skillsHtml += '<div class="card" style="display: flex; align-items: center; justify-content: center; text-align: center; padding: 32px;"><a href="about.html" class="btn secondary">Voir toutes mes compétences</a></div>';
        } else if (skills.length > 0) {
          // Add link to about page even if we show all skills
          skillsHtml += '<div class="card" style="display: flex; align-items: center; justify-content: center; text-align: center; padding: 32px; grid-column: span 3;"><a href="about.html" class="btn secondary">En savoir plus sur moi</a></div>';
        }
        
        homepageSkillsContainer.innerHTML = skillsHtml;
      }
    }
  }

  // Load and display portfolio data on page load
  // Fonction pour afficher les erreurs à l'utilisateur
  function showUserError(message, isTemporary = true) {
    // Créer ou réutiliser un container d'erreur
    let errorContainer = document.getElementById('user-error-notification');
    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.id = 'user-error-notification';
      errorContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        font-family: Arial, sans-serif;
      `;
      document.body.appendChild(errorContainer);
    }
    
    errorContainer.innerHTML = `
      <strong>⚠️ Erreur</strong><br>
      ${message}
      <br><br>
      <button onclick="this.parentElement.remove()" style="background: white; color: #ff4444; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
        Fermer
      </button>
    `;
    
    // Auto-fermer après 10 secondes si temporaire
    if (isTemporary) {
      setTimeout(() => {
        if (errorContainer.parentElement) {
          errorContainer.remove();
        }
      }, 10000);
    }
  }

  async function loadAndDisplayData() {
    try {
      const data = await loadPortfolioFromAPI();
      if (data) {
        console.log('✅ Portfolio data loaded successfully');
        
        // Immediately update displays after loading data
        setTimeout(() => {
          loadProjects();
          loadAboutPageContent();
          loadHomepageProjects();
          loadHomepageSkills();
        }, 100);
      } else {
        // Aucune donnée chargée - afficher message d'info à l'utilisateur
        showUserError('Impossible de charger les données du portfolio. Le contenu affiché peut être incomplet.', true);
      }
    } catch (error) {
      console.error('❌ Error loading portfolio:', error);
      showUserError('Erreur de connexion au serveur. Veuillez vérifier votre connexion internet et rafraîchir la page.', false);
    }
  }

  // Share portfolio function (called from HTML buttons)
  window.sharePortfolio = function(platform) {
    const url = window.location.href;
    const title = document.title;
    let shareUrl = '';
    
    switch(platform) {
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent('Découvrez le portfolio de Nema Elisée Kourouma : ' + url)}`;
        break;
      default:
        console.warn('Plateforme de partage inconnue:', platform);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }
  };

  // Initialize on page load
  loadAndDisplayData();

}); // End of DOMContentLoaded