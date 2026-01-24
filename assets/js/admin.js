/*
 * Administration du Portfolio
 * Script admin simplifié et humain pour gérer le contenu
 * 
 * Fonctionnalités :
 * - Connexion sécurisée
 * - Gestion des projets, compétences, informations
 * - Export/Import des données
 * - Interface intuitive
 */

document.addEventListener('DOMContentLoaded', function() {
  
  /* ===== CONFIGURATION ADMIN ===== */
  
  // Adresse de mon serveur
  const MON_SERVEUR = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://portfolio-backend-x47u.onrender.com/api';
  
  // Données par défaut de l'admin
  const DONNEES_PAR_DEFAUT = {
    personal: {
      name: 'Nema Elisée Kourouma',
      title: 'Développeur Full-Stack IA',
      description: 'Passionné par l\'IA et le développement web.',
      email: 'kouroumaelisee@gmail.com',
      phone: '+33689306432',
      photo: 'assets/photo.jpeg'
    },
    projects: [],
    skills: [],
    timeline: [],
    about: {
      heroDescription: 'Master 1 en IA à l\'ESGI Paris',
      aboutDescription: 'Je conçois des solutions innovantes.',
      stats: { projects: 0, experience: 2, technologies: 10 }
    }
  };
  
  // Données actuelles en cours d'édition
  let mesDonneesActuelles = JSON.parse(JSON.stringify(DONNEES_PAR_DEFAUT));
  
  
  /* ===== CONNEXION ET AUTHENTIFICATION ===== */
  
  // Vérifie si je suis connecté
  function suisJeConnecte() {
    const token = localStorage.getItem('adminToken');
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
    
    if (pageConnexion) pageConnexion.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
    
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
      const reponse = await fetch(`${MON_SERVEUR}/auth/login`, {
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
        afficherErreur(messageErreur, resultat.message || 'Email ou mot de passe incorrect');
      }
      
    } catch (erreur) {
      afficherErreur(messageErreur, 'Impossible de se connecter au serveur');
    }
  }
  
  // Déconnexion
  function seDeconnecter() {
    localStorage.removeItem('adminToken');
    afficherConnexion();
    afficherSucces('Déconnexion réussie');
  }
  
  
  /* ===== GESTION DES DONNÉES ===== */
  
  // Charge toutes mes données
  async function chargerToutesMesDonnees() {
    try {
      const donneesLocales = localStorage.getItem('portfolioData');
      if (donneesLocales) {
        mesDonneesActuelles = JSON.parse(donneesLocales);
      }
      
      afficherToutesMesDonnees();
    } catch (erreur) {
      afficherErreur(null, 'Erreur lors du chargement des données');
    }
  }
  
  // Sauvegarde mes données
  function sauvegarderMesDonnees() {
    try {
      localStorage.setItem('portfolioData', JSON.stringify(mesDonneesActuelles));
      afficherSucces('Données sauvegardées avec succès !');
    } catch (erreur) {
      afficherErreur(null, 'Erreur lors de la sauvegarde');
    }
  }
  
  // Affiche toutes les données dans l'interface
  function afficherToutesMesDonnees() {
    afficherMesInfosPersonnelles();
    afficherListeProjets();
    afficherListeCompetences();
    mettreAJourStatsDashboard();
  }
  
  
  /* ===== GESTION DES PROJETS ===== */
  
  // Affiche la liste de mes projets
  function afficherListeProjets() {
    const container = document.getElementById('projects-list');
    if (!container) return;
    
    if (!mesDonneesActuelles.projects || mesDonneesActuelles.projects.length === 0) {
      container.innerHTML = '<p class="muted">Aucun projet pour le moment.</p>';
      return;
    }
    
    container.innerHTML = mesDonneesActuelles.projects.map(projet => `
      <div class="card">
        <h4>${projet.title || 'Projet sans titre'}</h4>
        <p class="muted">${projet.description || 'Pas de description'}</p>
        <div class="flex gap-sm" style="margin-top: 12px;">
          <button class="btn-small" data-edit-project="${projet.id}">Modifier</button>
          <button class="btn-small btn-secondary" data-delete-project="${projet.id}">Supprimer</button>
        </div>
      </div>
    `).join('');
  }
  
  // Ajoute un nouveau projet
  function ajouterProjet() {
    const titre = document.getElementById('project-title').value.trim();
    const description = document.getElementById('project-description').value.trim();
    const technologies = document.getElementById('project-tech').value.split(',').map(t => t.trim());
    
    if (!titre || !description) {
      afficherErreur(null, 'Titre et description obligatoires');
      return;
    }
    
    const nouveauProjet = {
      id: 'project-' + Date.now(),
      title: titre,
      description: description,
      technologies: technologies.filter(t => t.length > 0),
      date: new Date().toISOString(),
      featured: false,
      type: 'Web App'
    };
    
    mesDonneesActuelles.projects.push(nouveauProjet);
    sauvegarderMesDonnees();
    afficherListeProjets();
    viderFormulaireProjet();
    afficherSucces('Projet ajouté avec succès !');
  }
  
  // Vide le formulaire de projet
  function viderFormulaireProjet() {
    const form = document.getElementById('project-form');
    if (form) form.reset();
  }
  
  
  /* ===== GESTION DES COMPÉTENCES ===== */
  
  // Affiche la liste de mes compétences
  function afficherListeCompetences() {
    const container = document.getElementById('skills-list');
    if (!container) return;
    
    if (!mesDonneesActuelles.skills || mesDonneesActuelles.skills.length === 0) {
      container.innerHTML = '<p class="muted">Aucune compétence pour le moment.</p>';
      return;
    }
    
    container.innerHTML = mesDonneesActuelles.skills.map(skill => `
      <div class="card">
        <h4>${skill.icon || '🔧'} ${skill.category || 'Compétence'}</h4>
        <p class="muted">${(skill.items || []).join(', ')}</p>
        <div class="flex gap-sm" style="margin-top: 12px;">
          <button class="btn-small" data-edit-skill="${skill.id}">Modifier</button>
          <button class="btn-small btn-secondary" data-delete-skill="${skill.id}">Supprimer</button>
        </div>
      </div>
    `).join('');
  }
  
  // Ajoute une nouvelle compétence
  function ajouterCompetence() {
    const categorie = document.getElementById('skill-category').value.trim();
    const icone = document.getElementById('skill-icon').value.trim();
    const items = document.getElementById('skill-items').value.split(',').map(i => i.trim());
    
    if (!categorie) {
      afficherErreur(null, 'Nom de catégorie obligatoire');
      return;
    }
    
    const nouvelleCompetence = {
      id: 'skill-' + Date.now(),
      category: categorie,
      icon: icone || '🔧',
      items: items.filter(i => i.length > 0)
    };
    
    mesDonneesActuelles.skills.push(nouvelleCompetence);
    sauvegarderMesDonnees();
    afficherListeCompetences();
    viderFormulaireCompetence();
    afficherSucces('Compétence ajoutée avec succès !');
  }
  
  // Vide le formulaire de compétence
  function viderFormulaireCompetence() {
    const form = document.getElementById('skill-form');
    if (form) form.reset();
  }
  
  
  /* ===== GESTION DES INFORMATIONS PERSONNELLES ===== */
  
  // Affiche mes infos personnelles dans le dashboard
  function afficherMesInfosPersonnelles() {
    const nom = document.getElementById('personal-name');
    const titre = document.getElementById('personal-title');
    const description = document.getElementById('personal-description');
    const email = document.getElementById('personal-email');
    const telephone = document.getElementById('personal-phone');
    
    if (nom) nom.value = mesDonneesActuelles.personal?.name || '';
    if (titre) titre.value = mesDonneesActuelles.personal?.title || '';
    if (description) description.value = mesDonneesActuelles.personal?.description || '';
    if (email) email.value = mesDonneesActuelles.personal?.email || '';
    if (telephone) telephone.value = mesDonneesActuelles.personal?.phone || '';
  }
  
  // Sauvegarde mes infos personnelles
  function sauvegarderInfosPersonnelles() {
    mesDonneesActuelles.personal = {
      ...mesDonneesActuelles.personal,
      name: document.getElementById('personal-name')?.value || '',
      title: document.getElementById('personal-title')?.value || '',
      description: document.getElementById('personal-description')?.value || '',
      email: document.getElementById('personal-email')?.value || '',
      phone: document.getElementById('personal-phone')?.value || ''
    };
    
    sauvegarderMesDonnees();
    afficherSucces('Informations personnelles sauvegardées !');
  }
  
  
  /* ===== IMPORT/EXPORT ===== */
  
  // Exporte toutes mes données
  function exporterMesDonnees() {
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
  }
  
  // Importe des données
  function importerDonnees() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
      const fichier = e.target.files[0];
      if (!fichier) return;
      
      const reader = new FileReader();
      reader.onload = function(event) {
        try {
          const donneesImportees = JSON.parse(event.target.result);
          
          if (confirm('Voulez-vous vraiment remplacer toutes vos données actuelles ?')) {
            mesDonneesActuelles = { ...DONNEES_PAR_DEFAUT, ...donneesImportees };
            sauvegarderMesDonnees();
            afficherToutesMesDonnees();
            afficherSucces('Données importées avec succès !');
          }
        } catch (erreur) {
          afficherErreur(null, 'Fichier JSON invalide');
        }
      };
      reader.readAsText(fichier);
    };
    
    input.click();
  }
  
  // Réinitialise toutes les données
  function reinitialiserDonnees() {
    if (confirm('⚠️ ATTENTION : Voulez-vous vraiment supprimer TOUTES vos données ?')) {
      if (confirm('Cette action est IRRÉVERSIBLE. Confirmez-vous ?')) {
        mesDonneesActuelles = JSON.parse(JSON.stringify(DONNEES_PAR_DEFAUT));
        sauvegarderMesDonnees();
        afficherToutesMesDonnees();
        afficherSucces('Données réinitialisées');
      }
    }
  }
  
  
  /* ===== INTERFACE ET ÉVÉNEMENTS ===== */
  
  // Affiche un message de succès
  function afficherSucces(message) {
    // Crée une notification verte temporaire
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--couleur-succes);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 500;
      z-index: 1000;
      box-shadow: var(--ombre-moyenne);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  // Affiche un message d'erreur
  function afficherErreur(element, message) {
    // Log d'erreur en développement seulement
    if (window.location.hostname === 'localhost') {
      console.error('Erreur:', message);
    }
    
    if (element) {
      element.textContent = message;
      element.style.display = 'block';
      
      setTimeout(() => {
        element.style.display = 'none';
      }, 5000);
    } else {
      // Notification rouge si pas d'élément spécifique
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--couleur-erreur);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 1000;
        box-shadow: var(--ombre-moyenne);
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 5000);
    }
  }
  
  // Met à jour les statistiques du dashboard
  function mettreAJourStatsDashboard() {
    const nbProjets = document.getElementById('dashboard-projects-count');
    const nbCompetences = document.getElementById('dashboard-skills-count');
    const nbEvenements = document.getElementById('dashboard-timeline-count');
    
    if (nbProjets) {
      nbProjets.textContent = mesDonneesActuelles.projects?.length || 0;
    }
    
    if (nbCompetences) {
      nbCompetences.textContent = mesDonneesActuelles.skills?.length || 0;
    }
    
    if (nbEvenements) {
      nbEvenements.textContent = mesDonneesActuelles.timeline?.length || 0;
    }
  }
  
  // Configure tous les événements de clic
  function configurerEvenements() {
    document.addEventListener('click', function(e) {
      // Bouton export
      if (e.target.matches('[data-action="export"]')) {
        e.preventDefault();
        exporterMesDonnees();
        return;
      }
      
      // Bouton import
      if (e.target.matches('[data-action="import"]')) {
        e.preventDefault();
        importerDonnees();
        return;
      }
      
      // Bouton réinitialiser
      if (e.target.matches('[data-action="reset"]')) {
        e.preventDefault();
        reinitialiserDonnees();
        return;
      }
      
      // Sauvegarde infos personnelles
      if (e.target.matches('[data-action="save-personal"]')) {
        e.preventDefault();
        sauvegarderInfosPersonnelles();
        return;
      }
      
      // Ajouter projet
      if (e.target.matches('[data-action="add-project"]')) {
        e.preventDefault();
        ajouterProjet();
        return;
      }
      
      // Ajouter compétence
      if (e.target.matches('[data-action="add-skill"]')) {
        e.preventDefault();
        ajouterCompetence();
        return;
      }
      
      // Déconnexion
      if (e.target.matches('[data-action="logout"]')) {
        e.preventDefault();
        seDeconnecter();
        return;
      }
    });
    
    // Formulaire de connexion
    const formConnexion = document.getElementById('login-form');
    if (formConnexion) {
      formConnexion.addEventListener('submit', seConnecter);
    }
  }
  
  
  /* ===== INITIALISATION ADMIN ===== */
  
  function initialiserAdmin() {
    // Vérifie l'état de connexion
    if (suisJeConnecte()) {
      afficherDashboard();
    } else {
      afficherConnexion();
    }
    
    // Configure tous les événements
    configurerEvenements();
    
    // Interface admin initialisée
  }
  
  // Lance l'admin !
  initialiserAdmin();
  
});

/*
 * Fonctions globales nécessaires pour certains boutons HTML existants
 * (Compatibilité avec l'HTML actuel)
 */

// Fonctions d'export/import publiques
window.exportAllData = function() {
  const event = new CustomEvent('click');
  const bouton = document.querySelector('[data-action="export"]');
  if (bouton) bouton.dispatchEvent(event);
};

window.importAllData = function() {
  const event = new CustomEvent('click');
  const bouton = document.querySelector('[data-action="import"]');
  if (bouton) bouton.dispatchEvent(event);
};

window.clearAllData = function() {
  const event = new CustomEvent('click');
  const bouton = document.querySelector('[data-action="reset"]');
  if (bouton) bouton.dispatchEvent(event);
};

// Autres fonctions demandées par l'HTML
window.showProjectForm = function() { /* Formulaire projet à implémenter */ };
window.hideProjectForm = function() { /* Fermeture formulaire projet */ };
window.editProject = function(id) { /* Édition projet: ${id} */ };
window.deleteProject = function(id) { /* Suppression projet: ${id} */ };
window.deleteSkill = function(id) { /* Suppression compétence: ${id} */ };
window.applyChangesToPortfolio = function() { 
  /* Application des modifications... */
};

// Autres fonctions administratives
const adminFunctions = [
  'clearPhotoPreview', 'showSuccess', 'deleteSelectedPersonalInfo',
  'toggleSelectAllPersonalInfo', 'showPersonalInfoForm', 'hidePersonalInfoForm',
  'toggleSelectAllProjects', 'deleteSelectedProjects', 'toggleSelectAllSkills',
  'deleteSelectedSkills', 'switchCVMethod', 'clearCVUpload', 'saveAboutInfo',
  'showTestimonialForm', 'hideTestimonialForm', 'showTimelineForm', 'hideTimelineForm',
  'showServiceForm', 'hideServiceForm', 'showCertificationForm', 'hideCertificationForm',
  'showFAQForm', 'hideFAQForm', 'saveSettings', 'saveStatsInfo',
  'toggleMaintenanceModeDisplay', 'handleFileImport'
];

adminFunctions.forEach(funcName => {
  window[funcName] = function() {
    // Fonction ${funcName}() appelée - à implémenter si nécessaire
  };
});