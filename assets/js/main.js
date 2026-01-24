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