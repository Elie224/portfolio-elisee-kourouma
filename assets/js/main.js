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
    }, 100);
  }

  // Initialize default data if localStorage is empty (for first-time visitors on Render)
  function initDefaultData() {
    // PORTFOLIO COMPLÈTEMENT VIDE - Cohérent avec admin.js et Portfolio.js 
    const DEFAULT_DATA = {
      personal: {
        fullName: 'Nema Elisée Kourouma',
        email: 'kouroumaelisee@gmail.com',
        phone: '',
        photo: 'assets/photo.jpeg',
        currentEducation: 'Master IA',
        previousEducation: 'Licence',
        additionalInfo: []
      },
      projects: [],
      skills: [],
      links: { cv: 'assets/CV.pdf', social: [] },
      about: { heroDescription: 'Master IA', stats: { projects: 0, experience: 2, technologies: 10 } },
      timeline: [],
      services: [],
      certifications: [],
      contactMessages: [],
      faq: []
    };

    try {
      console.log('📦 Initialisation portfolio VIDE...');
      localStorage.setItem('portfolioData', JSON.stringify(DEFAULT_DATA));
      localStorage.setItem('portfolioLastUpdate', new Date().toISOString());
      console.log('✅ Portfolio vide initialisé !');
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

  // Load and display portfolio data on page load
  async function loadAndDisplayData() {
    try {
      const data = await loadPortfolioFromAPI();
      if (data) {
        console.log('✅ Portfolio data loaded successfully');
      }
    } catch (error) {
      console.error('❌ Error loading portfolio:', error);
    }
  }

  // Initialize on page load
  loadAndDisplayData();

}); // End of DOMContentLoaded