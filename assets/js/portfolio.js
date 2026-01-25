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
    ? 'http://localhost:3001/api'
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
    
    // Vérifier si le portfolio contient un CV base64
    const aCvBase64 = donnees.links && (
      (donnees.links.cvFile && donnees.links.cvFile.startsWith('data:')) ||
      (donnees.links.cv && donnees.links.cv.startsWith('data:'))
    );
    
    // Ne pas considérer comme vide si un CV base64 est présent
    return !aProjets && !aCompetences && !aParcours && !aCvBase64;
  }
  
  // Données actuelles affichées (pour comparaison)
  let donneesActuelles = null;
  let hashDonneesActuelles = null;
  let intervalVerification = null;
  
  // Vérifie et affiche le mode maintenance
  function verifierModeMaintenance(donnees) {
    const settings = donnees?.settings || {};
    const maintenanceEnabled = settings.maintenance?.enabled || false;
    const maintenanceMessage = settings.maintenance?.message || 'Le site est actuellement en maintenance. Nous serons bientôt de retour !';
    
    // Vérifier si on est sur la page admin (ne pas afficher la maintenance sur admin)
    const isAdminPage = window.location.pathname.includes('admin.html');
    if (isAdminPage) {
      return; // Ne pas afficher la maintenance sur la page admin
    }
    
    // Créer ou mettre à jour l'overlay de maintenance
    let maintenanceOverlay = document.getElementById('maintenance-overlay');
    
    if (maintenanceEnabled) {
      if (!maintenanceOverlay) {
        // Créer l'overlay de maintenance
        maintenanceOverlay = document.createElement('div');
        maintenanceOverlay.id = 'maintenance-overlay';
        maintenanceOverlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a22 100%);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 20px;
          text-align: center;
        `;
        
        maintenanceOverlay.innerHTML = `
          <div style="max-width: 600px; padding: 48px; background: var(--couleur-fond-carte, #0f0f15); border-radius: 24px; border: 1px solid var(--couleur-bordure, #1f1f28); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
            <div style="font-size: 64px; margin-bottom: 24px;">🔧</div>
            <h1 style="font-size: 32px; margin-bottom: 16px; color: var(--couleur-texte, #ffffff);">Mode Maintenance</h1>
            <p id="maintenance-message-text" style="font-size: 18px; line-height: 1.6; color: var(--couleur-texte-muted, #9ca3af); margin-bottom: 32px;">
              ${maintenanceMessage}
            </p>
            <div style="width: 60px; height: 4px; background: var(--couleur-accent, #6366f1); border-radius: 2px; margin: 0 auto;"></div>
          </div>
        `;
        
        document.body.appendChild(maintenanceOverlay);
      } else {
        // Mettre à jour le message
        const messageText = document.getElementById('maintenance-message-text');
        if (messageText) {
          messageText.textContent = maintenanceMessage;
        }
        maintenanceOverlay.style.display = 'flex';
      }
      
      // Masquer le contenu principal
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.style.display = 'none';
      }
      const header = document.querySelector('header');
      if (header) {
        header.style.display = 'none';
      }
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.display = 'none';
      }
    } else {
      // Désactiver le mode maintenance
      if (maintenanceOverlay) {
        maintenanceOverlay.style.display = 'none';
      }
      
      // Réafficher le contenu principal
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.style.display = '';
      }
      const header = document.querySelector('header');
      if (header) {
        header.style.display = '';
      }
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.display = '';
      }
    }
  }
  
  // Calcule un hash simple des données pour détecter les changements
  function calculerHash(donnees) {
    if (!donnees) return null;
    const str = JSON.stringify({
      projects: donnees.projects?.length || 0,
      skills: donnees.skills?.length || 0,
      timeline: donnees.timeline?.length || 0,
      certifications: donnees.certifications?.length || 0,
      stages: donnees.stages?.length || 0,
      alternances: donnees.alternances?.length || 0,
      techEvents: donnees.techEvents?.length || 0,
      personal: donnees.personal?.name || '',
      links: donnees.links?.cv || '',
      about: donnees.about?.heroDescription || ''
    });
    // Hash simple (CRC32-like)
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }
  
  // Vérifie si les données ont changé et met à jour si nécessaire
  async function verifierEtMettreAJour() {
    try {
      const nouvellesDonnees = await chargerDonneesServeur();
      
      if (!nouvellesDonnees) {
        // Serveur indisponible, on continue avec les données actuelles
        return;
      }
      
      const nouveauHash = calculerHash(nouvellesDonnees);
      
      // Si le hash est différent, les données ont changé
      if (nouveauHash !== hashDonneesActuelles) {
        console.log('🔄 Mise à jour automatique détectée !');
        
        // Mettre à jour les données
        donneesActuelles = nouvellesDonnees;
        hashDonneesActuelles = nouveauHash;
        
        // Sauvegarder dans localStorage
        localStorage.setItem('portfolioData', JSON.stringify(nouvellesDonnees));
        
        // Mettre à jour l'affichage
        afficherMesDonnees(nouvellesDonnees);
        afficherCertifications(nouvellesDonnees.certifications || []);
        afficherStages(nouvellesDonnees.stages || []);
        afficherAlternances(nouvellesDonnees.alternances || []);
        afficherEvenementsTech(nouvellesDonnees.techEvents || []);
        
        // Mettre à jour les liens CV
        setTimeout(() => {
          mettreAJourLiensCV(nouvellesDonnees.links);
        }, 100);
        
        // Réanimer les éléments si nécessaire
        configurerAnimations();
        
        console.log('✅ Mise à jour automatique terminée');
      }
    } catch (erreur) {
      // Erreur silencieuse pour ne pas perturber l'utilisateur
      console.debug('Vérification mise à jour:', erreur);
    }
  }
  
  // Démarre la vérification automatique périodique
  function demarrerVerificationAutomatique() {
    // Ne pas démarrer si on est sur la page admin
    if (window.location.pathname.includes('admin.html')) {
      return;
    }
    
    // Vérifier toutes les 10 secondes (ajustable)
    const intervalle = 10000; // 10 secondes
    
    // Vérifier immédiatement après un délai initial
    setTimeout(() => {
      verifierEtMettreAJour();
    }, 5000); // Première vérification après 5 secondes
    
    // Puis vérifier périodiquement
    intervalVerification = setInterval(async () => {
      verifierEtMettreAJour();
    }, intervalle);
    
    console.log('🔄 Vérification automatique activée (toutes les 10 secondes)');
  }
  
  // Arrête la vérification automatique
  function arreterVerificationAutomatique() {
    if (intervalVerification) {
      clearInterval(intervalVerification);
      intervalVerification = null;
      console.log('⏸️ Vérification automatique arrêtée');
    }
  }
  
  
  /* ===== CHARGEMENT DES DONNÉES ===== */
  
  // Charge mes données depuis le serveur
  async function chargerDonneesServeur() {
    try {
      const reponse = await fetch(`${MON_SERVEUR}/portfolio`);
      if (!reponse.ok) throw new Error('Serveur indisponible');
      
      const donnees = await reponse.json();
      
      // Log pour déboguer le CV
      if (donnees && donnees.links) {
        console.log('📥 Données CV reçues du serveur:', {
          hasCv: !!donnees.links.cv,
          hasCvFile: !!donnees.links.cvFile,
          cvType: donnees.links.cv ? (donnees.links.cv.startsWith('data:') ? 'base64' : 'path') : 'none',
          cvFileType: donnees.links.cvFile ? (donnees.links.cvFile.startsWith('data:') ? 'base64' : 'path') : 'none',
          cvFileName: donnees.links.cvFileName,
          cvPreview: donnees.links.cv ? donnees.links.cv.substring(0, 50) + '...' : 'none',
          cvFilePreview: donnees.links.cvFile ? donnees.links.cvFile.substring(0, 50) + '...' : 'none'
        });
      }
      
      // Log des projets reçus du serveur
      console.log('📥 Données PROJETS reçues du serveur:', {
        hasProjects: !!donnees.projects,
        isArray: Array.isArray(donnees.projects),
        projectsLength: donnees.projects?.length || 0,
        projectsTitres: donnees.projects?.map(p => p.title) || [],
        projectsPublics: donnees.projects?.map(p => p.public !== false) || []
      });
      
      return donneesSontVides(donnees) ? null : donnees;
    } catch (erreur) {
      console.error('❌ Erreur lors du chargement depuis le serveur:', erreur);
      return null; // Si le serveur ne répond pas, on utilise les données locales
    }
  }
  
  // Récupère mes données (serveur ou localStorage)
  function obtenirMesDonnees() {
    try {
      const donneesLocales = localStorage.getItem('portfolioData');
      const donnees = donneesLocales ? JSON.parse(donneesLocales) : creerDonneesParDefaut();
      
      // Log pour déboguer le CV dans localStorage
      if (donnees && donnees.links) {
        console.log('💾 Données CV depuis localStorage:', {
          hasCv: !!donnees.links.cv,
          hasCvFile: !!donnees.links.cvFile,
          cvType: donnees.links.cv ? (donnees.links.cv.startsWith('data:') ? 'base64' : 'path') : 'none',
          cvFileType: donnees.links.cvFile ? (donnees.links.cvFile.startsWith('data:') ? 'base64' : 'path') : 'none'
        });
      }
      
      return donnees;
    } catch (erreur) {
      console.error('❌ Erreur lors du parsing des données locales:', erreur);
      return creerDonneesParDefaut();
    }
  }
  
  // Crée mes données de base si aucune n'existe
  function creerDonneesParDefaut() {
    const donneesParDefaut = {
      personal: {
        name: 'Nema Elisée Kourouma',
        title: 'Étudiant en Master 1 Intelligence Artificielle',
        description: 'Étudiant en Master 1 Intelligence Artificielle à l\'École Supérieure d\'Informatique de Paris. Titulaire d\'une licence en mathématiques et informatique (USMBA Fès).',
        email: MES_CONTACTS.email,
        phone: MES_CONTACTS.telephone,
        photo: 'assets/photo.jpeg'
      },
      projects: [],
      skills: [],
      timeline: [],
      certifications: [],
      stages: [],
      alternances: [],
      techEvents: [],
      links: {}, // Pas de CV par défaut - sera chargé depuis le serveur
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
        console.log('📥 Données serveur reçues - Vérification CV:', {
          hasLinks: !!donneesServeur.links,
          hasCv: !!donneesServeur.links?.cv,
          hasCvFile: !!donneesServeur.links?.cvFile,
          cvIsBase64: donneesServeur.links?.cv?.startsWith('data:'),
          cvFileIsBase64: donneesServeur.links?.cvFile?.startsWith('data:'),
          cvValue: donneesServeur.links?.cv ? (donneesServeur.links.cv.length > 50 ? donneesServeur.links.cv.substring(0, 50) + '...' : donneesServeur.links.cv) : 'none',
          cvFileValue: donneesServeur.links?.cvFile ? (donneesServeur.links.cvFile.length > 50 ? donneesServeur.links.cvFile.substring(0, 50) + '...' : donneesServeur.links.cvFile) : 'none'
        });
        
        console.log('📥 Données serveur reçues - Vérification Projets:', {
          hasProjects: !!donneesServeur.projects,
          isArray: Array.isArray(donneesServeur.projects),
          projectsLength: donneesServeur.projects?.length || 0,
          projects: donneesServeur.projects?.map(p => ({
            title: p.title,
            type: p.type,
            featured: p.featured,
            public: p.public
          })) || [],
          firstProject: donneesServeur.projects?.[0] ? {
            title: donneesServeur.projects[0].title,
            type: donneesServeur.projects[0].type,
            featured: donneesServeur.projects[0].featured,
            public: donneesServeur.projects[0].public
          } : 'none'
        });
        
        // S'assurer que projects est toujours un tableau
        if (!Array.isArray(donneesServeur.projects)) {
          console.warn('⚠️ projects n\'est pas un tableau, conversion en tableau vide');
          donneesServeur.projects = [];
        }
        
        // SUPPRIMER L'ANCIEN CV DU LOCALSTORAGE : Remplacer complètement par les données du serveur
        // Si le serveur a un CV base64, il doit remplacer l'ancien chemin dans localStorage
        if (donneesServeur.links) {
          // Si le serveur a un CV base64, s'assurer qu'il remplace l'ancien
          if (donneesServeur.links.cvFile && donneesServeur.links.cvFile.startsWith('data:')) {
            console.log('✅ Serveur a un CV base64 - Remplacement de l\'ancien CV dans localStorage');
            // S'assurer que cv contient aussi le base64
            if (!donneesServeur.links.cv || !donneesServeur.links.cv.startsWith('data:')) {
              donneesServeur.links.cv = donneesServeur.links.cvFile;
              console.log('✅ cv mis à jour avec le base64 de cvFile');
            }
          } else if (donneesServeur.links.cv && donneesServeur.links.cv.startsWith('data:')) {
            console.log('✅ Serveur a un CV base64 dans cv - Remplacement de l\'ancien CV dans localStorage');
          } else if (!donneesServeur.links.cv || donneesServeur.links.cv === '') {
            console.log('⚠️ Serveur n\'a pas de CV base64 - Vérification du localStorage pour un CV base64');
            // Vérifier si localStorage a un CV base64 qui n'a pas été sauvegardé
            const donneesLocales = localStorage.getItem('portfolioData');
            if (donneesLocales) {
              try {
                const localData = JSON.parse(donneesLocales);
                if (localData.links && localData.links.cvFile && localData.links.cvFile.startsWith('data:')) {
                  console.log('⚠️ localStorage a un CV base64 non sauvegardé - Utilisation du localStorage');
                  donneesServeur.links.cvFile = localData.links.cvFile;
                  donneesServeur.links.cv = localData.links.cvFile;
                  donneesServeur.links.cvFileName = localData.links.cvFileName;
                  donneesServeur.links.cvFileSize = localData.links.cvFileSize;
                }
              } catch (e) {
                console.error('Erreur parsing localStorage:', e);
              }
            }
          }
        }
        
        localStorage.setItem('portfolioData', JSON.stringify(donneesServeur));
        mesDonnees = donneesServeur;
      } else {
        // Sinon utilise les données locales
        console.log('⚠️ Serveur indisponible, utilisation des données locales');
        mesDonnees = obtenirMesDonnees();
      }
      
      // Stocker les données actuelles pour la comparaison
      donneesActuelles = mesDonnees;
      hashDonneesActuelles = calculerHash(mesDonnees);
      
      // Vérifier le mode maintenance
      verifierModeMaintenance(mesDonnees);
      
      // Log final avant affichage
      console.log('🎯 Données finales avant affichage:', {
        hasProjects: !!mesDonnees.projects,
        projectsLength: mesDonnees.projects?.length || 0,
        projectsIsArray: Array.isArray(mesDonnees.projects),
        projects: mesDonnees.projects?.slice(0, 2).map(p => p.title) || []
      });
      
      // Log détaillé des projets pour debug
      if (mesDonnees.projects && mesDonnees.projects.length > 0) {
        console.log('✅ PROJETS TROUVÉS - Détails:', {
          nombre: mesDonnees.projects.length,
          titres: mesDonnees.projects.map(p => p.title),
          publics: mesDonnees.projects.map(p => p.public !== false),
          featured: mesDonnees.projects.map(p => p.featured)
        });
      } else {
        console.warn('⚠️ AUCUN PROJET TROUVÉ dans les données finales!');
        console.warn('🔍 Vérification des données:', {
          projects: mesDonnees.projects,
          type: typeof mesDonnees.projects,
          isArray: Array.isArray(mesDonnees.projects),
          keys: Object.keys(mesDonnees || {})
        });
      }
      
      // S'assurer que le DOM est prêt avant d'afficher
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          afficherMesDonnees(mesDonnees);
        });
      } else {
        // Si le DOM est déjà chargé, utiliser un petit délai pour s'assurer que tous les éléments sont prêts
        setTimeout(() => {
          afficherMesDonnees(mesDonnees);
        }, 100);
      }
      
      // Afficher les certifications, stages et événements
      afficherCertifications(mesDonnees.certifications || []);
      afficherStages(mesDonnees.stages || []);
      afficherAlternances(mesDonnees.alternances || []);
      afficherEvenementsTech(mesDonnees.techEvents || []);
      
      // Réessayer d'afficher les projets après un délai pour s'assurer que le DOM est prêt
      setTimeout(() => {
        if (mesDonnees.projects && mesDonnees.projects.length > 0) {
          console.log('🔄 Réessai d\'affichage des projets après délai');
          afficherMesProjets(mesDonnees.projects);
        }
      }, 500);
      
      // Forcer la mise à jour des liens CV après un court délai pour s'assurer que le DOM est prêt
      setTimeout(() => {
        mettreAJourLiensCV(mesDonnees.links);
      }, 500);
      
      // Vérifier aussi après un délai plus long au cas où le DOM n'est pas encore prêt
      setTimeout(() => {
        mettreAJourLiensCV(mesDonnees.links);
        // Réessayer une dernière fois pour les projets
        if (mesDonnees.projects && mesDonnees.projects.length > 0) {
          afficherMesProjets(mesDonnees.projects);
        }
      }, 1000);
      
      return mesDonnees;
      
    } catch (erreur) {
      // En cas d'erreur, utilise les données par défaut
      const donnees = obtenirMesDonnees();
      donneesActuelles = donnees;
      hashDonneesActuelles = calculerHash(donnees);
      
      afficherMesDonnees(donnees);
      afficherCertifications(donnees.certifications || []);
      afficherStages(donnees.stages || []);
      afficherAlternances(donnees.alternances || []);
      afficherEvenementsTech(donnees.techEvents || []);
      mettreAJourLiensCV(donnees.links);
      
      // Vérifier le mode maintenance même en cas d'erreur
      verifierModeMaintenance(donnees);
      
      return donnees;
    }
  }
  
  
  /* ===== AFFICHAGE DES DONNÉES ===== */
  
  // Affiche toutes mes données sur le site
  function afficherMesDonnees(donnees) {
    console.log('📊 Affichage des données - Links:', {
      links: donnees?.links,
      cv: donnees?.links?.cv ? (donnees.links.cv.substring(0, 50) + '...') : 'undefined',
      cvFile: donnees?.links?.cvFile ? (donnees.links.cvFile.substring(0, 50) + '...') : 'undefined',
      cvFileName: donnees?.links?.cvFileName
    });
    
    console.log('📊 Affichage des données - Projets:', {
      projects: donnees?.projects,
      isArray: Array.isArray(donnees?.projects),
      length: donnees?.projects?.length || 0,
      firstProject: donnees?.projects?.[0]
    });
    
    afficherMesInfos(donnees.personal);
    // S'assurer que projects est toujours un tableau
    const projets = Array.isArray(donnees?.projects) ? donnees.projects : (donnees?.projects ? [donnees.projects] : []);
    afficherMesProjets(projets);
    afficherMesCompetences(donnees.skills);
    afficherMonParcours(donnees.timeline);
    afficherMesStats(donnees.about?.stats);
    
    // Mettre à jour les liens CV immédiatement
    mettreAJourLiensCV(donnees?.links);
    
    // Réessayer après un court délai pour s'assurer que le DOM est prêt
    setTimeout(() => {
      mettreAJourLiensCV(donnees?.links);
    }, 200);
    
    // Ajouter le lien "Voir tous les projets" si nécessaire
    if (donnees.projects && donnees.projects.length > 4) {
      const projectsSection = document.querySelector('[aria-labelledby="projects-heading"]');
      if (projectsSection && !projectsSection.querySelector('.btn')) {
        const linkDiv = document.createElement('div');
        linkDiv.style.cssText = 'text-align: center; margin-top: var(--espacement-xl);';
        linkDiv.innerHTML = '<a href="projects.html" class="btn">Voir tous les projets →</a>';
        projectsSection.appendChild(linkDiv);
      }
    }
  }
  
  // Met à jour tous les liens CV dans la page
  function mettreAJourLiensCV(links) {
    console.log('🔍 Mise à jour des liens CV - Données reçues:', links);
    
    // Récupérer le chemin du CV (priorité au cvFile si c'est un upload base64, sinon cv)
    let cvUrl = '';
    let isBase64 = false;
    let cvFileName = 'CV.pdf';
    
    console.log('🔍 Analyse des données CV:', {
      hasLinks: !!links,
      hasCvFile: !!(links && links.cvFile),
      hasCv: !!(links && links.cv),
      cvFileType: links && links.cvFile ? (links.cvFile.startsWith('data:') ? 'base64' : 'other') : 'none',
      cvType: links && links.cv ? (links.cv.startsWith('data:') ? 'base64' : 'path') : 'none',
      cvValue: links && links.cv ? (links.cv.length > 100 ? links.cv.substring(0, 100) + '...' : links.cv) : 'none',
      cvFileValue: links && links.cvFile ? (links.cvFile.length > 100 ? links.cvFile.substring(0, 100) + '...' : links.cvFile) : 'none'
    });
    
    // PRIORITÉ 1: cvFile en base64 (le plus fiable pour les uploads)
    if (links && links.cvFile && typeof links.cvFile === 'string' && links.cvFile.trim() !== '') {
      // Vérifier si c'est base64 (commence par 'data:' ou est une longue chaîne base64)
      if (links.cvFile.startsWith('data:')) {
        cvUrl = links.cvFile;
        isBase64 = true;
        cvFileName = links.cvFileName || 'CV.pdf';
        console.log('📄 CV détecté: Fichier base64 uploadé (cvFile avec data:) - Taille:', links.cvFile.length, 'caractères');
      } else if (links.cvFile.length > 100 && /^[A-Za-z0-9+/=\s]/.test(links.cvFile.trim())) {
        // Base64 sans préfixe data:
        cvUrl = `data:application/pdf;base64,${links.cvFile.trim()}`;
        isBase64 = true;
        cvFileName = links.cvFileName || 'CV.pdf';
        console.log('📄 CV détecté: Fichier base64 uploadé (cvFile sans data:) - Taille:', links.cvFile.length, 'caractères');
      } else if (links.cvFile !== 'assets/CV.pdf' && links.cvFile !== '') {
        // cvFile est un chemin/URL
        cvUrl = links.cvFile;
        isBase64 = false;
        cvFileName = links.cvFileName || 'CV.pdf';
        console.log('📄 CV détecté: Chemin dans cvFile:', cvUrl);
      }
    } 
    // PRIORITÉ 2: cv en base64 (fallback si cvFile n'existe pas mais cv contient base64)
    else if (links && links.cv && typeof links.cv === 'string' && links.cv.trim() !== '' && !cvUrl) {
      // Vérifier si c'est base64
      if (links.cv.startsWith('data:')) {
        cvUrl = links.cv;
        isBase64 = true;
        cvFileName = links.cvFileName || 'CV.pdf';
        console.log('📄 CV détecté: Base64 dans cv (avec data:) - Taille:', links.cv.length, 'caractères');
      } else if (links.cv.length > 100 && /^[A-Za-z0-9+/=\s]/.test(links.cv.trim())) {
        // Base64 sans préfixe data:
        cvUrl = `data:application/pdf;base64,${links.cv.trim()}`;
        isBase64 = true;
        cvFileName = links.cvFileName || 'CV.pdf';
        console.log('📄 CV détecté: Base64 dans cv (sans data:) - Taille:', links.cv.length, 'caractères');
      } else if (links.cv !== 'assets/CV.pdf' && links.cv !== '') {
        // cv est un chemin/URL personnalisé
        cvUrl = links.cv;
        isBase64 = false;
        console.log('📄 CV détecté: Chemin/URL personnalisé:', cvUrl);
      }
    } 
    // DÉFAUT: Aucun CV disponible (ne plus utiliser 'assets/CV.pdf')
    else {
      // Vérifier si cv ou cvFile existe mais est vide (chaîne vide)
      const cvEstVide = links && links.cv === '';
      const cvFileEstVide = links && links.cvFile === '';
      
      // Ne jamais utiliser 'assets/CV.pdf' - Si aucun CV n'est défini, laisser vide
      console.log('⚠️ CV non défini - Aucun CV disponible (pas de fallback vers assets/CV.pdf)');
      cvUrl = ''; // Pas de CV disponible
      isBase64 = false;
      
      console.log('🔍 État des données links:', {
        hasLinks: !!links,
        hasCvFile: !!(links && links.cvFile),
        hasCv: !!(links && links.cv),
        cvEstVide: cvEstVide,
        cvFileEstVide: cvFileEstVide,
        cvValue: links && links.cv ? (links.cv.length > 100 ? links.cv.substring(0, 100) + '...' : links.cv) : 'none',
        cvFileValue: links && links.cvFile ? (links.cvFile.length > 100 ? links.cvFile.substring(0, 100) + '...' : links.cvFile) : 'none',
        cvFileType: links && links.cvFile ? typeof links.cvFile : 'none',
        cvType: links && links.cv ? typeof links.cv : 'none'
      });
    }
    
    // Si cvUrl est vide, ne pas mettre à jour les liens (pas de CV disponible)
    if (!cvUrl || cvUrl === '') {
      console.log('⚠️ Aucun CV disponible - Les liens CV ne seront pas mis à jour');
      console.log('🔍 DEBUG - État complet des données links:', {
        links: links,
        linksType: typeof links,
        linksKeys: links ? Object.keys(links) : 'none',
        cvExists: links && 'cv' in links,
        cvFileExists: links && 'cvFile' in links,
        cvValue: links?.cv,
        cvFileValue: links?.cvFile ? (links.cvFile.length > 50 ? links.cvFile.substring(0, 50) + '...' : links.cvFile) : 'none',
        cvLength: links?.cv ? links.cv.length : 0,
        cvFileLength: links?.cvFile ? links.cvFile.length : 0
      });
      
      // Désactiver les liens CV s'il n'y a pas de CV
      const cvLinks = document.querySelectorAll('[data-cv-link="true"]');
      cvLinks.forEach(link => {
        link.href = '#';
        link.style.opacity = '0.5';
        link.style.cursor = 'not-allowed';
        link.title = 'Aucun CV disponible';
      });
      return;
    }
    
    // Mettre à jour tous les liens CV avec l'attribut data-cv-link
    const cvLinks = document.querySelectorAll('[data-cv-link="true"]');
    
    console.log('🔍 Liens CV trouvés dans le DOM:', cvLinks.length);
    
    if (cvLinks.length === 0) {
      console.warn('⚠️ Aucun lien CV trouvé dans la page avec data-cv-link="true"');
      console.log('🔍 Recherche de tous les liens dans la page...');
      const allLinks = document.querySelectorAll('a[href*="CV"], a[href*="cv"]');
      console.log('🔍 Liens contenant "CV" ou "cv":', allLinks.length);
      
      // Réessayer après un court délai
      setTimeout(() => {
        const retryLinks = document.querySelectorAll('[data-cv-link="true"]');
        if (retryLinks.length > 0) {
          console.log('✅ Liens CV trouvés au retry:', retryLinks.length);
          mettreAJourLiensCV(links);
        } else {
          console.error('❌ Toujours aucun lien CV trouvé après retry');
        }
      }, 500);
      return;
    }
    
    let liensMisAJour = 0;
    cvLinks.forEach((link, index) => {
      try {
        // Réactiver le lien s'il était désactivé
        link.style.opacity = '1';
        link.style.cursor = 'pointer';
        link.removeAttribute('title');
        
        const ancienHref = link.href;
        
        if (isBase64) {
          // Pour les fichiers base64, créer un gestionnaire de clic
          // Stocker les données dans l'élément pour y accéder dans le gestionnaire
          link.setAttribute('data-cv-base64', cvUrl);
          link.setAttribute('data-cv-filename', cvFileName);
          
          // Supprimer les anciens event listeners en clonant le nœud
          const newLink = link.cloneNode(true);
          if (link.parentNode) {
            link.parentNode.replaceChild(newLink, link);
          } else {
            return;
          }
          
          // Ajouter le gestionnaire de clic
          newLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const base64Data = this.getAttribute('data-cv-base64');
            const filename = this.getAttribute('data-cv-filename') || 'CV.pdf';
            
            if (!base64Data) {
              console.error('❌ Données base64 manquantes');
              return;
            }
            
            try {
              console.log('📥 Début du téléchargement du CV:', filename);
              
              // Extraire les données base64
              const base64String = base64Data.split(',')[1] || base64Data;
              const byteCharacters = atob(base64String);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: 'application/pdf' });
              const url = URL.createObjectURL(blob);
              
              // Créer un lien de téléchargement
              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              a.style.display = 'none';
              document.body.appendChild(a);
              a.click();
              
              // Nettoyer après un court délai
              setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                console.log('✅ CV téléchargé avec succès:', filename);
              }, 100);
            } catch (error) {
              console.error('❌ Erreur lors du téléchargement du CV:', error);
              // Fallback : essayer d'ouvrir directement
              try {
                const blob = new Blob([base64Data], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
              } catch (err) {
                console.error('❌ Impossible d\'ouvrir le CV:', err);
              }
            }
          }, { once: false, passive: false });
          
          // Mettre à jour le href et le style
          newLink.href = '#';
          newLink.style.cursor = 'pointer';
          newLink.style.pointerEvents = 'auto';
          newLink.setAttribute('title', 'Cliquez pour télécharger le CV');
          newLink.setAttribute('role', 'button');
          newLink.setAttribute('aria-label', 'Télécharger le CV');
          
          // S'assurer que le lien est cliquable
          newLink.onclick = null; // Supprimer tout onclick existant
          
          liensMisAJour++;
          console.log(`✅ Lien CV ${index + 1} configuré pour téléchargement base64:`, {
            href: newLink.href,
            hasListener: true,
            filename: cvFileName
          });
        } else {
          // Pour les chemins/URL normaux, mettre à jour directement
          link.href = cvUrl;
          // Ajouter un timestamp pour éviter le cache uniquement pour les fichiers locaux
          if (cvUrl && cvUrl.endsWith('.pdf') && !cvUrl.startsWith('http') && !cvUrl.startsWith('data:')) {
            link.href = cvUrl + (cvUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
          }
          liensMisAJour++;
          console.log(`✅ Lien CV ${index + 1} mis à jour: ${ancienHref} → ${link.href}`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la mise à jour du lien CV ${index + 1}:`, error);
      }
    });
    
    console.log('✅ Liens CV mis à jour:', {
      url: isBase64 ? 'Base64 (fichier uploadé)' : cvUrl,
      nombreLiens: cvLinks.length,
      liensMisAJour: liensMisAJour,
      isBase64: isBase64,
      filename: isBase64 ? cvFileName : 'N/A'
    });
    
    // Vérification finale : tester si les liens sont cliquables
    if (isBase64 && liensMisAJour > 0) {
      console.log('💡 Les liens CV sont maintenant prêts. Cliquez sur un lien pour télécharger le CV.');
      console.log('💡 Si le téléchargement ne fonctionne pas, vérifiez la console pour les erreurs.');
    }
  }
  
  // Affiche mes informations personnelles
  function afficherMesInfos(infos) {
    if (!infos) return;
    
    // Met à jour le titre de la page
    if (infos.name) {
      document.title = `${infos.name} - Portfolio`;
    }
  }
  
  // Affiche mes projets sur la page d'accueil avec carrousel
  function afficherMesProjets(projets) {
    console.log('🎯 afficherMesProjets appelée avec:', {
      projets: projets,
      isArray: Array.isArray(projets),
      length: projets?.length || 0,
      type: typeof projets,
      currentPage: window.location.pathname
    });
    
    // Vérifier qu'on est sur la page d'accueil
    const isHomePage = window.location.pathname === '/' || 
                       window.location.pathname.endsWith('index.html') ||
                       window.location.pathname.endsWith('/');
    
    if (!isHomePage) {
      console.log('ℹ️ afficherMesProjets ignorée - pas sur la page d\'accueil');
      return;
    }
    
    const container = document.getElementById('homepage-projects');
    console.log('🔍 Container homepage-projects:', {
      exists: !!container,
      id: container?.id,
      currentHTML: container?.innerHTML?.substring(0, 100),
      readyState: document.readyState
    });
    
    if (!container) {
      console.warn('⚠️ Container homepage-projects non trouvé dans le DOM - Réessai dans 500ms...');
      // Réessayer après un court délai au cas où le DOM n'est pas encore prêt
      setTimeout(() => {
        const retryContainer = document.getElementById('homepage-projects');
        if (retryContainer) {
          console.log('✅ Container trouvé après délai, réessai de l\'affichage');
          afficherMesProjets(projets);
        } else {
          console.error('❌ Container toujours introuvable après délai');
        }
      }, 500);
      return;
    }
    
    if (!projets || !Array.isArray(projets)) {
      console.warn('⚠️ Projets invalides:', { projets, isArray: Array.isArray(projets) });
      return;
    }
    
    if (projets.length === 0) {
      console.log('📭 Aucun projet à afficher');
      container.innerHTML = '<p class="text-center muted">Aucun projet disponible pour le moment. Ajoutez des projets depuis l\'interface d\'administration.</p>';
      return;
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
    
    // Filtrer les projets publics si pas admin
    let projetsAFiltrer = projets;
    if (!isAdmin) {
      projetsAFiltrer = projets.filter(p => p.public !== false);
      console.log('🔍 Filtrage des projets (public uniquement):', {
        total: projets.length,
        publics: projetsAFiltrer.length,
        filtres: projets.length - projetsAFiltrer.length
      });
    }
    
    if (projetsAFiltrer.length === 0) {
      console.log('📭 Aucun projet public à afficher');
      container.innerHTML = '<p class="text-center muted">Aucun projet disponible pour le moment. Ajoutez des projets depuis l\'interface d\'administration.</p>';
      return;
    }
    
    console.log('✅ Affichage de', projetsAFiltrer.length, 'projets');
    
    // Trier les projets : featured en premier
    const projetsFeatured = projetsAFiltrer.filter(p => p.featured);
    const autresProjets = projetsAFiltrer.filter(p => !p.featured);
    const tousLesProjets = [...projetsFeatured, ...autresProjets];
    
    // Créer toutes les cartes
    container.innerHTML = tousLesProjets.map((projet, index) => {
      const tags = projet.tags || [];
      const shortDesc = projet.shortDesc || (projet.description ? projet.description.substring(0, 100) + '...' : 'Aucune description');
      const type = projet.type || 'Projet Personnel';
      
      // Couleurs selon le type
      const typeColors = {
        'Projet Majeur': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'PFE Master 1': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'PFE Licence': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'PFA': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'Projet Personnel': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      };
      const typeColor = typeColors[type] || typeColors['Projet Personnel'];
      
      return `
        <article class="project-card-modern" style="animation-delay: ${index * 0.1}s; --card-index: ${index};">
          <div class="project-card-header">
            <div class="project-type-badge" style="background: ${typeColor}">
              ${type} ${projet.featured ? '⭐' : ''}
            </div>
            ${projet.featured ? '<span class="featured-badge">⭐ En vedette</span>' : ''}
          </div>
          
          <div class="project-card-content">
            <h3 class="project-title">
              <a href="project-details.html?project=${encodeURIComponent(projet.title)}" class="project-link">
                ${projet.title || 'Projet'}
              </a>
            </h3>
            <p class="project-description">${shortDesc}</p>
            ${tags.length > 0 ? `
              <div class="project-tags">
                ${tags.slice(0, 4).map(tag => `<span class="project-tag">${tag}</span>`).join('')}
              </div>
            ` : ''}
          </div>
          
          <div class="project-card-footer">
            <div class="project-actions">
              <a href="project-details.html?project=${encodeURIComponent(projet.title)}" class="btn-project btn-details">
                📖 Voir les détails
              </a>
              ${projet.link || projet.liveUrl ? `
                <a href="${projet.link || projet.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn-project btn-live">
                  🌐 Voir le projet
                </a>
              ` : ''}
            </div>
          </div>
        </article>
      `;
    }).join('');
    
    // Animer l'apparition
    setTimeout(() => {
      const cards = container.querySelectorAll('.project-card-modern');
      cards.forEach((card, i) => {
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 50);
      });
    }, 100);
    
    // Initialiser le carrousel après un court délai pour s'assurer que le DOM est prêt
    setTimeout(() => {
      if (tousLesProjets.length > 0) {
        console.log('🎠 Initialisation du carrousel avec', tousLesProjets.length, 'projets');
        initialiserCarrousel(tousLesProjets.length);
      }
    }, 300);
  }
  
  // Carousel/Slider moderne - Un projet à la fois avec défilement horizontal
  function initialiserCarrousel(nombreProjets) {
    const track = document.getElementById('homepage-projects');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const indicators = document.getElementById('carousel-indicators');
    const container = track?.parentElement;
    
    if (!track || !prevBtn || !nextBtn || !container) {
      console.warn('Éléments du carrousel non trouvés');
      return;
    }
    
    if (nombreProjets === 0) {
      if (indicators) indicators.innerHTML = '';
      return;
    }
    
    let currentIndex = 0;
    let isTransitioning = false;
    let cardWidth = 0;
    let gap = 24; // Espacement entre les cartes
    
    // Calculer la largeur d'une carte
    function calculerLargeurCarte() {
      const cards = track.querySelectorAll('.project-card-modern');
      if (cards.length > 0) {
        const firstCard = cards[0];
        const cardStyle = window.getComputedStyle(firstCard);
        cardWidth = firstCard.offsetWidth + parseInt(cardStyle.marginLeft || 0) + parseInt(cardStyle.marginRight || 0);
      } else {
        // Largeur par défaut
        cardWidth = window.innerWidth < 768 ? 280 : 350;
      }
      return cardWidth;
    }
    
    // Créer les indicateurs (dots)
    if (indicators) {
      indicators.innerHTML = '';
      for (let i = 0; i < nombreProjets; i++) {
        const indicator = document.createElement('button');
        indicator.className = 'carousel-indicator' + (i === 0 ? ' active' : '');
        indicator.setAttribute('aria-label', `Aller au projet ${i + 1}`);
        indicator.setAttribute('aria-current', i === 0 ? 'true' : 'false');
        indicator.addEventListener('click', () => allerASlide(i));
        indicators.appendChild(indicator);
      }
    }
    
    // Mettre à jour la position du slider
    function mettreAJourCarrousel(smooth = true) {
      if (isTransitioning) return;
      
      calculerLargeurCarte();
      const offset = currentIndex * (cardWidth + gap);
      
      if (smooth) {
        track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      } else {
        track.style.transition = 'none';
      }
      
      track.style.transform = `translateX(-${offset}px)`;
      
      // Mettre à jour les indicateurs
      if (indicators) {
        const allIndicators = indicators.querySelectorAll('.carousel-indicator');
        allIndicators.forEach((ind, i) => {
          const isActive = i === currentIndex;
          ind.classList.toggle('active', isActive);
          ind.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
      }
      
      // Mettre à jour les boutons (désactivés aux extrémités si pas de boucle)
      // Ici on garde la boucle infinie, donc toujours activés
      prevBtn.disabled = false;
      nextBtn.disabled = false;
    }
    
    // Aller à une slide spécifique
    function allerASlide(index) {
      if (isTransitioning) return;
      
      currentIndex = index % nombreProjets;
      if (currentIndex < 0) currentIndex += nombreProjets;
      
      isTransitioning = true;
      mettreAJourCarrousel(true);
      
      setTimeout(() => {
        isTransitioning = false;
      }, 600);
    }
    
    // Slide suivant
    function slideSuivant() {
      if (isTransitioning) return;
      
      currentIndex = (currentIndex + 1) % nombreProjets;
      isTransitioning = true;
      mettreAJourCarrousel(true);
      
      setTimeout(() => {
        isTransitioning = false;
      }, 600);
    }
    
    // Slide précédent
    function slidePrecedent() {
      if (isTransitioning) return;
      
      currentIndex = (currentIndex - 1 + nombreProjets) % nombreProjets;
      isTransitioning = true;
      mettreAJourCarrousel(true);
      
      setTimeout(() => {
        isTransitioning = false;
      }, 600);
    }
    
    // Event listeners pour les boutons
    nextBtn.addEventListener('click', slideSuivant);
    prevBtn.addEventListener('click', slidePrecedent);
    
    // Support du swipe tactile pour mobile
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;
    
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      isDragging = true;
      arreterAutoScroll();
    }, { passive: true });
    
    track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      touchEndX = e.touches[0].clientX;
    }, { passive: true });
    
    track.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      
      const swipeDistance = touchStartX - touchEndX;
      const minSwipeDistance = 50; // Distance minimale pour déclencher le swipe
      
      if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance > 0) {
          // Swipe vers la gauche = slide suivant
          slideSuivant();
        } else {
          // Swipe vers la droite = slide précédent
          slidePrecedent();
        }
      }
      
      // Reprendre l'auto-scroll après un court délai
      setTimeout(() => {
        reprendreAutoScroll();
      }, 2000);
    }, { passive: true });
    
    // Support du drag avec la souris (optionnel)
    let mouseStartX = 0;
    let mouseIsDown = false;
    
    track.addEventListener('mousedown', (e) => {
      mouseStartX = e.clientX;
      mouseIsDown = true;
      arreterAutoScroll();
      track.style.cursor = 'grabbing';
    });
    
    track.addEventListener('mousemove', (e) => {
      if (!mouseIsDown) return;
      e.preventDefault();
    });
    
    track.addEventListener('mouseup', (e) => {
      if (!mouseIsDown) return;
      mouseIsDown = false;
      track.style.cursor = 'grab';
      
      const dragDistance = mouseStartX - e.clientX;
      const minDragDistance = 50;
      
      if (Math.abs(dragDistance) > minDragDistance) {
        if (dragDistance > 0) {
          slideSuivant();
        } else {
          slidePrecedent();
        }
      }
      
      setTimeout(() => {
        reprendreAutoScroll();
      }, 2000);
    });
    
    track.addEventListener('mouseleave', () => {
      mouseIsDown = false;
      track.style.cursor = 'grab';
    });
    
    // Auto-scroll avec pause au survol
    let autoScrollInterval = null;
    let isPaused = false;
    
    function demarrerAutoScroll() {
      if (isPaused || autoScrollInterval) return;
      
      autoScrollInterval = setInterval(() => {
        slideSuivant();
      }, 4000); // Défilement toutes les 4 secondes
    }
    
    function arreterAutoScroll() {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
      isPaused = true;
    }
    
    function reprendreAutoScroll() {
      isPaused = false;
      if (!autoScrollInterval) {
        demarrerAutoScroll();
      }
    }
    
    // Démarrer l'auto-scroll
    demarrerAutoScroll();
    
    // Pause au survol
    const carouselWrapper = track.closest('.projects-carousel-wrapper');
    if (carouselWrapper) {
      carouselWrapper.addEventListener('mouseenter', arreterAutoScroll);
      carouselWrapper.addEventListener('mouseleave', reprendreAutoScroll);
    }
    
    // Gestion du redimensionnement
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        calculerLargeurCarte();
        mettreAJourCarrousel(false); // Pas de transition lors du resize
      }, 250);
    });
    
    // Navigation au clavier (accessibilité)
    track.setAttribute('tabindex', '0');
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        slidePrecedent();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        slideSuivant();
      }
    });
    
    // Initialisation
    setTimeout(() => {
      calculerLargeurCarte();
      mettreAJourCarrousel(false);
    }, 100);
    
    console.log('✅ Carousel slider initialisé:', {
      nombreProjets,
      type: 'Horizontal Slider',
      swipe: 'Activé',
      autoScroll: '4s'
    });
  }
  
  // Affiche mes compétences avec design moderne
  function afficherMesCompetences(competences) {
    const container = document.getElementById('homepage-skills');
    if (!container || !competences || !Array.isArray(competences)) return;
    
    if (competences.length === 0) {
      container.innerHTML = '<p class="text-center muted">Compétences en cours de chargement...</p>';
      return;
    }
    
    container.innerHTML = competences.map((skill, index) => {
      const items = skill.items || skill.skills || [];
      const category = skill.category || skill.name || 'Compétence';
      const icon = skill.icon || '🔧';
      
      return `
        <div class="card skill-card-modern" data-scroll-reveal="bottom" style="animation-delay: ${index * 0.1}s">
          <div class="skill-card-header">
            <div class="skill-icon">${icon}</div>
            <h4 class="skill-category">${category}</h4>
          </div>
          <div class="skills-list-modern">
            ${items.map((item, i) => `
              <span class="skill-item-modern" style="animation-delay: ${(index * 0.1) + (i * 0.05)}s">
                ${item}
              </span>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
    
    // Animer l'apparition
    setTimeout(() => {
      const cards = container.querySelectorAll('.skill-card-modern');
      cards.forEach((card, i) => {
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 100);
      });
      
      const items = container.querySelectorAll('.skill-item-modern');
      items.forEach((item, i) => {
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        }, 200 + (i * 30));
      });
    }, 100);
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
  
  // Configure le bouton retour en haut et la barre de progression
  function configurerRetourEnHaut() {
    const boutonRetour = document.getElementById('scroll-top');
    const progressBar = document.getElementById('scroll-progress');
    
    // Affiche/masque le bouton et met à jour la barre de progression
    window.addEventListener('scroll', function() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      // Barre de progression
      if (progressBar) {
        progressBar.style.width = scrollPercent + '%';
      }
      
      // Bouton retour en haut
      if (boutonRetour) {
        if (scrollTop > 300) {
          boutonRetour.classList.add('visible');
        } else {
          boutonRetour.classList.remove('visible');
        }
      }
    }, { passive: true });
    
    // Action du bouton
    if (boutonRetour) {
      boutonRetour.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }
  
  // Configure les animations au scroll améliorées - Animations sur toutes les pages
  function configurerAnimations() {
    // Animation immédiate pour les éléments visibles au chargement
    function animerElementsVisibles() {
      const elementsVisibles = document.querySelectorAll('[data-animate]');
      elementsVisibles.forEach(function(element) {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
          setTimeout(function() {
            element.classList.add('animated');
          }, 100);
        }
      });
    }
    
    // Animation pour [data-animate] - Améliorée
    const elementsAnimes = document.querySelectorAll('[data-animate]');
    if (elementsAnimes.length > 0) {
      const observateur = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observateur.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      
      elementsAnimes.forEach(function(element) {
        observateur.observe(element);
      });
      
      // Animer immédiatement les éléments déjà visibles
      animerElementsVisibles();
    }
    
    // Animation pour [data-scroll-reveal] - Améliorée avec support de toutes les directions
    const scrollRevealElements = document.querySelectorAll('[data-scroll-reveal]');
    if (scrollRevealElements.length > 0) {
      const scrollObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            scrollObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      
      scrollRevealElements.forEach(function(element) {
        scrollObserver.observe(element);
        // Animer immédiatement si déjà visible
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setTimeout(function() {
            element.classList.add('revealed');
          }, 200);
        }
      });
    }
    
    // Animation stagger pour les éléments avec [data-stagger]
    const staggerElements = document.querySelectorAll('[data-stagger]');
    if (staggerElements.length > 0) {
      const staggerObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const children = entry.target.children;
            Array.from(children).forEach(function(child, index) {
              setTimeout(function() {
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
              }, index * 100);
            });
            staggerObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      staggerElements.forEach(function(element) {
        const children = element.children;
        Array.from(children).forEach(function(child) {
          child.style.opacity = '0';
          child.style.transform = 'translateY(20px)';
          child.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        });
        staggerObserver.observe(element);
      });
    }
    
    // Animation pour les cartes (cards) - Toutes les pages
    const cards = document.querySelectorAll('.card, .project-card-modern, .skill-card-modern, .stat-card, .experience-card');
    if (cards.length > 0) {
      const cardObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry, index) {
          if (entry.isIntersecting) {
            setTimeout(function() {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0) scale(1)';
            }, index * 50);
            cardObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
      
      cards.forEach(function(card, index) {
        // Ne pas animer si déjà dans un élément animé
        if (!card.closest('[data-animate]') && !card.hasAttribute('data-scroll-reveal')) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(30px) scale(0.95)';
          card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          cardObserver.observe(card);
          
          // Animer immédiatement si visible
          const rect = card.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            setTimeout(function() {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0) scale(1)';
            }, 300 + (index * 50));
          }
        }
      });
    }
    
    // Animation pour les sections - Toutes les pages
    const sections = document.querySelectorAll('section');
    if (sections.length > 0) {
      const sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            sectionObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });
      
      sections.forEach(function(section, index) {
        if (!section.hasAttribute('data-animate') && !section.hasAttribute('data-scroll-reveal')) {
          section.style.opacity = '0';
          section.style.transform = 'translateY(40px)';
          section.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          sectionObserver.observe(section);
          
          // Animer immédiatement si visible
          const rect = section.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            setTimeout(function() {
              section.style.opacity = '1';
              section.style.transform = 'translateY(0)';
            }, 200 + (index * 100));
          }
        }
      });
    }
    
    // Animation pour les titres h1, h2, h3 - Toutes les pages
    const headings = document.querySelectorAll('h1, h2, h3');
    if (headings.length > 0) {
      const headingObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry, index) {
          if (entry.isIntersecting) {
            setTimeout(function() {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, index * 30);
            headingObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      
      headings.forEach(function(heading) {
        if (!heading.closest('[data-animate]') && !heading.hasAttribute('data-scroll-reveal')) {
          heading.style.opacity = '0';
          heading.style.transform = 'translateY(20px)';
          heading.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
          headingObserver.observe(heading);
        }
      });
    }
    
    // Animation pour les boutons - Toutes les pages
    const buttons = document.querySelectorAll('.btn, button:not([type="submit"]):not([type="button"])');
    if (buttons.length > 0) {
      buttons.forEach(function(button, index) {
        button.style.opacity = '0';
        button.style.transform = 'scale(0.9)';
        button.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        setTimeout(function() {
          button.style.opacity = '1';
          button.style.transform = 'scale(1)';
        }, 200 + (index * 50));
      });
    }
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
    
    // Lien email rapide dans la section info
    const emailQuick = document.getElementById('contact-email-quick');
    if (emailQuick) {
      emailQuick.href = `mailto:${MES_CONTACTS.email}?subject=Contact depuis le portfolio`;
      emailQuick.textContent = '📧 Email direct';
    }
    
    // Configurer le formulaire de contact avec validation améliorée
    const formulaireContact = document.getElementById('contact-form');
    if (formulaireContact) {
      const inputs = formulaireContact.querySelectorAll('input, textarea');
      
      // Validation en temps réel
      inputs.forEach(input => {
        input.addEventListener('blur', () => {
          validerChamp(input);
        });
        
        input.addEventListener('input', () => {
          const formGroup = input.closest('.form-group');
          if (formGroup && formGroup.classList.contains('error')) {
            validerChamp(input);
          }
        });
      });
      
      // Soumission du formulaire
      formulaireContact.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const boutonSubmit = document.getElementById('submit-btn');
        const btnText = boutonSubmit?.querySelector('.btn-text');
        const btnLoader = boutonSubmit?.querySelector('.btn-loader');
        const messageDiv = document.getElementById('form-message');
        
        // Récupérer les valeurs
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const subjectInput = document.getElementById('subject');
        const messageInput = document.getElementById('message');
        
        const name = nameInput?.value.trim() || '';
        const email = emailInput?.value.trim() || '';
        const subject = subjectInput?.value.trim() || '';
        const message = messageInput?.value.trim() || '';
        
        // Validation complète
        let isValid = true;
        isValid = validerChamp(nameInput) && isValid;
        isValid = validerChamp(emailInput) && isValid;
        isValid = validerChamp(messageInput) && isValid;
        
        if (!isValid) {
          // Scroll vers la première erreur
          const firstError = formulaireContact.querySelector('.form-group.error');
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }
        
        // Afficher le loader
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'inline-flex';
        if (boutonSubmit) {
          boutonSubmit.disabled = true;
          boutonSubmit.style.opacity = '0.7';
        }
        
        // Masquer les messages précédents
        if (messageDiv) {
          messageDiv.style.display = 'none';
          messageDiv.className = 'form-message';
          messageDiv.textContent = '';
        }
        
        try {
          // Envoyer au backend
          const reponse = await fetch(`${MON_SERVEUR}/contact`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, subject, message })
          });
          
          const resultat = await reponse.json();
          
          if (reponse.ok && resultat.success) {
            // Succès
            if (messageDiv) {
              messageDiv.textContent = '✅ Message envoyé avec succès ! Je vous répondrai dans les plus brefs délais.';
              messageDiv.className = 'form-message success';
              messageDiv.style.display = 'block';
            }
            
            // Réinitialiser le formulaire
            formulaireContact.reset();
            inputs.forEach(input => {
              const formGroup = input.closest('.form-group');
              if (formGroup) {
                formGroup.classList.remove('success', 'error');
              }
            });
            
            // Scroll vers le message de succès
            if (messageDiv) {
              setTimeout(() => {
                messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 100);
            }
            
          } else {
            throw new Error(resultat.message || 'Erreur lors de l\'envoi');
          }
          
        } catch (erreur) {
          console.error('Erreur lors de l\'envoi du message:', erreur);
          
          if (messageDiv) {
            messageDiv.textContent = '❌ Erreur lors de l\'envoi du message. Veuillez réessayer ou m\'envoyer un email directement à ' + MES_CONTACTS.email;
            messageDiv.className = 'form-message error';
            messageDiv.style.display = 'block';
          }
          
          // Scroll vers le message d'erreur
          if (messageDiv) {
            setTimeout(() => {
              messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }
        } finally {
          // Réinitialiser le bouton
          if (btnText) btnText.style.display = 'inline';
          if (btnLoader) btnLoader.style.display = 'none';
          if (boutonSubmit) {
            boutonSubmit.disabled = false;
            boutonSubmit.style.opacity = '1';
          }
        }
      });
      
      // Réinitialisation du formulaire
      formulaireContact.addEventListener('reset', () => {
        inputs.forEach(input => {
          const formGroup = input.closest('.form-group');
          const errorId = input.getAttribute('aria-describedby') || input.id + '-error';
          const errorEl = document.getElementById(errorId);
          
          if (formGroup) {
            formGroup.classList.remove('error', 'success');
          }
          if (errorEl) {
            errorEl.classList.remove('active');
            errorEl.style.display = 'none';
          }
        });
        
        const messageDiv = document.getElementById('form-message');
        if (messageDiv) {
          messageDiv.style.display = 'none';
          messageDiv.textContent = '';
        }
      });
    }
  }
  
  // Affiche une erreur pour un champ spécifique
  function afficherErreurChamp(idChamp, message) {
    const elementErreur = document.getElementById(idChamp);
    const formGroup = elementErreur?.closest('.form-group');
    
    if (elementErreur) {
      elementErreur.textContent = message;
      elementErreur.classList.add('active');
      elementErreur.style.display = 'block';
    }
    
    if (formGroup) {
      formGroup.classList.add('error');
      formGroup.classList.remove('success');
      
      // Retirer l'erreur après 5 secondes
      setTimeout(() => {
        formGroup.classList.remove('error');
        if (elementErreur) {
          elementErreur.classList.remove('active');
          elementErreur.style.display = 'none';
        }
      }, 5000);
    }
  }
  
  // Affiche un succès pour un champ
  function afficherSuccesChamp(idChamp) {
    const formGroup = document.getElementById(idChamp)?.closest('.form-group');
    if (formGroup) {
      formGroup.classList.add('success');
      formGroup.classList.remove('error');
    }
  }
  
  // Valide un champ
  function validerChamp(input) {
    const formGroup = input.closest('.form-group');
    const errorId = input.getAttribute('aria-describedby') || input.id + '-error';
    const errorEl = document.getElementById(errorId);
    
    // Retirer les classes précédentes
    if (formGroup) {
      formGroup.classList.remove('error', 'success');
    }
    
    // Validation
    if (input.hasAttribute('required') && !input.value.trim()) {
      if (errorEl) {
        errorEl.textContent = 'Ce champ est obligatoire';
        errorEl.classList.add('active');
        errorEl.style.display = 'block';
      }
      if (formGroup) formGroup.classList.add('error');
      return false;
    }
    
    // Validation email
    if (input.type === 'email' && input.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value)) {
        if (errorEl) {
          errorEl.textContent = 'Format d\'email invalide';
          errorEl.classList.add('active');
          errorEl.style.display = 'block';
        }
        if (formGroup) formGroup.classList.add('error');
        return false;
      }
    }
    
    // Succès
    if (errorEl) {
      errorEl.classList.remove('active');
      errorEl.style.display = 'none';
    }
    if (formGroup && input.value.trim()) {
      formGroup.classList.add('success');
    }
    
    return true;
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
  
  /* ===== AFFICHAGE CERTIFICATIONS, STAGES & ÉVÉNEMENTS ===== */
  
  // Affiche les certifications
  function afficherCertifications(certifications) {
    const container = document.getElementById('certifications-container');
    if (!container) return;
    
    if (!certifications || certifications.length === 0) {
      container.innerHTML = `
        <div class="experience-card" style="grid-column: 1 / -1; text-align: center; padding: var(--espacement-2xl);">
          <p style="color: var(--couleur-texte-muted);">Aucune certification pour le moment</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = certifications.map((cert, index) => {
      return `
        <div class="experience-card" style="animation-delay: ${index * 0.1}s;">
          <div class="experience-card-header">
            <div class="experience-card-icon">🏆</div>
            <div style="flex: 1;">
              <h4 class="experience-card-title">${cert.name || 'Certification'}</h4>
              <p class="experience-card-issuer">${cert.issuer || ''}</p>
            </div>
            ${cert.date ? `<span class="experience-card-date">${cert.date}</span>` : ''}
          </div>
          ${cert.description ? `<p class="experience-card-description">${cert.description}</p>` : ''}
          ${cert.link ? `
            <a href="${cert.link}" target="_blank" rel="noopener noreferrer" class="experience-card-link">
              Voir la certification
            </a>
          ` : ''}
        </div>
      `;
    }).join('');
    
    // Animer l'apparition
    setTimeout(() => {
      const cards = container.querySelectorAll('.experience-card');
      cards.forEach((card, i) => {
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 100);
      });
    }, 200);
  }
  
  // Affiche les stages
  function afficherStages(stages) {
    const container = document.getElementById('stages-container');
    if (!container) return;
    
    if (!stages || stages.length === 0) {
      container.innerHTML = `
        <div class="experience-card" style="grid-column: 1 / -1; text-align: center; padding: var(--espacement-2xl);">
          <p style="color: var(--couleur-texte-muted);">Aucun stage pour le moment</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = stages.map((stage, index) => {
      return `
        <div class="experience-card" style="animation-delay: ${index * 0.1}s;">
          <div class="experience-card-header">
            <div class="experience-card-icon">💼</div>
            <div style="flex: 1;">
              <h4 class="experience-card-title">${stage.title || stage.company || 'Stage'}</h4>
              <p class="experience-card-issuer">${stage.company || ''} ${stage.location ? `· ${stage.location}` : ''}</p>
            </div>
            ${stage.date ? `<span class="experience-card-date">${stage.date}</span>` : ''}
          </div>
          ${stage.duration ? `<span style="display: inline-block; padding: 4px 12px; background: rgba(99, 102, 241, 0.15); border-radius: var(--rayon-full); font-size: 0.8125rem; color: var(--couleur-accent); margin-bottom: var(--espacement-sm);">${stage.duration}</span>` : ''}
          ${stage.description ? `<p class="experience-card-description">${stage.description}</p>` : ''}
          ${stage.technologies && stage.technologies.length > 0 ? `
            <div style="display: flex; flex-wrap: wrap; gap: var(--espacement-xs); margin-top: var(--espacement-sm);">
              ${stage.technologies.map(tech => `
                <span style="padding: 4px 10px; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: var(--rayon-full); font-size: 0.8125rem; color: var(--couleur-accent-light);">
                  ${tech}
                </span>
              `).join('')}
            </div>
          ` : ''}
          ${stage.link ? `
            <a href="${stage.link}" target="_blank" rel="noopener noreferrer" class="experience-card-link">
              En savoir plus
            </a>
          ` : ''}
        </div>
      `;
    }).join('');
    
    // Animer l'apparition
    setTimeout(() => {
      const cards = container.querySelectorAll('.experience-card');
      cards.forEach((card, i) => {
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 100);
      });
    }, 200);
  }
  
  // Affiche les événements technologiques
  function afficherEvenementsTech(events) {
    const container = document.getElementById('tech-events-container');
    if (!container) return;
    
    if (!events || events.length === 0) {
      container.innerHTML = `
        <div class="experience-card" style="grid-column: 1 / -1; text-align: center; padding: var(--espacement-2xl);">
          <p style="color: var(--couleur-texte-muted);">Aucun événement technologique pour le moment</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = events.map((event, index) => {
      const eventIcons = {
        'conference': '🎤',
        'hackathon': '💻',
        'workshop': '🔧',
        'meetup': '👥',
        'webinar': '📺',
        'competition': '🏅',
        'default': '🚀'
      };
      const icon = eventIcons[event.type] || eventIcons.default;
      
      return `
        <div class="experience-card" style="animation-delay: ${index * 0.1}s;">
          <div class="experience-card-header">
            <div class="experience-card-icon">${icon}</div>
            <div style="flex: 1;">
              <h4 class="experience-card-title">${event.name || event.title || 'Événement'}</h4>
              <p class="experience-card-issuer">${event.organizer || event.location || ''}</p>
            </div>
            ${event.date ? `<span class="experience-card-date">${event.date}</span>` : ''}
          </div>
          ${event.type ? `<span style="display: inline-block; padding: 4px 12px; background: rgba(99, 102, 241, 0.15); border-radius: var(--rayon-full); font-size: 0.8125rem; color: var(--couleur-accent); margin-bottom: var(--espacement-sm); text-transform: capitalize;">${event.type}</span>` : ''}
          ${event.description ? `<p class="experience-card-description">${event.description}</p>` : ''}
          ${event.location ? `<p style="font-size: 0.875rem; color: var(--couleur-texte-muted); margin-top: var(--espacement-xs);">📍 ${event.location}</p>` : ''}
          ${event.link ? `
            <a href="${event.link}" target="_blank" rel="noopener noreferrer" class="experience-card-link">
              Voir l'événement
            </a>
          ` : ''}
        </div>
      `;
    }).join('');
    
    // Animer l'apparition
    setTimeout(() => {
      const cards = container.querySelectorAll('.experience-card');
      cards.forEach((card, i) => {
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 100);
      });
    }, 200);
  }
  
  
  /* ===== INITIALISATION ===== */
  
  function initialiserPortfolio() {
    // Fonctions de base
    mettreAJourAnnee();
    nettoyerDonnees();
    
    // Chargement des données
    chargerEtAfficherDonnees().then(() => {
      // Initialiser le hash après le premier chargement
      const donnees = obtenirMesDonnees();
      donneesActuelles = donnees;
      hashDonneesActuelles = calculerHash(donnees);
      
      // Vérifier le mode maintenance au chargement initial
      verifierModeMaintenance(donnees);
      
      // Démarrer la vérification automatique
      demarrerVerificationAutomatique();
    });
    
    // Configuration de l'interface
    configurerContact();
    configurerMenuMobile();
    configurerRetourEnHaut();
    configurerEvenements();
    
    // Configurer les animations avec un petit délai pour s'assurer que le DOM est prêt
    setTimeout(function() {
      configurerAnimations();
      
      // Forcer l'application des animations sur les éléments déjà visibles
      requestAnimationFrame(function() {
        const elementsAnimes = document.querySelectorAll('[data-animate]');
        elementsAnimes.forEach(function(element) {
          const rect = element.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.top > -100) {
            element.classList.add('animated');
          }
        });
        
        const scrollRevealElements = document.querySelectorAll('[data-scroll-reveal]');
        scrollRevealElements.forEach(function(element) {
          const rect = element.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.top > -100) {
            element.classList.add('revealed');
          }
        });
      });
      
      // Forcer la mise à jour des liens CV après que le DOM soit complètement prêt
      setTimeout(() => {
        const donnees = obtenirMesDonnees();
        console.log('🔄 Mise à jour finale des liens CV après chargement DOM');
        mettreAJourLiensCV(donnees?.links);
      }, 300);
    }, 150);
    
    // Arrêter la vérification quand la page est cachée (optimisation)
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        arreterVerificationAutomatique();
      } else {
        demarrerVerificationAutomatique();
        // Vérifier immédiatement quand la page redevient visible
        setTimeout(() => verifierEtMettreAJour(), 1000);
      }
    });
    
    // Portfolio initialisé avec succès
    console.log('✅ Portfolio initialisé avec animations améliorées et mise à jour automatique');
  }
  
  // API publique pour l'admin panel
  window.portfolioAPI = {
    charger: chargerEtAfficherDonnees,
    obtenir: obtenirMesDonnees,
    actualiser: function() {
      chargerDonneesServeur().then(function(donnees) {
        if (donnees) {
          localStorage.setItem('portfolioData', JSON.stringify(donnees));
          
          // Mettre à jour le hash pour éviter une double mise à jour
          hashDonneesActuelles = calculerHash(donnees);
          donneesActuelles = donnees;
          
          afficherMesDonnees(donnees);
          afficherCertifications(donnees.certifications || []);
          afficherStages(donnees.stages || []);
      afficherAlternances(donnees.alternances || []);
          afficherEvenementsTech(donnees.techEvents || []);
          // Forcer la mise à jour des liens CV
          setTimeout(() => {
            mettreAJourLiensCV(donnees.links);
          }, 100);
        }
      }).catch(function(erreur) {
        console.error('Erreur lors de l\'actualisation:', erreur);
        // Utiliser localStorage en fallback
        const donneesLocales = localStorage.getItem('portfolioData');
        if (donneesLocales) {
          const donnees = JSON.parse(donneesLocales);
          hashDonneesActuelles = calculerHash(donnees);
          donneesActuelles = donnees;
          afficherMesDonnees(donnees);
          mettreAJourLiensCV(donnees.links);
        }
      });
    },
    verifierMaintenant: verifierEtMettreAJour,
    demarrerVerification: demarrerVerificationAutomatique,
    arreterVerification: arreterVerificationAutomatique,
    nettoyerLocalStorage: function() {
      console.log('🗑️ Nettoyage du localStorage...');
      localStorage.removeItem('portfolioData');
      console.log('✅ localStorage nettoyé - Rechargement depuis le serveur');
      location.reload();
    },
    forcerRechargementServeur: async function() {
      console.log('🔄 Forçage du rechargement depuis le serveur...');
      localStorage.removeItem('portfolioData');
      const donnees = await chargerDonneesServeur();
      if (donnees) {
        localStorage.setItem('portfolioData', JSON.stringify(donnees));
        location.reload();
      } else {
        console.error('❌ Impossible de charger depuis le serveur');
      }
    }
  };
  
  // Démarre le portfolio !
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiserPortfolio);
  } else {
    initialiserPortfolio();
  }
  
  // Forcer la mise à jour des liens CV après le chargement complet de la page
  window.addEventListener('load', function() {
    console.log('🔄 Page complètement chargée - Vérification finale des liens CV');
    
    // Vérifier que les liens existent dans le DOM
    const testLinks = document.querySelectorAll('[data-cv-link="true"]');
    console.log('🔍 Test: Liens CV trouvés au chargement:', testLinks.length);
    
    if (testLinks.length === 0) {
      console.error('❌ PROBLÈME: Aucun lien CV trouvé dans le DOM !');
      console.log('🔍 Recherche de tous les liens contenant "CV":');
      const allLinks = document.querySelectorAll('a');
      allLinks.forEach((link, i) => {
        if (link.href.includes('CV') || link.href.includes('cv') || link.textContent.includes('CV')) {
          console.log(`  Lien ${i + 1}:`, link.href, link.textContent, link.outerHTML);
        }
      });
    }
    
    setTimeout(() => {
      const donnees = obtenirMesDonnees();
      console.log('📊 Données chargées pour CV:', {
        links: donnees?.links,
        cv: donnees?.links?.cv ? (donnees.links.cv.substring(0, 100) + '...') : 'undefined',
        cvFile: donnees?.links?.cvFile ? (donnees.links.cvFile.substring(0, 100) + '...') : 'undefined',
        cvFileName: donnees?.links?.cvFileName,
        cvFileSize: donnees?.links?.cvFileSize
      });
      mettreAJourLiensCV(donnees?.links);
      
      // Réessayer une dernière fois après 2 secondes
      setTimeout(() => {
        console.log('🔄 Dernière tentative de mise à jour des liens CV');
        const donneesFinales = obtenirMesDonnees();
        mettreAJourLiensCV(donneesFinales?.links);
      }, 2000);
    }, 500);
  });
  
  // Exposer la fonction globalement pour le débogage
  window.debugCV = function() {
    console.log('🔍 DEBUG CV - État actuel:');
    const links = document.querySelectorAll('[data-cv-link="true"]');
    console.log('Liens avec data-cv-link:', links.length);
    links.forEach((link, i) => {
      console.log(`Lien ${i + 1}:`, {
        href: link.href,
        text: link.textContent,
        parent: link.parentNode?.tagName,
        hasBase64: link.hasAttribute('data-cv-base64')
      });
    });
    
    const donnees = obtenirMesDonnees();
    console.log('💾 Données depuis localStorage:', {
      links: donnees?.links,
      cv: donnees?.links?.cv ? (donnees.links.cv.substring(0, 100) + '...') : 'undefined',
      cvFile: donnees?.links?.cvFile ? (donnees.links.cvFile.substring(0, 100) + '...') : 'undefined',
      cvFileName: donnees?.links?.cvFileName,
      cvLength: donnees?.links?.cv ? donnees.links.cv.length : 0,
      cvFileLength: donnees?.links?.cvFile ? donnees.links.cvFile.length : 0
    });
    
    // Tester le chargement depuis le serveur
    chargerDonneesServeur().then(donneesServeur => {
      console.log('📥 Données serveur (debug):', {
        hasLinks: !!donneesServeur?.links,
        cv: donneesServeur?.links?.cv ? (donneesServeur.links.cv.substring(0, 100) + '...') : 'undefined',
        cvFile: donneesServeur?.links?.cvFile ? (donneesServeur.links.cvFile.substring(0, 100) + '...') : 'undefined',
        cvLength: donneesServeur?.links?.cv ? donneesServeur.links.cv.length : 0,
        cvFileLength: donneesServeur?.links?.cvFile ? donneesServeur.links.cvFile.length : 0,
        cvType: donneesServeur?.links?.cv ? (donneesServeur.links.cv.startsWith('data:') ? 'base64' : 'other') : 'none',
        cvFileType: donneesServeur?.links?.cvFile ? (donneesServeur.links.cvFile.startsWith('data:') ? 'base64' : 'other') : 'none'
      });
      
      // Forcer la mise à jour avec les données du serveur
      if (donneesServeur?.links) {
        console.log('🔄 Forçage de la mise à jour des liens CV avec les données serveur...');
        mettreAJourLiensCV(donneesServeur.links);
      }
    });
    
    // Forcer la mise à jour avec les données locales
    mettreAJourLiensCV(donnees?.links);
  };
  
});