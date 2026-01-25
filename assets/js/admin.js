/*
 * Administration du Portfolio - Version Complète
 * Gestion complète du portfolio via l'API backend
 * 
 * Fonctionnalités :
 * - Connexion sécurisée avec JWT
 * - Chargement depuis le serveur
 * - Sauvegarde sur le serveur
 * - CRUD complet pour toutes les sections
 * - Gestion des onglets
 * - Formulaires complets
 */

document.addEventListener('DOMContentLoaded', function() {
  
  /* ===== CONFIGURATION ADMIN ===== */
  
  // Utilitaires pour les logs (uniquement en développement)
  const estEnDeveloppement = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const log = estEnDeveloppement ? console.log.bind(console) : () => {};
  const logError = estEnDeveloppement ? console.error.bind(console) : () => {};
  const logWarn = estEnDeveloppement ? console.warn.bind(console) : () => {};
  
  // Adresse de mon serveur
  const MON_SERVEUR = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://portfolio-backend-x47u.onrender.com/api';
  
  // Données actuelles en cours d'édition
  let mesDonneesActuelles = {
    personal: {},
    projects: [],
    skills: [],
    timeline: [],
    certifications: [],
    stages: [],
    alternances: [],
    techEvents: [],
    services: [],
    faq: [],
    links: {},
    about: {}
  };
  
  // État de chargement
  let isLoading = false;
  let currentEditingId = null;
  let selectedItems = {
    projects: new Set(),
    skills: new Set(),
    certifications: new Set(),
    timeline: new Set(),
    services: new Set(),
    faq: new Set()
  };
  
  
  /* ===== CONNEXION ET AUTHENTIFICATION ===== */
  
  // Récupère le token JWT
  function obtenirToken() {
    return localStorage.getItem('adminToken');
  }
  
  // Vérifie si je suis connecté
  function suisJeConnecte() {
    const token = obtenirToken();
    if (!token) return false;
    
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const maintenant = Date.now() / 1000;
      return tokenData.exp > maintenant;
    } catch (erreur) {
      localStorage.removeItem('adminToken');
      return false;
    }
  }
  
  // Affiche la page de connexion
  function afficherConnexion() {
    const pageConnexion = document.getElementById('login-container');
    const dashboard = document.getElementById('admin-dashboard');
    
    if (pageConnexion) pageConnexion.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';
  }
  
  // Affiche le dashboard admin
  function afficherDashboard() {
    const pageConnexion = document.getElementById('login-container');
    const dashboard = document.getElementById('admin-dashboard');
    const emailDisplay = document.getElementById('admin-email-display');
    
    if (pageConnexion) pageConnexion.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
    
    // Afficher l'email de l'admin
    try {
      const token = obtenirToken();
      if (token && emailDisplay) {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        emailDisplay.textContent = tokenData.email || 'Admin';
      }
    } catch (e) {}
    
    chargerToutesMesDonnees();
    mettreAJourStatsDashboard();
  }
  
  // Gère la connexion
  async function seConnecter(e) {
    e.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const motDePasse = document.getElementById('admin-password').value;
    const messageErreur = document.getElementById('login-error');
    
    if (!email || !motDePasse) {
      afficherErreur(messageErreur, 'Veuillez remplir tous les champs');
      return;
    }
    
    try {
      const reponse = await fetch(`${MON_SERVEUR}/portfolio/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: motDePasse })
      });
      
      const resultat = await reponse.json();
      
      if (reponse.ok && resultat.token) {
        localStorage.setItem('adminToken', resultat.token);
        afficherDashboard();
        afficherSucces('Connexion réussie !');
      } else {
        afficherErreur(messageErreur, resultat.error || resultat.message || 'Email ou mot de passe incorrect');
      }
      
    } catch (erreur) {
      afficherErreur(messageErreur, 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
    }
  }
  
  // Déconnexion
  function seDeconnecter() {
    localStorage.removeItem('adminToken');
    afficherConnexion();
    afficherSucces('Déconnexion réussie');
  }
  
  
  /* ===== GESTION DES DONNÉES - SERVEUR ===== */
  
  // Charge toutes mes données depuis le serveur
  async function chargerToutesMesDonnees() {
    if (isLoading) return;
    isLoading = true;
    
    try {
      // Essayer de charger depuis le serveur
      const reponse = await fetch(`${MON_SERVEUR}/portfolio`);
      
      if (reponse.ok) {
        const donnees = await reponse.json();
        mesDonneesActuelles = {
          personal: donnees.personal || {},
          projects: donnees.projects || [],
          skills: donnees.skills || [],
          timeline: donnees.timeline || [],
          certifications: donnees.certifications || [],
          stages: donnees.stages || [],
          alternances: donnees.alternances || [],
          techEvents: donnees.techEvents || [],
          services: donnees.services || [],
          faq: donnees.faq || [],
          links: donnees.links || {},
          about: donnees.about || {}
        };
        
        // Sauvegarder aussi dans localStorage comme backup
        localStorage.setItem('portfolioData', JSON.stringify(mesDonneesActuelles));
        
        afficherToutesMesDonnees();
        afficherSucces('Données chargées depuis le serveur');
      } else {
        // Si erreur serveur, utiliser localStorage
        const donneesLocales = localStorage.getItem('portfolioData');
        if (donneesLocales) {
          mesDonneesActuelles = JSON.parse(donneesLocales);
          afficherToutesMesDonnees();
          afficherErreur(null, 'Serveur indisponible, utilisation des données locales');
        }
      }
    } catch (erreur) {
      logError('Erreur chargement:', erreur);
      // Utiliser localStorage en fallback
      const donneesLocales = localStorage.getItem('portfolioData');
      if (donneesLocales) {
        mesDonneesActuelles = JSON.parse(donneesLocales);
        afficherToutesMesDonnees();
        afficherErreur(null, 'Serveur indisponible, utilisation des données locales');
      }
    } finally {
      isLoading = false;
    }
  }
  
  // Sauvegarde les données sur le serveur
  async function sauvegarderSurServeur() {
    const token = obtenirToken();
    if (!token) {
      afficherErreur(null, 'Vous devez être connecté pour sauvegarder');
      return false;
    }
    
    // Log pour déboguer le CV avant envoi
    if (mesDonneesActuelles.links) {
      log('📤 CV avant envoi au serveur:', {
        hasCv: !!mesDonneesActuelles.links.cv,
        hasCvFile: !!mesDonneesActuelles.links.cvFile,
        cvType: mesDonneesActuelles.links.cv ? (mesDonneesActuelles.links.cv.startsWith('data:') ? 'base64' : 'path') : 'none',
        cvFileType: mesDonneesActuelles.links.cvFile ? (mesDonneesActuelles.links.cvFile.startsWith('data:') ? 'base64' : 'path') : 'none',
        cvFileName: mesDonneesActuelles.links.cvFileName,
        cvSize: mesDonneesActuelles.links.cvFile ? mesDonneesActuelles.links.cvFile.length : 0
      });
    }
    
    try {
      const reponse = await fetch(`${MON_SERVEUR}/portfolio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(mesDonneesActuelles)
      });
      
      const resultat = await reponse.json();
      
      if (reponse.ok) {
        // Vérifier que le CV a bien été sauvegardé
        if (resultat.portfolio && resultat.portfolio.links) {
          const cvSauvegarde = resultat.portfolio.links;
          log('📥 CV retourné par le serveur après sauvegarde:', {
            hasCv: !!cvSauvegarde.cv,
            hasCvFile: !!cvSauvegarde.cvFile,
            cvType: cvSauvegarde.cv ? (cvSauvegarde.cv.startsWith('data:') ? 'base64' : 'path') : 'none',
            cvFileType: cvSauvegarde.cvFile ? (cvSauvegarde.cvFile.startsWith('data:') ? 'base64' : 'path') : 'none',
            cvFileName: cvSauvegarde.cvFileName,
            cvSize: cvSauvegarde.cvFile ? cvSauvegarde.cvFile.length : 0
          });
          
          // Vérifier que le CV base64 a bien été sauvegardé
          if (mesDonneesActuelles.links && mesDonneesActuelles.links.cvFile && mesDonneesActuelles.links.cvFile.startsWith('data:')) {
            if (!cvSauvegarde.cvFile || !cvSauvegarde.cvFile.startsWith('data:')) {
              logError('❌ ERREUR: Le CV base64 n\'a pas été sauvegardé correctement sur le serveur !');
              logError('CV envoyé:', mesDonneesActuelles.links.cvFile.substring(0, 50) + '...');
              logError('CV reçu:', cvSauvegarde.cvFile ? cvSauvegarde.cvFile.substring(0, 50) + '...' : 'undefined');
            } else {
              log('✅ CV base64 confirmé sauvegardé sur le serveur');
            }
          }
          
          // Mettre à jour mesDonneesActuelles avec les données retournées par le serveur
          if (resultat.portfolio.links) {
            mesDonneesActuelles.links = { ...mesDonneesActuelles.links, ...resultat.portfolio.links };
          }
        }
        
        // Sauvegarder aussi dans localStorage avec les données mises à jour
        localStorage.setItem('portfolioData', JSON.stringify(mesDonneesActuelles));
        afficherSucces('Portfolio sauvegardé sur le serveur avec succès !');
        
        // Forcer le rechargement des données sur toutes les pages ouvertes
        if (window.portfolioAPI && window.portfolioAPI.actualiser) {
          // Attendre un peu pour que le serveur ait fini de sauvegarder
          setTimeout(() => {
            log('🔄 Actualisation des pages publiques après sauvegarde...');
            window.portfolioAPI.actualiser();
          }, 500);
        }
        
        return true;
      } else {
        afficherErreur(null, resultat.error || resultat.message || 'Erreur lors de la sauvegarde');
        return false;
      }
    } catch (erreur) {
      logError('Erreur sauvegarde:', erreur);
      afficherErreur(null, 'Impossible de sauvegarder sur le serveur');
      // Sauvegarder quand même dans localStorage
      localStorage.setItem('portfolioData', JSON.stringify(mesDonneesActuelles));
      return false;
    }
  }
  
  
  /* ===== GESTION DES ONGLETS ===== */
  
  // Configure la navigation entre les onglets
  function configurerOnglets() {
    const onglets = document.querySelectorAll('.admin-tab');
    const contenus = document.querySelectorAll('.admin-tab-content');
    
    // Charger les infos des paramètres quand l'onglet est ouvert
    onglets.forEach(onglet => {
      onglet.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        if (tabName === 'settings') {
          chargerInfosParametres();
        }
      });
    });
    
    onglets.forEach(onglet => {
      onglet.addEventListener('click', () => {
        const tabName = onglet.getAttribute('data-tab');
        
        // Désactiver tous les onglets
        onglets.forEach(t => t.classList.remove('active'));
        contenus.forEach(c => c.classList.remove('active'));
        
        // Activer l'onglet cliqué
        onglet.classList.add('active');
        const contenu = document.getElementById(`tab-${tabName}`);
        if (contenu) contenu.classList.add('active');
      });
    });
  }
  
  
  /* ===== AFFICHAGE DES DONNÉES ===== */
  
  // Affiche toutes les données dans l'interface
  function afficherToutesMesDonnees() {
    afficherMesInfosPersonnelles();
    afficherListeProjets();
    afficherListeCompetences();
    afficherListeCertifications();
    afficherListeStages();
    afficherListeAlternances();
    afficherListeTechEvents();
    afficherListeTimeline();
    afficherListeServices();
    afficherListeFAQ();
    chargerInfosParametres();
    afficherInfosAbout();
    afficherLiens();
    mettreAJourStatsDashboard();
  }
  
  
  /* ===== GESTION DES INFORMATIONS PERSONNELLES ===== */
  
  // Affiche mes infos personnelles
  function afficherMesInfosPersonnelles() {
    const personal = mesDonneesActuelles.personal || {};
    
    const fullName = document.getElementById('full-name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const currentEducation = document.getElementById('current-education');
    const previousEducation = document.getElementById('previous-education');
    const photo = document.getElementById('photo');
    
    if (fullName) fullName.value = personal.fullName || '';
    if (email) email.value = personal.email || '';
    if (phone) phone.value = personal.phone || '';
    if (currentEducation) currentEducation.value = personal.currentEducation || '';
    if (previousEducation) previousEducation.value = personal.previousEducation || '';
    if (photo) photo.value = personal.photo || '';
    
    // Afficher la photo si elle existe
    const photoPreview = document.getElementById('photo-preview');
    const photoPlaceholder = document.getElementById('photo-preview-placeholder');
    if (personal.photo) {
      if (photoPreview) {
        photoPreview.src = personal.photo;
        photoPreview.style.display = 'block';
      }
      if (photoPlaceholder) photoPlaceholder.style.display = 'none';
    } else {
      if (photoPreview) photoPreview.style.display = 'none';
      if (photoPlaceholder) photoPlaceholder.style.display = 'flex';
    }
  }
  
  // Sauvegarde les infos personnelles
  async function sauvegarderInfosPersonnelles() {
    mesDonneesActuelles.personal = {
      fullName: document.getElementById('full-name')?.value || '',
      email: document.getElementById('email')?.value || '',
      phone: document.getElementById('phone')?.value || '',
      currentEducation: document.getElementById('current-education')?.value || '',
      previousEducation: document.getElementById('previous-education')?.value || '',
      photo: document.getElementById('photo')?.value || '',
      additionalInfo: mesDonneesActuelles.personal?.additionalInfo || []
    };
    
    await sauvegarderSurServeur();
  }
  
  
  /* ===== GESTION DES PROJETS ===== */
  
  // Affiche la liste des projets
  function afficherListeProjets() {
    const container = document.getElementById('projects-list');
    if (!container) return;
    
    const projets = mesDonneesActuelles.projects || [];
    
    if (projets.length === 0) {
      container.innerHTML = '<p class="muted">Aucun projet pour le moment.</p>';
      return;
    }
    
    container.innerHTML = projets.map((projet, index) => `
      <div class="item-card">
        <input type="checkbox" class="select-checkbox" data-type="projects" data-index="${index}" onchange="toggleItemSelection('projects', ${index}, this.checked)" />
        <h4>${projet.title || 'Projet sans titre'}</h4>
        <p class="item-meta">${projet.type || ''} ${projet.category ? '· ' + projet.category : ''} ${projet.featured ? '· ⭐ En vedette' : ''}</p>
        <p class="muted">${projet.shortDesc || projet.description || 'Pas de description'}</p>
        <div class="item-actions">
          <button class="btn-small" onclick="editProject(${index})" style="display: inline-flex; align-items: center; gap: 6px;">
            <span>✏️</span> Modifier
          </button>
          <button class="btn-small btn-secondary" onclick="deleteProject(${index})" style="display: inline-flex; align-items: center; gap: 6px;">
            <span>🗑️</span> Supprimer
          </button>
        </div>
      </div>
    `).join('');
  }
  
  // Affiche le formulaire de projet
  window.showProjectForm = function(editIndex = null) {
    const modal = document.getElementById('project-form-modal');
    const form = document.getElementById('project-form');
    const title = document.getElementById('project-form-title');
    
    if (!modal || !form) return;
    
    currentEditingId = editIndex;
    
    if (title) {
      title.textContent = editIndex !== null ? 'Modifier le projet' : 'Ajouter un projet';
    }
    
    if (editIndex !== null) {
      const projet = mesDonneesActuelles.projects[editIndex];
      document.getElementById('project-id').value = editIndex;
      document.getElementById('project-title').value = projet.title || '';
      document.getElementById('project-type').value = projet.type || 'Projet Personnel';
      document.getElementById('project-category').value = projet.category || '';
      document.getElementById('project-short-desc').value = projet.shortDesc || '';
      document.getElementById('project-description').value = projet.description || '';
      document.getElementById('project-features').value = (projet.features || []).join('\n');
      document.getElementById('project-tags').value = (projet.tags || projet.technologies || []).join(', ');
      document.getElementById('project-link').value = projet.link || projet.liveUrl || '';
      document.getElementById('project-demo-link').value = projet.demoLink || '';
      document.getElementById('project-featured').checked = projet.featured || false;
      document.getElementById('project-public').checked = projet.public !== false;
      
      // Afficher un message de confirmation
      if (window.location.hostname === 'localhost') {
        log('✏️ Mode édition activé pour le projet:', projet.title);
      }
    } else {
      form.reset();
      document.getElementById('project-id').value = '';
      document.getElementById('project-featured').checked = false;
      document.getElementById('project-public').checked = true;
    }
    
    modal.style.display = 'block';
    afficherTagsProjet();
  };
  
  // Cache le formulaire de projet
  window.hideProjectForm = function() {
    const modal = document.getElementById('project-form-modal');
    if (modal) modal.style.display = 'none';
    currentEditingId = null;
  };
  
  // Affiche les tags du projet
  function afficherTagsProjet() {
    const tagsInput = document.getElementById('project-tags');
    const tagsDisplay = document.getElementById('project-tags-display');
    if (!tagsInput || !tagsDisplay) return;
    
    // Supprimer les anciens listeners pour éviter les doublons
    const newInput = tagsInput.cloneNode(true);
    tagsInput.parentNode.replaceChild(newInput, tagsInput);
    
    const updatedInput = document.getElementById('project-tags');
    
    // Fonction pour mettre à jour l'affichage des tags
    const updateTagsDisplay = () => {
      const tags = updatedInput.value.split(',').map(t => t.trim()).filter(t => t);
      if (tags.length > 0) {
        tagsDisplay.innerHTML = tags.map(tag => `
          <span class="tag-item" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); padding: 6px 12px; border-radius: 20px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; color: var(--accent);">
            ${tag}
            <span class="remove-tag" onclick="removeProjectTag('${tag.replace(/'/g, "\\'")}')" style="cursor: pointer; color: var(--muted); font-weight: bold; font-size: 16px; line-height: 1; margin-left: 4px;">×</span>
          </span>
        `).join('');
      } else {
        tagsDisplay.innerHTML = '';
      }
    };
    
    // Mettre à jour lors de la saisie
    updatedInput.addEventListener('input', updateTagsDisplay);
    
    // Mettre à jour immédiatement si des tags existent déjà
    updateTagsDisplay();
  }
  
  // Supprime un tag
  window.removeProjectTag = function(tag) {
    const tagsInput = document.getElementById('project-tags');
    if (!tagsInput) return;
    const tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t && t !== tag);
    tagsInput.value = tags.join(', ');
    afficherTagsProjet();
  };
  
  // Sauvegarde un projet
  async function sauvegarderProjet(e) {
    e.preventDefault();
    
    const projet = {
      title: document.getElementById('project-title').value.trim(),
      type: document.getElementById('project-type').value,
      category: document.getElementById('project-category').value.trim(),
      shortDesc: document.getElementById('project-short-desc').value.trim(),
      description: document.getElementById('project-description').value.trim(),
      features: document.getElementById('project-features').value.split('\n').filter(f => f.trim()),
      tags: document.getElementById('project-tags').value.split(',').map(t => t.trim()).filter(t => t),
      link: document.getElementById('project-link').value.trim(),
      demoLink: document.getElementById('project-demo-link').value.trim(),
      featured: document.getElementById('project-featured').checked,
      public: document.getElementById('project-public').checked
    };
    
    if (!projet.title) {
      afficherErreur(null, 'Le titre est obligatoire');
      return;
    }
    
    const editIndex = currentEditingId;
    if (editIndex !== null) {
      mesDonneesActuelles.projects[editIndex] = projet;
    } else {
      mesDonneesActuelles.projects.push(projet);
    }
    
    await sauvegarderSurServeur();
    afficherListeProjets();
    window.hideProjectForm();
  }
  
  // Édite un projet
  window.editProject = function(index) {
    window.showProjectForm(index);
  };
  
  // Supprime un projet
  window.deleteProject = function(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      mesDonneesActuelles.projects.splice(index, 1);
      sauvegarderSurServeur();
      afficherListeProjets();
    }
  };
  
  
  /* ===== GESTION DES COMPÉTENCES ===== */
  
  // Affiche la liste des compétences
  function afficherListeCompetences() {
    const container = document.getElementById('skills-list');
    if (!container) return;
    
    const skills = mesDonneesActuelles.skills || [];
    
    if (skills.length === 0) {
      container.innerHTML = '<p class="muted">Aucune compétence pour le moment.</p>';
      return;
    }
    
    container.innerHTML = skills.map((skill, index) => `
      <div class="item-card">
        <input type="checkbox" class="select-checkbox" data-type="skills" data-index="${index}" onchange="toggleItemSelection('skills', ${index}, this.checked)" />
        <h4>${skill.icon || '🔧'} ${skill.name || 'Compétence'}</h4>
        <div class="skill-item-container" style="margin-top: 8px;">
          ${(skill.skills || []).map(s => `<span class="skill-item">${s}</span>`).join('')}
        </div>
        <div class="item-actions">
          <button class="btn-small" onclick="editSkill(${index})">Modifier</button>
          <button class="btn-small btn-secondary" onclick="deleteSkill(${index})">Supprimer</button>
        </div>
      </div>
    `).join('');
  }
  
  // Sauvegarde une compétence
  async function sauvegarderCompetence(e) {
    e.preventDefault();
    
    const skill = {
      icon: document.getElementById('skill-category-icon').value.trim(),
      name: document.getElementById('skill-category-name').value.trim(),
      skills: document.getElementById('skill-category-skills').value.split(',').map(s => s.trim()).filter(s => s)
    };
    
    if (!skill.name) {
      afficherErreur(null, 'Le nom de la catégorie est obligatoire');
      return;
    }
    
    mesDonneesActuelles.skills.push(skill);
    await sauvegarderSurServeur();
    afficherListeCompetences();
    document.getElementById('skill-category-form').reset();
  }
  
  // Édite une compétence
  window.editSkill = function(index) {
    const skill = mesDonneesActuelles.skills[index];
    document.getElementById('skill-category-icon').value = skill.icon || '';
    document.getElementById('skill-category-name').value = skill.name || '';
    document.getElementById('skill-category-skills').value = (skill.skills || []).join(', ');
    
    // Supprimer l'ancienne et ajouter la nouvelle
    mesDonneesActuelles.skills.splice(index, 1);
    sauvegarderSurServeur();
    afficherListeCompetences();
  };
  
  // Supprime une compétence
  window.deleteSkill = function(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
      mesDonneesActuelles.skills.splice(index, 1);
      sauvegarderSurServeur();
      afficherListeCompetences();
    }
  };
  
  
  /* ===== GESTION DES CERTIFICATIONS ===== */
  
  // Affiche la liste des certifications
  function afficherListeCertifications() {
    const container = document.getElementById('certifications-list');
    if (!container) return;
    
    const certs = mesDonneesActuelles.certifications || [];
    
    if (certs.length === 0) {
      container.innerHTML = '<p class="muted">Aucune certification pour le moment.</p>';
      return;
    }
    
    container.innerHTML = certs.map((cert, index) => `
      <div class="item-card">
        <input type="checkbox" class="select-checkbox" data-type="certifications" data-index="${index}" onchange="toggleItemSelection('certifications', ${index}, this.checked)" />
        <h4>${cert.name || 'Certification'}</h4>
        <p class="item-meta">${cert.issuer || ''} ${cert.date ? '· ' + cert.date : ''}</p>
        <p class="muted">${cert.description || ''}</p>
        <div class="item-actions">
          <button class="btn-small" onclick="editCertification(${index})">Modifier</button>
          <button class="btn-small btn-secondary" onclick="deleteCertification(${index})">Supprimer</button>
        </div>
      </div>
    `).join('');
  }
  
  // Affiche le formulaire de certification
  window.showCertificationForm = function(editIndex = null) {
    const modal = document.getElementById('certification-form-modal');
    const form = document.getElementById('certification-form');
    const title = document.getElementById('certification-form-title');
    
    if (!modal || !form) return;
    
    currentEditingId = editIndex;
    
    if (title) {
      title.textContent = editIndex !== null ? 'Modifier la certification' : 'Ajouter une certification';
    }
    
    if (editIndex !== null) {
      const cert = mesDonneesActuelles.certifications[editIndex];
      document.getElementById('certification-id').value = editIndex;
      document.getElementById('cert-name').value = cert.name || '';
      document.getElementById('cert-issuer').value = cert.issuer || '';
      document.getElementById('cert-date').value = cert.date || '';
      document.getElementById('cert-url').value = cert.link || '';
    } else {
      form.reset();
      document.getElementById('certification-id').value = '';
    }
    
    modal.style.display = 'block';
  };
  
  // Cache le formulaire de certification
  window.hideCertificationForm = function() {
    const modal = document.getElementById('certification-form-modal');
    if (modal) modal.style.display = 'none';
    currentEditingId = null;
  };
  
  // Sauvegarde une certification
  async function sauvegarderCertification(e) {
    e.preventDefault();
    
    const cert = {
      name: document.getElementById('cert-name').value.trim(),
      issuer: document.getElementById('cert-issuer').value.trim(),
      date: document.getElementById('cert-date').value,
      description: '',
      link: document.getElementById('cert-url').value.trim()
    };
    
    if (!cert.name || !cert.issuer) {
      afficherErreur(null, 'Le nom et l\'organisme émetteur sont obligatoires');
      return;
    }
    
    const editIndex = currentEditingId;
    if (editIndex !== null) {
      mesDonneesActuelles.certifications[editIndex] = cert;
    } else {
      mesDonneesActuelles.certifications.push(cert);
    }
    
    await sauvegarderSurServeur();
    afficherListeCertifications();
    window.hideCertificationForm();
  }
  
  // Édite une certification
  window.editCertification = function(index) {
    window.showCertificationForm(index);
  };
  
  // Supprime une certification
  window.deleteCertification = function(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette certification ?')) {
      mesDonneesActuelles.certifications.splice(index, 1);
      sauvegarderSurServeur();
      afficherListeCertifications();
    }
  };
  
  
  /* ===== GESTION DES STAGES ===== */
  
  // Affiche la liste des stages
  function afficherListeStages() {
    const container = document.getElementById('stages-list');
    if (!container) return;
    
    const stages = mesDonneesActuelles.stages || [];
    
    if (stages.length === 0) {
      container.innerHTML = '<p class="muted">Aucun stage pour le moment.</p>';
      return;
    }
    
    container.innerHTML = stages.map((stage, index) => `
      <div class="item-card">
        <h4>${stage.title || 'Stage'}</h4>
        <p class="item-meta">${stage.company || ''} ${stage.location ? '· ' + stage.location : ''} ${stage.date ? '· ' + stage.date : ''}</p>
        <p class="muted">${stage.description || ''}</p>
        <div class="item-actions">
          <button class="btn-small" onclick="editStage(${index})">Modifier</button>
          <button class="btn-small btn-secondary" onclick="deleteStage(${index})">Supprimer</button>
        </div>
      </div>
    `).join('');
  }
  
  // Affiche le formulaire de stage
  window.showStageForm = function(editIndex = null) {
    const modal = document.getElementById('stage-form-modal');
    const form = document.getElementById('stage-form');
    const title = document.getElementById('stage-form-title');
    
    if (!modal || !form) return;
    
    currentEditingId = editIndex;
    
    if (title) {
      title.textContent = editIndex !== null ? 'Modifier le stage' : 'Ajouter un stage';
    }
    
    if (editIndex !== null) {
      const item = mesDonneesActuelles.stages[editIndex];
      document.getElementById('stage-id').value = editIndex;
      document.getElementById('stage-title').value = item.title || '';
      document.getElementById('stage-company').value = item.company || '';
      document.getElementById('stage-location').value = item.location || '';
      document.getElementById('stage-date').value = item.date || '';
      document.getElementById('stage-duration').value = item.duration || '';
      document.getElementById('stage-description').value = item.description || '';
      document.getElementById('stage-technologies').value = (item.technologies || []).join(', ');
      document.getElementById('stage-link').value = item.link || '';
    } else {
      form.reset();
      document.getElementById('stage-id').value = '';
    }
    
    modal.style.display = 'block';
  };
  
  // Cache le formulaire de stage
  window.hideStageForm = function() {
    const modal = document.getElementById('stage-form-modal');
    if (modal) modal.style.display = 'none';
    currentEditingId = null;
  };
  
  // Sauvegarde un stage
  async function sauvegarderStage(e) {
    e.preventDefault();
    
    const item = {
      title: document.getElementById('stage-title').value.trim(),
      company: document.getElementById('stage-company').value.trim(),
      location: document.getElementById('stage-location').value.trim(),
      date: document.getElementById('stage-date').value.trim(),
      duration: document.getElementById('stage-duration').value.trim(),
      description: document.getElementById('stage-description').value.trim(),
      technologies: document.getElementById('stage-technologies').value.split(',').map(t => t.trim()).filter(t => t),
      link: document.getElementById('stage-link').value.trim()
    };
    
    if (!item.title || !item.company || !item.description || !item.date) {
      afficherErreur(null, 'Le titre, l\'entreprise, la date et la description sont obligatoires');
      return;
    }
    
    const editIndex = currentEditingId;
    if (editIndex !== null) {
      mesDonneesActuelles.stages[editIndex] = item;
    } else {
      mesDonneesActuelles.stages.push(item);
    }
    
    await sauvegarderSurServeur();
    afficherListeStages();
    window.hideStageForm();
  }
  
  // Édite un stage
  window.editStage = function(index) {
    window.showStageForm(index);
  };
  
  // Supprime un stage
  window.deleteStage = function(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce stage ?')) {
      mesDonneesActuelles.stages.splice(index, 1);
      sauvegarderSurServeur();
      afficherListeStages();
    }
  };

  /* ===== GESTION DES ALTERNANCES ===== */
  
  // Affiche la liste des alternances
  function afficherListeAlternances() {
    const container = document.getElementById('alternances-list');
    if (!container) return;
    
    const alternances = mesDonneesActuelles.alternances || [];
    
    if (alternances.length === 0) {
      container.innerHTML = '<p class="muted">Aucune alternance pour le moment.</p>';
      return;
    }
    
    container.innerHTML = alternances.map((alternance, index) => `
      <div class="item-card">
        <h4>${alternance.title || 'Alternance'}</h4>
        <p class="item-meta">${alternance.company || ''} ${alternance.location ? '· ' + alternance.location : ''} ${alternance.date ? '· ' + alternance.date : ''}</p>
        <p class="muted">${alternance.description || ''}</p>
        <div class="item-actions">
          <button class="btn-small" onclick="editAlternance(${index})">Modifier</button>
          <button class="btn-small btn-secondary" onclick="deleteAlternance(${index})">Supprimer</button>
        </div>
      </div>
    `).join('');
  }
  
  // Affiche le formulaire d'alternance
  window.showAlternanceForm = function(editIndex = null) {
    const modal = document.getElementById('alternance-form-modal');
    const form = document.getElementById('alternance-form');
    const title = document.getElementById('alternance-form-title');
    
    if (!modal || !form) return;
    
    currentEditingId = editIndex;
    
    if (title) {
      title.textContent = editIndex !== null ? 'Modifier l\'alternance' : 'Ajouter une alternance';
    }
    
    if (editIndex !== null) {
      const item = mesDonneesActuelles.alternances[editIndex];
      document.getElementById('alternance-id').value = editIndex;
      document.getElementById('alternance-title').value = item.title || '';
      document.getElementById('alternance-company').value = item.company || '';
      document.getElementById('alternance-location').value = item.location || '';
      document.getElementById('alternance-date').value = item.date || '';
      document.getElementById('alternance-rhythm').value = item.rhythm || '';
      document.getElementById('alternance-description').value = item.description || '';
      document.getElementById('alternance-technologies').value = (item.technologies || []).join(', ');
      document.getElementById('alternance-link').value = item.link || '';
    } else {
      form.reset();
      document.getElementById('alternance-id').value = '';
    }
    
    modal.style.display = 'block';
  };
  
  // Cache le formulaire d'alternance
  window.hideAlternanceForm = function() {
    const modal = document.getElementById('alternance-form-modal');
    if (modal) modal.style.display = 'none';
    currentEditingId = null;
  };
  
  // Sauvegarde une alternance
  async function sauvegarderAlternance(e) {
    e.preventDefault();
    
    const item = {
      title: document.getElementById('alternance-title').value.trim(),
      company: document.getElementById('alternance-company').value.trim(),
      location: document.getElementById('alternance-location').value.trim(),
      date: document.getElementById('alternance-date').value.trim(),
      rhythm: document.getElementById('alternance-rhythm').value.trim(),
      description: document.getElementById('alternance-description').value.trim(),
      technologies: document.getElementById('alternance-technologies').value.split(',').map(t => t.trim()).filter(t => t),
      link: document.getElementById('alternance-link').value.trim()
    };
    
    if (!item.title || !item.company || !item.description || !item.date) {
      afficherErreur(null, 'Le titre, l\'entreprise, la date et la description sont obligatoires');
      return;
    }
    
    const editIndex = currentEditingId;
    if (editIndex !== null) {
      mesDonneesActuelles.alternances[editIndex] = item;
    } else {
      mesDonneesActuelles.alternances.push(item);
    }
    
    await sauvegarderSurServeur();
    afficherListeAlternances();
    window.hideAlternanceForm();
  }
  
  // Édite une alternance
  window.editAlternance = function(index) {
    window.showAlternanceForm(index);
  };
  
  // Supprime une alternance
  window.deleteAlternance = function(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette alternance ?')) {
      mesDonneesActuelles.alternances.splice(index, 1);
      sauvegarderSurServeur();
      afficherListeAlternances();
    }
  };
  
  
  /* ===== GESTION DES ÉVÉNEMENTS TECHNOLOGIQUES ===== */
  
  // Affiche la liste des événements technologiques
  function afficherListeTechEvents() {
    const container = document.getElementById('tech-events-list');
    if (!container) return;
    
    const events = mesDonneesActuelles.techEvents || [];
    
    if (events.length === 0) {
      container.innerHTML = '<p class="muted">Aucun événement technologique pour le moment.</p>';
      return;
    }
    
    container.innerHTML = events.map((event, index) => `
      <div class="item-card">
        <h4>${event.name || event.title || 'Événement'}</h4>
        <p class="item-meta">${event.type || ''} ${event.organizer ? '· ' + event.organizer : ''} ${event.location ? '· ' + event.location : ''} ${event.date ? '· ' + event.date : ''}</p>
        <p class="muted">${event.description || ''}</p>
        <div class="item-actions">
          <button class="btn-small" onclick="editTechEvent(${index})">Modifier</button>
          <button class="btn-small btn-secondary" onclick="deleteTechEvent(${index})">Supprimer</button>
        </div>
      </div>
    `).join('');
  }
  
  // Affiche le formulaire d'événement technologique
  window.showTechEventForm = function(editIndex = null) {
    const modal = document.getElementById('tech-event-form-modal');
    const form = document.getElementById('tech-event-form');
    const title = document.getElementById('tech-event-form-title');
    
    if (!modal || !form) return;
    
    currentEditingId = editIndex;
    
    if (title) {
      title.textContent = editIndex !== null ? 'Modifier l\'événement' : 'Ajouter un événement';
    }
    
    if (editIndex !== null) {
      const item = mesDonneesActuelles.techEvents[editIndex];
      document.getElementById('tech-event-id').value = editIndex;
      document.getElementById('tech-event-name').value = item.name || item.title || '';
      document.getElementById('tech-event-type').value = item.type || 'conference';
      document.getElementById('tech-event-date').value = item.date || '';
      document.getElementById('tech-event-organizer').value = item.organizer || '';
      document.getElementById('tech-event-location').value = item.location || '';
      document.getElementById('tech-event-description').value = item.description || '';
      document.getElementById('tech-event-link').value = item.link || '';
    } else {
      form.reset();
      document.getElementById('tech-event-id').value = '';
    }
    
    modal.style.display = 'block';
  };
  
  // Cache le formulaire d'événement technologique
  window.hideTechEventForm = function() {
    const modal = document.getElementById('tech-event-form-modal');
    if (modal) modal.style.display = 'none';
    currentEditingId = null;
  };
  
  // Sauvegarde un événement technologique
  async function sauvegarderTechEvent(e) {
    e.preventDefault();
    
    const item = {
      name: document.getElementById('tech-event-name').value.trim(),
      title: document.getElementById('tech-event-name').value.trim(),
      type: document.getElementById('tech-event-type').value,
      date: document.getElementById('tech-event-date').value.trim(),
      organizer: document.getElementById('tech-event-organizer').value.trim(),
      location: document.getElementById('tech-event-location').value.trim(),
      description: document.getElementById('tech-event-description').value.trim(),
      link: document.getElementById('tech-event-link').value.trim()
    };
    
    if (!item.name || !item.description) {
      afficherErreur(null, 'Le nom et la description sont obligatoires');
      return;
    }
    
    const editIndex = currentEditingId;
    if (editIndex !== null) {
      mesDonneesActuelles.techEvents[editIndex] = item;
    } else {
      mesDonneesActuelles.techEvents.push(item);
    }
    
    await sauvegarderSurServeur();
    afficherListeTechEvents();
    window.hideTechEventForm();
  }
  
  // Édite un événement technologique
  window.editTechEvent = function(index) {
    window.showTechEventForm(index);
  };
  
  // Supprime un événement technologique
  window.deleteTechEvent = function(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      mesDonneesActuelles.techEvents.splice(index, 1);
      sauvegarderSurServeur();
      afficherListeTechEvents();
    }
  };
  
  
  /* ===== GESTION DE LA TIMELINE ===== */
  
  // Affiche la liste de la timeline
  function afficherListeTimeline() {
    const container = document.getElementById('timeline-list');
    if (!container) return;
    
    const timeline = mesDonneesActuelles.timeline || [];
    
    if (timeline.length === 0) {
      container.innerHTML = '<p class="muted">Aucun événement pour le moment.</p>';
      return;
    }
    
    container.innerHTML = timeline.map((item, index) => `
      <div class="item-card">
        <input type="checkbox" class="select-checkbox" data-type="timeline" data-index="${index}" onchange="toggleItemSelection('timeline', ${index}, this.checked)" />
        <h4>${item.title || 'Événement'}</h4>
        <p class="item-meta">${item.date || ''} ${item.subtitle ? '· ' + item.subtitle : ''}</p>
        <p class="muted">${item.description || ''}</p>
        <div class="item-actions">
          <button class="btn-small" onclick="editTimeline(${index})">Modifier</button>
          <button class="btn-small btn-secondary" onclick="deleteTimeline(${index})">Supprimer</button>
        </div>
      </div>
    `).join('');
  }
  
  // Affiche le formulaire de timeline
  window.showTimelineForm = function(editIndex = null) {
    const modal = document.getElementById('timeline-form-modal');
    const form = document.getElementById('timeline-form');
    const title = document.getElementById('timeline-form-title');
    
    if (!modal || !form) return;
    
    currentEditingId = editIndex;
    
    if (title) {
      title.textContent = editIndex !== null ? 'Modifier l\'événement' : 'Ajouter un événement';
    }
    
    if (editIndex !== null) {
      const item = mesDonneesActuelles.timeline[editIndex];
      document.getElementById('timeline-id').value = editIndex;
      document.getElementById('timeline-date').value = item.date || '';
      document.getElementById('timeline-title').value = item.title || '';
      document.getElementById('timeline-subtitle').value = item.subtitle || '';
      document.getElementById('timeline-description').value = item.description || '';
    } else {
      form.reset();
      document.getElementById('timeline-id').value = '';
    }
    
    modal.style.display = 'block';
  };
  
  // Cache le formulaire de timeline
  window.hideTimelineForm = function() {
    const modal = document.getElementById('timeline-form-modal');
    if (modal) modal.style.display = 'none';
    currentEditingId = null;
  };
  
  // Sauvegarde un événement timeline
  async function sauvegarderTimeline(e) {
    e.preventDefault();
    
    const item = {
      date: document.getElementById('timeline-date').value.trim(),
      title: document.getElementById('timeline-title').value.trim(),
      subtitle: document.getElementById('timeline-subtitle').value.trim(),
      description: document.getElementById('timeline-description').value.trim()
    };
    
    if (!item.date || !item.title || !item.description) {
      afficherErreur(null, 'La date, le titre et la description sont obligatoires');
      return;
    }
    
    const editIndex = currentEditingId;
    if (editIndex !== null) {
      mesDonneesActuelles.timeline[editIndex] = item;
    } else {
      mesDonneesActuelles.timeline.push(item);
    }
    
    await sauvegarderSurServeur();
    afficherListeTimeline();
    window.hideTimelineForm();
  }
  
  // Édite un événement timeline
  window.editTimeline = function(index) {
    window.showTimelineForm(index);
  };
  
  // Supprime un événement timeline
  window.deleteTimeline = function(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      mesDonneesActuelles.timeline.splice(index, 1);
      sauvegarderSurServeur();
      afficherListeTimeline();
    }
  };
  
  
  /* ===== GESTION DES SERVICES ===== */
  
  // Affiche la liste des services
  function afficherListeServices() {
    const container = document.getElementById('services-list');
    if (!container) return;
    
    const services = mesDonneesActuelles.services || [];
    
    if (services.length === 0) {
      container.innerHTML = '<p class="muted">Aucun service pour le moment.</p>';
      return;
    }
    
    container.innerHTML = services.map((service, index) => `
      <div class="item-card">
        <input type="checkbox" class="select-checkbox" data-type="services" data-index="${index}" onchange="toggleItemSelection('services', ${index}, this.checked)" />
        <h4>${service.icon || '🛠️'} ${service.title || 'Service'}</h4>
        <p class="muted">${service.description || ''}</p>
        <div class="item-actions">
          <button class="btn-small" onclick="editService(${index})">Modifier</button>
          <button class="btn-small btn-secondary" onclick="deleteService(${index})">Supprimer</button>
        </div>
      </div>
    `).join('');
  }
  
  // Affiche le formulaire de service
  window.showServiceForm = function(editIndex = null) {
    const modal = document.getElementById('service-form-modal');
    const form = document.getElementById('service-form');
    const title = document.getElementById('service-form-title');
    
    if (!modal || !form) return;
    
    currentEditingId = editIndex;
    
    if (title) {
      title.textContent = editIndex !== null ? 'Modifier le service' : 'Ajouter un service';
    }
    
    if (editIndex !== null) {
      const service = mesDonneesActuelles.services[editIndex];
      document.getElementById('service-id').value = editIndex;
      document.getElementById('service-icon').value = service.icon || '';
      document.getElementById('service-title').value = service.title || '';
      document.getElementById('service-description').value = service.description || '';
      document.getElementById('service-features').value = (service.features || []).join('\n');
    } else {
      form.reset();
      document.getElementById('service-id').value = '';
    }
    
    modal.style.display = 'block';
  };
  
  // Cache le formulaire de service
  window.hideServiceForm = function() {
    const modal = document.getElementById('service-form-modal');
    if (modal) modal.style.display = 'none';
    currentEditingId = null;
  };
  
  // Sauvegarde un service
  async function sauvegarderService(e) {
    e.preventDefault();
    
    const service = {
      icon: document.getElementById('service-icon').value.trim(),
      title: document.getElementById('service-title').value.trim(),
      description: document.getElementById('service-description').value.trim(),
      features: document.getElementById('service-features').value.split('\n').filter(f => f.trim())
    };
    
    if (!service.icon || !service.title || !service.description) {
      afficherErreur(null, 'L\'icône, le titre et la description sont obligatoires');
      return;
    }
    
    const editIndex = currentEditingId;
    if (editIndex !== null) {
      mesDonneesActuelles.services[editIndex] = service;
    } else {
      mesDonneesActuelles.services.push(service);
    }
    
    await sauvegarderSurServeur();
    afficherListeServices();
    window.hideServiceForm();
  }
  
  // Édite un service
  window.editService = function(index) {
    window.showServiceForm(index);
  };
  
  // Supprime un service
  window.deleteService = function(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      mesDonneesActuelles.services.splice(index, 1);
      sauvegarderSurServeur();
      afficherListeServices();
    }
  };
  
  
  /* ===== GESTION DE LA FAQ ===== */
  
  // Affiche la liste de la FAQ
  function afficherListeFAQ() {
    const container = document.getElementById('faq-list');
    if (!container) return;
    
    const faq = mesDonneesActuelles.faq || [];
    
    if (faq.length === 0) {
      container.innerHTML = '<p class="muted">Aucune question pour le moment.</p>';
      return;
    }
    
    container.innerHTML = faq.map((item, index) => `
      <div class="item-card">
        <input type="checkbox" class="select-checkbox" data-type="faq" data-index="${index}" onchange="toggleItemSelection('faq', ${index}, this.checked)" />
        <h4>${item.question || 'Question'}</h4>
        <p class="muted">${item.answer || ''}</p>
        <div class="item-actions">
          <button class="btn-small" onclick="editFAQ(${index})">Modifier</button>
          <button class="btn-small btn-secondary" onclick="deleteFAQ(${index})">Supprimer</button>
        </div>
      </div>
    `).join('');
  }
  
  // Affiche le formulaire de FAQ
  window.showFAQForm = function(editIndex = null) {
    const modal = document.getElementById('faq-form-modal');
    const form = document.getElementById('faq-form');
    const title = document.getElementById('faq-form-title');
    
    if (!modal || !form) return;
    
    currentEditingId = editIndex;
    
    if (title) {
      title.textContent = editIndex !== null ? 'Modifier la question' : 'Ajouter une question FAQ';
    }
    
    if (editIndex !== null) {
      const item = mesDonneesActuelles.faq[editIndex];
      document.getElementById('faq-id').value = editIndex;
      document.getElementById('faq-question').value = item.question || '';
      document.getElementById('faq-answer').value = item.answer || '';
    } else {
      form.reset();
      document.getElementById('faq-id').value = '';
    }
    
    modal.style.display = 'block';
  };
  
  // Cache le formulaire de FAQ
  window.hideFAQForm = function() {
    const modal = document.getElementById('faq-form-modal');
    if (modal) modal.style.display = 'none';
    currentEditingId = null;
  };
  
  // Sauvegarde une FAQ
  async function sauvegarderFAQ(e) {
    e.preventDefault();
    
    const item = {
      question: document.getElementById('faq-question').value.trim(),
      answer: document.getElementById('faq-answer').value.trim()
    };
    
    if (!item.question || !item.answer) {
      afficherErreur(null, 'La question et la réponse sont obligatoires');
      return;
    }
    
    const editIndex = currentEditingId;
    if (editIndex !== null) {
      mesDonneesActuelles.faq[editIndex] = item;
    } else {
      mesDonneesActuelles.faq.push(item);
    }
    
    await sauvegarderSurServeur();
    afficherListeFAQ();
    window.hideFAQForm();
  }
  
  // Édite une FAQ
  window.editFAQ = function(index) {
    window.showFAQForm(index);
  };
  
  // Supprime une FAQ
  window.deleteFAQ = function(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      mesDonneesActuelles.faq.splice(index, 1);
      sauvegarderSurServeur();
      afficherListeFAQ();
    }
  };
  
  
  /* ===== GESTION DES DESCRIPTIONS (ABOUT) ===== */
  
  // Affiche les infos about
  function afficherInfosAbout() {
    const about = mesDonneesActuelles.about || {};
    
    const heroDesc = document.getElementById('hero-description');
    const aboutDesc = document.getElementById('about-description');
    const statsProjects = document.getElementById('stats-projects');
    const statsExperience = document.getElementById('stats-experience');
    const statsTechnologies = document.getElementById('stats-technologies');
    
    if (heroDesc) heroDesc.value = about.heroDescription || '';
    if (aboutDesc) aboutDesc.value = about.aboutDescription || '';
    if (statsProjects) statsProjects.value = about.stats?.projects || 0;
    if (statsExperience) statsExperience.value = about.stats?.experience || 0;
    if (statsTechnologies) statsTechnologies.value = about.stats?.technologies || 0;
  }
  
  // Sauvegarde les infos about
  window.saveAboutInfo = async function() {
    mesDonneesActuelles.about = {
      heroDescription: document.getElementById('hero-description')?.value || '',
      aboutDescription: document.getElementById('about-description')?.value || '',
      stats: {
        projects: parseInt(document.getElementById('stats-projects')?.value || 0),
        experience: parseInt(document.getElementById('stats-experience')?.value || 0),
        technologies: parseInt(document.getElementById('stats-technologies')?.value || 0)
      }
    };
    
    await sauvegarderSurServeur();
  };
  
  
  /* ===== GESTION DES LIENS ===== */
  
  // Affiche les liens
  function afficherLiens() {
    const links = mesDonneesActuelles.links || {};
    
    const cvPath = document.getElementById('cv-path');
    if (cvPath) {
      // Afficher le chemin du CV (ou indiquer qu'un fichier est uploadé)
      if (links.cvFile) {
        cvPath.value = 'Fichier uploadé: ' + (links.cvFileName || 'CV.pdf');
        cvPath.disabled = true;
        cvPath.style.background = 'rgba(91, 124, 250, 0.1)';
      } else {
        cvPath.value = links.cv || '';
        cvPath.disabled = false;
        cvPath.style.background = '';
      }
    }
    
    // Afficher la section de prévisualisation si un fichier est uploadé
    const previewSection = document.getElementById('cv-preview-section');
    if (links.cvFile && previewSection) {
      previewSection.style.display = 'block';
      const fileName = document.getElementById('cv-file-name');
      const fileSize = document.getElementById('cv-file-size');
      const previewLink = document.getElementById('cv-preview-link');
      
      if (fileName) fileName.textContent = links.cvFileName || 'CV.pdf';
      if (fileSize && links.cvFileSize) {
        fileSize.textContent = `Taille: ${(links.cvFileSize / 1024).toFixed(2)} KB`;
      }
      if (previewLink) {
        previewLink.href = links.cvFile;
        previewLink.download = links.cvFileName || 'CV.pdf';
      }
    } else if (previewSection) {
      previewSection.style.display = 'none';
    }
    
    afficherLiensSociaux();
  }
  
  // Affiche les liens sociaux
  function afficherLiensSociaux() {
    const container = document.getElementById('social-links-list');
    if (!container) return;
    
    const social = (mesDonneesActuelles.links || {}).social || [];
    
    if (social.length === 0) {
      container.innerHTML = '<p class="muted">Aucun lien social pour le moment.</p>';
      return;
    }
    
    container.innerHTML = social.map((link, index) => `
      <div class="item-card">
        <h4>${link.name || 'Lien'}</h4>
        <p class="muted"><a href="${link.url}" target="_blank">${link.url}</a></p>
        <div class="item-actions">
          <button class="btn-small btn-secondary" onclick="deleteSocialLink(${index})">Supprimer</button>
        </div>
      </div>
    `).join('');
  }
  
  // Sauvegarde le CV
  async function sauvegarderCV(e) {
    e.preventDefault();
    
    if (!mesDonneesActuelles.links) mesDonneesActuelles.links = {};
    
    const cvPath = document.getElementById('cv-path').value.trim();
    
    // Si un fichier a été uploadé, il est déjà dans mesDonneesActuelles.links.cvFile
    // Dans ce cas, on ne modifie pas cvFile, seulement cv si c'est un chemin
    if (cvPath && !cvPath.startsWith('Fichier uploadé:')) {
      // Si c'est un nouveau chemin (pas un fichier uploadé), mettre à jour
      // SUPPRIMER L'ANCIEN CV BASE64 : Si on change de méthode (de upload à chemin), supprimer cvFile
      if (mesDonneesActuelles.links.cvFile) {
        log('🗑️ Suppression de l\'ancien CV base64 (remplacement par chemin)');
        delete mesDonneesActuelles.links.cvFile;
        delete mesDonneesActuelles.links.cvFileName;
        delete mesDonneesActuelles.links.cvFileSize;
      }
      // SUPPRIMER L'ANCIEN CV BASE64 DANS cv : Si cv était en base64, le remplacer par le chemin
      if (mesDonneesActuelles.links.cv && mesDonneesActuelles.links.cv.startsWith('data:')) {
        log('🗑️ Suppression de l\'ancien CV base64 dans cv (remplacement par chemin)');
      }
      // Mettre le nouveau chemin
      mesDonneesActuelles.links.cv = cvPath;
    }
    
    const success = await sauvegarderSurServeur();
    if (success) {
      afficherSucces('CV sauvegardé avec succès ! L\'ancien CV a été remplacé. Rechargez les pages d\'accueil et "À propos" (F5 ou Ctrl+Shift+R) pour voir le changement.');
      // Forcer le rechargement des données sur les autres pages après un délai
      setTimeout(() => {
        if (window.portfolioAPI && window.portfolioAPI.actualiser) {
          window.portfolioAPI.actualiser();
        }
      }, 1000);
      
      // Recharger aussi les liens dans l'admin
      afficherLiens();
    }
  }
  
  // Ajoute un lien social
  async function ajouterLienSocial(e) {
    e.preventDefault();
    
    const name = document.getElementById('social-name').value.trim();
    const url = document.getElementById('social-url').value.trim();
    
    if (!name || !url) {
      afficherErreur(null, 'Le nom et l\'URL sont obligatoires');
      return;
    }
    
    if (!mesDonneesActuelles.links) mesDonneesActuelles.links = {};
    if (!mesDonneesActuelles.links.social) mesDonneesActuelles.links.social = [];
    
    mesDonneesActuelles.links.social.push({ name, url });
    await sauvegarderSurServeur();
    afficherLiensSociaux();
    document.getElementById('social-link-form').reset();
  }
  
  // Supprime un lien social
  window.deleteSocialLink = function(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) {
      mesDonneesActuelles.links.social.splice(index, 1);
      sauvegarderSurServeur();
      afficherLiensSociaux();
    }
  };
  
  
  /* ===== GESTION DES STATISTIQUES ===== */
  
  // Met à jour les statistiques du dashboard
  function mettreAJourStatsDashboard() {
    const statProjects = document.getElementById('stat-projects');
    const statSkills = document.getElementById('stat-skills');
    const statVisitors = document.getElementById('stat-visitors');
    const statLastUpdate = document.getElementById('stat-last-update');
    
    if (statProjects) statProjects.textContent = mesDonneesActuelles.projects?.length || 0;
    if (statSkills) statSkills.textContent = mesDonneesActuelles.skills?.length || 0;
    if (statVisitors) statVisitors.textContent = '-';
    if (statLastUpdate) statLastUpdate.textContent = new Date().toLocaleDateString('fr-FR');
    
    // Stats dans l'onglet stats
    const dashboardStatProjects = document.getElementById('dashboard-stat-projects');
    const dashboardStatSkills = document.getElementById('dashboard-stat-skills');
    const dashboardStatLinks = document.getElementById('dashboard-stat-links');
    
    if (dashboardStatProjects) dashboardStatProjects.textContent = mesDonneesActuelles.projects?.length || 0;
    if (dashboardStatSkills) dashboardStatSkills.textContent = mesDonneesActuelles.skills?.length || 0;
    if (dashboardStatLinks) dashboardStatLinks.textContent = (mesDonneesActuelles.links?.social || []).length || 0;
  }
  
  // Sauvegarde les statistiques
  window.saveStatsInfo = async function() {
    mesDonneesActuelles.about = mesDonneesActuelles.about || {};
    mesDonneesActuelles.about.stats = {
      projects: parseInt(document.getElementById('stats-projects-display')?.value || 0),
      experience: parseInt(document.getElementById('stats-experience-display')?.value || 0),
      technologies: parseInt(document.getElementById('stats-technologies-display')?.value || 0)
    };
    
    await sauvegarderSurServeur();
  };
  
  
  /* ===== GESTION DE LA SÉLECTION MULTIPLE ===== */
  
  // Toggle la sélection d'un item
  window.toggleItemSelection = function(type, index, checked) {
    if (checked) {
      selectedItems[type].add(index);
    } else {
      selectedItems[type].delete(index);
    }
    mettreAJourBulkActions(type);
  };
  
  // Met à jour les boutons de sélection multiple
  function mettreAJourBulkActions(type) {
    const count = selectedItems[type].size;
    const bulkActions = document.getElementById(`bulk-actions-${type}`);
    const selectedCount = document.getElementById(`selected-count-${type}`);
    
    if (bulkActions) {
      if (count > 0) {
        bulkActions.classList.add('active');
      } else {
        bulkActions.classList.remove('active');
      }
    }
    
    if (selectedCount) {
      selectedCount.textContent = count > 0 ? `${count} sélectionné(s)` : '';
    }
  }
  
  // Sélectionne tout
  window.toggleSelectAllProjects = function() {
    const checked = document.getElementById('select-all-projects').checked;
    document.querySelectorAll('[data-type="projects"].select-checkbox').forEach((cb, i) => {
      cb.checked = checked;
      toggleItemSelection('projects', i, checked);
    });
  };
  
  window.toggleSelectAllSkills = function() {
    const checked = document.getElementById('select-all-skills').checked;
    document.querySelectorAll('[data-type="skills"].select-checkbox').forEach((cb, i) => {
      cb.checked = checked;
      toggleItemSelection('skills', i, checked);
    });
  };
  
  // Supprime les items sélectionnés
  window.deleteSelectedProjects = function() {
    const indices = Array.from(selectedItems.projects).sort((a, b) => b - a);
    if (indices.length === 0) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${indices.length} projet(s) ?`)) {
      indices.forEach(i => mesDonneesActuelles.projects.splice(i, 1));
      selectedItems.projects.clear();
      sauvegarderSurServeur();
      afficherListeProjets();
    }
  };
  
  window.deleteSelectedSkills = function() {
    const indices = Array.from(selectedItems.skills).sort((a, b) => b - a);
    if (indices.length === 0) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${indices.length} compétence(s) ?`)) {
      indices.forEach(i => mesDonneesActuelles.skills.splice(i, 1));
      selectedItems.skills.clear();
      sauvegarderSurServeur();
      afficherListeCompetences();
    }
  };
  
  
  /* ===== IMPORT/EXPORT ===== */
  
  // Exporte toutes les données
  window.exportAllData = function() {
    try {
      const donneesJson = JSON.stringify(mesDonneesActuelles, null, 2);
      const fichier = new Blob([donneesJson], { type: 'application/json' });
      const url = URL.createObjectURL(fichier);
      
      const lien = document.createElement('a');
      lien.href = url;
      lien.download = `portfolio-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(lien);
      lien.click();
      document.body.removeChild(lien);
      
      URL.revokeObjectURL(url);
      afficherSucces('Données exportées avec succès !');
    } catch (erreur) {
      afficherErreur(null, 'Erreur lors de l\'export');
    }
  };
  
  // Importe des données
  window.handleFileImport = function(event) {
    const fichier = event.target.files[0];
    if (!fichier) return;
    
    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        const donneesImportees = JSON.parse(e.target.result);
        
        if (confirm('Voulez-vous vraiment remplacer toutes vos données actuelles ?')) {
          mesDonneesActuelles = donneesImportees;
          await sauvegarderSurServeur();
          afficherToutesMesDonnees();
          afficherSucces('Données importées avec succès !');
        }
      } catch (erreur) {
        afficherErreur(null, 'Fichier JSON invalide');
      }
    };
    reader.readAsText(fichier);
  };
  
  window.importAllData = function() {
    document.getElementById('import-file').click();
  };
  
  // Réinitialise toutes les données
  window.clearAllData = function() {
    if (confirm('⚠️ ATTENTION : Voulez-vous vraiment supprimer TOUTES vos données ?')) {
      if (confirm('Cette action est IRRÉVERSIBLE. Confirmez-vous ?')) {
        mesDonneesActuelles = {
          personal: {},
          projects: [],
          skills: [],
          timeline: [],
          certifications: [],
          stages: [],
          alternances: [],
          techEvents: [],
          services: [],
          faq: [],
          links: {},
          about: {}
        };
        sauvegarderSurServeur();
        afficherToutesMesDonnees();
        afficherSucces('Données réinitialisées');
      }
    }
  };
  
  // Applique les modifications au portfolio
  window.applyChangesToPortfolio = async function() {
    await sauvegarderSurServeur();
    afficherSucces('Modifications appliquées au portfolio !');
  };
  
  
  /* ===== AUTRES FONCTIONS ===== */
  
  // Gestion de la photo
  window.clearPhotoPreview = function() {
    document.getElementById('photo').value = '';
    document.getElementById('photo-preview').style.display = 'none';
    document.getElementById('photo-preview-placeholder').style.display = 'flex';
  };
  
  // Gestion du CV
  window.switchCVMethod = function(method) {
    const uploadSection = document.getElementById('cv-upload-section');
    const pathSection = document.getElementById('cv-path-section');
    const uploadTab = document.getElementById('cv-upload-tab');
    const pathTab = document.getElementById('cv-path-tab');
    
    if (method === 'upload') {
      if (uploadSection) uploadSection.style.display = 'block';
      if (pathSection) pathSection.style.display = 'none';
      if (uploadTab) uploadTab.classList.add('active');
      if (pathTab) pathTab.classList.remove('active');
    } else {
      if (uploadSection) uploadSection.style.display = 'none';
      if (pathSection) pathSection.style.display = 'block';
      if (uploadTab) uploadTab.classList.remove('active');
      if (pathTab) pathTab.classList.add('active');
    }
  };
  
  window.clearCVUpload = function() {
    document.getElementById('cv-file-input').value = '';
    document.getElementById('cv-preview-section').style.display = 'none';
    
    // SUPPRIMER L'ANCIEN CV : Supprimer complètement des données
    if (mesDonneesActuelles.links) {
      delete mesDonneesActuelles.links.cvFile;
      delete mesDonneesActuelles.links.cvFileName;
      delete mesDonneesActuelles.links.cvFileSize;
      // NE PAS REMETTRE 'assets/CV.pdf' - Laisser vide pour que l'utilisateur choisisse
      // Si cv était un base64, le supprimer aussi
      if (mesDonneesActuelles.links.cv && mesDonneesActuelles.links.cv.startsWith('data:')) {
        delete mesDonneesActuelles.links.cv;
        log('🗑️ CV base64 supprimé');
      } else if (mesDonneesActuelles.links.cv === 'assets/CV.pdf') {
        // Supprimer aussi le chemin par défaut
        delete mesDonneesActuelles.links.cv;
        log('🗑️ Chemin CV par défaut supprimé');
      }
      log('🗑️ CV uploadé supprimé - Aucun CV défini (l\'utilisateur peut en ajouter un)');
    }
    
    // Réactiver le champ cv-path
    const cvPath = document.getElementById('cv-path');
    if (cvPath) {
      cvPath.value = ''; // Laisser vide au lieu de 'assets/CV.pdf'
      cvPath.disabled = false;
      cvPath.style.background = '';
      cvPath.placeholder = 'assets/CV.pdf ou https://...';
    }
  };
  
  // Messages de succès
  window.showSuccess = function(message) {
    afficherSucces(message);
  };
  
  // Paramètres
  window.saveSettings = async function() {
    try {
      const settings = {
        maintenance: {
          enabled: document.getElementById('maintenance-mode')?.checked || false,
          message: document.getElementById('maintenance-message')?.value || ''
        },
        seo: {
          title: document.getElementById('meta-title')?.value || '',
          description: document.getElementById('meta-description')?.value || '',
          keywords: document.getElementById('meta-keywords')?.value || ''
        },
        analytics: {
          googleAnalytics: document.getElementById('google-analytics')?.value || ''
        }
      };
      
      // Sauvegarder dans les données actuelles
      mesDonneesActuelles.settings = settings;
      
      // Sauvegarder dans localStorage
      const currentData = JSON.parse(localStorage.getItem('portfolioData') || '{}');
      currentData.settings = settings;
      localStorage.setItem('portfolioData', JSON.stringify(currentData));
      
      // Déclencher manuellement l'événement storage pour les autres onglets
      // (l'événement storage ne se déclenche que pour les autres onglets, pas pour celui qui fait le changement)
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'portfolioData',
        newValue: JSON.stringify(currentData),
        oldValue: localStorage.getItem('portfolioData')
      }));
      
      // Sauvegarder sur le serveur
      await sauvegarderSurServeur();
      
      // Forcer la mise à jour du mode maintenance sur toutes les pages
      if (window.portfolioAPI && window.portfolioAPI.actualiser) {
        setTimeout(() => {
          window.portfolioAPI.actualiser();
        }, 500);
      }
      
      // Note: L'événement storage sera déclenché automatiquement pour les autres onglets
      // Pour cette page, la vérification se fera lors du prochain chargement ou via portfolioAPI
      
      afficherSucces('Paramètres du portfolio sauvegardés avec succès !');
    } catch (erreur) {
      afficherErreur(null, 'Erreur lors de la sauvegarde des paramètres');
    }
  };
  
  // Sauvegarde les informations personnelles depuis l'onglet Paramètres
  async function sauvegarderInfosCompte(e) {
    e.preventDefault();
    
    try {
      const infos = {
        name: document.getElementById('settings-full-name').value.trim(),
        email: document.getElementById('settings-email').value.trim(),
        phone: document.getElementById('settings-phone').value.trim(),
        address: document.getElementById('settings-address').value.trim(),
        city: document.getElementById('settings-city').value.trim(),
        country: document.getElementById('settings-country').value.trim(),
        bio: document.getElementById('settings-bio').value.trim()
      };
      
      if (!infos.name || !infos.email) {
        afficherErreur(null, 'Le nom et l\'email sont obligatoires');
        return;
      }
      
      // Mettre à jour les données personnelles
      mesDonneesActuelles.personal = {
        ...mesDonneesActuelles.personal,
        ...infos
      };
      
      await sauvegarderSurServeur();
      afficherSucces('Informations personnelles mises à jour avec succès !');
      
      // Mettre à jour aussi l'onglet Informations personnelles
      afficherMesInfosPersonnelles();
    } catch (erreur) {
      afficherErreur(null, 'Erreur lors de la mise à jour des informations');
    }
  }
  
  // Sauvegarde les autres informations
  async function sauvegarderAutresInfos(e) {
    e.preventDefault();
    
    try {
      const autresInfos = {
        currentEducation: document.getElementById('settings-current-education').value.trim(),
        previousEducation: document.getElementById('settings-previous-education').value.trim(),
        languages: document.getElementById('settings-languages').value.split(',').map(l => l.trim()).filter(l => l),
        interests: document.getElementById('settings-interests').value.split(',').map(i => i.trim()).filter(i => i)
      };
      
      // Mettre à jour les données personnelles
      mesDonneesActuelles.personal = {
        ...mesDonneesActuelles.personal,
        ...autresInfos
      };
      
      await sauvegarderSurServeur();
      afficherSucces('Autres informations mises à jour avec succès !');
    } catch (erreur) {
      afficherErreur(null, 'Erreur lors de la mise à jour des informations');
    }
  }
  
  // Change le mot de passe
  async function changerMotDePasse(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      afficherErreur(null, 'Tous les champs sont obligatoires');
      return;
    }
    
    if (newPassword.length < 8) {
      afficherErreur(null, 'Le nouveau mot de passe doit contenir au minimum 8 caractères');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      afficherErreur(null, 'Les mots de passe ne correspondent pas');
      return;
    }
    
    try {
      const token = obtenirToken();
      if (!token) {
        afficherErreur(null, 'Vous devez être connecté pour changer votre mot de passe');
        return;
      }
      
      // Appeler l'API pour changer le mot de passe
      const reponse = await fetch(`${MON_SERVEUR}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      
      const resultat = await reponse.json();
      
      if (reponse.ok) {
        // Afficher les instructions pour mettre à jour le .env
        let message = '✅ Nouveau hash généré avec succès !\n\n';
        message += '⚠️ IMPORTANT - Étapes à suivre :\n\n';
        if (resultat.instructions) {
          message += resultat.instructions.join('\n') + '\n\n';
        }
        message += '📋 Nouveau hash :\n';
        message += resultat.newHash || 'Non disponible';
        message += '\n\n';
        message += '1. Copiez le hash ci-dessus\n';
        message += '2. Mettez à jour ADMIN_PASSWORD_HASH dans votre fichier .env\n';
        message += '3. Redémarrez le serveur\n';
        message += '4. Connectez-vous avec votre nouveau mot de passe';
        
        // Afficher dans une alerte pour que l'utilisateur puisse copier le hash
        alert(message);
        
        // Afficher aussi un message de succès
        afficherSucces('Nouveau hash généré ! Consultez l\'alerte pour les instructions.');
        
        // Réinitialiser le formulaire
        document.getElementById('change-password-form').reset();
      } else {
        afficherErreur(null, resultat.error || resultat.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (erreur) {
      logError('Erreur changement mot de passe:', erreur);
      afficherErreur(null, 'Impossible de changer le mot de passe. Vérifiez votre connexion au serveur.');
    }
  }
  
  // Charge les informations dans le formulaire Paramètres
  function chargerInfosParametres() {
    const personal = mesDonneesActuelles.personal || {};
    
    // Informations personnelles
    if (document.getElementById('settings-full-name')) {
      document.getElementById('settings-full-name').value = personal.name || personal.fullName || '';
    }
    if (document.getElementById('settings-email')) {
      document.getElementById('settings-email').value = personal.email || '';
    }
    if (document.getElementById('settings-phone')) {
      document.getElementById('settings-phone').value = personal.phone || '';
    }
    if (document.getElementById('settings-address')) {
      document.getElementById('settings-address').value = personal.address || '';
    }
    if (document.getElementById('settings-city')) {
      document.getElementById('settings-city').value = personal.city || '';
    }
    if (document.getElementById('settings-country')) {
      document.getElementById('settings-country').value = personal.country || '';
    }
    if (document.getElementById('settings-bio')) {
      document.getElementById('settings-bio').value = personal.bio || personal.description || '';
    }
    
    // Autres informations
    if (document.getElementById('settings-current-education')) {
      document.getElementById('settings-current-education').value = personal.currentEducation || '';
    }
    if (document.getElementById('settings-previous-education')) {
      document.getElementById('settings-previous-education').value = personal.previousEducation || '';
    }
    if (document.getElementById('settings-languages')) {
      document.getElementById('settings-languages').value = Array.isArray(personal.languages) ? personal.languages.join(', ') : (personal.languages || '');
    }
    if (document.getElementById('settings-interests')) {
      document.getElementById('settings-interests').value = Array.isArray(personal.interests) ? personal.interests.join(', ') : (personal.interests || '');
    }
    
    // Paramètres du portfolio
    const settings = mesDonneesActuelles.settings || {};
    if (document.getElementById('maintenance-mode')) {
      document.getElementById('maintenance-mode').checked = settings.maintenance?.enabled || false;
      toggleMaintenanceModeDisplay();
    }
    if (document.getElementById('maintenance-message')) {
      document.getElementById('maintenance-message').value = settings.maintenance?.message || '';
    }
    if (document.getElementById('meta-title')) {
      document.getElementById('meta-title').value = settings.seo?.title || '';
    }
    if (document.getElementById('meta-description')) {
      document.getElementById('meta-description').value = settings.seo?.description || '';
    }
    if (document.getElementById('meta-keywords')) {
      document.getElementById('meta-keywords').value = settings.seo?.keywords || '';
    }
    if (document.getElementById('google-analytics')) {
      document.getElementById('google-analytics').value = settings.analytics?.googleAnalytics || '';
    }
  }
  
  window.toggleMaintenanceModeDisplay = function() {
    const group = document.getElementById('maintenance-message-group');
    const checkbox = document.getElementById('maintenance-mode');
    if (group && checkbox) {
      group.style.display = checkbox.checked ? 'block' : 'none';
    }
  };
  
  // Témoignages (placeholder)
  window.showTestimonialForm = function() {
    afficherErreur(null, 'Fonctionnalité des témoignages à venir');
  };
  
  window.hideTestimonialForm = function() {};
  
  
  /* ===== INTERFACE ET ÉVÉNEMENTS ===== */
  
  // Affiche un message de succès
  function afficherSucces(message) {
    const successMsg = document.getElementById('success-message');
    if (successMsg) {
      successMsg.textContent = message;
      successMsg.classList.add('active');
      setTimeout(() => successMsg.classList.remove('active'), 5000);
    }
  }
  
  // Affiche un message d'erreur
  function afficherErreur(element, message) {
    if (window.location.hostname === 'localhost') {
      logError('Erreur:', message);
    }
    
    if (element) {
      element.textContent = message;
      element.classList.add('active');
      setTimeout(() => element.classList.remove('active'), 5000);
    } else {
      const errorMsg = document.getElementById('login-error');
      if (errorMsg) {
        errorMsg.textContent = message;
        errorMsg.classList.add('active');
      }
    }
  }
  
  
  /* ===== CONFIGURATION DES FORMULAIRES ===== */
  
  // Configure tous les formulaires
  function configurerFormulaires() {
    // Formulaire de connexion
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', seConnecter);
    
    // Formulaire infos personnelles
    const personalForm = document.getElementById('personal-info-form');
    if (personalForm) personalForm.addEventListener('submit', sauvegarderInfosPersonnelles);
    
    // Formulaire projet
    const projectForm = document.getElementById('project-form');
    if (projectForm) projectForm.addEventListener('submit', sauvegarderProjet);
    
    // Formulaire compétence
    const skillForm = document.getElementById('skill-category-form');
    if (skillForm) skillForm.addEventListener('submit', sauvegarderCompetence);
    
    // Formulaire certification
    const certForm = document.getElementById('certification-form');
    if (certForm) certForm.addEventListener('submit', sauvegarderCertification);
    
    // Formulaire timeline
    const timelineForm = document.getElementById('timeline-form');
    if (timelineForm) timelineForm.addEventListener('submit', sauvegarderTimeline);
    
    // Formulaire service
    const serviceForm = document.getElementById('service-form');
    if (serviceForm) serviceForm.addEventListener('submit', sauvegarderService);
    
    // Formulaire FAQ
    const faqForm = document.getElementById('faq-form');
    if (faqForm) faqForm.addEventListener('submit', sauvegarderFAQ);
    
    // Formulaire CV
    const cvForm = document.getElementById('cv-form');
    if (cvForm) cvForm.addEventListener('submit', sauvegarderCV);
    
    // Formulaire lien social
    const socialForm = document.getElementById('social-link-form');
    if (socialForm) socialForm.addEventListener('submit', ajouterLienSocial);
    
    // Formulaire stage
    const stageForm = document.getElementById('stage-form');
    if (stageForm) stageForm.addEventListener('submit', sauvegarderStage);
    
    // Formulaire alternance
    const alternanceForm = document.getElementById('alternance-form');
    if (alternanceForm) alternanceForm.addEventListener('submit', sauvegarderAlternance);
    
    // Formulaire événement technologique
    const techEventForm = document.getElementById('tech-event-form');
    if (techEventForm) techEventForm.addEventListener('submit', sauvegarderTechEvent);
    
    // Formulaires Paramètres
    const accountInfoForm = document.getElementById('account-info-form');
    if (accountInfoForm) accountInfoForm.addEventListener('submit', sauvegarderInfosCompte);
    
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) changePasswordForm.addEventListener('submit', changerMotDePasse);
    
    const otherInfoForm = document.getElementById('other-info-form');
    if (otherInfoForm) otherInfoForm.addEventListener('submit', sauvegarderAutresInfos);
    
    // Bouton déconnexion
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', seDeconnecter);
  }
  
  
  /* ===== INITIALISATION ADMIN ===== */
  
  function initialiserAdmin() {
    // Vérifie l'état de connexion
    if (suisJeConnecte()) {
      afficherDashboard();
    } else {
      afficherConnexion();
    }
    
    // Configure les onglets
    configurerOnglets();
    
    // Configure les formulaires
    configurerFormulaires();
    
    // Gestion de la photo
    const photoInput = document.getElementById('photo-file-input');
    if (photoInput) {
      photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(event) {
            // Convertir en base64 pour stockage
            const base64 = event.target.result;
            document.getElementById('photo').value = base64;
            const preview = document.getElementById('photo-preview');
            if (preview) {
              preview.src = base64;
              preview.style.display = 'block';
            }
            const placeholder = document.getElementById('photo-preview-placeholder');
            if (placeholder) placeholder.style.display = 'none';
          };
          reader.readAsDataURL(file);
        }
      });
    }
    
    // Gestion du CV upload
    const cvFileInput = document.getElementById('cv-file-input');
    const cvUploadForm = document.getElementById('cv-upload-form');
    
    if (cvFileInput) {
      cvFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(event) {
            const base64 = event.target.result;
            if (!mesDonneesActuelles.links) mesDonneesActuelles.links = {};
            
            // SUPPRIMER L'ANCIEN CV : Remplacer complètement par le nouveau
            // Supprimer l'ancien cvFile s'il existe
            if (mesDonneesActuelles.links.cvFile) {
              log('🗑️ Remplacement de l\'ancien CV par le nouveau');
            }
            
            // SUPPRIMER L'ANCIEN CHEMIN : Si cv était un chemin (assets/CV.pdf), le remplacer
            if (mesDonneesActuelles.links.cv && !mesDonneesActuelles.links.cv.startsWith('data:')) {
              log('🗑️ Suppression de l\'ancien chemin CV:', mesDonneesActuelles.links.cv);
            }
            
            // Mettre le nouveau CV (base64) dans cvFile ET cv
            mesDonneesActuelles.links.cvFile = base64;
            mesDonneesActuelles.links.cvFileName = file.name;
            mesDonneesActuelles.links.cvFileSize = file.size;
            // REMPLACER l'ancien cv (chemin ou base64) par le nouveau base64
            mesDonneesActuelles.links.cv = base64;
            
            log('✅ Nouveau CV base64 enregistré:', {
              fileName: file.name,
              size: file.size,
              base64Length: base64.length,
              cvIsBase64: mesDonneesActuelles.links.cv.startsWith('data:'),
              cvFileIsBase64: mesDonneesActuelles.links.cvFile.startsWith('data:')
            });
            
            const previewSection = document.getElementById('cv-preview-section');
            const fileName = document.getElementById('cv-file-name');
            const fileSize = document.getElementById('cv-file-size');
            const previewLink = document.getElementById('cv-preview-link');
            
            if (previewSection) previewSection.style.display = 'block';
            if (fileName) fileName.textContent = file.name;
            if (fileSize) fileSize.textContent = `Taille: ${(file.size / 1024).toFixed(2)} KB`;
            if (previewLink) {
              previewLink.href = base64;
              previewLink.download = file.name;
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
    
    // Formulaire d'upload CV
    if (cvUploadForm) {
      cvUploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!mesDonneesActuelles.links) mesDonneesActuelles.links = {};
        
        // Le fichier est déjà dans cvFile après le change event
        if (mesDonneesActuelles.links.cvFile && mesDonneesActuelles.links.cvFile.startsWith('data:')) {
          // SUPPRIMER L'ANCIEN CV : Remplacer complètement par le nouveau
          // Mettre le nouveau CV base64 dans cvFile ET cv (remplace l'ancien chemin ou base64)
          const nouveauCvBase64 = mesDonneesActuelles.links.cvFile;
          
          // Vérifier si l'ancien cv était un chemin
          const ancienCv = mesDonneesActuelles.links.cv;
          if (ancienCv && !ancienCv.startsWith('data:')) {
            log('🗑️ Suppression de l\'ancien chemin CV:', ancienCv);
          }
          
          // S'assurer que cvFile et cv contiennent le même base64
          mesDonneesActuelles.links.cv = nouveauCvBase64;
          
          // Vérification finale avant sauvegarde
          log('✅ Nouveau CV base64 prêt à être sauvegardé:', {
            fileName: mesDonneesActuelles.links.cvFileName,
            fileSize: mesDonneesActuelles.links.cvFileSize,
            cvIsBase64: mesDonneesActuelles.links.cv.startsWith('data:'),
            cvFileIsBase64: mesDonneesActuelles.links.cvFile.startsWith('data:'),
            cvLength: mesDonneesActuelles.links.cv.length,
            cvFileLength: mesDonneesActuelles.links.cvFile.length,
            cvStartsWith: mesDonneesActuelles.links.cv.substring(0, 20),
            cvFileStartsWith: mesDonneesActuelles.links.cvFile.substring(0, 20)
          });
          
          // Sauvegarder sur le serveur
          const success = await sauvegarderSurServeur();
          if (success) {
            afficherSucces('✅ CV uploadé et sauvegardé avec succès ! L\'ancien CV a été remplacé. Les pages publiques seront mises à jour automatiquement.');
            
            // Forcer le rechargement sur les autres pages après un court délai
            setTimeout(() => {
              if (window.portfolioAPI && window.portfolioAPI.actualiser) {
                log('🔄 Actualisation des pages publiques...');
                window.portfolioAPI.actualiser();
              }
            }, 1000);
            
            // Recharger aussi les liens dans l'admin
            afficherLiens();
          } else {
            afficherErreur(null, '❌ Erreur lors de la sauvegarde du CV. Vérifiez la console pour plus de détails.');
          }
        } else {
          afficherErreur(null, '❌ Veuillez sélectionner un fichier PDF valide. Le fichier doit être chargé avant de pouvoir être sauvegardé.');
        }
      });
    }
    
    log('✅ Interface admin initialisée');
  }
  
  // Lance l'admin !
  initialiserAdmin();
  
});
