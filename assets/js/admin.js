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
  
  const API_PRODUCTION = 'https://portfolio-backend-elisee.fly.dev/api';
  const API_PROXY = '/api';

  function normaliserApiBase(url) {
    if (!url || typeof url !== 'string') return null;
    const propre = url.trim().replace(/\/$/, '');
    if (!/^https?:\/\//i.test(propre)) return null;
    if (!propre.toLowerCase().endsWith('/api')) return null;
    return propre;
  }

  function normaliserGoogleAnalyticsId(value) {
    if (typeof value !== 'string') return '';
    return value.trim().toUpperCase();
  }

  // Adresse de mon serveur backend (avec fallback local / réseau / override)
  function determinerServeur() {
    const params = new URLSearchParams(window.location.search);
    const overrideParam = normaliserApiBase(params.get('api'));
    const overrideStorage = localStorage.getItem('portfolioApiBase');
    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    const isLocalLan = /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(host);

    if (overrideParam) {
      localStorage.setItem('portfolioApiBase', overrideParam);
      return overrideParam;
    }

    // En production web, privilégier le proxy same-origin Netlify pour éviter les blocages cross-origin
    if (!isLocalHost && !isLocalLan) {
      if (overrideStorage) {
        localStorage.removeItem('portfolioApiBase');
      }
      return API_PROXY;
    }

    const apiStorageNormalisee = normaliserApiBase(overrideStorage);

    if (apiStorageNormalisee) {
      const estApiLocale = /https?:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(apiStorageNormalisee);
      if (!isLocalHost && !isLocalLan && estApiLocale) {
        localStorage.removeItem('portfolioApiBase');
      } else {
        return apiStorageNormalisee;
      }
    } else if (overrideStorage) {
      localStorage.removeItem('portfolioApiBase');
    }

    if (isLocalHost || isLocalLan) {
      // Si on sert le front sur un autre port que 3000, on pointe quand même l'API sur 3000
      const proto = window.location.protocol || 'http:';
      return `${proto}//${host}:3000/api`;
    }

    return API_PRODUCTION;
  }

  const MON_SERVEUR = determinerServeur();
  log('🔌 API utilisée:', MON_SERVEUR);
  
  // Données actuelles en cours d'édition
  let mesDonneesActuelles = {
    personal: {},
    projects: [],
    skills: [],
    timeline: [],
    activeSearches: [],
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
  let isRefreshingProjects = false;
  let cvBase64Dirty = false;
  let currentEditingId = null;
  let projetsStables = [];
  let selectedItems = {
    projects: new Set(),
    skills: new Set(),
    activeSearches: new Set(),
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
      const bases = [MON_SERVEUR];
      if (MON_SERVEUR !== API_PRODUCTION) {
        bases.push(API_PRODUCTION);
      }

      let derniereErreur = null;

      for (const base of bases) {
        try {
          log('🔑 Tentative de connexion via', base);
          const reponse = await fetch(`${base}/portfolio/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: motDePasse })
          });

          const resultat = await reponse.json().catch(() => ({}));

          if (reponse.ok && resultat.token) {
            localStorage.setItem('adminToken', resultat.token);
            if (base !== MON_SERVEUR) {
              localStorage.setItem('portfolioApiBase', API_PRODUCTION);
            }
            afficherDashboard();
            afficherSucces('Connexion réussie !');
            return;
          }

          if (reponse.status === 401 || reponse.status === 403 || reponse.status === 400) {
            const msg = resultat.error || resultat.message || `Connexion refusée (code ${reponse.status})`;
            afficherErreur(messageErreur, msg);
            return;
          }

          derniereErreur = new Error(`HTTP ${reponse.status}`);
        } catch (err) {
          derniereErreur = err;
        }
      }

      throw derniereErreur || new Error('Connexion impossible');
    } catch (erreur) {
      logError('❌ Erreur réseau login:', erreur);
      afficherErreur(messageErreur, `Impossible de se connecter au serveur (${MON_SERVEUR}). Vérifiez que le backend est démarré ou utilisez ?api=`);
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

    const forcerHydratationProjetsDepuisServeur = async () => {
      const bases = [MON_SERVEUR];
      if (MON_SERVEUR !== API_PRODUCTION) {
        bases.push(API_PRODUCTION);
      }

      for (const base of bases) {
        try {
          const reponsePublique = await fetch(`${base}/portfolio`, {
            cache: 'no-store'
          });
          if (!reponsePublique.ok) continue;

          const donneesPubliques = await reponsePublique.json();
          const projetsServeur = Array.isArray(donneesPubliques.projects) ? donneesPubliques.projects : [];
          if (projetsServeur.length > 0) {
            mesDonneesActuelles.projects = projetsServeur;
            if (Array.isArray(donneesPubliques.services)) {
              mesDonneesActuelles.services = donneesPubliques.services;
            }
            if (Array.isArray(donneesPubliques.skills)) {
              mesDonneesActuelles.skills = donneesPubliques.skills;
            }
            localStorage.setItem('portfolioData', JSON.stringify(mesDonneesActuelles));
            afficherListeProjets();
            mettreAJourStatsDashboard();
            return true;
          }
        } catch (e) {
          // essayer la base suivante
        }
      }

      return false;
    };

    const attendre = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const fetchAvecRetry = async (endpoint, options = {}, maxTentatives = 2) => {
      let derniereErreur = null;
      let derniereReponse = null;

      for (let tentative = 1; tentative <= maxTentatives; tentative++) {
        try {
          const reponse = await fetch(endpoint, options);
          derniereReponse = reponse;

          const erreurServeurRetryable = reponse.status >= 500 || reponse.status === 429;
          if (!erreurServeurRetryable || tentative === maxTentatives) {
            return reponse;
          }
        } catch (erreur) {
          derniereErreur = erreur;
          if (tentative === maxTentatives) {
            throw erreur;
          }
        }

        await attendre(600 * tentative);
      }

      if (derniereReponse) {
        return derniereReponse;
      }

      throw derniereErreur || new Error('Requête impossible');
    };

    const verifierServeurJoignable = async () => {
      const bases = [MON_SERVEUR];
      if (MON_SERVEUR !== API_PRODUCTION) {
        bases.push(API_PRODUCTION);
      }

      for (const base of bases) {
        const probeUrl = `${base}/portfolio`;
        try {
          const probeResponse = await fetch(probeUrl, {
            cache: 'no-store'
          });
          if (probeResponse.ok || probeResponse.status === 304) {
            return true;
          }
        } catch (e) {
          // essayer la base suivante
        }
      }

      return false;
    };

    const normaliserCollection = (value) => {
      if (Array.isArray(value)) return value;
      if (value && typeof value === 'object') return Object.values(value);
      return [];
    };

    const resoudreProjets = (sourceProjects) => {
      const projetsSource = normaliserCollection(sourceProjects);
      if (projetsSource.length > 0) return projetsSource;

      const projetsCourants = normaliserCollection(mesDonneesActuelles?.projects);
      if (projetsCourants.length > 0) return projetsCourants;

      if (Array.isArray(projetsStables) && projetsStables.length > 0) {
        return [...projetsStables];
      }

      return projetsSource;
    };

    const normaliserDonneesChargees = (donnees) => ({
      personal: donnees.personal || {},
      projects: resoudreProjets(donnees.projects),
      skills: normaliserCollection(donnees.skills),
      timeline: normaliserCollection(donnees.timeline),
      activeSearches: normaliserCollection(donnees.activeSearches),
      certifications: normaliserCollection(donnees.certifications),
      stages: normaliserCollection(donnees.stages),
      alternances: normaliserCollection(donnees.alternances),
      techEvents: normaliserCollection(donnees.techEvents),
      services: normaliserCollection(donnees.services),
      faq: normaliserCollection(donnees.faq),
      contactMessages: normaliserCollection(donnees.contactMessages),
      links: donnees.links || {},
      about: donnees.about || {},
      settings: donnees.settings || {
        maintenance: { enabled: false, message: 'Le site est actuellement en maintenance. Nous serons bientôt de retour !' },
        seo: { title: '', description: '', keywords: '' },
        analytics: { googleAnalytics: '' }
      }
    });

    const cacheLocalEstValide = (donnees) => (
      !!donnees &&
      Array.isArray(donnees.projects)
    );

    const aDesDonneesAffichables = () => {
      return Array.isArray(mesDonneesActuelles?.projects) && mesDonneesActuelles.projects.length > 0;
    };

    const tenterRecuperationAdminProduction = async (token) => {
      if (!token) return false;
      try {
        const reponseAdmin = await fetch(`${API_PRODUCTION}/portfolio/admin`, {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store'
        });

        if (!reponseAdmin.ok) return false;

        const donneesAdmin = await reponseAdmin.json();
        mesDonneesActuelles = normaliserDonneesChargees(donneesAdmin);
        if (!mesDonneesActuelles.settings.analytics) {
          mesDonneesActuelles.settings.analytics = { googleAnalytics: '' };
        }
        localStorage.setItem('portfolioData', JSON.stringify(mesDonneesActuelles));
        afficherToutesMesDonnees();
        afficherSucces('Données serveur récupérées');
        return true;
      } catch (e) {
        return false;
      }
    };

    const tenterRecuperationPublique = async () => {
      const bases = [MON_SERVEUR];
      if (MON_SERVEUR !== API_PRODUCTION) {
        bases.push(API_PRODUCTION);
      }

      for (const base of bases) {
        try {
          const reponsePublique = await fetchAvecRetry(`${base}/portfolio`, {
            cache: 'no-store'
          }, 3);

          if (!reponsePublique.ok) continue;

          const donneesPubliques = await reponsePublique.json();
          mesDonneesActuelles = normaliserDonneesChargees(donneesPubliques);
          if (!mesDonneesActuelles.settings.analytics) {
            mesDonneesActuelles.settings.analytics = { googleAnalytics: '' };
          }
          localStorage.setItem('portfolioData', JSON.stringify(mesDonneesActuelles));
          afficherToutesMesDonnees();
          return true;
        } catch (e) {
          // essayer la base suivante
        }
      }

      return false;
    };
    
    try {
      let token = obtenirToken();
      let headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      let sessionExpiree = false;
      const bases = [MON_SERVEUR];
      if (MON_SERVEUR !== API_PRODUCTION) {
        bases.push(API_PRODUCTION);
      }

      let reponse = null;
      let statutReponse = null;
      let erreurReseau = false;

      for (const base of bases) {
        const endpoint = token ? `${base}/portfolio/admin` : `${base}/portfolio`;
        try {
          const tentative = await fetchAvecRetry(endpoint, {
            headers,
            cache: 'no-store'
          });
          statutReponse = tentative.status;

          if ((tentative.status === 401 || tentative.status === 403) && token) {
            sessionExpiree = true;
            localStorage.removeItem('adminToken');
            token = null;
            headers = {};

            const tentativePublique = await fetchAvecRetry(`${base}/portfolio`, {
              cache: 'no-store'
            });
            if (tentativePublique.ok) {
              reponse = tentativePublique;
              if (base !== MON_SERVEUR) {
                localStorage.setItem('portfolioApiBase', API_PRODUCTION);
              }
              break;
            }
            continue;
          }

          if (tentative.ok) {
            reponse = tentative;
            if (base !== MON_SERVEUR) {
              localStorage.setItem('portfolioApiBase', API_PRODUCTION);
            }
            break;
          }

          // Si l'endpoint admin échoue mais que le serveur répond, tenter l'endpoint public
          if (token && tentative.status !== 401 && tentative.status !== 403) {
            try {
              const tentativePublique = await fetchAvecRetry(`${base}/portfolio`, {
                cache: 'no-store'
              });

              if (tentativePublique.ok) {
                reponse = tentativePublique;
                if (base !== MON_SERVEUR) {
                  localStorage.setItem('portfolioApiBase', API_PRODUCTION);
                }
                break;
              }
            } catch (e) {
              erreurReseau = true;
            }
          } else if (tentative.status >= 500 || tentative.status === 429) {
            erreurReseau = true;
          }
        } catch (e) {
          erreurReseau = true;
          // essayer la base suivante
        }
      }

      // Dernier recours: si l'endpoint admin ne répond pas, forcer une lecture publique en production
      if ((!reponse || !reponse.ok) && token) {
        try {
          const endpointPublicProduction = `${API_PRODUCTION}/portfolio`;
          const tentativeFinale = await fetchAvecRetry(endpointPublicProduction, {
            cache: 'no-store'
          }, 3);

          statutReponse = tentativeFinale.status;
          if (tentativeFinale.ok) {
            reponse = tentativeFinale;
            localStorage.setItem('portfolioApiBase', API_PRODUCTION);
          } else if (tentativeFinale.status >= 500 || tentativeFinale.status === 429) {
            erreurReseau = true;
          }
        } catch (e) {
          erreurReseau = true;
        }
      }

      if (reponse && reponse.ok) {
        const donnees = await reponse.json();
        mesDonneesActuelles = normaliserDonneesChargees(donnees);
        
        // S'assurer que les settings ont bien la structure analytics
        if (!mesDonneesActuelles.settings.analytics) {
          mesDonneesActuelles.settings.analytics = { googleAnalytics: '' };
        }
        
        // Log pour debug
        if (estEnDeveloppement) {
          log('📊 Settings chargées depuis serveur:', {
            hasSettings: !!mesDonneesActuelles.settings,
            hasAnalytics: !!mesDonneesActuelles.settings.analytics,
            googleAnalytics: mesDonneesActuelles.settings.analytics?.googleAnalytics || '(vide)'
          });
        }
        
        // Sauvegarder aussi dans localStorage comme backup
        localStorage.setItem('portfolioData', JSON.stringify(mesDonneesActuelles));
        cvBase64Dirty = false;
        
        afficherToutesMesDonnees();
        if (sessionExpiree) {
          afficherErreur(null, 'Session expirée : reconnectez-vous pour modifier les projets');
        }
        afficherSucces('Données chargées depuis le serveur');
        await forcerHydratationProjetsDepuisServeur();
      } else {
        // Si erreur serveur ou réponse conditionnelle (304), utiliser localStorage
        const donneesLocales = localStorage.getItem('portfolioData');
        if (donneesLocales) {
          const donneesLocalesParsees = JSON.parse(donneesLocales);

          // Si le cache local est incomplet (ex: projets absents), tenter une récupération directe admin
          if ((!cacheLocalEstValide(donneesLocalesParsees) || donneesLocalesParsees.projects.length === 0) && await tenterRecuperationAdminProduction(token)) {
            return;
          }

          // Si les projets sont vides en local, tenter explicitement la récupération publique
          if (Array.isArray(donneesLocalesParsees.projects) && donneesLocalesParsees.projects.length === 0 && await tenterRecuperationPublique()) {
            return;
          }

          if ((!cacheLocalEstValide(donneesLocalesParsees) || donneesLocalesParsees.projects.length === 0) && await tenterRecuperationPublique()) {
            return;
          }

          if (!cacheLocalEstValide(donneesLocalesParsees)) {
            if (cacheLocalEstValide(mesDonneesActuelles) && mesDonneesActuelles.projects.length > 0) {
              afficherToutesMesDonnees();
              afficherErreur(null, 'Synchronisation serveur indisponible. Les dernières données chargées sont conservées.');
            } else {
              afficherErreur(null, 'Synchronisation serveur indisponible. Réessayez dans quelques secondes.');
            }
            return;
          }

          mesDonneesActuelles = normaliserDonneesChargees(donneesLocalesParsees);
          
          // S'assurer que les settings ont bien la structure analytics
          if (!mesDonneesActuelles.settings) {
            mesDonneesActuelles.settings = {
              maintenance: { enabled: false, message: 'Le site est actuellement en maintenance. Nous serons bientôt de retour !' },
              seo: { title: '', description: '', keywords: '' },
              analytics: { googleAnalytics: '' }
            };
          }
          if (!mesDonneesActuelles.settings.analytics) {
            mesDonneesActuelles.settings.analytics = { googleAnalytics: '' };
          }
          
          afficherToutesMesDonnees();
          if (statutReponse === 304) {
            afficherSucces('Données serveur synchronisées (cache validé)');
          } else if (erreurReseau || !statutReponse) {
            // Fallback silencieux: garder l'affichage local sans spam de toast
            if (estEnDeveloppement) {
              const serveurJoignable = await verifierServeurJoignable();
              logWarn('⚠️ Sync serveur indisponible, fallback local conservé', { serveurJoignable });
            }
          } else {
            // Réponse partielle: conserver l'état actuel sans alerte utilisateur
            if (estEnDeveloppement) {
              logWarn('⚠️ Réponse API incomplète, fallback local conservé');
            }
          }
          await forcerHydratationProjetsDepuisServeur();
        }
      }
    } catch (erreur) {
      logError('Erreur chargement:', erreur);
      // Utiliser localStorage en fallback
      const donneesLocales = localStorage.getItem('portfolioData');
      if (donneesLocales) {
        const donneesLocalesParsees = JSON.parse(donneesLocales);

        // Même en cas d'exception, tenter une récupération admin directe pour éviter une liste de projets vide
        if ((!cacheLocalEstValide(donneesLocalesParsees) || donneesLocalesParsees.projects.length === 0) && await tenterRecuperationAdminProduction(obtenirToken())) {
          return;
        }

        // Même en cas d'exception, tenter aussi une récupération publique si les projets locaux sont vides
        if (Array.isArray(donneesLocalesParsees.projects) && donneesLocalesParsees.projects.length === 0 && await tenterRecuperationPublique()) {
          return;
        }

        if ((!cacheLocalEstValide(donneesLocalesParsees) || donneesLocalesParsees.projects.length === 0) && await tenterRecuperationPublique()) {
          return;
        }

        if (!cacheLocalEstValide(donneesLocalesParsees)) {
          if (cacheLocalEstValide(mesDonneesActuelles) && mesDonneesActuelles.projects.length > 0) {
            afficherToutesMesDonnees();
            afficherErreur(null, 'Synchronisation serveur indisponible. Les dernières données chargées sont conservées.');
          } else {
            afficherErreur(null, 'Synchronisation serveur indisponible. Réessayez dans quelques secondes.');
          }
          return;
        }

        mesDonneesActuelles = normaliserDonneesChargees(donneesLocalesParsees);

        afficherToutesMesDonnees();
        if (estEnDeveloppement) {
          const serveurJoignable = await verifierServeurJoignable();
          logWarn('⚠️ Exception chargement, fallback local conservé', { serveurJoignable });
        }
        await forcerHydratationProjetsDepuisServeur();
      }
    } finally {
      isLoading = false;
    }
  }
  
  // Sauvegarde les données sur le serveur
  async function sauvegarderSurServeur(messageSucces = 'Action sauvegardée avec succès') {
    const token = obtenirToken();
    if (!token) {
      afficherErreur(null, 'Vous devez être connecté pour sauvegarder');
      return false;
    }

    // Trace rapide pour savoir si le clic déclenche bien le fetch
    const debugSave = estEnDeveloppement || localStorage.getItem('debugSauvegarde') === 'true';
    const endpoints = [`${MON_SERVEUR}/portfolio`];
    if (MON_SERVEUR !== API_PRODUCTION) {
      endpoints.push(`${API_PRODUCTION}/portfolio`);
    }
    if (debugSave) {
      console.log('🚀 Sauvegarde déclenchée', {
        endpoint: endpoints[0],
        tokenPresent: !!token,
        stages: mesDonneesActuelles.stages?.length || 0,
        alternances: mesDonneesActuelles.alternances?.length || 0,
        projects: mesDonneesActuelles.projects?.length || 0,
        timestamp: new Date().toISOString()
      });
    }
    const watchdog = setTimeout(() => {
      if (debugSave) {
        console.warn('⏱️ POST /portfolio toujours en cours (5s)...', { endpoint });
      }
    }, 5000);
    
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
      // S'assurer que les settings sont inclus dans les données à envoyer
      // Si mesDonneesActuelles n'a pas de settings, les récupérer depuis localStorage
      if (!mesDonneesActuelles.settings) {
        const currentData = JSON.parse(localStorage.getItem('portfolioData') || '{}');
        if (currentData.settings) {
          mesDonneesActuelles.settings = currentData.settings;
          log('📥 Settings récupérées depuis localStorage:', mesDonneesActuelles.settings);
        }
      }
      
      const donneesAEnvoyer = {
        ...mesDonneesActuelles,
        links: { ...(mesDonneesActuelles.links || {}) },
        settings: mesDonneesActuelles.settings || {
          maintenance: { enabled: false, message: 'Le site est actuellement en maintenance. Nous serons bientôt de retour !' },
          seo: { title: '', description: '', keywords: '' },
          analytics: { googleAnalytics: '' }
        }
      };

      if (!cvBase64Dirty && donneesAEnvoyer.links && typeof donneesAEnvoyer.links.cvFile === 'string' && donneesAEnvoyer.links.cvFile.startsWith('data:')) {
        delete donneesAEnvoyer.links.cvFile;
        delete donneesAEnvoyer.links.cvFileName;
        delete donneesAEnvoyer.links.cvFileSize;
        if (typeof donneesAEnvoyer.links.cv === 'string' && donneesAEnvoyer.links.cv.startsWith('data:')) {
          donneesAEnvoyer.links.cv = '/api/portfolio/cv';
        }
      }
      
      // Log pour debug
      log('📤 Données envoyées au serveur:', {
        hasSettings: !!donneesAEnvoyer.settings,
        maintenanceEnabled: donneesAEnvoyer.settings?.maintenance?.enabled,
        maintenanceMessage: donneesAEnvoyer.settings?.maintenance?.message,
        settingsComplete: JSON.stringify(donneesAEnvoyer.settings)
      });
      let dernierStatut = null;
      let dernierMessage = '';
      let derniereErreur = null;

      for (const endpoint of endpoints) {
        try {
          const reponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(donneesAEnvoyer)
          });

          const resultat = await reponse.json().catch(() => ({}));

          if (debugSave) {
            console.log('✅ POST /portfolio envoyé', {
              status: reponse.status,
              ok: reponse.ok,
              endpoint,
              contentLength: JSON.stringify(donneesAEnvoyer).length
            });
          }

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
              cvBase64Dirty = false;
          
              // Mettre à jour les settings aussi
              if (resultat.portfolio.settings) {
                mesDonneesActuelles.settings = resultat.portfolio.settings;
                log('✅ Settings mis à jour depuis le serveur:', {
                  maintenanceEnabled: mesDonneesActuelles.settings?.maintenance?.enabled,
                  maintenanceMessage: mesDonneesActuelles.settings?.maintenance?.message
                });
              }
            }
        
            // Sauvegarder aussi dans localStorage avec les données mises à jour
            localStorage.setItem('portfolioData', JSON.stringify(mesDonneesActuelles));
            afficherSucces(messageSucces || 'Action sauvegardée avec succès');
        
            // Forcer le rechargement des données sur toutes les pages ouvertes
            if (window.portfolioAPI && window.portfolioAPI.actualiser) {
              // Attendre un peu pour que le serveur ait fini de sauvegarder
              setTimeout(() => {
                log('🔄 Actualisation des pages publiques après sauvegarde...');
                window.portfolioAPI.actualiser();
              }, 500);
            }
        
            clearTimeout(watchdog);
            return true;
          }

          if (reponse.status === 401 || reponse.status === 403) {
            clearTimeout(watchdog);
            seDeconnecter();
            afficherErreur(null, 'Session expirée. Reconnectez-vous pour enregistrer.');
            return false;
          }

          dernierStatut = reponse.status;
          dernierMessage = resultat.error || resultat.message || '';
        } catch (erreurTentative) {
          derniereErreur = erreurTentative;
        }
      }

      clearTimeout(watchdog);
      if (dernierStatut) {
        afficherErreur(null, `Erreur sauvegarde (HTTP ${dernierStatut})${dernierMessage ? ` : ${dernierMessage}` : ''}`);
      } else if (derniereErreur) {
        afficherErreur(null, 'Impossible de sauvegarder sur le serveur');
      }
      return false;
    } catch (erreur) {
      clearTimeout(watchdog);
      logError('Erreur sauvegarde:', erreur);
      if (debugSave) {
        console.error('❌ Sauvegarde non envoyée ou échouée', { endpoint: endpoints[0], erreur });
        alert('Sauvegarde bloquée avant POST: ' + (erreur?.message || erreur));
      }
      afficherErreur(null, 'Impossible de sauvegarder sur le serveur');
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

        if (tabName === 'projects') {
          chargerProjetsDepuisServeur(true);
        }
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
    afficherListeTestimonials();
    afficherListeActiveSearches();
    afficherListeServices();
    afficherListeFAQ();
    afficherListeMessages();
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

  async function chargerProjetsDepuisServeur(force = false) {
    if (isRefreshingProjects) return false;

    const projetsLocaux = mesDonneesActuelles.projects || [];
    if (!force && Array.isArray(projetsLocaux) && projetsLocaux.length > 0) {
      return true;
    }

    isRefreshingProjects = true;
    try {
      const bases = [MON_SERVEUR];
      if (MON_SERVEUR !== API_PRODUCTION) {
        bases.push(API_PRODUCTION);
      }

      for (const base of bases) {
        try {
          const reponse = await fetch(`${base}/portfolio`, {
            cache: 'no-store'
          });
          if (!reponse.ok) continue;

          const donnees = await reponse.json();
          const projetsServeur = Array.isArray(donnees.projects) ? donnees.projects : [];

          mesDonneesActuelles.projects = projetsServeur;
          localStorage.setItem('portfolioData', JSON.stringify(mesDonneesActuelles));
          afficherListeProjets();
          mettreAJourStatsDashboard();
          return projetsServeur.length > 0;
        } catch (e) {
          // essayer la base suivante
        }
      }

      return false;
    } finally {
      isRefreshingProjects = false;
    }
  }
  
  // Affiche la liste des projets
  function afficherListeProjets() {
    const container = document.getElementById('projects-list');
    if (!container) return;

    const projetsCourants = Array.isArray(mesDonneesActuelles.projects)
      ? mesDonneesActuelles.projects
      : (mesDonneesActuelles.projects && typeof mesDonneesActuelles.projects === 'object'
          ? Object.values(mesDonneesActuelles.projects)
          : []);

    if (!Array.isArray(mesDonneesActuelles.projects)) {
      mesDonneesActuelles.projects = projetsCourants;
    }

    if (projetsCourants.length > 0) {
      projetsStables = [...projetsCourants];
    }

    const utiliserProjetsStables = projetsCourants.length === 0 && (isLoading || isRefreshingProjects) && projetsStables.length > 0;
    const projets = utiliserProjetsStables ? projetsStables : projetsCourants;

    if (utiliserProjetsStables) {
      mesDonneesActuelles.projects = [...projetsStables];
    }
    
    if (projets.length === 0) {
      container.innerHTML = '<p class="muted">Aucun projet pour le moment.</p>';
      chargerProjetsDepuisServeur(true);
      return;
    }
    
    container.innerHTML = projets.map((projet, index) => `
      <div class="item-card">
        <input type="checkbox" class="select-checkbox" data-type="projects" data-index="${index}" onchange="toggleItemSelection('projects', ${index}, this.checked)" />
        <h4>${projet.title || 'Projet sans titre'}</h4>
        <p class="item-meta">${projet.type || ''} ${projet.category ? '· ' + projet.category : ''} ${projet.featured ? '· ⭐ En vedette' : ''} ${projet.docFile ? '· 📂 Doc protégé' : ''}</p>
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

  const LIMITE_TAILLE_DOC = 50 * 1024 * 1024;

  function formaterTailleDoc(octets) {
    if (!octets) return '0 o';
    if (octets < 1024) return `${octets} o`;
    if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`;
    return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
  }

  function mettreAJourAffichageDocProjet({ fileName, fileSize, hasDoc }) {
    const info = document.getElementById('project-doc-file-info');
    const hint = document.getElementById('project-doc-remove-hint');
    if (info) {
      if (hasDoc && fileName) {
        info.textContent = `${fileName} (${formaterTailleDoc(fileSize)})`;
      } else {
        info.textContent = 'Aucun fichier sélectionné.';
      }
    }
    if (hint) {
      hint.textContent = hasDoc ? 'Un document est attaché à ce projet' : 'Aucun document chargé';
    }
  }

  function viderDocProjet(markRemoved = false) {
    const fileInput = document.getElementById('project-doc-file');
    if (fileInput) fileInput.value = '';
    ['project-doc-file-data', 'project-doc-file-name', 'project-doc-file-size'].forEach(id => {
      const input = document.getElementById(id);
      if (input) input.value = '';
    });
    const removed = document.getElementById('project-doc-removed');
    if (removed) removed.value = markRemoved ? 'true' : 'false';
    const password = document.getElementById('project-doc-password');
    if (password) password.value = '';
    mettreAJourAffichageDocProjet({ hasDoc: false });
  }

  function chargerDocProjetDansForm(projet = {}) {
    viderDocProjet(false);
    const removed = document.getElementById('project-doc-removed');
    if (removed) removed.value = 'false';

    const base64Input = document.getElementById('project-doc-file-data');
    const nameInput = document.getElementById('project-doc-file-name');
    const sizeInput = document.getElementById('project-doc-file-size');
    if (base64Input) base64Input.value = projet.docFile || '';
    if (nameInput) nameInput.value = projet.docFileName || '';
    if (sizeInput) sizeInput.value = projet.docFileSize || '';

    const hasDoc = !!projet.docFile;
    mettreAJourAffichageDocProjet({ fileName: projet.docFileName, fileSize: projet.docFileSize, hasDoc });
  }

  async function lireFichierGeneriqueBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Lecture du fichier échouée'));
      reader.readAsDataURL(file);
    });
  }

  async function gererSelectionDocProjet(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > LIMITE_TAILLE_DOC) {
      afficherErreur(null, 'Le document dépasse la limite de 50 Mo');
      event.target.value = '';
      viderDocProjet(true);
      return;
    }

    const extensionAutorisee = /(\.pdf|\.doc|\.docx|\.zip)$/i.test(file.name);
    if (!extensionAutorisee) {
      afficherErreur(null, 'Formats autorisés : PDF, DOC, DOCX, ZIP');
      event.target.value = '';
      viderDocProjet(true);
      return;
    }

    try {
      const base64 = await lireFichierGeneriqueBase64(file);
      document.getElementById('project-doc-file-data').value = base64;
      document.getElementById('project-doc-file-name').value = file.name;
      document.getElementById('project-doc-file-size').value = file.size.toString();
      const removed = document.getElementById('project-doc-removed');
      if (removed) removed.value = 'false';
      mettreAJourAffichageDocProjet({ fileName: file.name, fileSize: file.size, hasDoc: true });
    } catch (err) {
      logError('Erreur lecture doc projet:', err);
      afficherErreur(null, 'Impossible de lire le document (PDF/DOCX/ZIP)');
      viderDocProjet(true);
    }
  }

  window.removeProjectDoc = function() {
    viderDocProjet(true);
  };
  
  // Affiche le formulaire de projet
  window.showProjectForm = function(editIndex = null) {
    const modal = document.getElementById('project-form-modal');
    const form = document.getElementById('project-form');
    const title = document.getElementById('project-form-title');

    if (!suisJeConnecte()) {
      afficherErreur(null, 'Session expirée. Reconnectez-vous pour modifier les projets.');
      afficherConnexion();
      return;
    }
    
    if (!modal || !form) return;
    
    currentEditingId = editIndex;
    viderDocProjet(false);
    
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
      chargerDocProjetDansForm(projet);
      
      // Afficher un message de confirmation
      if (window.location.hostname === 'localhost') {
        log('✏️ Mode édition activé pour le projet:', projet.title);
      }
    } else {
      form.reset();
      document.getElementById('project-id').value = '';
      document.getElementById('project-featured').checked = false;
      document.getElementById('project-public').checked = true;
      viderDocProjet(false);
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
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    if (!suisJeConnecte()) {
      afficherErreur(null, 'Session expirée. Reconnectez-vous pour enregistrer vos modifications.');
      afficherConnexion();
      return;
    }

    const normaliserUrl = (valeur) => {
      const brut = (valeur || '').trim();
      if (!brut) return '';
      const avecProtocole = /^https?:\/\//i.test(brut) ? brut : `https://${brut}`;
      try {
        return new URL(avecProtocole).toString();
      } catch {
        return null;
      }
    };
    
    const editIndex = currentEditingId;
    const projetExistant = editIndex !== null ? (mesDonneesActuelles.projects[editIndex] || {}) : {};
    const docFileData = document.getElementById('project-doc-file-data')?.value || '';
    const docFileName = document.getElementById('project-doc-file-name')?.value || '';
    const docFileSizeValue = document.getElementById('project-doc-file-size')?.value || '';
    const docPassword = document.getElementById('project-doc-password')?.value.trim() || '';
    const docRemoved = (document.getElementById('project-doc-removed')?.value || 'false') === 'true';

    const titre = document.getElementById('project-title').value.trim();
    const shortDesc = document.getElementById('project-short-desc').value.trim();
    const description = document.getElementById('project-description').value.trim();
    const tags = document.getElementById('project-tags').value.split(',').map(t => t.trim()).filter(t => t);
    const lienProjet = normaliserUrl(document.getElementById('project-link').value);
    const lienDemo = normaliserUrl(document.getElementById('project-demo-link').value);

    if (!titre) {
      afficherErreur(null, 'Le titre est obligatoire');
      return;
    }

    if (!shortDesc) {
      afficherErreur(null, 'La description courte est obligatoire');
      return;
    }

    if (!description) {
      afficherErreur(null, 'La description complète est obligatoire');
      return;
    }

    if (tags.length === 0) {
      afficherErreur(null, 'Ajoutez au moins une technologie');
      return;
    }

    if (lienProjet === null) {
      afficherErreur(null, 'Lien du projet invalide');
      return;
    }

    if (lienDemo === null) {
      afficherErreur(null, 'Lien de démo invalide');
      return;
    }

    const projet = {
      ...projetExistant,
      title: titre,
      type: document.getElementById('project-type').value,
      category: document.getElementById('project-category').value.trim(),
      shortDesc,
      description,
      features: document.getElementById('project-features').value.split('\n').filter(f => f.trim()),
      tags,
      link: lienProjet || '',
      demoLink: lienDemo || '',
      featured: document.getElementById('project-featured').checked,
      public: document.getElementById('project-public').checked
    };

    if (docRemoved) {
      delete projet.docFile;
      delete projet.docFileName;
      delete projet.docFileSize;
      delete projet.docPasswordHash;
    } else if (docFileData) {
      projet.docFile = docFileData;
      if (docFileName) projet.docFileName = docFileName;
      if (docFileSizeValue) {
        projet.docFileSize = parseInt(docFileSizeValue, 10) || 0;
      }
    }

    if (docPassword) {
      projet.docPassword = docPassword;
      delete projet.docPasswordHash;
    } else if (projet.docFile && !projet.docPasswordHash) {
      afficherErreur(null, 'Ajoutez un mot de passe pour protéger le document');
      return;
    }
    
    const ancienneListeProjets = [...(mesDonneesActuelles.projects || [])];
    if (editIndex !== null) {
      mesDonneesActuelles.projects[editIndex] = projet;
    } else {
      mesDonneesActuelles.projects.push(projet);
    }

    const messageSucces = editIndex !== null
      ? 'Projet modifié et enregistré avec succès'
      : 'Projet ajouté et enregistré avec succès';

    const success = await sauvegarderSurServeur(messageSucces);
    if (!success) {
      mesDonneesActuelles.projects = ancienneListeProjets;
      afficherListeProjets();
      return;
    }

    afficherListeProjets();
    window.hideProjectForm();
  }
  
  // Édite un projet
  window.editProject = function(index) {
    window.showProjectForm(index);
  };
  
  // Supprime un projet
  window.deleteProject = async function(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      const ancienneListeProjets = [...(mesDonneesActuelles.projects || [])];
      mesDonneesActuelles.projects.splice(index, 1);
      const success = await sauvegarderSurServeur('Projet supprimé avec succès');
      if (!success) {
        mesDonneesActuelles.projects = ancienneListeProjets;
      }
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
    await sauvegarderSurServeur('Compétence ajoutée et publiée');
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
        ${(cert.photo || cert.image) ? '<p class="muted" style="margin: 4px 0;">📷 Photo configurée</p>' : ''}
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
      const certPhotoUrl = document.getElementById('cert-photo-url');
      if (certPhotoUrl) certPhotoUrl.value = cert.photo && !cert.photo.startsWith('data:') ? cert.photo : '';
      const certPhotoPreview = document.getElementById('cert-photo-preview');
      if (certPhotoPreview) {
        const certPhoto = cert.photo || cert.image || '';
        certPhotoPreview.innerHTML = certPhoto ? `<img src="${certPhoto}" alt="Visuel certification" style="max-width:100%; height:auto; border-radius: 8px;" />` : '';
      }
      const certPhotoFile = document.getElementById('cert-photo-file');
      if (certPhotoFile) certPhotoFile.value = '';
      document.getElementById('cert-issuer').value = cert.issuer || '';
      document.getElementById('cert-date').value = cert.date || '';
      document.getElementById('cert-url').value = cert.link || '';
      const certImage = document.getElementById('cert-image');
      if (certImage) certImage.value = cert.image || cert.photo || '';
    } else {
      form.reset();
      document.getElementById('certification-id').value = '';
      const certPhotoPreview = document.getElementById('cert-photo-preview');
      if (certPhotoPreview) certPhotoPreview.innerHTML = '';
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

    const photoUrlInput = document.getElementById('cert-photo-url');
    const photoFileInput = document.getElementById('cert-photo-file');
    const photoPreview = document.getElementById('cert-photo-preview');
    const imageInput = document.getElementById('cert-image');

    const editIndex = currentEditingId;
    const ancien = editIndex !== null ? mesDonneesActuelles.certifications[editIndex] || {} : {};
    
    const cert = {
      name: document.getElementById('cert-name').value.trim(),
      issuer: document.getElementById('cert-issuer').value.trim(),
      date: document.getElementById('cert-date').value,
      description: '',
      link: document.getElementById('cert-url').value.trim(),
      photo: '',
      image: ''
    };

    try {
      const nouvellePhotoBase64 = await lireImageBase64(photoFileInput);
      const photoUrl = photoUrlInput?.value.trim();
      const imageUrl = imageInput?.value.trim();

      if (nouvellePhotoBase64) {
        cert.photo = nouvellePhotoBase64;
        cert.image = imageUrl || ancienneImageOuPhoto(ancien);
        if (photoPreview) {
          photoPreview.innerHTML = `<img src="${nouvellePhotoBase64}" alt="Visuel certification" style="max-width:100%; height:auto; border-radius: 8px;" />`;
        }
      } else if (photoUrl) {
        cert.photo = photoUrl;
        cert.image = imageUrl || photoUrl;
        if (photoPreview) {
          photoPreview.innerHTML = `<img src="${photoUrl}" alt="Visuel certification" style="max-width:100%; height:auto; border-radius: 8px;" />`;
        }
      } else {
        cert.photo = ancien.photo || '';
        cert.image = imageUrl || ancien.image || ancien.photo || '';
      }
    } catch (err) {
      if (err.message === 'IMAGE_TOO_LARGE') {
        afficherErreur(null, 'Image trop volumineuse (max 5 Mo)');
        return;
      }
      afficherErreur(null, 'Impossible de lire l\'image de la certification');
      return;
    }
    
    if (!cert.name || !cert.issuer) {
      afficherErreur(null, 'Le nom et l\'organisme émetteur sont obligatoires');
      return;
    }
    
    if (editIndex !== null) {
      mesDonneesActuelles.certifications[editIndex] = cert;
    } else {
      mesDonneesActuelles.certifications.push(cert);
    }
    
    await sauvegarderSurServeur();
    afficherListeCertifications();
    window.hideCertificationForm();
  }

  function ancienneImageOuPhoto(cert) {
    if (!cert) return '';
    return cert.image || cert.photo || '';
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

  async function lireImageBase64(input) {
    return new Promise((resolve, reject) => {
      const file = input?.files?.[0];
      if (!file) return resolve(null);
      if (file.size > 5 * 1024 * 1024) {
        return reject(new Error('IMAGE_TOO_LARGE'));
      }
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = () => reject(new Error('IMAGE_READ_ERROR'));
      reader.readAsDataURL(file);
    });
  }

  async function lireFichierDocBase64(input) {
    return new Promise((resolve, reject) => {
      const file = input?.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = e => resolve({ base64: e.target.result, name: file.name, size: file.size });
      reader.onerror = () => reject(new Error('Lecture du fichier rapport échouée'));
      reader.readAsDataURL(file);
    });
  }
  
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
      const stagePhotoUrl = document.getElementById('stage-photo-url');
      if (stagePhotoUrl) stagePhotoUrl.value = item.photo && !item.photo.startsWith('data:') ? item.photo : '';
      const stagePhotoPreview = document.getElementById('stage-photo-preview');
      if (stagePhotoPreview) {
        stagePhotoPreview.innerHTML = item.photo ? `<img src="${item.photo}" alt="Visuel stage" style="max-width:100%; height:auto; border-radius: 8px;" />` : '';
      }
      document.getElementById('stage-company').value = item.company || '';
      document.getElementById('stage-location').value = item.location || '';
      document.getElementById('stage-date').value = item.date || '';
      document.getElementById('stage-duration').value = item.duration || '';
      document.getElementById('stage-description').value = item.description || '';
      document.getElementById('stage-technologies').value = (item.technologies || []).join(', ');
      document.getElementById('stage-link').value = item.link || '';
      const info = document.getElementById('stage-report-info');
      if (info) info.textContent = item.docFileName ? `Rapport chargé: ${item.docFileName}` : 'Aucun rapport chargé';
      const passInput = document.getElementById('stage-report-password');
      if (passInput) passInput.value = '';
    } else {
      form.reset();
      document.getElementById('stage-id').value = '';
      const stagePhotoPreview = document.getElementById('stage-photo-preview');
      if (stagePhotoPreview) stagePhotoPreview.innerHTML = '';
      const info = document.getElementById('stage-report-info');
      if (info) info.textContent = 'Aucun rapport chargé';
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
    
    const docInfoEl = document.getElementById('stage-report-info');
    const docInput = document.getElementById('stage-report-file');
    const docPassword = document.getElementById('stage-report-password')?.value.trim();
    const photoUrlInput = document.getElementById('stage-photo-url');
    const photoFileInput = document.getElementById('stage-photo-file');

    const editIndex = currentEditingId;
    const ancien = editIndex !== null ? mesDonneesActuelles.stages[editIndex] || {} : {};

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
    
    // Photo du stage : fichier prioritaire, sinon URL, sinon conserver l'existant
    try {
      const nouvellePhotoBase64 = await lireImageBase64(photoFileInput);
      const photoUrl = photoUrlInput?.value.trim();
      if (nouvellePhotoBase64) {
        item.photo = nouvellePhotoBase64;
        const stagePhotoPreview = document.getElementById('stage-photo-preview');
        if (stagePhotoPreview) stagePhotoPreview.innerHTML = `<img src="${nouvellePhotoBase64}" alt="Visuel stage" style="max-width:100%; height:auto; border-radius: 8px;" />`;
      } else if (photoUrl) {
        item.photo = photoUrl;
      } else {
        item.photo = ancien.photo;
      }
    } catch (err) {
      if (err.message === 'IMAGE_TOO_LARGE') {
        afficherErreur(null, 'Image trop volumineuse (max 5 Mo)');
        return;
      }
      afficherErreur(null, 'Impossible de lire l\'image du stage');
      return;
    }

    if (!item.title || !item.company || !item.description || !item.date) {
      afficherErreur(null, 'Le titre, l\'entreprise, la date et la description sont obligatoires');
      return;
    }
    
    // Charger le rapport de stage si fourni
    try {
      const fichier = await lireFichierDocBase64(docInput);
      if (fichier) {
        if (fichier.size > 50 * 1024 * 1024) {
          afficherErreur(null, 'Rapport trop volumineux (max 50 Mo)');
          return;
        }
        item.docFile = fichier.base64;
        item.docFileName = fichier.name;
        item.docFileSize = fichier.size;
        if (docInfoEl) docInfoEl.textContent = `Rapport chargé: ${fichier.name}`;
      } else {
        // Pas de nouveau fichier : conserver l'existant pour ne pas le neutraliser
        item.docFile = ancien.docFile;
        item.docFileName = ancien.docFileName;
        item.docFileSize = ancien.docFileSize;
        item.docPasswordHash = ancien.docPasswordHash;
      }
    } catch (err) {
      afficherErreur(null, 'Impossible de lire le rapport de stage');
      return;
    }

    if (docPassword) {
      item.docPassword = docPassword;
    }

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
      const altPhotoUrl = document.getElementById('alternance-photo-url');
      if (altPhotoUrl) altPhotoUrl.value = item.photo && !item.photo.startsWith('data:') ? item.photo : '';
      const altPhotoPreview = document.getElementById('alternance-photo-preview');
      if (altPhotoPreview) {
        altPhotoPreview.innerHTML = item.photo ? `<img src="${item.photo}" alt="Visuel alternance" style="max-width:100%; height:auto; border-radius: 8px;" />` : '';
      }
      document.getElementById('alternance-company').value = item.company || '';
      document.getElementById('alternance-location').value = item.location || '';
      document.getElementById('alternance-date').value = item.date || '';
      document.getElementById('alternance-rhythm').value = item.rhythm || '';
      document.getElementById('alternance-description').value = item.description || '';
      document.getElementById('alternance-technologies').value = (item.technologies || []).join(', ');
      document.getElementById('alternance-link').value = item.link || '';
      const info = document.getElementById('alternance-report-info');
      if (info) info.textContent = item.docFileName ? `Rapport chargé: ${item.docFileName}` : 'Aucun rapport chargé';
      const passInput = document.getElementById('alternance-report-password');
      if (passInput) passInput.value = '';
    } else {
      form.reset();
      document.getElementById('alternance-id').value = '';
      const altPhotoPreview = document.getElementById('alternance-photo-preview');
      if (altPhotoPreview) altPhotoPreview.innerHTML = '';
      const info = document.getElementById('alternance-report-info');
      if (info) info.textContent = 'Aucun rapport chargé';
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
    
    const docInfoEl = document.getElementById('alternance-report-info');
    const docInput = document.getElementById('alternance-report-file');
    const docPassword = document.getElementById('alternance-report-password')?.value.trim();
    const photoUrlInput = document.getElementById('alternance-photo-url');
    const photoFileInput = document.getElementById('alternance-photo-file');

    const editIndex = currentEditingId;
    const ancien = editIndex !== null ? mesDonneesActuelles.alternances[editIndex] || {} : {};

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
    
    // Photo d'alternance : fichier prioritaire, sinon URL, sinon conserver l'existant
    try {
      const nouvellePhotoBase64 = await lireImageBase64(photoFileInput);
      const photoUrl = photoUrlInput?.value.trim();
      if (nouvellePhotoBase64) {
        item.photo = nouvellePhotoBase64;
        const preview = document.getElementById('alternance-photo-preview');
        if (preview) preview.innerHTML = `<img src="${nouvellePhotoBase64}" alt="Visuel alternance" style="max-width:100%; height:auto; border-radius: 8px;" />`;
      } else if (photoUrl) {
        item.photo = photoUrl;
      } else {
        item.photo = ancien.photo;
      }
    } catch (err) {
      if (err.message === 'IMAGE_TOO_LARGE') {
        afficherErreur(null, 'Image trop volumineuse (max 5 Mo)');
        return;
      }
      afficherErreur(null, 'Impossible de lire l\'image de l\'alternance');
      return;
    }

    if (!item.title || !item.company || !item.description || !item.date) {
      afficherErreur(null, 'Le titre, l\'entreprise, la date et la description sont obligatoires');
      return;
    }

    // Charger le rapport d'alternance si fourni
    try {
      const fichier = await lireFichierDocBase64(docInput);
      if (fichier) {
        if (fichier.size > 50 * 1024 * 1024) {
          afficherErreur(null, 'Rapport trop volumineux (max 50 Mo)');
          return;
        }
        item.docFile = fichier.base64;
        item.docFileName = fichier.name;
        item.docFileSize = fichier.size;
        if (docInfoEl) docInfoEl.textContent = `Rapport chargé: ${fichier.name}`;
      } else {
        item.docFile = ancien.docFile;
        item.docFileName = ancien.docFileName;
        item.docFileSize = ancien.docFileSize;
        item.docPasswordHash = ancien.docPasswordHash;
      }
    } catch (err) {
      afficherErreur(null, 'Impossible de lire le rapport d\'alternance');
      return;
    }

    if (docPassword) {
      item.docPassword = docPassword;
    }

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
        ${item.link?.url ? `<p class="muted">Lien : <a href="${item.link.url}" target="_blank" rel="noopener">${item.link.label || item.link.url}</a></p>` : ''}
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
      document.getElementById('timeline-link-label').value = item.link?.label || '';
      document.getElementById('timeline-link-url').value = item.link?.url || '';
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
      description: document.getElementById('timeline-description').value.trim(),
      link: {
        label: document.getElementById('timeline-link-label').value.trim(),
        url: document.getElementById('timeline-link-url').value.trim()
      }
    };

    if (!item.link.label && !item.link.url) {
      delete item.link;
    } else if (item.link.url && !item.link.label) {
      item.link.label = 'Voir le site';
    }
    
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


  /* ===== GESTION DES RECHERCHES ACTIVES ===== */

  function afficherListeActiveSearches() {
    const container = document.getElementById('active-search-list');
    if (!container) return;
    const recherches = mesDonneesActuelles.activeSearches || [];
    if (recherches.length === 0) {
      container.innerHTML = '<p class="muted">Aucune recherche active pour le moment.</p>';
      return;
    }
    container.innerHTML = recherches.map((item, index) => `
      <div class="item-card">
        <h4>${item.title || 'Recherche'}</h4>
        <p class="item-meta">${item.status === 'active' ? '🟢 Active' : '⏸️ Désactivée'}${item.location ? ' · ' + item.location : ''}${item.visible === false ? ' · Privée' : ''}</p>
        <p class="muted">${item.notes || ''}</p>
        ${item.link ? `<p class="muted">Lien : <a href="${item.link}" target="_blank" rel="noopener">${item.link}</a></p>` : ''}
        <div class="item-actions">
          <button class="btn-small" onclick="toggleActiveSearch(${index})">${item.status === 'active' ? 'Désactiver' : 'Activer'}</button>
          <button class="btn-small" onclick="editActiveSearch(${index})">Modifier</button>
          <button class="btn-small btn-secondary" onclick="deleteActiveSearch(${index})">Supprimer</button>
        </div>
      </div>
    `).join('');
  }

  window.showActiveSearchForm = function(editIndex = null) {
    const modal = document.getElementById('active-search-form-modal');
    const form = document.getElementById('active-search-form');
    const title = document.getElementById('active-search-form-title');
    if (!modal || !form) return;
    currentEditingId = editIndex;
    if (title) {
      title.textContent = editIndex !== null ? 'Modifier une recherche active' : 'Ajouter une recherche active';
    }
    if (editIndex !== null) {
      const item = mesDonneesActuelles.activeSearches[editIndex] || {};
      document.getElementById('active-search-id').value = editIndex;
      document.getElementById('active-search-title').value = item.title || '';
      document.getElementById('active-search-status').value = item.status === 'paused' ? 'paused' : 'active';
      document.getElementById('active-search-location').value = item.location || '';
      document.getElementById('active-search-link').value = item.link || '';
      document.getElementById('active-search-notes').value = item.notes || '';
      document.getElementById('active-search-visible').checked = item.visible !== false;
    } else {
      form.reset();
      document.getElementById('active-search-id').value = '';
      document.getElementById('active-search-status').value = 'active';
      document.getElementById('active-search-visible').checked = true;
    }
    modal.style.display = 'block';
  };

  window.hideActiveSearchForm = function() {
    const modal = document.getElementById('active-search-form-modal');
    if (modal) modal.style.display = 'none';
    currentEditingId = null;
  };

  async function sauvegarderActiveSearch(e) {
    e.preventDefault();
    const item = {
      title: document.getElementById('active-search-title').value.trim(),
      status: document.getElementById('active-search-status').value === 'paused' ? 'paused' : 'active',
      location: document.getElementById('active-search-location').value.trim(),
      link: document.getElementById('active-search-link').value.trim(),
      notes: document.getElementById('active-search-notes').value.trim(),
      visible: document.getElementById('active-search-visible').checked
    };
    if (!item.title) {
      afficherErreur(null, 'Le titre est obligatoire');
      return;
    }
    const editIndex = currentEditingId;
    if (editIndex !== null) {
      mesDonneesActuelles.activeSearches[editIndex] = item;
    } else {
      mesDonneesActuelles.activeSearches.push(item);
    }
    await sauvegarderSurServeur();
    afficherListeActiveSearches();
    window.hideActiveSearchForm();
  }

  window.editActiveSearch = function(index) {
    window.showActiveSearchForm(index);
  };

  window.toggleActiveSearch = async function(index) {
    const item = mesDonneesActuelles.activeSearches[index];
    if (!item) return;
    item.status = item.status === 'active' ? 'paused' : 'active';
    await sauvegarderSurServeur();
    afficherListeActiveSearches();
  };

  window.deleteActiveSearch = function(index) {
    if (confirm('Supprimer cette recherche active ?')) {
      mesDonneesActuelles.activeSearches.splice(index, 1);
      sauvegarderSurServeur();
      afficherListeActiveSearches();
    }
  };
  
  
  /* ===== GESTION DES SERVICES ===== */

  function normaliserEmojiService(valeur) {
    const texte = (valeur || '').toString().trim();
    if (!texte) return '🛠️';

    const emojiMatch = texte.match(/(\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?)*)/u);
    if (emojiMatch && emojiMatch[1]) return emojiMatch[1];

    const flagMatch = texte.match(/([\u{1F1E6}-\u{1F1FF}]{2})/u);
    if (flagMatch && flagMatch[1]) return flagMatch[1];

    return '🛠️';
  }

  function normaliserStatutService(valeur) {
    const brut = (valeur || '').toString().trim().toLowerCase();
    if (!brut) return 'propose';

    if (brut === 'livre' || brut === 'livré' || brut.includes('livr')) {
      return 'livre';
    }

    if (brut === 'en-cours' || brut === 'encours' || brut.includes('cours')) {
      return 'en-cours';
    }

    return 'propose';
  }

  function libelleStatutService(statut) {
    const s = normaliserStatutService(statut);
    if (s === 'livre') return 'Service livré';
    if (s === 'en-cours') return 'Service en cours';
    return 'Services que je propose';
  }

  function assurerSelectStatutService() {
    if (document.getElementById('service-status')) return;

    const serviceTitleInput = document.getElementById('service-title');
    if (!serviceTitleInput) return;

    const formRow = serviceTitleInput.closest('.form-row');
    if (!formRow) return;

    const statutGroup = document.createElement('div');
    statutGroup.className = 'form-group';
    statutGroup.innerHTML = `
      <label for="service-status">Type de service *</label>
      <select id="service-status" required>
        <option value="propose">Services que je propose</option>
        <option value="livre">Service livré</option>
        <option value="en-cours">Service en cours</option>
      </select>
    `;

    formRow.appendChild(statutGroup);
  }

  function assurerSelectEmojiService() {
    const serviceIconInput = document.getElementById('service-icon');
    if (!serviceIconInput) return;

    // Si le select existe déjà (HTML à jour), rien à faire
    if (document.getElementById('service-emoji-selector')) return;

    const wrapper = serviceIconInput.parentElement;
    if (!wrapper) return;

    wrapper.style.display = 'flex';
    wrapper.style.gap = '8px';
    wrapper.style.alignItems = 'center';
    wrapper.style.flexWrap = 'wrap';

    serviceIconInput.style.flex = '1';
    serviceIconInput.style.minWidth = '100px';

    const selector = document.createElement('select');
    selector.id = 'service-emoji-selector';
    selector.style.cssText = 'padding: 8px 12px; border: 2px solid var(--line); border-radius: 8px; background: var(--bg); color: var(--text); cursor: pointer; font-size: 16px;';
    selector.innerHTML = `
      <option value="">Choisir un emoji...</option>
      <option value="💻">💻 Développement web</option>
      <option value="📱">📱 Mobile</option>
      <option value="🖥️">🖥️ Desktop</option>
      <option value="🌐">🌐 Internet</option>
      <option value="🔧">🔧 Outils</option>
      <option value="🧰">🧰 Toolbox</option>
      <option value="🛠️">🛠️ Développement</option>
      <option value="⚙️">⚙️ Configuration</option>
      <option value="🔩">🔩 Technique</option>
      <option value="🧪">🧪 Tests</option>
      <option value="🔬">🔬 Recherche</option>
      <option value="📡">📡 Réseau</option>
      <option value="🔌">🔌 API</option>
      <option value="🗄️">🗄️ Base de données</option>
      <option value="💾">💾 Stockage</option>
      <option value="📦">📦 Packaging</option>
      <option value="🔄">🔄 Intégration</option>
      <option value="🚀">🚀 Performance</option>
      <option value="⚡">⚡ Vitesse</option>
      <option value="☁️">☁️ Cloud</option>
      <option value="🔐">🔐 Sécurité</option>
      <option value="🔒">🔒 Protection</option>
      <option value="🤖">🤖 IA</option>
      <option value="🧠">🧠 Machine Learning</option>
      <option value="📊">📊 Data</option>
      <option value="📈">📈 Analytics</option>
      <option value="📉">📉 Reporting</option>
      <option value="🔍">🔍 Audit</option>
      <option value="💡">💡 Conseil</option>
      <option value="🎯">🎯 Stratégie</option>
      <option value="📝">📝 Rédaction</option>
      <option value="📚">📚 Formation</option>
      <option value="🎓">🎓 Accompagnement</option>
      <option value="🎨">🎨 Design</option>
      <option value="🖼️">🖼️ UI</option>
      <option value="🎬">🎬 Vidéo</option>
      <option value="🎵">🎵 Audio</option>
      <option value="🛒">🛒 E-commerce</option>
      <option value="🏗️">🏗️ Architecture</option>
      <option value="🧱">🧱 Structure</option>
      <option value="📁">📁 Gestion de projet</option>
      <option value="📋">📋 Planification</option>
      <option value="🤝">🤝 Collaboration</option>
      <option value="🌍">🌍 International</option>
      <option value="📞">📞 Support</option>
      <option value="✅">✅ Qualité</option>
      <option value="⭐">⭐ Premium</option>
      <option value="💎">💎 Haut de gamme</option>
      <option value="🎁">🎁 Offre</option>
      <option value="🔮">🔮 Innovation</option>
    `;
    selector.addEventListener('change', function() {
      if (this.value) {
        serviceIconInput.value = this.value;
        this.value = '';
      }
    });

    wrapper.appendChild(selector);
  }
  
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
        <h4>${normaliserEmojiService(service.icon)} ${service.title || 'Service'}</h4>
        ${(service.photo || service.image) ? '<p class="muted" style="margin: 4px 0;">📷 Photo configurée</p>' : ''}
        <p class="muted" style="margin: 6px 0 8px;">${libelleStatutService(service.status)}</p>
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
    assurerSelectEmojiService();
    assurerSelectStatutService();

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
      const photoActuelle = service.photo || service.image || '';
      document.getElementById('service-id').value = editIndex;
      document.getElementById('service-icon').value = normaliserEmojiService(service.icon);
      document.getElementById('service-title').value = service.title || '';
      const servicePhotoUrlInput = document.getElementById('service-photo-url');
      if (servicePhotoUrlInput) {
        servicePhotoUrlInput.value = photoActuelle && !photoActuelle.startsWith('data:') ? photoActuelle : '';
      }
      const servicePhotoPreview = document.getElementById('service-photo-preview');
      if (servicePhotoPreview) {
        servicePhotoPreview.innerHTML = photoActuelle
          ? `<img src="${photoActuelle}" alt="Visuel service" style="width: 180px; height: 110px; object-fit: cover; border-radius: 8px; display: block;" />`
          : '';
      }
      const servicePhotoFileInput = document.getElementById('service-photo-file');
      if (servicePhotoFileInput) {
        servicePhotoFileInput.value = '';
      }
      const serviceStatusInput = document.getElementById('service-status');
      if (serviceStatusInput) {
        serviceStatusInput.value = normaliserStatutService(service.status);
      }
      document.getElementById('service-description').value = service.description || '';
      document.getElementById('service-features').value = (service.features || []).join('\n');
    } else {
      form.reset();
      document.getElementById('service-id').value = '';
      const servicePhotoPreview = document.getElementById('service-photo-preview');
      if (servicePhotoPreview) {
        servicePhotoPreview.innerHTML = '';
      }
      const serviceStatusInput = document.getElementById('service-status');
      if (serviceStatusInput) {
        serviceStatusInput.value = 'propose';
      }
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

    const photoUrlInput = document.getElementById('service-photo-url');
    const photoFileInput = document.getElementById('service-photo-file');
    const photoPreview = document.getElementById('service-photo-preview');

    const editIndex = currentEditingId;
    const ancien = editIndex !== null ? mesDonneesActuelles.services[editIndex] || {} : {};
    const anciennePhoto = ancien.photo || ancien.image || '';
    
    const service = {
      icon: normaliserEmojiService(document.getElementById('service-icon').value),
      title: document.getElementById('service-title').value.trim(),
      status: normaliserStatutService(document.getElementById('service-status')?.value || 'propose'),
      description: document.getElementById('service-description').value.trim(),
      features: document.getElementById('service-features').value.split('\n').filter(f => f.trim())
    };

    try {
      const nouvellePhotoBase64 = await lireImageBase64(photoFileInput);
      const photoUrl = photoUrlInput?.value.trim();

      if (nouvellePhotoBase64) {
        service.photo = nouvellePhotoBase64;
        service.image = nouvellePhotoBase64;
        if (photoPreview) {
          photoPreview.innerHTML = `<img src="${nouvellePhotoBase64}" alt="Visuel service" style="width: 180px; height: 110px; object-fit: cover; border-radius: 8px; display: block;" />`;
        }
      } else if (photoUrl) {
        service.photo = photoUrl;
        service.image = photoUrl;
        if (photoPreview) {
          photoPreview.innerHTML = `<img src="${photoUrl}" alt="Visuel service" style="width: 180px; height: 110px; object-fit: cover; border-radius: 8px; display: block;" />`;
        }
      } else {
        service.photo = anciennePhoto;
        service.image = anciennePhoto;
      }
    } catch (err) {
      if (err.message === 'IMAGE_TOO_LARGE') {
        afficherErreur(null, 'Image trop volumineuse (max 5 Mo)');
        return;
      }
      afficherErreur(null, 'Impossible de lire l\'image du service');
      return;
    }
    
    if (!service.title || !service.description) {
      afficherErreur(null, 'Le titre et la description sont obligatoires');
      return;
    }
    
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
  
  
  /* ===== GESTION DES MESSAGES DE CONTACT ===== */
  
  // Affiche la liste des messages de contact
  function afficherListeMessages() {
    const container = document.getElementById('messages-list');
    if (!container) return;
    
    const messages = mesDonneesActuelles.contactMessages || [];
    
    if (messages.length === 0) {
      container.innerHTML = '<p class="muted">Aucun message reçu pour le moment.</p>';
      return;
    }
    
    // Trier les messages par date (plus récents en premier)
    const messagesTries = [...messages].sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateB - dateA;
    });
    
    container.innerHTML = messagesTries.map((msg, index) => {
      const date = msg.date ? new Date(msg.date).toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Date inconnue';
      
      const isRead = msg.read ? 'read' : 'unread';
      const readBadge = msg.read ? '<span style="color: var(--muted); font-size: 0.85rem;">✓ Lu</span>' : '<span style="color: var(--accent); font-size: 0.85rem; font-weight: bold;">● Non lu</span>';
      
      return `
        <div class="item-card" style="border-left: 4px solid ${msg.read ? 'var(--muted)' : 'var(--accent)'};">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
            <div>
              <h4 style="margin: 0 0 4px;">${msg.name || 'Anonyme'}</h4>
              <p style="margin: 0; color: var(--accent); font-size: 0.9rem;">${msg.email || ''}</p>
            </div>
            <div style="text-align: right;">
              ${readBadge}
              <p style="margin: 4px 0 0; color: var(--muted); font-size: 0.85rem;">${date}</p>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: var(--text);">Sujet:</strong> ${msg.subject || 'Sans objet'}
          </div>
          <div style="background: var(--bg); padding: 12px; border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--line);">
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${msg.message || ''}</p>
          </div>
          <div class="item-actions">
            <a href="mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Votre message')}" class="btn-small" style="text-decoration: none;">📧 Répondre</a>
            <button class="btn-small ${msg.read ? 'btn-secondary' : ''}" onclick="toggleMessageRead(${msg.id})">
              ${msg.read ? 'Marquer non lu' : 'Marquer lu'}
            </button>
            <button class="btn-small btn-secondary" onclick="deleteMessage(${msg.id})">🗑️ Supprimer</button>
          </div>
        </div>
      `;
    }).join('');
  }
  
  // Marque un message comme lu/non lu
  window.toggleMessageRead = async function(messageId) {
    const messages = mesDonneesActuelles.contactMessages || [];
    const message = messages.find(m => m.id === messageId);
    if (message) {
      message.read = !message.read;
      await sauvegarderSurServeur();
      afficherListeMessages();
      afficherSucces(`Message ${message.read ? 'marqué comme lu' : 'marqué comme non lu'}`);
    }
  };
  
  // Supprime un message
  window.deleteMessage = async function(messageId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      const messages = mesDonneesActuelles.contactMessages || [];
      const index = messages.findIndex(m => m.id === messageId);
      if (index !== -1) {
        messages.splice(index, 1);
        await sauvegarderSurServeur();
        afficherListeMessages();
        afficherSucces('Message supprimé');
      }
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
    const cvDisponible = !!links.cvFile || !!links.cv;
    
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
    if (cvDisponible && previewSection) {
      previewSection.style.display = 'block';
      const fileName = document.getElementById('cv-file-name');
      const fileSize = document.getElementById('cv-file-size');
      const previewLink = document.getElementById('cv-preview-link');
      
      if (fileName) fileName.textContent = links.cvFileName || 'CV.pdf';
      if (fileSize && links.cvFileSize) {
        fileSize.textContent = `Taille: ${(links.cvFileSize / 1024).toFixed(2)} KB`;
      }
      if (previewLink) {
        previewLink.href = links.cvFile || links.cv;
        previewLink.removeAttribute('download');
        previewLink.onclick = ouvrirApercuCV;
      }
    } else if (previewSection) {
      previewSection.style.display = 'none';
    }
    
    afficherLiensSociaux();
  }

  // Ouvre la prévisualisation du CV de manière fiable (base64 ou URL)
  function ouvrirApercuCV(e) {
    if (e) e.preventDefault();

    const links = mesDonneesActuelles?.links || {};
    const previewLink = document.getElementById('cv-preview-link');
    const sourceCv = links.cvFile || links.cv || previewLink?.getAttribute('href');

    if (!sourceCv || sourceCv === '#') {
      afficherErreur(null, 'Aucun CV disponible pour la prévisualisation.');
      return false;
    }

    try {
      if (typeof sourceCv === 'string' && sourceCv.startsWith('data:application/pdf')) {
        const virguleIndex = sourceCv.indexOf(',');
        const base64Data = virguleIndex !== -1 ? sourceCv.substring(virguleIndex + 1) : '';

        if (!base64Data) {
          window.open(sourceCv, '_blank', 'noopener,noreferrer');
          return false;
        }

        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        return false;
      }

      window.open(sourceCv, '_blank', 'noopener,noreferrer');
      return false;
    } catch (err) {
      logError('❌ Erreur prévisualisation CV:', err);
      afficherErreur(null, 'Impossible de prévisualiser le CV.');
      return false;
    }
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
        cvBase64Dirty = true;
      }
      // SUPPRIMER L'ANCIEN CV BASE64 DANS cv : Si cv était en base64, le remplacer par le chemin
      if (mesDonneesActuelles.links.cv && mesDonneesActuelles.links.cv.startsWith('data:')) {
        log('🗑️ Suppression de l\'ancien CV base64 dans cv (remplacement par chemin)');
      }
      // Mettre le nouveau chemin
      mesDonneesActuelles.links.cv = cvPath;
      cvBase64Dirty = true;
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
    
    // Afficher le statut Google Analytics
    if (statVisitors) {
      const hasAnalytics = normaliserGoogleAnalyticsId(mesDonneesActuelles.settings?.analytics?.googleAnalytics || '');
      if (hasAnalytics) {
        // Google Analytics est configuré - afficher un indicateur actif
        statVisitors.innerHTML = '<span style="color: var(--success);">✓</span> Actif';
        statVisitors.title = `Google Analytics configuré (ID: ${hasAnalytics}). Voir les données sur analytics.google.com`;
      } else {
        // Google Analytics non configuré
        statVisitors.textContent = 'Non configuré';
        statVisitors.style.color = 'var(--muted)';
        statVisitors.title = 'Configurez Google Analytics dans l\'onglet Paramètres > Analytics';
      }
    }
    
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
          activeSearches: [],
          certifications: [],
          stages: [],
          alternances: [],
          techEvents: [],
          testimonials: [],
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
        cvBase64Dirty = true;
      } else if (mesDonneesActuelles.links.cv === 'assets/CV.pdf') {
        // Supprimer aussi le chemin par défaut
        delete mesDonneesActuelles.links.cv;
        log('🗑️ Chemin CV par défaut supprimé');
        cvBase64Dirty = true;
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
      // Récupérer le message de maintenance
      const maintenanceMessageInput = document.getElementById('maintenance-message');
      const maintenanceMessage = maintenanceMessageInput?.value?.trim() || '';
      
      // Si le message est vide, utiliser le message par défaut
      const finalMessage = maintenanceMessage || 'Le site est actuellement en maintenance. Nous serons bientôt de retour !';
      
      const googleAnalyticsBrut = document.getElementById('google-analytics')?.value || '';
      const googleAnalyticsId = normaliserGoogleAnalyticsId(googleAnalyticsBrut);

      if (googleAnalyticsId && !/^G-[A-Z0-9]+$/i.test(googleAnalyticsId)) {
        afficherErreur(null, 'ID Google Analytics invalide. Format attendu: G-XXXXXXXXXX');
        return;
      }

      const settings = {
        maintenance: {
          enabled: document.getElementById('maintenance-mode')?.checked || false,
          message: finalMessage
        },
        seo: {
          title: document.getElementById('meta-title')?.value || '',
          description: document.getElementById('meta-description')?.value || '',
          keywords: document.getElementById('meta-keywords')?.value || ''
        },
        analytics: {
          googleAnalytics: googleAnalyticsId
        }
      };
      
      // Sauvegarder dans les données actuelles
      mesDonneesActuelles.settings = settings;
      
      // Log pour debug
      log('💾 Settings à sauvegarder:', {
        maintenance: settings.maintenance,
        enabled: settings.maintenance.enabled,
        message: settings.maintenance.message
      });
      
      // Sauvegarder dans localStorage sans perdre les autres sections (projets, services, etc.)
      const oldValue = localStorage.getItem('portfolioData');
      const currentData = {
        ...mesDonneesActuelles,
        settings
      };
      localStorage.setItem('portfolioData', JSON.stringify(currentData));
      
      // S'assurer que mesDonneesActuelles contient bien les settings avant la sauvegarde
      if (!mesDonneesActuelles.settings) {
        mesDonneesActuelles.settings = settings;
      }
      
      log('💾 mesDonneesActuelles avant sauvegarde:', {
        hasSettings: !!mesDonneesActuelles.settings,
        maintenanceEnabled: mesDonneesActuelles.settings?.maintenance?.enabled
      });
      
      // Déclencher manuellement l'événement storage pour les autres onglets
      // (l'événement storage ne se déclenche que pour les autres onglets, pas pour celui qui fait le changement)
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'portfolioData',
        newValue: JSON.stringify(currentData),
        oldValue
      }));
      
      // Sauvegarder sur le serveur
      const success = await sauvegarderSurServeur();
      
      if (success) {
        log('✅ Settings sauvegardés sur le serveur avec succès');
      } else {
        logError('❌ Erreur lors de la sauvegarde des settings sur le serveur');
      }
      
      // Forcer la mise à jour du mode maintenance sur toutes les pages
      if (window.portfolioAPI && window.portfolioAPI.actualiser) {
        setTimeout(() => {
          window.portfolioAPI.actualiser();
        }, 500);
      }
      
      // Déclencher la vérification sur cette page aussi (pour les autres onglets, l'événement storage le fera)
      // Essayer d'appeler la fonction si elle est disponible (depuis portfolio.js)
      if (typeof window.verifierModeMaintenance === 'function') {
        window.verifierModeMaintenance(currentData);
      }
      
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
    
    // Log pour debug
    if (estEnDeveloppement) {
      log('🔍 Chargement des paramètres:', {
        hasSettings: !!mesDonneesActuelles.settings,
        hasAnalytics: !!settings.analytics,
        googleAnalytics: settings.analytics?.googleAnalytics || '(vide)'
      });
    }
    
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
    
    // Charger l'ID Google Analytics
    const googleAnalyticsInput = document.getElementById('google-analytics');
    if (googleAnalyticsInput) {
      // Récupérer l'ID depuis settings.analytics.googleAnalytics
      const gaId = (settings.analytics && settings.analytics.googleAnalytics) 
        ? normaliserGoogleAnalyticsId(settings.analytics.googleAnalytics) 
        : '';
      
      googleAnalyticsInput.value = gaId;
      
      if (estEnDeveloppement) {
        log('📊 Google Analytics ID chargé:', {
          found: !!googleAnalyticsInput,
          value: gaId || '(vide)',
          hasSettings: !!settings,
          hasAnalytics: !!settings.analytics,
          fullSettings: settings
        });
      }
    } else {
      if (estEnDeveloppement) {
        logError('❌ Champ google-analytics introuvable dans le DOM');
        logError('💡 Vérifiez que l\'onglet Paramètres est chargé et que le champ existe dans admin.html');
      }
      
      // Essayer de trouver le champ après un court délai (au cas où l'onglet n'est pas encore chargé)
      setTimeout(() => {
        const retryInput = document.getElementById('google-analytics');
        if (retryInput && settings.analytics) {
          retryInput.value = normaliserGoogleAnalyticsId(settings.analytics.googleAnalytics || '');
          if (estEnDeveloppement) {
            log('✅ Google Analytics ID chargé après délai');
          }
        }
      }, 500);
    }
  }
  
  window.toggleMaintenanceModeDisplay = function() {
    const group = document.getElementById('maintenance-message-group');
    const checkbox = document.getElementById('maintenance-mode');
    if (group && checkbox) {
      group.style.display = checkbox.checked ? 'block' : 'none';
    }
  };
  
  /* ===== GESTION DES TÉMOIGNAGES ===== */

  function afficherListeTestimonials() {
    const container = document.getElementById('testimonials-list');
    if (!container) return;

    const items = mesDonneesActuelles.testimonials || [];

    if (items.length === 0) {
      container.innerHTML = '<p class="muted">Aucun témoignage pour le moment.</p>';
      return;
    }

    container.innerHTML = items.map((item, index) => {
      const stars = item.rating ? '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating) : '';
      return `
        <div class="item-card">
          <h4>${item.author || 'Auteur inconnu'}</h4>
          <p class="item-meta">${item.role || ''} ${stars ? '· ' + stars : ''}</p>
          <p class="muted">${item.text || ''}</p>
          ${item.photo ? `<div class="muted">Photo: <a href="${item.photo}" target="_blank" rel="noopener">voir</a></div>` : ''}
          <div class="item-actions">
            <button class="btn-small" onclick="editTestimonial(${index})">Modifier</button>
            <button class="btn-small btn-secondary" onclick="deleteTestimonial(${index})">Supprimer</button>
          </div>
        </div>
      `;
    }).join('');
  }

  async function lireFichierImageBase64(input) {
    return new Promise((resolve, reject) => {
      const file = input?.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Lecture du fichier image échouée'));
      reader.readAsDataURL(file);
    });
  }

  window.showTestimonialForm = function(editIndex = null) {
    const modal = document.getElementById('testimonial-form-modal');
    const form = document.getElementById('testimonial-form');
    const title = document.getElementById('testimonial-form-title');
    const preview = document.getElementById('testimonial-photo-preview');

    if (!modal || !form) return;

    currentEditingId = editIndex;

    if (title) {
      title.textContent = editIndex !== null ? 'Modifier un témoignage' : 'Ajouter un témoignage';
    }

    if (editIndex !== null) {
      const item = mesDonneesActuelles.testimonials?.[editIndex] || {};
      document.getElementById('testimonial-id').value = editIndex;
      document.getElementById('testimonial-text').value = item.text || '';
      document.getElementById('testimonial-author').value = item.author || '';
      document.getElementById('testimonial-role').value = item.role || '';
      document.getElementById('testimonial-rating').value = item.rating || 5;
      document.getElementById('testimonial-photo-url').value = item.photo || '';
      if (preview) {
        preview.innerHTML = item.photo ? `<img src="${item.photo}" alt="Preview" style="max-width:120px;border-radius:8px;" />` : '';
      }
    } else {
      form.reset();
      document.getElementById('testimonial-id').value = '';
      if (preview) preview.innerHTML = '';
    }

    modal.style.display = 'block';
  };
  
  window.hideTestimonialForm = function() {
    const modal = document.getElementById('testimonial-form-modal');
    const preview = document.getElementById('testimonial-photo-preview');
    if (modal) modal.style.display = 'none';
    if (preview) preview.innerHTML = '';
    currentEditingId = null;
  };

  async function sauvegarderTestimonial(e) {
    e.preventDefault();

    const text = document.getElementById('testimonial-text').value.trim();
    const author = document.getElementById('testimonial-author').value.trim();
    const role = document.getElementById('testimonial-role').value.trim();
    const rating = Math.min(5, Math.max(1, parseInt(document.getElementById('testimonial-rating').value || '5', 10)));
    const photoUrl = document.getElementById('testimonial-photo-url').value.trim();
    const photoFileInput = document.getElementById('testimonial-photo-file');

    if (!text || !author) {
      afficherErreur(null, 'Le texte et l\'auteur sont obligatoires');
      return;
    }

    let photo = photoUrl || '';
    try {
      const base64 = await lireFichierImageBase64(photoFileInput);
      if (base64) photo = base64;
    } catch (err) {
      logError('Erreur lecture image témoignage:', err);
      afficherErreur(null, 'Impossible de lire l\'image du témoignage');
      return;
    }

    const item = { text, author, role, rating, photo };
    const editIndex = currentEditingId;
    if (editIndex !== null) {
      mesDonneesActuelles.testimonials[editIndex] = item;
    } else {
      if (!mesDonneesActuelles.testimonials) mesDonneesActuelles.testimonials = [];
      mesDonneesActuelles.testimonials.push(item);
    }

    await sauvegarderSurServeur();
    afficherListeTestimonials();
    window.hideTestimonialForm();
    afficherSucces('Témoignage enregistré');
  }

  window.editTestimonial = function(index) {
    window.showTestimonialForm(index);
  };

  window.deleteTestimonial = function(index) {
    if (confirm('Supprimer ce témoignage ?')) {
      mesDonneesActuelles.testimonials.splice(index, 1);
      sauvegarderSurServeur();
      afficherListeTestimonials();
    }
  };
  
  
  /* ===== INTERFACE ET ÉVÉNEMENTS ===== */
  
  // Affiche un message de succès
  function afficherSucces(message) {
    const toast = document.getElementById('global-toast') || document.getElementById('success-message');
    if (toast) {
      toast.classList.remove('error');
      toast.textContent = message;
      toast.style.display = 'block';
      toast.classList.add('active');
      setTimeout(() => toast.classList.remove('active'), 5000);
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
      const globalToast = document.getElementById('global-toast') || document.getElementById('success-message');
      if (globalToast) {
        globalToast.style.display = 'block';
        globalToast.classList.add('error');
        globalToast.textContent = message;
        globalToast.classList.add('active');
        setTimeout(() => globalToast.classList.remove('active'), 6000);
      } else {
        const errorMsg = document.getElementById('login-error');
        if (errorMsg) {
          errorMsg.textContent = message;
          errorMsg.classList.add('active');
        } else {
          alert(message);
        }
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
    if (projectForm) {
      projectForm.noValidate = true;
      projectForm.addEventListener('submit', sauvegarderProjet);
    }
    const projectDocInput = document.getElementById('project-doc-file');
    if (projectDocInput) projectDocInput.addEventListener('change', gererSelectionDocProjet);
    const projectDocRemoveBtn = document.getElementById('project-doc-remove-btn');
    if (projectDocRemoveBtn) projectDocRemoveBtn.addEventListener('click', removeProjectDoc);
    
    // Formulaire compétence
    const skillForm = document.getElementById('skill-category-form');
    if (skillForm) skillForm.addEventListener('submit', sauvegarderCompetence);
    
    // Formulaire certification
    const certForm = document.getElementById('certification-form');
    if (certForm) certForm.addEventListener('submit', sauvegarderCertification);
    const certPhotoUrlInput = document.getElementById('cert-photo-url');
    const certPhotoFileInput = document.getElementById('cert-photo-file');
    const certPhotoPreview = document.getElementById('cert-photo-preview');
    if (certPhotoUrlInput && certPhotoPreview) {
      certPhotoUrlInput.addEventListener('input', () => {
        const url = certPhotoUrlInput.value.trim();
        if (url) {
          certPhotoPreview.innerHTML = `<img src="${url}" alt="Visuel certification" style="max-width:100%; height:auto; border-radius: 8px;" />`;
        }
      });
    }
    if (certPhotoFileInput && certPhotoPreview) {
      certPhotoFileInput.addEventListener('change', async () => {
        try {
          const base64 = await lireImageBase64(certPhotoFileInput);
          if (base64) {
            certPhotoPreview.innerHTML = `<img src="${base64}" alt="Visuel certification" style="max-width:100%; height:auto; border-radius: 8px;" />`;
          }
        } catch (err) {
          if (err.message === 'IMAGE_TOO_LARGE') {
            afficherErreur(null, 'Image trop volumineuse (max 5 Mo)');
            return;
          }
          afficherErreur(null, 'Impossible de lire l\'image de la certification');
        }
      });
    }
    
    // Formulaire timeline
    const timelineForm = document.getElementById('timeline-form');
    if (timelineForm) timelineForm.addEventListener('submit', sauvegarderTimeline);

    const activeSearchForm = document.getElementById('active-search-form');
    if (activeSearchForm) activeSearchForm.addEventListener('submit', sauvegarderActiveSearch);
    
    // Formulaire service
    const serviceForm = document.getElementById('service-form');
    if (serviceForm) serviceForm.addEventListener('submit', sauvegarderService);
    const servicePhotoUrlInput = document.getElementById('service-photo-url');
    const servicePhotoFileInput = document.getElementById('service-photo-file');
    const servicePhotoPreview = document.getElementById('service-photo-preview');

    if (servicePhotoUrlInput && servicePhotoPreview) {
      servicePhotoUrlInput.addEventListener('input', () => {
        const url = servicePhotoUrlInput.value.trim();
        if (url) {
          servicePhotoPreview.innerHTML = `<img src="${url}" alt="Visuel service" style="width: 180px; height: 110px; object-fit: cover; border-radius: 8px; display: block;" />`;
        }
      });
    }

    if (servicePhotoFileInput && servicePhotoPreview) {
      servicePhotoFileInput.addEventListener('change', async () => {
        try {
          const base64 = await lireImageBase64(servicePhotoFileInput);
          if (base64) {
            servicePhotoPreview.innerHTML = `<img src="${base64}" alt="Visuel service" style="width: 180px; height: 110px; object-fit: cover; border-radius: 8px; display: block;" />`;
          }
        } catch (err) {
          if (err.message === 'IMAGE_TOO_LARGE') {
            afficherErreur(null, 'Image trop volumineuse (max 5 Mo)');
            return;
          }
          afficherErreur(null, 'Impossible de lire l\'image du service');
        }
      });
    }
    
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
    const stageReportInput = document.getElementById('stage-report-file');
    if (stageReportInput) {
      stageReportInput.addEventListener('change', () => {
        const info = document.getElementById('stage-report-info');
        const file = stageReportInput.files?.[0];
        if (info) info.textContent = file ? `Rapport sélectionné: ${file.name}` : 'Aucun rapport chargé';
      });
    }
    
    // Formulaire alternance
    const alternanceForm = document.getElementById('alternance-form');
    if (alternanceForm) alternanceForm.addEventListener('submit', sauvegarderAlternance);
    
    // Formulaire événement technologique
    const techEventForm = document.getElementById('tech-event-form');
    if (techEventForm) techEventForm.addEventListener('submit', sauvegarderTechEvent);

    // Formulaire témoignage
    const testimonialForm = document.getElementById('testimonial-form');
    if (testimonialForm) testimonialForm.addEventListener('submit', sauvegarderTestimonial);
    
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
            cvBase64Dirty = true;
            
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
              previewLink.removeAttribute('download');
              previewLink.onclick = ouvrirApercuCV;
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    const cvPreviewLink = document.getElementById('cv-preview-link');
    if (cvPreviewLink) {
      cvPreviewLink.onclick = ouvrirApercuCV;
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
