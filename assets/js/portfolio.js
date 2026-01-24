/*
 * Portfolio de Nema Elisée Kourouma
 * Script principal - Code écrit pour être compris par un humain
 * 
 * Ce fichier gère toute l'interactivité du portfolio :
 * - Chargement et affichage des données personnelles
 * - Navigation et animations
 * - Partage sur les réseaux sociaux
 * - Contact et interactions
 */

// On attend que la page soit complètement chargée
document.addEventListener('DOMContentLoaded', function() {
  
  /* ===== CONFIGURATION GÉNÉRALE ===== */
  
  // Mon email et informations de contact
  const MES_CONTACTS = {
    email: 'kouroumaelisee@gmail.com',
    telephone: '+33689306432',
    whatsapp: 'https://wa.me/33689306432',
    facebook: 'https://www.facebook.com/share/17xGVe29cL/',
    linkedin: 'https://linkedin.com/in/nema-kourouma'
  };
  
  // Adresse de mon serveur backend
  const MON_SERVEUR = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : 'https://portfolio-backend-x47u.onrender.com/api';
  
  
  /* ===== FONCTIONS UTILITAIRES ===== */
  
  // Met à jour l'année dans le footer automatiquement
  function mettreAJourAnnee() {
    const elementAnnee = document.querySelector('[data-year]');
    if (elementAnnee) {
      elementAnnee.textContent = new Date().getFullYear();
    }
  }
  
  // Nettoie le localStorage si il contient du code malveillant
  function nettoyerDonnees() {
    const donnees = localStorage.getItem('portfolioData');
    if (donnees && (donnees.includes("'\\n' +") || donnees.includes('`'))) {
      // On supprime les données suspectes pour la sécurité
      localStorage.removeItem('portfolioData');
      localStorage.removeItem('projects');
      localStorage.removeItem('skills');
      localStorage.removeItem('timeline');
    }
  }
  
  // Vérifie si les données sont vides ou inexistantes
  function donneesSontVides(donnees) {
    if (!donnees) return true;
    
    const aProjets = donnees.projects && donnees.projects.length > 0;
    const aCompetences = donnees.skills && donnees.skills.length > 0;
    const aParcours = donnees.timeline && donnees.timeline.length > 0;
    
    return !aProjets && !aCompetences && !aParcours;
  }
  
  
  /* ===== CHARGEMENT DES DONNÉES ===== */
  
  // Charge mes données depuis le serveur
  async function chargerDonneesServeur() {
    try {
      const reponse = await fetch(`${MON_SERVEUR}/portfolio`);
      if (!reponse.ok) throw new Error('Serveur indisponible');
      
      const donnees = await reponse.json();
      return donneesSontVides(donnees) ? null : donnees;
    } catch (erreur) {
      return null; // Si le serveur ne répond pas, on utilise les données locales
    }
  }
  
  // Récupère mes données (serveur ou localStorage)
  function obtenirMesDonnees() {
    try {
      const donneesLocales = localStorage.getItem('portfolioData');
      return donneesLocales ? JSON.parse(donneesLocales) : creerDonneesParDefaut();
    } catch (erreur) {
      return creerDonneesParDefaut();
    }
  }
  
  // Crée mes données de base si aucune n'existe
  function creerDonneesParDefaut() {
    const donneesParDefaut = {
      personal: {
        name: 'Nema Elisée Kourouma',
        title: 'Développeur Full-Stack IA',
        description: 'Master 1 en Intelligence Artificielle à l\'École Supérieure d\'Informatique de Paris. Titulaire d\'une licence en mathématiques et informatique (USMBA Fès).',
        email: MES_CONTACTS.email,
        phone: MES_CONTACTS.telephone,
        photo: 'assets/photo.jpeg'
      },
      projects: [],
      skills: [],
      timeline: [],
      about: {
        heroDescription: 'Passionné par l\'Intelligence Artificielle et le développement web.',
        aboutDescription: 'Je conçois des solutions innovantes alliant IA et développement web.',
        stats: {
          projects: 0,
          experience: 2,
          technologies: 10
        }
      }
    };
    
    localStorage.setItem('portfolioData', JSON.stringify(donneesParDefaut));
    return donneesParDefaut;
  }
  
  // Charge et affiche toutes mes données
  async function chargerEtAfficherDonnees() {
    try {
      // Essaie d'abord de charger depuis le serveur
      const donneesServeur = await chargerDonneesServeur();
      let mesDonnees;
      
      if (donneesServeur) {
        // Utilise les données du serveur si disponibles
        localStorage.setItem('portfolioData', JSON.stringify(donneesServeur));
        mesDonnees = donneesServeur;
      } else {
        // Sinon utilise les données locales
        mesDonnees = obtenirMesDonnees();
      }
      
      afficherMesDonnees(mesDonnees);
      
    } catch (erreur) {
      // En cas d'erreur, utilise les données par défaut
      const donnees = obtenirMesDonnees();
      afficherMesDonnees(donnees);
    }
  }
  
  
  /* ===== AFFICHAGE DES DONNÉES ===== */
  
  // Affiche toutes mes données sur le site
  function afficherMesDonnees(donnees) {
    afficherMesInfos(donnees.personal);
    afficherMesProjets(donnees.projects);
    afficherMesCompetences(donnees.skills);
    afficherMonParcours(donnees.timeline);
    afficherMesStats(donnees.about?.stats);
  }
  
  // Affiche mes informations personnelles
  function afficherMesInfos(infos) {
    if (!infos) return;
    
    // Met à jour le titre de la page
    if (infos.name) {
      document.title = `${infos.name} - Portfolio`;
    }
  }
  
  // Affiche mes projets sur la page d'accueil
  function afficherMesProjets(projets) {
    const container = document.getElementById('homepage-projects');
    if (!container || !projets || !Array.isArray(projets)) return;
    
    if (projets.length === 0) {
      container.innerHTML = '<p class="text-center muted">Projets en cours de chargement...</p>';
      return;
    }
    
    // Affiche les 4 premiers projets
    const projetsAffichage = projets.slice(0, 4);
    
    container.innerHTML = projetsAffichage.map(projet => `
      <div class="card project-card">
        <h3>${projet.title || 'Projet'}</h3>
        <p class="muted">${projet.description || 'Description à venir...'}</p>
        <div class="project-tech">
          ${(projet.technologies || []).map(tech => 
            `<span class="badge">${tech}</span>`
          ).join('')}
        </div>
      </div>
    `).join('');
  }
  
  // Affiche mes compétences
  function afficherMesCompetences(competences) {
    const container = document.getElementById('homepage-skills');
    if (!container || !competences || !Array.isArray(competences)) return;
    
    if (competences.length === 0) {
      container.innerHTML = '<p class="text-center muted">Compétences en cours de chargement...</p>';
      return;
    }
    
    container.innerHTML = competences.map(skill => `
      <div class="card skill-card">
        <h4>${skill.icon || '🔧'} ${skill.category || 'Compétence'}</h4>
        <div class="skills-list">
          ${(skill.items || []).map(item => 
            `<span class="skill-item">${item}</span>`
          ).join('')}
        </div>
      </div>
    `).join('');
  }
  
  // Affiche mon parcours (timeline)
  function afficherMonParcours(parcours) {
    // Cette fonction sera utilisée sur la page À propos
    if (!parcours || !Array.isArray(parcours)) return;
    
    const container = document.getElementById('timeline-container');
    if (!container) return;
    
    container.innerHTML = parcours.map(etape => `
      <div class="timeline-item">
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <h3 class="timeline-title">${etape.title || 'Étape'}</h3>
            <span class="timeline-date">${etape.date || ''}</span>
          </div>
          <p class="timeline-description">${etape.description || ''}</p>
        </div>
      </div>
    `).join('');
  }
  
  // Met à jour les statistiques
  function afficherMesStats(stats) {
    if (!stats) return;
    
    const statProjets = document.getElementById('stat-projects');
    const statExperience = document.getElementById('stat-experience');
    const statTechnologies = document.getElementById('stat-technologies');
    
    if (statProjets && stats.projects !== undefined) {
      animerCompteur(statProjets, stats.projects);
    }
    
    if (statExperience && stats.experience !== undefined) {
      statExperience.textContent = stats.experience + '+';
    }
    
    if (statTechnologies && stats.technologies !== undefined) {
      statTechnologies.textContent = stats.technologies + '+';
    }
  }
  
  // Anime un compteur de 0 vers la valeur finale
  function animerCompteur(element, valeurFinale) {
    const duree = 1000; // 1 seconde
    const debut = performance.now();
    
    function animer(tempsActuel) {
      const tempsEcoule = tempsActuel - debut;
      const progres = Math.min(tempsEcoule / duree, 1);
      const valeurActuelle = Math.floor(progres * valeurFinale);
      
      element.textContent = valeurActuelle;
      
      if (progres < 1) {
        requestAnimationFrame(animer);
      }
    }
    
    requestAnimationFrame(animer);
  }
  
  
  /* ===== NAVIGATION ET INTERACTIONS ===== */
  
  // Configure le menu mobile
  function configurerMenuMobile() {
    const boutonMenu = document.getElementById('mobile-menu-toggle');
    const navigation = document.getElementById('nav-links');
    const overlay = document.getElementById('mobile-menu-overlay');
    
    if (!boutonMenu || !navigation || !overlay) return;
    
    function basculerMenu() {
      const estOuvert = navigation.classList.contains('active');
      
      if (estOuvert) {
        // Ferme le menu
        navigation.classList.remove('active');
        overlay.classList.remove('active');
        boutonMenu.classList.remove('active');
        boutonMenu.setAttribute('aria-expanded', 'false');
      } else {
        // Ouvre le menu
        navigation.classList.add('active');
        overlay.classList.add('active');
        boutonMenu.classList.add('active');
        boutonMenu.setAttribute('aria-expanded', 'true');
      }
    }
    
    boutonMenu.addEventListener('click', basculerMenu);
    overlay.addEventListener('click', basculerMenu);
    
    // Ferme le menu quand on clique sur un lien
    navigation.addEventListener('click', function(e) {
      if (e.target.tagName === 'A') {
        basculerMenu();
      }
    });
  }
  
  // Configure le bouton retour en haut
  function configurerRetourEnHaut() {
    const boutonRetour = document.getElementById('scroll-top');
    if (!boutonRetour) return;
    
    // Affiche/masque le bouton selon le scroll
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        boutonRetour.classList.add('visible');
      } else {
        boutonRetour.classList.remove('visible');
      }
    });
    
    // Action du bouton
    boutonRetour.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  
  // Configure les animations au scroll
  function configurerAnimations() {
    const elementsAnimes = document.querySelectorAll('[data-animate]');
    if (elementsAnimes.length === 0) return;
    
    const observateur = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });
    
    // Prépare et observe chaque élément
    elementsAnimes.forEach(function(element) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observateur.observe(element);
    });
  }
  
  
  /* ===== PARTAGE ET CONTACT ===== */
  
  // Configure les liens de contact sécurisés
  function configurerContact() {
    const boutonEmail = document.getElementById('contact-email-btn');
    const affichageEmail = document.getElementById('contact-email-display');
    
    if (boutonEmail) {
      boutonEmail.href = `mailto:${MES_CONTACTS.email}`;
      boutonEmail.textContent = 'Envoyer un email';
    }
    
    if (affichageEmail) {
      affichageEmail.href = `mailto:${MES_CONTACTS.email}`;
      affichageEmail.textContent = MES_CONTACTS.email;
    }
  }
  
  // Partage le portfolio sur les réseaux sociaux
  function partagerPortfolio(plateforme) {
    const urlSite = encodeURIComponent(window.location.href);
    const titreSite = encodeURIComponent(document.title);
    const message = encodeURIComponent('Découvrez mon portfolio !');
    
    let urlPartage = '';
    
    switch (plateforme) {
      case 'linkedin':
        urlPartage = `https://linkedin.com/sharing/share-offsite/?url=${urlSite}`;
        break;
      case 'twitter':
        urlPartage = `https://twitter.com/intent/tweet?text=${message}&url=${urlSite}`;
        break;
      case 'facebook':
        urlPartage = `https://www.facebook.com/sharer/sharer.php?u=${urlSite}`;
        break;
      case 'email':
        urlPartage = `mailto:?subject=${titreSite}&body=${message}%20${urlSite}`;
        break;
      default:
        return;
    }
    
    if (plateforme === 'email') {
      window.location.href = urlPartage;
    } else {
      window.open(urlPartage, 'partage', 'width=600,height=400');
    }
  }
  
  // Envoie une demande d'information sur un projet
  function demanderInfoProjet(nomProjet) {
    const sujet = encodeURIComponent(`Demande d'informations sur le projet: ${nomProjet}`);
    const message = encodeURIComponent(
      `Bonjour,\n\nJe suis intéressé(e) par votre projet "${nomProjet}". ` +
      `Pourriez-vous me donner plus d'informations ?\n\nMerci !`
    );
    
    window.open(`mailto:${MES_CONTACTS.email}?subject=${sujet}&body=${message}`, '_blank');
  }
  
  // Configure les événements de clic sécurisés (sans onclick inline)
  function configurerEvenements() {
    document.addEventListener('click', function(e) {
      // Gestion du partage social
      const boutonPartage = e.target.closest('[data-share]');
      if (boutonPartage) {
        e.preventDefault();
        const plateforme = boutonPartage.getAttribute('data-share');
        partagerPortfolio(plateforme);
        return;
      }
      
      // Gestion des demandes de projet
      const boutonProjet = e.target.closest('[data-project-inquiry]');
      if (boutonProjet) {
        e.preventDefault();
        const nomProjet = boutonProjet.getAttribute('data-project-inquiry');
        demanderInfoProjet(nomProjet);
        return;
      }
    });
  }
  
  
  /* ===== INITIALISATION ===== */
  
  // Lance toutes les fonctionnalités quand la page est chargée
  function initialiserPortfolio() {
    // Fonctions de base
    mettreAJourAnnee();
    nettoyerDonnees();
    
    // Chargement des données
    chargerEtAfficherDonnees();
    
    // Configuration de l'interface
    configurerContact();
    configurerMenuMobile();
    configurerRetourEnHaut();
    configurerAnimations();
    configurerEvenements();
    
    // Portfolio initialisé avec succès
  }
  
  // API publique pour l'admin panel
  window.portfolioAPI = {
    charger: chargerEtAfficherDonnees,
    obtenir: obtenirMesDonnees,
    actualiser: function() {
      chargerDonneesServeur().then(function(donnees) {
        if (donnees) {
          afficherMesDonnees(donnees);
        }
      });
    }
  };
  
  // Démarre le portfolio !
  initialiserPortfolio();
  
});