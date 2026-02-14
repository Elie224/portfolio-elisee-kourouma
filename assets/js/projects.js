/*
 * Gestion des Projets - Portfolio
 * Script dédié pour l'affichage et la gestion des projets avec animations
 */

document.addEventListener('DOMContentLoaded', function() {
  
  // Configuration du serveur backend
  // Configuration centralisée pour faciliter la maintenance
  const MON_SERVEUR = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://portfolio-backend-elisee.fly.dev/api';
  
  // Utilitaires pour les logs (uniquement en développement)
  const estEnDeveloppement = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const log = estEnDeveloppement ? console.log.bind(console) : () => {};
  const logError = estEnDeveloppement ? console.error.bind(console) : () => {};
  const logWarn = estEnDeveloppement ? console.warn.bind(console) : () => {};
  
  let allProjects = [];
  let filteredProjects = [];
  let currentView = 'grid'; // 'grid' ou 'list'
  
  // État de chargement
  let isLoading = true;
  
  function fetchAvecTimeout(url, options = {}, timeout = 4000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    return fetch(url, { ...options, signal: controller.signal })
      .finally(() => clearTimeout(id));
  }
  /* ===== CHARGEMENT DES PROJETS ===== */
  
  async function chargerProjets() {
    try {
      isLoading = true;
      afficherLoading();
      
      let projetsCharges = [];
      
      // Essayer de charger depuis le serveur
      try {
        const reponse = await fetchAvecTimeout(`${MON_SERVEUR}/portfolio`, {}, 4000);
        if (reponse.ok) {
          const donnees = await reponse.json();
          projetsCharges = donnees.projects || [];
          log('✅ Projets chargés depuis le serveur:', projetsCharges.length);
          
          // Sauvegarder dans localStorage comme backup
          if (projetsCharges.length > 0) {
            const portfolioData = JSON.parse(localStorage.getItem('portfolioData') || '{}');
            portfolioData.projects = projetsCharges;
            localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
          }
        }
      } catch (erreur) {
        log('⚠️ Serveur non disponible, utilisation du localStorage');
      }
      
      // Si pas de projets depuis le serveur, utiliser localStorage
      if (projetsCharges.length === 0) {
        const portfolioData = localStorage.getItem('portfolioData');
        if (portfolioData) {
          try {
            const donnees = JSON.parse(portfolioData);
            projetsCharges = donnees.projects || [];
            log('✅ Projets chargés depuis localStorage:', projetsCharges.length);
          } catch (e) {
            logError('Erreur parsing localStorage:', e);
          }
        }
      }

      // S'assurer que c'est un tableau
      if (!Array.isArray(projetsCharges)) {
        projetsCharges = [];
      }
      
      // Filtrer les projets publics (sauf si admin)
      const isAdmin = (() => {
        const session = localStorage.getItem('adminSession');
        if (session) {
          try {
            const sessionData = JSON.parse(session);
            const now = new Date().getTime();
            return sessionData.expires && now < sessionData.expires;
          } catch (e) {
            return false;
          }
        }
        return false;
      })();
      
      if (!isAdmin) {
        allProjects = projetsCharges.filter(p => p.public !== false);
      } else {
        allProjects = projetsCharges;
      }
      
      log('📊 Projets finaux à afficher:', allProjects.length);
      
      isLoading = false;
      filteredProjects = [...allProjects];
      
      mettreAJourStats();
      afficherProjets();
      
    } catch (erreur) {
      logError('❌ Erreur lors du chargement des projets:', erreur);
      isLoading = false;
      afficherErreur();
    }
  }

  // Sécurité : si le chargement reste bloqué, forcer l'affichage avec le fallback
  function forcerAffichageFallback() {
    if (!isLoading) return;
    logWarn('⏱️ Chargement trop long, affichage du fallback projets');
    isLoading = false;
    allProjects = PROJETS_FALLBACK;
    filteredProjects = [...allProjects];
    mettreAJourStats();
    afficherProjets();
  }
  
  /* ===== AFFICHAGE DES PROJETS ===== */
  
  function afficherProjets() {
    const container = document.getElementById('projects-grid');
    const emptyState = document.getElementById('empty-state');
    const loadingState = document.getElementById('projects-loading');
    
    if (!container) {
      logError('❌ Container projects-grid non trouvé');
      return;
    }
    
    // Masquer le loading
    if (loadingState) {
      loadingState.style.display = 'none';
    }
    
    log('📋 Affichage de', filteredProjects.length, 'projets');
    
    // Si aucun projet
    if (filteredProjects.length === 0) {
      container.style.display = 'none';
      if (emptyState) emptyState.style.display = 'none';
      mettreAJourCompteur();
      return;
    }
    
    // Afficher la grille
    container.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';
    
    // Générer le HTML des projets
    container.innerHTML = filteredProjects.map((projet, index) => 
      creerCarteProjet(projet, index)
    ).join('');
    
    // Animer l'apparition
    setTimeout(() => {
      animerApparitionProjets();
    }, 100);
    
    // Mettre à jour le compteur
    mettreAJourCompteur();
  }

  // Forcer le contenu de l'état vide pour ne pas afficher d'appel admin sur la page publique
  function normaliserEmptyState() {
    const emptyState = document.getElementById('empty-state');
    if (!emptyState) return;
    emptyState.innerHTML = '';
  }
  
  function creerCarteProjet(projet, index) {
    // Gérer différents formats de données
    const tags = projet.tags || projet.technologies || [];
    const type = projet.type || 'Projet Personnel';
    const featured = projet.featured ? '⭐' : '';
    const description = projet.description || projet.shortDesc || '';
    const shortDesc = projet.shortDesc || (description.length > 120 ? description.substring(0, 120) + '...' : description) || 'Aucune description disponible';
    
    // Badge de type avec couleur
    const typeColors = {
      'Projet Majeur': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Projet de cours': 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)',
      'PFE Master': 'linear-gradient(135deg, #c471ed 0%, #f64f59 100%)',
      'PFE Licence': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'PFA': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'Projet Personnel': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'Contrat': 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      'Apprentissage': 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
    };
    
    const typeColor = typeColors[type] || typeColors['Projet Personnel'];
    const projectTitle = projet.title || 'Projet sans titre';
    const projectUrl = `project-details.html?project=${encodeURIComponent(projectTitle)}`;
    const docDisponible = projet.docAvailable === true;
    
    return `
      <article class="project-card-modern" data-project-index="${index}" style="animation-delay: ${index * 0.1}s">
        <div class="project-card-header">
          <div class="project-type-badge" style="background: ${typeColor}">
            ${type} ${featured}
          </div>
          ${projet.featured ? '<span class="featured-badge">⭐ En vedette</span>' : ''}
        </div>
        
        <div class="project-card-content">
          <h3 class="project-title">
            <a href="${projectUrl}" class="project-link">
              ${projectTitle}
            </a>
          </h3>
          
          <p class="project-description">${shortDesc}</p>
          
          ${tags.length > 0 ? `
            <div class="project-tags">
              ${tags.slice(0, 5).map(tag => `
                <span class="project-tag">${tag}</span>
              `).join('')}
              ${tags.length > 5 ? `<span class="project-tag-more">+${tags.length - 5}</span>` : ''}
            </div>
          ` : ''}
        </div>
        
        <div class="project-card-footer">
          <div class="project-actions">
            ${projet.link || projet.liveUrl ? `
              <a href="${projet.link || projet.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn-project btn-live">
                🌐 Voir le projet
              </a>
            ` : ''}
            ${projet.demoLink || projet.githubUrl ? `
              <a href="${projet.demoLink || projet.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn-project btn-code">
                💻 Code source
              </a>
            ` : ''}
            <a href="${projectUrl}" class="btn-project btn-details">
              📖 Détails
            </a>
            ${docDisponible ? `
              <button class="btn-project btn-secondary" type="button" data-doc-request="${encodeURIComponent(projectTitle)}">
                📂 Demander le doc
              </button>
            ` : ''}
          </div>
        </div>
      </article>
    `;
  }
  
  function afficherLoading() {
    const container = document.getElementById('projects-grid');
    const loadingState = document.getElementById('projects-loading');
    const emptyState = document.getElementById('empty-state');
    
    if (container) container.style.display = 'none';
    if (loadingState) {
      loadingState.style.display = 'block';
      loadingState.style.opacity = '1';
    }
    if (emptyState) emptyState.style.display = 'none';
  }
  
  function afficherErreur() {
    const container = document.getElementById('projects-grid');
    const loadingState = document.getElementById('projects-loading');
    const emptyState = document.getElementById('empty-state');
    
    if (container) {
      container.style.display = 'grid';
      container.innerHTML = `
        <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div style="font-size: 64px; margin-bottom: 20px; animation: pulse 2s ease-in-out infinite;">⚠️</div>
          <h3 style="margin-bottom: 12px; color: var(--accent);">Erreur de chargement</h3>
          <p class="muted" style="margin-bottom: 24px; max-width: 500px; margin-left: auto; margin-right: auto;">
            Impossible de charger les projets depuis le serveur. Vérifiez votre connexion ou réessayez plus tard.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button class="btn" onclick="location.reload()">🔄 Recharger la page</button>
          </div>
        </div>
      `;
    }
    
    if (loadingState) loadingState.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
  }
  
  /* ===== ANIMATIONS ===== */
  
  function animerApparitionProjets() {
    const projets = document.querySelectorAll('.project-card-modern');
    
    projets.forEach((projet, index) => {
      projet.style.opacity = '0';
      projet.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        projet.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        projet.style.opacity = '1';
        projet.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }
  
  function animerCompteur(element, valeurFinale) {
    const duree = 1500;
    const debut = performance.now();
    const valeurInitiale = parseInt(element.textContent) || 0;
    
    function animer(tempsActuel) {
      const tempsEcoule = tempsActuel - debut;
      const progres = Math.min(tempsEcoule / duree, 1);
      const valeurActuelle = Math.floor(progres * (valeurFinale - valeurInitiale) + valeurInitiale);
      
      element.textContent = valeurActuelle;
      
      if (progres < 1) {
        requestAnimationFrame(animer);
      } else {
        element.textContent = valeurFinale;
      }
    }
    
    requestAnimationFrame(animer);
  }
  
  /* ===== STATISTIQUES ===== */
  
  function mettreAJourStats() {
    const total = allProjects.length;
    const featured = allProjects.filter(p => p.featured).length;
    const visible = filteredProjects.length;
    
    const totalEl = document.getElementById('total-projects-count');
    const featuredEl = document.getElementById('featured-projects-count');
    const visibleEl = document.getElementById('visible-projects-count');
    
    if (totalEl) animerCompteur(totalEl, total);
    if (featuredEl) animerCompteur(featuredEl, featured);
    if (visibleEl) animerCompteur(visibleEl, visible);
  }
  
  function mettreAJourCompteur() {
    const countEl = document.getElementById('visible-count');
    if (countEl) {
      countEl.textContent = filteredProjects.length;
    }
  }
  
  /* ===== FILTRES ET RECHERCHE ===== */
  
  function configurerFiltres() {
    const searchInput = document.getElementById('project-search');
    const typeFilter = document.getElementById('project-type-filter');
    const sortSelect = document.getElementById('project-sort');
    const clearBtn = document.getElementById('clear-filters');
    const clearBtnEmpty = document.getElementById('clear-filters-empty');
    
    function appliquerFiltres() {
      let resultats = [...allProjects];
      
      // Filtre par recherche
      const searchTerm = searchInput?.value.toLowerCase().trim() || '';
      if (searchTerm) {
        resultats = resultats.filter(projet => {
          const titre = (projet.title || '').toLowerCase();
          const desc = (projet.description || '').toLowerCase();
          const tags = (projet.tags || []).join(' ').toLowerCase();
          return titre.includes(searchTerm) || desc.includes(searchTerm) || tags.includes(searchTerm);
        });
      }
      
      // Filtre par type
      const typeSelected = typeFilter?.value || '';
      if (typeSelected) {
        resultats = resultats.filter(projet => projet.type === typeSelected);
      }
      
      // Tri
      const sortType = sortSelect?.value || 'default';
      switch (sortType) {
        case 'featured':
          resultats.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          break;
        case 'recent':
          resultats.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
          break;
        case 'name':
          resultats.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
          break;
      }
      
      filteredProjects = resultats;
      afficherProjets();
    }
    
    // Événements
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(appliquerFiltres, 300);
      });
    }
    
    if (typeFilter) typeFilter.addEventListener('change', appliquerFiltres);
    if (sortSelect) sortSelect.addEventListener('change', appliquerFiltres);
    
    function effacerFiltres() {
      if (searchInput) searchInput.value = '';
      if (typeFilter) typeFilter.value = '';
      if (sortSelect) sortSelect.value = 'default';
      appliquerFiltres();
    }
    
    if (clearBtn) clearBtn.addEventListener('click', effacerFiltres);
    if (clearBtnEmpty) clearBtnEmpty.addEventListener('click', effacerFiltres);
  }
  
  /* ===== TOGGLE VUE ===== */
  
  function configurerToggleVue() {
    const toggleBtn = document.getElementById('view-toggle');
    const viewIcon = document.getElementById('view-icon');
    const grid = document.getElementById('projects-grid');
    
    if (!toggleBtn || !grid) return;
    
    toggleBtn.addEventListener('click', () => {
      currentView = currentView === 'grid' ? 'list' : 'grid';
      
      if (currentView === 'list') {
        grid.classList.add('projects-list-view');
        if (viewIcon) viewIcon.textContent = '📊';
        toggleBtn.querySelector('span:last-child').textContent = ' Vue grille';
      } else {
        grid.classList.remove('projects-list-view');
        if (viewIcon) viewIcon.textContent = '📋';
        toggleBtn.querySelector('span:last-child').textContent = ' Vue liste';
      }
      
      // Réanimer
      setTimeout(() => animerApparitionProjets(), 100);
    });
  }

  /* ===== DEMANDE DE DOCUMENT PROTÉGÉ ===== */

  let docModalElements = null;
  let projetDocCourant = null;

  function initialiserModalDoc() {
    docModalElements = {
      overlay: document.getElementById('doc-request-overlay'),
      modal: document.getElementById('doc-request-modal'),
      closeBtn: document.getElementById('doc-request-close'),
      cancelBtn: document.getElementById('doc-request-cancel'),
      submitBtn: document.getElementById('doc-request-submit'),
      form: document.getElementById('doc-request-form'),
      projectLabel: document.getElementById('doc-request-project'),
      firstname: document.getElementById('doc-firstname'),
      lastname: document.getElementById('doc-lastname'),
      email: document.getElementById('doc-email'),
      status: document.getElementById('doc-request-status')
    };

    if (!docModalElements.form || !docModalElements.overlay || !docModalElements.modal) {
      logWarn('Modal de demande de document introuvable dans le DOM');
      return;
    }

    const fermer = () => {
      if (docModalElements.overlay) docModalElements.overlay.style.display = 'none';
      if (docModalElements.modal) docModalElements.modal.style.display = 'none';
      projetDocCourant = null;
    };

    const ouvrir = () => {
      if (docModalElements.overlay) docModalElements.overlay.style.display = 'block';
      if (docModalElements.modal) docModalElements.modal.style.display = 'flex';
    };

    window.openDocRequest = function(titreEncode) {
      const titre = decodeURIComponent(titreEncode || '');
      projetDocCourant = titre;
      if (docModalElements.projectLabel) {
        docModalElements.projectLabel.textContent = titre ? `Projet : ${titre}` : '';
      }
      if (docModalElements.status) docModalElements.status.textContent = '';
      if (docModalElements.form) docModalElements.form.reset();
      ouvrir();
    };

    const validerEmail = (email) => /\S+@\S+\.\S+/.test(email);

    docModalElements.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!projetDocCourant) return;
      const firstName = docModalElements.firstname?.value.trim() || '';
      const lastName = docModalElements.lastname?.value.trim() || '';
      const email = docModalElements.email?.value.trim() || '';
      if (!email || !validerEmail(email)) {
        if (docModalElements.status) docModalElements.status.textContent = 'Email invalide';
        return;
      }

      if (docModalElements.submitBtn) {
        docModalElements.submitBtn.disabled = true;
        docModalElements.submitBtn.textContent = 'Envoi...';
      }
      if (docModalElements.status) docModalElements.status.textContent = '';

      try {
        const reponse = await fetch(`${MON_SERVEUR}/portfolio/projects/${encodeURIComponent(projetDocCourant)}/request-doc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName, lastName, email })
        });
        const resultat = await reponse.json().catch(() => ({}));
        if (reponse.ok) {
          if (docModalElements.status) {
            docModalElements.status.textContent = 'Lien envoyé par email. Pensez à vérifier vos spams.';
            docModalElements.status.style.color = 'var(--accent)';
          }
          setTimeout(fermer, 1200);
        } else {
          const msg = resultat.error || 'Envoi impossible pour le moment.';
          if (docModalElements.status) {
            docModalElements.status.textContent = msg;
            docModalElements.status.style.color = 'var(--danger, #f87171)';
          }
        }
      } catch (err) {
        logError('Erreur envoi demande doc:', err);
        if (docModalElements.status) {
          docModalElements.status.textContent = 'Erreur réseau, réessayez.';
          docModalElements.status.style.color = 'var(--danger, #f87171)';
        }
      } finally {
        if (docModalElements.submitBtn) {
          docModalElements.submitBtn.disabled = false;
          docModalElements.submitBtn.textContent = 'Envoyer le lien';
        }
      }
    });

    const fermerEtReset = () => {
      fermer();
      if (docModalElements.form) docModalElements.form.reset();
      if (docModalElements.status) {
        docModalElements.status.textContent = '';
        docModalElements.status.style.color = 'var(--muted)';
      }
    };

    if (docModalElements.closeBtn) docModalElements.closeBtn.addEventListener('click', fermerEtReset);
    if (docModalElements.cancelBtn) docModalElements.cancelBtn.addEventListener('click', fermerEtReset);
    if (docModalElements.overlay) docModalElements.overlay.addEventListener('click', fermerEtReset);
  }
  
  /* ===== INITIALISATION ===== */
  
  function initialiser() {
    log('🚀 Initialisation de la page projets...');
    normaliserEmptyState();
    chargerProjets();
    configurerFiltres();
    configurerToggleVue();
    initialiserModalDoc();
    // Si après 5s rien ne s'affiche, forcer le fallback
    setTimeout(forcerAffichageFallback, 5000);
  }
  
  // Démarrer
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiser);
  } else {
    initialiser();
  }
  
});
