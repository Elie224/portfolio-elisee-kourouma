document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Initialize default data if localStorage is empty (for first-time visitors on Render)
  function initDefaultData() {
    try {
      const existingData = localStorage.getItem('portfolioData');
      if (!existingData) {
        console.log('📦 Initialisation des données par défaut (première visite)...');
        
        // Import DEFAULT_DATA structure from admin.js logic
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
              shortDesc: 'Plateforme de stockage cloud avec 20 Go d\'espace · Application web et mobile complète',
              description: 'Fylor est une plateforme de stockage cloud développée comme projet personnel, similaire à Supfile. Cette application permet aux utilisateurs de stocker, sécuriser et partager leurs fichiers personnels dans le cloud, avec un quota de 20 Go par utilisateur (contrairement à Supfile qui offre 30 Go).\n\nLe projet comprend le développement d\'une application web complète et d\'une application mobile, avec une architecture basée sur une API REST, des clients distincts et une base de données pour les métadonnées. L\'application offre les mêmes fonctionnalités avancées que Supfile, avec un espace de stockage de 20 Go.\n\nL\'accent est mis sur la gestion performante des flux de données (upload/download), la navigation fluide dans une arborescence de dossiers, l\'ergonomie, la prévisualisation instantanée des fichiers et la synchronisation entre les clients web et mobile.',
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
                'Quota généreux de 20 Go par utilisateur',
                'Sécurité : JWT, hachage des mots de passe, gestion des secrets'
              ],
              tags: ['Web', 'Mobile', 'Application Web', 'Cloud Storage', 'API REST', 'Docker', 'OAuth2', 'JWT', '20 Go', 'Stockage Cloud', 'Déploiement'],
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
            cvFile: null,
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
            }
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
        
        localStorage.setItem('portfolioData', JSON.stringify(DEFAULT_DATA));
        console.log('✅ Données par défaut initialisées avec succès !');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des données par défaut:', error);
      return false;
    }
  }

  // Initialize default data on page load (for first-time visitors)
  initDefaultData();

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
      // Only set overflow hidden on mobile
      if (window.innerWidth <= 768) {
        document.body.style.overflow = isOpen ? '' : 'hidden';
    } else {
        document.body.style.overflow = '';
      }
    }

    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    if (mobileMenuOverlay) {
      mobileMenuOverlay.addEventListener('click', toggleMobileMenu);
    }

    // Close menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          setTimeout(() => {
            navLinks.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
          }, 300);
        }
      });
    });

    // Close menu on window resize if desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        navLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Safety: Reset on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && window.innerWidth > 768) {
        document.body.style.overflow = '';
      }
    });
  }

  // Force dark theme - no toggle needed
  document.body.classList.add('dark');
  localStorage.setItem('theme', 'dark');

  // Scroll reveal animations - Ensure content is visible
  const revealTargets = document.querySelectorAll('[data-animate]');
  
  // Make sure all elements are visible first (safety)
  revealTargets.forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
  
  // Then add animation if IntersectionObserver is available
  if ('IntersectionObserver' in window && revealTargets.length > 0) {
    try {
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => { 
          if (e.isIntersecting) { 
            e.target.classList.add('in'); 
            io.unobserve(e.target); 
          } 
        });
    }, { rootMargin: '0px 0px -10% 0px' });
      
    revealTargets.forEach((el, i) => {
        // Reset opacity for animation to work
        el.style.opacity = '';
        el.style.transform = '';
      const customDelay = el.getAttribute('data-animate-delay');
      const delay = customDelay ? customDelay : `${Math.min(i * 60, 360)}ms`;
      el.style.transitionDelay = delay;
      io.observe(el);
    });
    } catch (error) {
      console.error('Animation error:', error);
      // On error, ensure all content is visible
      revealTargets.forEach(el => {
        el.classList.add('in');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  } else {
    // Fallback: add 'in' class immediately if no IntersectionObserver
    revealTargets.forEach(el => {
      el.classList.add('in');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ==================== ANIMATIONS CRÉATIVES ====================
  
  // 1. Animation de typing pour le titre principal
  function animateTyping(element, text, speed = 100) {
    if (!element || !text) return;
    
    element.textContent = '';
    element.style.borderRight = '2px solid var(--accent)';
    element.style.animation = 'blink 1s infinite';
    
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          element.style.borderRight = 'none';
        }, 500);
      }
    }, speed);
  }

  // Appliquer l'animation de typing au titre hero s'il existe
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle && !heroTitle.dataset.typed) {
    const originalText = heroTitle.textContent;
    if (originalText.length < 30) { // Seulement pour les titres courts
      heroTitle.dataset.typed = 'true';
      setTimeout(() => {
        animateTyping(heroTitle, originalText, 80);
      }, 300);
    }
  }

  // 2. Animation de parallax pour les sections
  function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length > 0 && window.innerWidth > 768) {
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(el => {
          const speed = parseFloat(el.dataset.parallax) || 0.5;
          const yPos = -(scrolled * speed);
          el.style.transform = `translateY(${yPos}px)`;
        });
      });
    }
  }
  initParallax();

  // 3. Animation de fade-in au scroll pour tous les éléments
  function initScrollFadeIn() {
    const fadeElements = document.querySelectorAll('.card, .skill-card, .project-card, .testimonial-card, .service-card, .cert-card, .timeline-item');
    
    if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
      const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
              entry.target.classList.add('fade-in');
            }, index * 50);
            fadeObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeObserver.observe(el);
      });
    }
  }
  initScrollFadeIn();

  // 4. Animation de hover pour les cartes
  function initCardHover() {
    const cards = document.querySelectorAll('.card, .project-card, .skill-card, .testimonial-card, .service-card, .cert-card');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.02)';
        this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        this.style.boxShadow = '0 10px 30px rgba(91, 124, 250, 0.2)';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
        this.style.boxShadow = '';
      });
    });
  }
  initCardHover();

  // 5. Animation de gradient pour les boutons
  function initButtonGradient() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(btn => {
      btn.addEventListener('mouseenter', function() {
        if (!this.style.background.includes('gradient')) {
          this.style.background = `linear-gradient(135deg, var(--accent), #7c93ff)`;
          this.style.backgroundSize = '200% 200%';
        }
      });
      
      btn.addEventListener('mouseleave', function() {
        if (!this.classList.contains('gradient-btn')) {
          this.style.background = '';
        }
      });
    });
  }
  initButtonGradient();

  // 6. Animation de progress bar pour le scroll
  function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--accent), #7c93ff);
      width: 0%;
      z-index: 1000;
      transition: width 0.1s ease;
      box-shadow: 0 2px 10px rgba(91, 124, 250, 0.5);
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.pageYOffset / windowHeight) * 100;
      progressBar.style.width = scrolled + '%';
    });
  }
  initScrollProgress();

  // 7. Animation de pulsation pour les éléments importants
  function initPulseAnimation() {
    const pulseElements = document.querySelectorAll('[data-pulse]');
    
    pulseElements.forEach(el => {
      el.style.animation = 'pulse 2s infinite';
      el.style.transition = 'all 0.3s ease';
    });
  }
  initPulseAnimation();

  // 8. Animation de chiffres qui montent (pour les stats)
  function animateNumber(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = Math.round(target);
        clearInterval(timer);
      } else {
        element.textContent = Math.round(current);
      }
    }, 16);
  }

  // 9. Animation de particules flottantes (optionnel, léger)
  function initFloatingParticles() {
    const hero = document.querySelector('.hero');
    if (!hero || window.innerWidth < 768) return;

    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'floating-particle';
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: var(--accent);
        border-radius: 50%;
        opacity: 0.3;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: floatParticle ${5 + Math.random() * 5}s infinite ease-in-out;
        animation-delay: ${Math.random() * 2}s;
        pointer-events: none;
        z-index: 0;
      `;
      hero.style.position = 'relative';
      hero.style.overflow = 'hidden';
      hero.appendChild(particle);
    }
  }
  initFloatingParticles();

  // 10. Animation de chargement au démarrage
  function initPageLoadAnimation() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    window.addEventListener('load', () => {
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 100);
    });
  }
  initPageLoadAnimation();

  // ==================== ANIMATIONS SUPPLÉMENTAIRES ====================

  // 11. Animation de texte qui apparaît lettre par lettre
  function initLetterReveal() {
    const letterRevealElements = document.querySelectorAll('[data-letter-reveal]');
    
    letterRevealElements.forEach(el => {
      const text = el.textContent;
      el.textContent = '';
      el.style.opacity = '1';
      
      text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.opacity = '0';
        span.style.animation = `fadeInUp 0.5s ease forwards`;
        span.style.animationDelay = `${index * 0.03}s`;
        el.appendChild(span);
      });
    });
  }
  initLetterReveal();

  // 12. Animation de rotation pour les icônes au hover
  function initIconRotation() {
    const icons = document.querySelectorAll('.service-icon, .skill-icon, .contact-icon, [data-icon-rotate]');
    
    icons.forEach(icon => {
      icon.addEventListener('mouseenter', function() {
        this.style.transform = 'rotate(360deg) scale(1.1)';
        this.style.transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      });
      
      icon.addEventListener('mouseleave', function() {
        this.style.transform = 'rotate(0deg) scale(1)';
      });
    });
  }
  initIconRotation();

  // 13. Animation de wave/ondulation pour les boutons
  function initWaveEffect() {
    const buttons = document.querySelectorAll('.btn, [data-wave]');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: scale(0);
          animation: rippleWave 0.6s ease-out;
          pointer-events: none;
        `;
        
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }
  initWaveEffect();

  // 14. Animation de flip pour les cartes
  function initCardFlip() {
    const flipCards = document.querySelectorAll('[data-flip]');
    
    flipCards.forEach(card => {
      card.addEventListener('click', function() {
        this.style.transform = this.style.transform.includes('rotateY') 
          ? 'rotateY(0deg)' 
          : 'rotateY(180deg)';
        this.style.transition = 'transform 0.6s ease';
      });
    });
  }
  initCardFlip();

  // 15. Animation de morphing pour les formes
  function initMorphingShapes() {
    const shapes = document.querySelectorAll('[data-morph]');
    
    shapes.forEach((shape, index) => {
      setInterval(() => {
        const radius = 50 + Math.random() * 30;
        shape.style.borderRadius = `${radius}% ${100 - radius}% ${radius}% ${100 - radius}%`;
        shape.style.transition = 'border-radius 3s ease';
      }, 3000 + index * 500);
    });
  }
  initMorphingShapes();

  // 16. Animation de shake/tremblement au hover
  function initShakeAnimation() {
    const shakeElements = document.querySelectorAll('[data-shake]');
    
    shakeElements.forEach(el => {
      el.addEventListener('mouseenter', function() {
        this.style.animation = 'shake 0.5s ease';
      });
      
      el.addEventListener('animationend', function() {
        this.style.animation = '';
      });
    });
  }
  initShakeAnimation();

  // 17. Animation de skeleton loading
  function initSkeletonLoading() {
    const skeletonElements = document.querySelectorAll('.skeleton');
    
    if (skeletonElements.length > 0) {
      skeletonElements.forEach(el => {
        setTimeout(() => {
          el.style.opacity = '0';
          el.style.transition = 'opacity 0.5s ease';
          setTimeout(() => el.remove(), 500);
        }, 1000 + Math.random() * 500);
      });
    }
  }
  initSkeletonLoading();

  // 18. Animation de particules au survol des boutons
  function initButtonParticles() {
    const buttons = document.querySelectorAll('.btn, button, a[href]');
    
    buttons.forEach(btn => {
      btn.addEventListener('mouseenter', function(e) {
        const rect = this.getBoundingClientRect();
        const particlesCount = 6;
        
        for (let i = 0; i < particlesCount; i++) {
          const particle = document.createElement('span');
          const angle = (Math.PI * 2 * i) / particlesCount;
          const velocity = 50 + Math.random() * 30;
          
          particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: var(--accent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
          `;
          
          document.body.appendChild(particle);
          
          const endX = Math.cos(angle) * velocity;
          const endY = Math.sin(angle) * velocity;
          
          particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${endX}px, ${endY}px) scale(0)`, opacity: 0 }
          ], {
            duration: 600,
            easing: 'cubic-bezier(0.5, 0, 0.5, 1)'
          }).onfinish = () => particle.remove();
        }
      });
    });
  }
  initButtonParticles();

  // 18b. Animation de glow au survol des cartes
  function initCardGlow() {
    const cards = document.querySelectorAll('.card, .project-card, .skill-card, .service-card');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 0 30px rgba(91, 124, 250, 0.4), 0 0 60px rgba(91, 124, 250, 0.2)';
        this.style.transition = 'box-shadow 0.3s ease';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.boxShadow = '';
      });
    });
  }
  initCardGlow();

  // 18c. Animation de scale au hover avec effet élastique
  function initElasticScale() {
    const scaleElements = document.querySelectorAll('[data-elastic], .btn, .card');
    
    scaleElements.forEach(el => {
      el.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
        this.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      });
      
      el.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
      });
    });
  }
  initElasticScale();

  // 19. Animation de texte qui scintille au hover
  function initTextShimmer() {
    const shimmerElements = document.querySelectorAll('[data-shimmer]');
    
    shimmerElements.forEach(el => {
      const text = el.textContent;
      el.innerHTML = '';
      
      text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.transition = 'all 0.3s ease';
        
        el.appendChild(span);
      });
      
      el.addEventListener('mouseenter', function() {
        this.querySelectorAll('span').forEach((span, i) => {
          setTimeout(() => {
            span.style.transform = 'translateY(-10px) rotate(5deg)';
            span.style.color = 'var(--accent)';
            span.style.textShadow = '0 0 10px var(--accent)';
            setTimeout(() => {
              span.style.transform = 'translateY(0) rotate(0deg)';
              span.style.color = '';
              span.style.textShadow = '';
            }, 300);
          }, i * 30);
        });
      });
    });
  }
  initTextShimmer();

  // 19b. Animation de glassmorphism au scroll
  function initGlassmorphism() {
    const glassElements = document.querySelectorAll('[data-glass]');
    
    if (glassElements.length > 0 && 'IntersectionObserver' in window) {
      const glassObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.backdropFilter = 'blur(10px) saturate(180%)';
            entry.target.style.backgroundColor = 'rgba(11, 15, 25, 0.7)';
            entry.target.style.transition = 'all 0.3s ease';
          }
        });
      }, { threshold: 0.1 });

      glassElements.forEach(el => {
        glassObserver.observe(el);
      });
    }
  }
  initGlassmorphism();

  // 20. Animation de stagger (décalage) pour les listes
  function initStaggerAnimation() {
    const staggerContainers = document.querySelectorAll('[data-stagger]');
    
    staggerContainers.forEach(container => {
      const children = Array.from(container.children);
      
      if ('IntersectionObserver' in window) {
        const staggerObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              children.forEach((child, index) => {
                setTimeout(() => {
                  child.style.opacity = '1';
                  child.style.transform = 'translateY(0)';
                }, index * 100);
              });
              staggerObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });

        children.forEach(child => {
          child.style.opacity = '0';
          child.style.transform = 'translateY(20px)';
          child.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });

        staggerObserver.observe(container);
      }
    });
  }
  initStaggerAnimation();

  // 21. Animation de gradient animé pour les titres
  function initAnimatedGradient() {
    const gradientElements = document.querySelectorAll('[data-gradient-animate]');
    
    gradientElements.forEach(el => {
      let position = 0;
      setInterval(() => {
        position = (position + 1) % 100;
        el.style.backgroundPosition = `${position}% 50%`;
      }, 50);
    });
  }
  initAnimatedGradient();

  // 22. Animation de bounce pour les notifications
  function initBounceNotification() {
    const notifications = document.querySelectorAll('.toast, [data-bounce]');
    
    notifications.forEach(notif => {
      notif.style.animation = 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    });
  }
  initBounceNotification();

  // 23. Animation de scroll reveal avec parallax
  function initAdvancedScrollReveal() {
    const revealElements = document.querySelectorAll('[data-scroll-reveal]');
    
    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const direction = entry.target.dataset.scrollReveal || 'bottom';
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translate(0, 0) scale(1)';
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      revealElements.forEach(el => {
        const direction = el.dataset.scrollReveal || 'bottom';
        el.style.opacity = '0';
        
        switch(direction) {
          case 'left':
            el.style.transform = 'translateX(-50px) scale(0.9)';
            break;
          case 'right':
            el.style.transform = 'translateX(50px) scale(0.9)';
            break;
          case 'top':
            el.style.transform = 'translateY(-50px) scale(0.9)';
            break;
          default:
            el.style.transform = 'translateY(50px) scale(0.9)';
        }
        
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        revealObserver.observe(el);
      });
    }
  }
  initAdvancedScrollReveal();

  // 24. Animation de loading spinner personnalisé
  function initCustomLoader() {
    const loaders = document.querySelectorAll('[data-loader]');
    
    loaders.forEach(loader => {
      const type = loader.dataset.loader || 'spinner';
      
      if (type === 'spinner') {
        loader.innerHTML = `
          <div style="
            width: 40px;
            height: 40px;
            border: 4px solid var(--line);
            border-top-color: var(--accent);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          "></div>
        `;
      } else if (type === 'dots') {
        loader.innerHTML = `
          <div style="display: flex; gap: 8px;">
            <span style="width: 10px; height: 10px; background: var(--accent); border-radius: 50%; animation: bounce 1s infinite;"></span>
            <span style="width: 10px; height: 10px; background: var(--accent); border-radius: 50%; animation: bounce 1s infinite 0.2s;"></span>
            <span style="width: 10px; height: 10px; background: var(--accent); border-radius: 50%; animation: bounce 1s infinite 0.4s;"></span>
          </div>
        `;
      }
    });
  }
  initCustomLoader();

  // 25. Animation de typing améliorée avec curseur
  function initEnhancedTyping() {
    const typingElements = document.querySelectorAll('[data-typing]');
    
    typingElements.forEach(el => {
      try {
        const texts = JSON.parse(el.dataset.typing || '[]');
        if (texts.length === 0) return;
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        function typeText() {
          const currentText = texts[textIndex];
          
          if (isDeleting) {
            el.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
          } else {
            el.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
          }
          
          let typeSpeed = isDeleting ? 50 : 100;
          
          if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000;
            isDeleting = true;
          } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 500;
          }
          
          setTimeout(typeText, typeSpeed);
        }
        
        typeText();
      } catch (e) {
        console.error('Erreur dans initEnhancedTyping:', e);
      }
    });
  }
  initEnhancedTyping();

  // Active nav link highlight
  const navLinkElements = Array.from(document.querySelectorAll('.links a'));
  const highlightActive = () => {
    const path = location.pathname.split('/').pop() || 'index.html';
    navLinkElements.forEach(l => {
      const href = l.getAttribute('href');
      const normalized = href === '/' ? 'index.html' : href;
      if (normalized.endsWith(path)) l.classList.add('active'); else l.classList.remove('active');
    });
  };
  highlightActive();

  // Check admin session and show admin link ONLY if logged in
  const checkAdminSessionAndShowLink = () => {
    const adminNavLink = document.querySelector('#admin-nav-link');
    const adminNavLinkLogged = document.querySelector('#admin-nav-link-logged');
    
    const session = localStorage.getItem('adminSession');
    let isAdminLoggedIn = false;
    
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const now = new Date().getTime();
        if (sessionData.expires && now < sessionData.expires && sessionData.email === 'kouroumaelisee@gmail.com') {
          isAdminLoggedIn = true;
        } else {
          localStorage.removeItem('adminSession');
        }
      } catch (e) {
        localStorage.removeItem('adminSession');
      }
    }
    
    // Show admin link ONLY if admin is logged in
    if (isAdminLoggedIn) {
      // Show "Admin (Connecté)" link
      if (adminNavLinkLogged) {
        adminNavLinkLogged.style.display = 'inline-flex';
      }
      // Hide regular admin link
      if (adminNavLink) {
        adminNavLink.style.display = 'none';
      }
    } else {
      // Hide both links if not logged in
      if (adminNavLink) {
        adminNavLink.style.display = 'none';
      }
      if (adminNavLinkLogged) {
        adminNavLinkLogged.style.display = 'none';
      }
    }
  };
  
  // Check on page load
  checkAdminSessionAndShowLink();
  
  // Also check when storage changes (when admin logs in from another tab)
  window.addEventListener('storage', (e) => {
    if (e.key === 'adminSession') {
      checkAdminSessionAndShowLink();
    }
  });
  
  // Listen for custom logout event
  window.addEventListener('adminLoggedOut', () => {
    checkAdminSessionAndShowLink();
  });
  
  // Listen for custom login event
  window.addEventListener('adminLoggedIn', () => {
    checkAdminSessionAndShowLink();
  });
  
  // Also check periodically to catch login from same tab (but less frequently)
  setInterval(checkAdminSessionAndShowLink, 3000);

  // Migrate old paths to new paths
  const migrateOldPaths = () => {
    try {
      const portfolioData = localStorage.getItem('portfolioData');
      if (!portfolioData) return;
      
      const data = JSON.parse(portfolioData);
      let updated = false;
      
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
      
      if (updated) {
        localStorage.setItem('portfolioData', JSON.stringify(data));
      }
    } catch (e) {
      // Ignore migration errors
    }
  };
  
  // Run migration on page load
  migrateOldPaths();

  // Load and update CV links dynamically - FORCE UPDATE TO PREVENT CACHE ISSUES
  const loadCVLinks = () => {
    try {
      // Run migration before loading
      migrateOldPaths();
      
      const portfolioData = localStorage.getItem('portfolioData');
      if (!portfolioData) {
        return;
      }
      
      const data = JSON.parse(portfolioData);
      if (!data.links) {
        return;
      }
      
      // Find all CV links using data attribute first, then fallback to href/text detection
      let cvLinks = Array.from(document.querySelectorAll('a[data-cv-link="true"]'));
      
      // Also find CV links by href or text if not already marked
      const allLinks = document.querySelectorAll('a:not([data-cv-link])');
      allLinks.forEach(link => {
        const href = link.getAttribute('href');
        const text = link.textContent.trim().toLowerCase();
        
        // Check if this is a CV link
        const isCVLink = (href && (href.includes('Mon_CV.pdf') || href.includes('/cv') || href.includes('CV.pdf'))) ||
                        text === 'cv' || (text.includes('voir mon cv')) || text.includes('mon cv') || (text.includes('télécharger') && text.includes('cv'));
        
        if (isCVLink) {
          link.dataset.cvLink = 'true';
          cvLinks.push(link);
        }
      });
      
      
      // Update each CV link - AGGRESSIVE INTERCEPTION
      cvLinks.forEach((link, index) => {
        // FORCE REMOVE any existing handlers by cloning the node
        const parent = link.parentNode;
        if (!parent) return;
        
        const newLink = link.cloneNode(true);
        parent.replaceChild(newLink, link);
        
        // Store a unique ID for this link
        newLink.dataset.cvLinkId = 'cv-' + Date.now() + '-' + index;
        const linkId = newLink.dataset.cvLinkId;
        
        // IMMEDIATELY change href to prevent browser from opening file directly
        const originalHref = newLink.getAttribute('href');
        if (originalHref && !newLink.dataset.originalHref) {
          newLink.dataset.originalHref = originalHref;
        }
        
        // If CV is uploaded, FORCE href change immediately
        if (data.links.cvFile) {
          newLink.setAttribute('href', '#');
          newLink.setAttribute('onclick', 'return false;');
          newLink.setAttribute('title', `CV - ${data.links.cvFileName || 'CV.pdf'}`);
          newLink.style.cursor = 'pointer';
        }
        
        // Create NEW click handler that ALWAYS uses uploaded CV if available
        const clickHandler = (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          
          // Get fresh data from localStorage to ensure we have latest CV
          let freshData = data;
          try {
            const freshPortfolioData = localStorage.getItem('portfolioData');
            if (freshPortfolioData) {
              freshData = JSON.parse(freshPortfolioData);
            }
          } catch (err) {
            console.error('Erreur lecture localStorage:', err);
          }
          
          // PRIORITY 1: Use uploaded CV file (base64)
          if (freshData.links && freshData.links.cvFile) {
            
            try {
              // Get base64 data (remove data:application/pdf;base64, prefix if present)
              let base64Data = freshData.links.cvFile;
              if (base64Data.includes(',')) {
                base64Data = base64Data.split(',')[1];
              }
              
              // Convert base64 to blob
              const byteCharacters = atob(base64Data);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: 'application/pdf' });
              const blobUrl = URL.createObjectURL(blob);
              
              // Create download link with unique filename to avoid cache
              const fileName = (freshData.links.cvFileName || 'CV.pdf').replace(/\.[^/.]+$/, '') + '_' + Date.now() + '.pdf';
              
              // FORCE open in new window/tab
              const newWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer');
              
              if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                // Fallback: force download
                const downloadLink = document.createElement('a');
                downloadLink.href = blobUrl;
                downloadLink.download = fileName;
                downloadLink.style.display = 'none';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                setTimeout(() => {
                  document.body.removeChild(downloadLink);
                  URL.revokeObjectURL(blobUrl);
                }, 100);
              } else {
                // Clean up after window opens
                setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
              }
            } catch (error) {
              console.error('❌ Erreur lors de l\'ouverture du CV:', error);
              alert('Erreur lors de l\'ouverture du CV. Veuillez réessayer.');
            }
            return false;
          } 
          // PRIORITY 2: Use custom CV path/URL
          else if (freshData.links && freshData.links.cv && freshData.links.cv !== 'assets/CV.pdf') {
            const separator = freshData.links.cv.includes('?') ? '&' : '?';
            const timestamp = Date.now();
            window.open(`${freshData.links.cv}${separator}t=${timestamp}`, '_blank', 'noopener,noreferrer');
            return false;
          } 
          // PRIORITY 3: Default CV (with cache busting)
          else {
            const defaultHref = newLink.dataset.originalHref || 'assets/CV.pdf';
            const separator = defaultHref.includes('?') ? '&' : '?';
            const timestamp = Date.now();
            window.open(`${defaultHref}${separator}t=${timestamp}`, '_blank', 'noopener,noreferrer');
            return false;
          }
        };
        
        // Store handler reference
        window[`_cvHandler_${linkId}`] = clickHandler;
        
        // Add event listener with CAPTURE phase to intercept BEFORE default behavior
        newLink.addEventListener('click', clickHandler, true); // true = capture phase
        newLink.addEventListener('click', (e) => e.preventDefault(), true); // Double protection
        
        // Also prevent default on mousedown (before click)
        newLink.addEventListener('mousedown', (e) => {
          if (data.links.cvFile) {
            e.preventDefault();
          }
        }, true);
        
        // Update link attributes
        if (!data.links.cvFile) {
          // For path-based CV, add cache busting
          const cvPath = data.links.cv || newLink.dataset.originalHref || 'assets/CV.pdf';
          const separator = cvPath.includes('?') ? '&' : '?';
          const timestamp = Date.now();
          newLink.setAttribute('href', `${cvPath}${separator}t=${timestamp}`);
        }
        newLink.setAttribute('target', '_blank');
        newLink.setAttribute('rel', 'noopener');
      });
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des liens CV:', error);
    }
  };
  
  // DEBUG: Function to check CV status (can be called from console)
  window.checkCVStatus = function() {
    try {
      const portfolioData = localStorage.getItem('portfolioData');
      if (!portfolioData) {
        console.log('❌ Aucune donnée portfolio trouvée');
        return;
      }
      
      const data = JSON.parse(portfolioData);
      console.log('📊 État du CV:');
      console.log('  - CV uploadé (base64):', data.links?.cvFile ? '✅ OUI' : '❌ NON');
      console.log('  - Nom du fichier:', data.links?.cvFileName || 'N/A');
      console.log('  - Taille:', data.links?.cvFileSize ? (data.links.cvFileSize / 1024).toFixed(2) + ' KB' : 'N/A');
      console.log('  - Chemin CV:', data.links?.cv || 'assets/CV.pdf');
      console.log('  - Dernière mise à jour:', localStorage.getItem('cvLastUpdate') || 'N/A');
      
      const cvLinks = document.querySelectorAll('a[data-cv-link="true"]');
      console.log('  - Nombre de liens CV trouvés:', cvLinks.length);
      
      return data.links;
    } catch (error) {
      console.error('❌ Erreur:', error);
    }
  };
  
  // Load CV links on page load - FORCE EXECUTION MULTIPLE TIMES
  // Execute immediately
  loadCVLinks();
  
  // Execute after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(loadCVLinks, 50);
      setTimeout(loadCVLinks, 200);
    });
  } else {
    setTimeout(loadCVLinks, 50);
    setTimeout(loadCVLinks, 200);
  }
  
  // Also execute after a short delay to catch any late-loading elements
  setTimeout(() => {
    loadCVLinks();
  }, 500);
  
  // Reload CV links when storage changes (when CV is updated in admin)
  window.addEventListener('storage', (e) => {
    if (e.key === 'portfolioData' || e.key === 'cvLastUpdate') {
      setTimeout(() => loadCVLinks(), 50);
    }
  });
  
  // Also listen for custom event that can be triggered from admin page
  window.addEventListener('cvUpdated', () => {
    setTimeout(() => loadCVLinks(), 50);
  });
  
  // Force reload on focus (when user comes back to tab)
  window.addEventListener('focus', () => {
    setTimeout(() => loadCVLinks(), 100);
  });
  
  // Poll for CV updates (fallback method) - Only if portfolioData exists
  const hasPortfolioData = !!localStorage.getItem('portfolioData');
  let cvUpdateInterval = null;
  
  if (hasPortfolioData) {
    let lastCVUpdate = localStorage.getItem('cvLastUpdate') || '0';
    let lastPortfolioDataHash = '';
    
    const checkForCVUpdates = () => {
      // Skip if no portfolio data exists
      if (!localStorage.getItem('portfolioData')) {
        return;
      }
      
      const currentCVUpdate = localStorage.getItem('cvLastUpdate');
      const currentPortfolioData = localStorage.getItem('portfolioData');
      // Create a simple hash that works with Unicode characters
      const currentHash = currentPortfolioData ? 
        (currentPortfolioData.length + '_' + currentPortfolioData.substring(0, 100).replace(/[^\w\s]/g, '').substring(0, 50)) : '';
      
      if ((currentCVUpdate && currentCVUpdate !== lastCVUpdate) || 
          (currentHash && currentHash !== lastPortfolioDataHash)) {
        lastCVUpdate = currentCVUpdate || lastCVUpdate;
        lastPortfolioDataHash = currentHash || lastPortfolioDataHash;
        loadCVLinks();
      }
    };
    
    // Check immediately
    checkForCVUpdates();
    
    // Check every 2 seconds for updates (reduced frequency)
    cvUpdateInterval = setInterval(checkForCVUpdates, 2000);
    
    // Also check when page becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        checkForCVUpdates();
      }
    });
  }

  // Button ripple effect
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  // Card tilt interaction (subtle)
  const cards = document.querySelectorAll('.card');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    cards.forEach(card => {
      let frame;
      const onMove = (ev) => {
        const r = card.getBoundingClientRect();
        const x = ev.clientX - r.left; const y = ev.clientY - r.top;
        const px = (x / r.width) - 0.5; const py = (y / r.height) - 0.5;
        const rx = (py * -6); const ry = (px * 6);
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
      };
      const reset = () => { card.style.transform = ''; };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', reset);
    });
  }

  // Scroll progress bar
  let progress = document.querySelector('.progress');
  if (!progress) {
    progress = document.createElement('div');
    progress.className = 'progress';
    document.body.appendChild(progress);
  }
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = docHeight > 0 ? (scrollTop / docHeight) : 0;
    progress.style.width = Math.min(100, Math.max(0, ratio * 100)) + '%';
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  // Scroll to top button
  const scrollTopBtn = document.querySelector('#scroll-top');
  if (scrollTopBtn) {
    const toggleScrollTop = () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    };
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', toggleScrollTop, { passive: true });
    toggleScrollTop();
  }

  // Animated counter for stats
  const animateCounter = (el, target) => {
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 16);
  };

  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  if (statNumbers.length && 'IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          const target = parseInt(entry.target.dataset.count);
          animateCounter(entry.target, target);
          entry.target.dataset.animated = 'true';
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statNumbers.forEach(el => statObserver.observe(el));
  }

  // Enhanced contact form validation
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    const nameInput = contactForm.querySelector('#name');
    const emailInput = contactForm.querySelector('#email');
    const messageInput = contactForm.querySelector('#message');
    const submitBtn = contactForm.querySelector('#submit-btn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoader = submitBtn?.querySelector('.btn-loader');
    const formMessage = contactForm.querySelector('#form-message');

    const validateEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const showError = (input, message) => {
      const errorEl = contactForm.querySelector(`#${input.id}-error`);
      if (errorEl) {
        errorEl.textContent = message;
        input.classList.add('error');
      }
    };

    const clearError = (input) => {
      const errorEl = contactForm.querySelector(`#${input.id}-error`);
      if (errorEl) errorEl.textContent = '';
      input.classList.remove('error');
    };

    const showMessage = (text, type) => {
      if (formMessage) {
        formMessage.textContent = text;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';
        setTimeout(() => {
          formMessage.style.display = 'none';
        }, 5000);
      }
    };

    [nameInput, emailInput, messageInput].forEach(input => {
      if (input) {
        input.addEventListener('blur', () => {
          if (input.value.trim()) {
            if (input === emailInput && !validateEmail(emailInput.value)) {
              showError(input, 'Email invalide');
            } else {
              clearError(input);
            }
          }
        });
        input.addEventListener('input', () => {
          if (input.classList.contains('error') && input.value.trim()) {
            if (input !== emailInput || validateEmail(emailInput.value)) {
              clearError(input);
            }
          }
        });
      }
    });

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      let isValid = true;
      
      // Clear previous errors
      [nameInput, emailInput, messageInput].forEach(clearError);
      
      // Validate name
      if (!nameInput.value.trim()) {
        showError(nameInput, 'Le nom est requis');
        isValid = false;
      }
      
      // Validate email
      if (!emailInput.value.trim()) {
        showError(emailInput, 'L\'email est requis');
        isValid = false;
      } else if (!validateEmail(emailInput.value)) {
        showError(emailInput, 'Email invalide');
        isValid = false;
      }
      
      // Validate message
      if (!messageInput.value.trim()) {
        showError(messageInput, 'Le message est requis');
        isValid = false;
      } else if (messageInput.value.trim().length < 10) {
        showError(messageInput, 'Le message doit contenir au moins 10 caractères');
        isValid = false;
      }
      
      if (!isValid) {
        showMessage('Veuillez corriger les erreurs dans le formulaire', 'error');
        return;
      }
      
      // Show loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'inline';
      }
      
      // Save message to localStorage
      try {
        const formData = new FormData(contactForm);
        const messageData = {
          id: Date.now() + Math.random(), // Unique ID
          name: formData.get('name').trim(),
          email: formData.get('email').trim(),
          subject: (formData.get('subject') || '').trim(),
          message: formData.get('message').trim(),
          date: new Date().toISOString(),
          read: false
        };

        console.log('💾 Sauvegarde du message:', messageData);

        // Get existing messages
        const portfolioData = localStorage.getItem('portfolioData');
        let data = {};
        try {
          if (portfolioData) {
            data = JSON.parse(portfolioData);
          }
        } catch (e) {
          console.error('❌ Erreur lors du parsing de portfolioData:', e);
          data = {};
        }
        
        // Ensure contactMessages array exists
        if (!data.contactMessages || !Array.isArray(data.contactMessages)) {
          console.log('📝 Initialisation du tableau contactMessages');
          data.contactMessages = [];
        }
        
        console.log('📊 Messages existants avant ajout:', data.contactMessages.length);

        // Add new message at the beginning (most recent first)
        data.contactMessages.unshift(messageData);
        console.log('📝 Message ajouté. Total maintenant:', data.contactMessages.length);
        
        // Keep only last 100 messages
        if (data.contactMessages.length > 100) {
          data.contactMessages = data.contactMessages.slice(0, 100);
          console.log('✂️ Messages limités à 100');
        }

        // Save to localStorage
        const oldData = localStorage.getItem('portfolioData');
        localStorage.setItem('portfolioData', JSON.stringify(data));
        console.log('✅ Message sauvegardé dans localStorage. Total messages:', data.contactMessages.length);
        
        // Vérification immédiate
        try {
          const verifyData = localStorage.getItem('portfolioData');
          if (verifyData) {
            const verifyParsed = JSON.parse(verifyData);
            console.log('🔍 Vérification après sauvegarde:', {
              totalMessages: verifyParsed.contactMessages ? verifyParsed.contactMessages.length : 0,
              lastMessage: verifyParsed.contactMessages && verifyParsed.contactMessages.length > 0 ? {
                name: verifyParsed.contactMessages[0].name,
                email: verifyParsed.contactMessages[0].email,
                subject: verifyParsed.contactMessages[0].subject,
                date: verifyParsed.contactMessages[0].date
              } : null,
              allMessages: verifyParsed.contactMessages
            });
          } else {
            console.error('❌ Aucune donnée trouvée dans localStorage après sauvegarde !');
          }
        } catch (e) {
          console.error('❌ Erreur lors de la vérification:', e);
        }
        
        // Dispatch custom event to notify admin page of new message
        try {
          window.dispatchEvent(new CustomEvent('newContactMessage', {
            detail: messageData
          }));
          console.log('📢 Événement newContactMessage déclenché');
          
          // Also trigger storage event for cross-tab communication
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'portfolioData',
            newValue: JSON.stringify(data),
            oldValue: oldData,
            url: window.location.href,
            storageArea: localStorage
          }));
          console.log('📢 Événement storage déclenché');
        } catch (e) {
          console.error('❌ Erreur lors du déclenchement de l\'événement:', e);
        }

        showMessage(`Merci ${messageData.name} ! Votre message a été envoyé avec succès.`, 'success');
        contactForm.reset();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du message:', error);
        showMessage('Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
      }
        
        if (submitBtn) {
          submitBtn.disabled = false;
          if (btnText) btnText.style.display = 'inline';
          if (btnLoader) btnLoader.style.display = 'none';
        }
    });
  }

  // (Notebook page numbering removed)

  // Initialize default projects if needed
  function initDefaultProject() {
    try {
      const portfolioData = localStorage.getItem('portfolioData');
      if (!portfolioData) return;
      
      const data = JSON.parse(portfolioData);
      if (!data.projects || data.projects.length === 0) {
        // Add default projects if array is empty
        const defaultProjects = [
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
            shortDesc: 'Plateforme de stockage cloud avec 20 Go d\'espace · Application web et mobile complète',
            description: 'Fylor est une plateforme de stockage cloud développée comme projet personnel, similaire à Supfile. Cette application permet aux utilisateurs de stocker, sécuriser et partager leurs fichiers personnels dans le cloud, avec un quota de 20 Go par utilisateur (contrairement à Supfile qui offre 30 Go).\n\nLe projet comprend le développement d\'une application web complète et d\'une application mobile, avec une architecture basée sur une API REST, des clients distincts et une base de données pour les métadonnées. L\'application offre les mêmes fonctionnalités avancées que Supfile, avec un espace de stockage de 20 Go.\n\nL\'accent est mis sur la gestion performante des flux de données (upload/download), la navigation fluide dans une arborescence de dossiers, l\'ergonomie, la prévisualisation instantanée des fichiers et la synchronisation entre les clients web et mobile.',
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
              'Quota généreux de 20 Go par utilisateur',
              'Sécurité : JWT, hachage des mots de passe, gestion des secrets'
            ],
            tags: ['Web', 'Mobile', 'Application Web', 'Cloud Storage', 'API REST', 'Docker', 'OAuth2', 'JWT', '20 Go', 'Stockage Cloud', 'Déploiement'],
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
        ];
        data.projects = defaultProjects;
        localStorage.setItem('portfolioData', JSON.stringify(data));
        console.log('✅ Projets par défaut ajoutés (tableau vide)');
      } else {
        // Check if new default projects need to be added
        const existingTitles = data.projects.map(p => p.title);
        const defaultProjects = [
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
            shortDesc: 'Plateforme de stockage cloud avec 20 Go d\'espace · Application web et mobile complète',
            description: 'Fylor est une plateforme de stockage cloud développée comme projet personnel, similaire à Supfile. Cette application permet aux utilisateurs de stocker, sécuriser et partager leurs fichiers personnels dans le cloud, avec un quota de 20 Go par utilisateur (contrairement à Supfile qui offre 30 Go).\n\nLe projet comprend le développement d\'une application web complète et d\'une application mobile, avec une architecture basée sur une API REST, des clients distincts et une base de données pour les métadonnées. L\'application offre les mêmes fonctionnalités avancées que Supfile, avec un espace de stockage de 20 Go.\n\nL\'accent est mis sur la gestion performante des flux de données (upload/download), la navigation fluide dans une arborescence de dossiers, l\'ergonomie, la prévisualisation instantanée des fichiers et la synchronisation entre les clients web et mobile.',
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
              'Quota généreux de 20 Go par utilisateur',
              'Sécurité : JWT, hachage des mots de passe, gestion des secrets'
            ],
            tags: ['Web', 'Mobile', 'Application Web', 'Cloud Storage', 'API REST', 'Docker', 'OAuth2', 'JWT', '20 Go', 'Stockage Cloud', 'Déploiement'],
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
        ];
        
        const projectsToAdd = defaultProjects.filter(p => !existingTitles.includes(p.title));
        
        if (projectsToAdd.length > 0) {
          console.log(`📦 Ajout de ${projectsToAdd.length} nouveau(x) projet(s) par défaut:`, projectsToAdd.map(p => p.title));
          data.projects = [...data.projects, ...projectsToAdd];
          localStorage.setItem('portfolioData', JSON.stringify(data));
        }
      }
    } catch (e) {
      console.error('Erreur lors de l\'initialisation des projets par défaut:', e);
    }
  }

  // Load Projects Dynamically from localStorage
  function loadProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    const projectsLoadingEl = document.getElementById('projects-loading');
    
    if (!projectsGrid) return;
    
    // Show loading state
    if (projectsLoadingEl) {
      projectsLoadingEl.style.display = 'block';
    }

    // DO NOT call initDefaultProject() here - it can overwrite user modifications
    // Only initDefaultData() should initialize data if localStorage is completely empty
    // initDefaultProject() is only for adding missing projects, not for overwriting existing ones

    try {
      const portfolioData = localStorage.getItem('portfolioData');
      if (!portfolioData) {
        console.log('⚠️ Aucune donnée portfolio trouvée dans localStorage');
        // Hide loading state
        if (projectsLoadingEl) {
          projectsLoadingEl.style.display = 'none';
        }
        // Show empty state
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
          emptyState.style.display = 'block';
          emptyState.style.opacity = '1';
        }
        // Keep original HTML projects if no data
        return;
      }

      const data = JSON.parse(portfolioData);
      let projects = data.projects || [];
      
      // Debug: Log all projects with their public status
      console.log('🔍 Tous les projets dans localStorage:');
      projects.forEach((p, i) => {
        console.log(`  ${i + 1}. "${p.title}" - public=${p.public} (type: ${typeof p.public}, strict false: ${p.public === false})`);
      });

      // Check if admin is logged in
      const isAdminLoggedIn = (() => {
        const session = localStorage.getItem('adminSession');
        if (session) {
          try {
            const sessionData = JSON.parse(session);
            const now = new Date().getTime();
            const isValid = sessionData.expires && now < sessionData.expires && sessionData.email === 'kouroumaelisee@gmail.com';
            console.log(`🔐 Vérification session admin: ${isValid ? '✅ Connecté' : '❌ Non connecté'}`, {
              hasSession: !!session,
              expires: sessionData.expires,
              now: now,
              expired: sessionData.expires ? now >= sessionData.expires : true,
              email: sessionData.email,
              emailMatch: sessionData.email === 'kouroumaelisee@gmail.com'
            });
            return isValid;
          } catch (e) {
            console.log('❌ Erreur lors de la vérification de session:', e);
            return false;
          }
        }
        console.log('❌ Aucune session admin trouvée');
        return false;
      })();

      // Filter out private projects if admin is not logged in
      // A project is public if: public === true OR public is undefined/null (default to public)
      if (!isAdminLoggedIn) {
        const beforeFilter = projects.length;
        projects = projects.filter(project => {
          // Consider project public if: public === true OR public is undefined/null
          // Only filter out if explicitly set to false
          // Use strict comparison to ensure we catch boolean false
          const isPublic = project.public !== false;
          
          // Debug logging
          if (!isPublic) {
            console.log(`🔒 Projet privé filtré: "${project.title}"`, {
              public: project.public,
              publicType: typeof project.public,
              isStrictFalse: project.public === false,
              willBeFiltered: !isPublic
            });
          }
          return isPublic;
        });
        if (beforeFilter !== projects.length) {
          console.log(`🔒 Filtrage: ${beforeFilter} → ${projects.length} projet(s) (${beforeFilter - projects.length} projet(s) privé(s) masqué(s))`);
        }
      } else {
        console.log('👤 Admin connecté - tous les projets sont visibles (y compris les projets privés)');
      }
      
      console.log(`📊 Projets chargés: ${projects.length} (${isAdminLoggedIn ? 'Admin connecté - tous les projets visibles' : 'Visiteur - projets publics uniquement'})`);
      if (projects.length > 0) {
        projects.forEach((p, i) => {
          const isPublic = p.public !== false;
          console.log(`  ${i + 1}. "${p.title}" - Public: ${isPublic ? '✅ Oui' : '❌ Non'} (public=${p.public}, type=${typeof p.public})`);
        });
      } else {
        console.log('⚠️ Aucun projet public trouvé. Tous les projets sont peut-être privés ou il n\'y a pas de projets.');
      }
      
      // Vérification supplémentaire : compter les projets privés
      const allProjects = data.projects || [];
      const privateProjects = allProjects.filter(p => p.public === false);
      if (privateProjects.length > 0) {
        console.log(`🔒 ${privateProjects.length} projet(s) privé(s) détecté(s) dans localStorage:`, privateProjects.map(p => p.title));
        if (isAdminLoggedIn) {
          console.log('   → Visible car admin connecté');
        } else {
          console.log('   → Devrait être masqué pour les visiteurs');
        }
      }

      // Hide loading state
      if (projectsLoadingEl) {
        projectsLoadingEl.style.display = 'none';
      }

      // Mark that we're loading dynamically
      projectsGrid.dataset.loaded = 'true';
      
      // Clear existing projects
      projectsGrid.innerHTML = '';

      // Only replace if there are projects from admin
      if (projects.length === 0) {
        console.log('⚠️ Aucun projet trouvé - affichage de l\'état vide');
        // Show empty state
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
          emptyState.style.display = 'block';
          emptyState.style.opacity = '1';
          setTimeout(() => {
            emptyState.style.transform = 'translateY(0)';
          }, 100);
        }
        return;
      }

      // Hide empty state if projects exist
      const emptyState = document.getElementById('empty-state');
      if (emptyState) {
        emptyState.style.display = 'none';
      }

      // Render projects from localStorage
      projects.forEach((project, index) => {
        const projectCard = document.createElement('article');
        projectCard.className = project.featured ? 'card featured-project' : 'card';
        projectCard.setAttribute('data-animate', '');
        projectCard.setAttribute('data-animate-delay', `${index * 60}ms`);
        projectCard.setAttribute('data-project-type', project.type || 'Projet Personnel');
        
        // Force visibility for dynamically loaded projects
        // Add 'in' class immediately and ensure opacity is 1
        projectCard.classList.add('in');
        projectCard.style.opacity = '1';
        projectCard.style.transform = 'none';
        projectCard.style.display = '';
        projectCard.style.visibility = 'visible';

        let tagsHTML = '';
        if (project.tags && project.tags.length > 0) {
          tagsHTML = `<div class="tags">${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`;
        }

        let badgeHTML = '';
        if (project.type) {
          badgeHTML = `<div class="project-badge">${project.type}${project.featured ? ' ⭐' : ''}</div>`;
        }

        // Don't show full description on projects page - only on details page
        // Only show shortDesc on the projects listing page

        let linksHTML = '';
        // Support both old format (liveUrl, githubUrl, emailSubject) and new format (link, demoLink)
        const liveUrl = project.liveUrl || project.link || '';
        const demoLink = project.demoLink || project.githubUrl || '';
        const emailSubject = project.emailSubject || '';
        
        // Add Details button - use project title as identifier in URL
        const detailsUrl = `project-details.html?project=${encodeURIComponent(project.title)}`;
        linksHTML += `<a class="btn" href="${detailsUrl}">📄 Détails</a>`;
        
        if (liveUrl) {
          linksHTML += `<a class="btn secondary" href="${liveUrl}" target="_blank" rel="noopener">🌐 Voir l'application</a>`;
        }
        if (demoLink) {
          linksHTML += `<a class="btn secondary" href="${demoLink}" target="_blank" rel="noopener">💻 Code source</a>`;
        }
        if (emailSubject) {
          linksHTML += `<a class="btn secondary" href="mailto:kouroumaelisee@gmail.com?subject=${encodeURIComponent(emailSubject)}" target="_blank" rel="noopener">📧 Plus d'infos</a>`;
        }

        // Enhanced project card HTML with better design
        projectCard.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            ${badgeHTML}
            ${project.featured ? '<span style="font-size: 20px; opacity: 0.7;" title="Projet en vedette">⭐</span>' : ''}
          </div>
          <h3 style="margin-bottom: 8px; font-size: 22px; line-height: 1.3;">${project.title || 'Projet sans titre'}</h3>
          ${project.type ? `<div style="font-size: 12px; color: var(--accent); margin-bottom: 12px; font-weight: 500;">${project.type}</div>` : ''}
          ${project.shortDesc ? `<p class="muted" style="margin-bottom: 16px; line-height: 1.6; font-size: 14px;">${project.shortDesc}</p>` : ''}
          ${tagsHTML}
          ${linksHTML ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;padding-top:16px;border-top:1px solid var(--line);">${linksHTML}</div>` : ''}
        `;
        
        // Add hover effect and click to details
        projectCard.style.cursor = 'pointer';
        projectCard.addEventListener('click', (e) => {
          if (!e.target.closest('a') && !e.target.closest('button')) {
            const detailsBtn = projectCard.querySelector('a[href*="project-details.html"]');
            if (detailsBtn) detailsBtn.click();
          }
        });

        projectsGrid.appendChild(projectCard);
        
        // Observe the new project with IntersectionObserver if available
        // This ensures scroll reveal animations work for dynamically added projects
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver(entries => {
            entries.forEach(e => { 
              if (e.isIntersecting) { 
                e.target.classList.add('in'); 
                e.target.style.opacity = '1';
                e.target.style.transform = 'none';
                io.unobserve(e.target); 
              } 
            });
          }, { rootMargin: '0px 0px -10% 0px' });
          io.observe(projectCard);
        }
      });
      
      console.log(`✅ ${projects.length} projet(s) ajouté(s) au DOM dans #projects-grid`);
      console.log(`   Éléments dans le DOM: ${projectsGrid.children.length}`);
      
      // Trigger filterProjects after projects are loaded if it exists
      // Use setTimeout to ensure DOM is fully updated
      setTimeout(() => {
        if (typeof window.triggerFilterProjects === 'function') {
          console.log('🔄 Déclenchement de filterProjects...');
          window.triggerFilterProjects();
          // Check visibility after filtering
          setTimeout(() => {
            const visibleProjects = Array.from(projectsGrid.querySelectorAll('.card, article.card')).filter(card => {
              const style = window.getComputedStyle(card);
              const computedOpacity = parseFloat(style.opacity);
              const isVisible = style.display !== 'none' && 
                               style.visibility !== 'hidden' && 
                               computedOpacity > 0;
              if (!isVisible) {
                console.log(`   ⚠️ Projet masqué: display=${style.display}, visibility=${style.visibility}, opacity=${style.opacity}`);
              }
              return isVisible;
            });
            console.log(`👁️ Projets visibles après filtrage: ${visibleProjects.length}`);
            if (visibleProjects.length === 0 && projects.length > 0) {
              console.warn('⚠️ Aucun projet visible après filtrage ! Forçage de la visibilité...');
              // Force visibility as fallback
              Array.from(projectsGrid.children).forEach((card, idx) => {
                if (card) {
                  card.classList.add('in');
                  card.style.opacity = '1';
                  card.style.transform = 'none';
                  card.style.display = '';
                  card.style.visibility = 'visible';
                  console.log(`   🔧 Visibilité forcée pour le projet ${idx + 1}`);
                }
              });
            }
          }, 100);
        }
      }, 50);
      
      // Hide loading state after rendering
      if (projectsLoadingEl) {
        projectsLoadingEl.style.display = 'none';
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des projets:', error);
      // Hide loading state on error
      if (projectsLoadingEl) {
        projectsLoadingEl.style.display = 'none';
      }
      // Show empty state on error
      const emptyState = document.getElementById('empty-state');
      if (emptyState) {
        emptyState.style.display = 'block';
        emptyState.innerHTML = '<p class="muted">Erreur lors du chargement des projets. Veuillez rafraîchir la page.</p>';
      }
    }
  }

  // Load projects on page load
  // Only load on projects page
  if (document.getElementById('projects-grid')) {
    console.log('📦 Chargement des projets...');
    loadProjects();
  } else {
    console.log('ℹ️ Page projets non détectée - skip loadProjects');
  }

  // Watch for changes in localStorage to reload projects when updated from admin
  // Only on projects page
  if (document.getElementById('projects-grid')) {
    let lastProjectsHash = '';
    
    const checkProjectsUpdate = () => {
      try {
        const portfolioData = localStorage.getItem('portfolioData');
        if (!portfolioData) return;
        
        const data = JSON.parse(portfolioData);
        const projects = data.projects || [];
        // Create a hash to detect changes
        const projectsHash = JSON.stringify(projects.map(p => ({ 
          title: p.title, 
          public: p.public,
          id: p.title // Use title as identifier
        })));
        
        if (projectsHash !== lastProjectsHash) {
          console.log('🔄 Changements détectés dans les projets - rechargement...');
          lastProjectsHash = projectsHash;
          loadProjects();
          // Also trigger filter update if it exists
          setTimeout(() => {
            if (typeof window.triggerFilterProjects === 'function') {
              window.triggerFilterProjects();
            }
          }, 200);
        }
      } catch (e) {
        console.error('Erreur lors de la vérification des projets:', e);
      }
    };

    // Check for updates every 2 seconds
    checkProjectsUpdate(); // Check immediately
    setInterval(checkProjectsUpdate, 2000);
    
    // Also check when page becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        checkProjectsUpdate();
      }
    });

    // Listen to storage events (when localStorage is updated from another tab/window)
    window.addEventListener('storage', (e) => {
      if (e.key === 'portfolioData' || e.key === 'portfolioLastUpdate') {
        console.log('📥 Événement de stockage reçu - rechargement des projets...');
        checkProjectsUpdate();
      }
    });
    
    // Also listen to custom event
    window.addEventListener('portfolioDataUpdated', () => {
      console.log('📥 Événement personnalisé reçu - rechargement des projets...');
      checkProjectsUpdate();
    });
  }

  // Project Filters and Search
  const projectSearch = document.getElementById('project-search');
  const projectTypeFilter = document.getElementById('project-type-filter');
  const clearFiltersBtn = document.getElementById('clear-filters');
  const projectsGrid = document.getElementById('projects-grid');
  const filterTagsContainer = document.getElementById('filter-tags');
  const projectCountEl = document.getElementById('project-count');
  const visibleCountEl = document.getElementById('visible-count');
  const emptyStateEl = document.getElementById('empty-state');
  const projectsLoadingEl = document.getElementById('projects-loading');
  const viewToggleEl = document.getElementById('view-toggle');
  const viewIconEl = document.getElementById('view-icon');
  const projectSortEl = document.getElementById('project-sort');
  const clearFiltersEmptyEl = document.getElementById('clear-filters-empty');
  
  // View toggle state
  let isListView = false;

  if (projectSearch && projectsGrid) {
    let allProjects = Array.from(projectsGrid.querySelectorAll('.card'));
    let activeFilters = {
      search: '',
      type: ''
    };

    // Reload projects list when filters are used (in case projects were loaded dynamically)
    function refreshProjectsList() {
      allProjects = Array.from(projectsGrid.querySelectorAll('.card, article.card'));
    }

    function filterProjects() {
      refreshProjectsList(); // Refresh list in case projects were dynamically loaded
      const searchTerm = activeFilters.search.toLowerCase();
      const typeFilter = activeFilters.type;
      let visibleCount = 0;

      console.log(`🔍 Filtrage actif - Recherche: "${searchTerm}", Type: "${typeFilter}"`);
      console.log(`   Projets à filtrer: ${allProjects.length}`);

      allProjects.forEach((project, idx) => {
        const title = project.querySelector('h3')?.textContent || '';
        const titleLower = title.toLowerCase();
        const description = project.textContent.toLowerCase();
        const badge = project.querySelector('.project-badge')?.textContent || '';
        const tags = Array.from(project.querySelectorAll('.tag')).map(t => t.textContent.toLowerCase()).join(' ');
        const projectType = project.getAttribute('data-project-type') || '';

        const matchesSearch = !searchTerm || 
          titleLower.includes(searchTerm) || 
          description.includes(searchTerm) || 
          tags.includes(searchTerm);

        const matchesType = !typeFilter || badge.includes(typeFilter) || projectType.includes(typeFilter);

        if (matchesSearch && matchesType) {
          project.style.display = '';
          visibleCount++;
          console.log(`  ✅ Projet ${idx + 1}: "${title}" - VISIBLE`);
        } else {
          project.style.display = 'none';
          console.log(`  ❌ Projet ${idx + 1}: "${title}" - MASQUÉ (matchesSearch: ${matchesSearch}, matchesType: ${matchesType})`);
        }
      });

      console.log(`📊 Résultat du filtrage: ${visibleCount}/${allProjects.length} projet(s) visible(s)`);

      // Update filter tags
      if (filterTagsContainer) {
        filterTagsContainer.innerHTML = '';
        if (activeFilters.search) {
          const tag = document.createElement('span');
          tag.className = 'filter-tag active';
          tag.innerHTML = `Recherche: "${activeFilters.search}" <span onclick="removeSearchFilter()" style="cursor: pointer; margin-left: 4px;">×</span>`;
          filterTagsContainer.appendChild(tag);
        }
        if (activeFilters.type) {
          const tag = document.createElement('span');
          tag.className = 'filter-tag active';
          tag.innerHTML = `Type: ${activeFilters.type} <span onclick="removeTypeFilter()" style="cursor: pointer; margin-left: 4px;">×</span>`;
          filterTagsContainer.appendChild(tag);
        }
      }

      // Update visible count
      const visibleCountEl = document.getElementById('visible-count');
      if (visibleCountEl) {
        visibleCountEl.textContent = visibleCount;
      }
      
      // Update empty state
      const emptyStateEl = document.getElementById('empty-state');
      if (emptyStateEl) {
        if (visibleCount === 0) {
          emptyStateEl.style.display = 'block';
          setTimeout(() => {
            emptyStateEl.style.opacity = '1';
            emptyStateEl.style.transform = 'translateY(0)';
          }, 100);
        } else {
          emptyStateEl.style.opacity = '0';
          emptyStateEl.style.transform = 'translateY(20px)';
          setTimeout(() => {
            emptyStateEl.style.display = 'none';
          }, 300);
        }
      }

      // Hide loading state
      const projectsLoadingEl = document.getElementById('projects-loading');
      if (projectsLoadingEl) {
        projectsLoadingEl.style.display = 'none';
      }
      
      // Update project statistics
      updateProjectStats();
    }

    // Update project statistics
    function updateProjectStats() {
      if (!projectsGrid) return;
      
      const allProjects = Array.from(projectsGrid.querySelectorAll('.card, article.card'));
      const featuredProjects = allProjects.filter(p => p.classList.contains('featured-project'));
      const visibleProjects = allProjects.filter(p => p.style.display !== 'none');
      
      const totalCountEl = document.getElementById('total-projects-count');
      const featuredCountEl = document.getElementById('featured-projects-count');
      const visibleProjectsCountEl = document.getElementById('visible-projects-count');
      
      if (totalCountEl) {
        totalCountEl.setAttribute('data-count', allProjects.length);
        animateCounter(totalCountEl, allProjects.length);
      }
      if (featuredCountEl) {
        featuredCountEl.setAttribute('data-count', featuredProjects.length);
        animateCounter(featuredCountEl, featuredProjects.length);
      }
      if (visibleProjectsCountEl) {
        visibleProjectsCountEl.setAttribute('data-count', visibleProjects.length);
        animateCounter(visibleProjectsCountEl, visibleProjects.length);
      }
    }

    // Sort projects function
    function sortProjects() {
      if (!projectSortEl || !projectsGrid) return;
      
      const sortValue = projectSortEl.value;
      const allProjects = Array.from(projectsGrid.querySelectorAll('.card, article.card'));
      
      if (sortValue === 'default') {
        allProjects.forEach(card => projectsGrid.appendChild(card));
        return;
      }
      
      const sorted = allProjects.sort((a, b) => {
        const titleA = (a.querySelector('h3')?.textContent || '').toLowerCase();
        const titleB = (b.querySelector('h3')?.textContent || '').toLowerCase();
        const featuredA = a.classList.contains('featured-project');
        const featuredB = b.classList.contains('featured-project');
        
        switch(sortValue) {
          case 'featured':
            if (featuredA && !featuredB) return -1;
            if (!featuredA && featuredB) return 1;
            return titleA.localeCompare(titleB);
          case 'recent':
            return titleB.localeCompare(titleA);
          case 'name':
            return titleA.localeCompare(titleB);
          default:
            return 0;
        }
      });
      
      sorted.forEach(card => projectsGrid.appendChild(card));
    }

    // Toggle view (grid/list) - using globally declared variables
    if (viewToggleEl && projectsGrid) {
      viewToggleEl.addEventListener('click', () => {
        isListView = !isListView;
        
        if (isListView) {
          projectsGrid.classList.add('list-view');
          projectsGrid.classList.remove('cols-2');
          if (viewIconEl) viewIconEl.textContent = '📊';
          const textSpan = viewToggleEl.querySelector('span:not(#view-icon)');
          if (textSpan) textSpan.textContent = 'Vue grille';
        } else {
          projectsGrid.classList.remove('list-view');
          projectsGrid.classList.add('cols-2');
          if (viewIconEl) viewIconEl.textContent = '📋';
          const textSpan = viewToggleEl.querySelector('span:not(#view-icon)');
          if (textSpan) textSpan.textContent = 'Vue liste';
        }
      });
    }

    // Sort projects when sort changes - using globally declared projectSortEl
    if (projectSortEl) {
      projectSortEl.addEventListener('change', () => {
        sortProjects();
        filterProjects();
      });
    }

    // Clear filters from empty state - using globally declared clearFiltersEmptyEl
    if (clearFiltersEmptyEl) {
      clearFiltersEmptyEl.addEventListener('click', () => {
        if (clearFiltersBtn) clearFiltersBtn.click();
      });
    }

    if (projectSearch) {
      projectSearch.addEventListener('input', (e) => {
        activeFilters.search = e.target.value;
        filterProjects();
      });
    }

    if (projectTypeFilter) {
      projectTypeFilter.addEventListener('change', (e) => {
        activeFilters.type = e.target.value;
        filterProjects();
      });
    }

    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        activeFilters.search = '';
        activeFilters.type = '';
        if (projectSearch) projectSearch.value = '';
        if (projectTypeFilter) projectTypeFilter.value = '';
        filterProjects();
      });
    }

    window.removeSearchFilter = function() {
      activeFilters.search = '';
      if (projectSearch) projectSearch.value = '';
      filterProjects();
    };

    window.removeTypeFilter = function() {
      activeFilters.type = '';
      if (projectTypeFilter) projectTypeFilter.value = '';
      filterProjects();
    };

    // Update project statistics
    function updateProjectStats() {
      if (!projectsGrid) return;
      
      const allProjects = Array.from(projectsGrid.querySelectorAll('.card, article.card'));
      const featuredProjects = allProjects.filter(p => p.classList.contains('featured-project'));
      const visibleProjects = allProjects.filter(p => p.style.display !== 'none');
      
      const totalCountEl = document.getElementById('total-projects-count');
      const featuredCountEl = document.getElementById('featured-projects-count');
      const visibleProjectsCountEl = document.getElementById('visible-projects-count');
      
      if (totalCountEl && typeof animateCounter === 'function') {
        totalCountEl.setAttribute('data-count', allProjects.length);
        animateCounter(totalCountEl, allProjects.length);
      } else if (totalCountEl) {
        totalCountEl.textContent = allProjects.length;
      }
      
      if (featuredCountEl && typeof animateCounter === 'function') {
        featuredCountEl.setAttribute('data-count', featuredProjects.length);
        animateCounter(featuredCountEl, featuredProjects.length);
      } else if (featuredCountEl) {
        featuredCountEl.textContent = featuredProjects.length;
      }
      
      if (visibleProjectsCountEl && typeof animateCounter === 'function') {
        visibleProjectsCountEl.setAttribute('data-count', visibleProjects.length);
        animateCounter(visibleProjectsCountEl, visibleProjects.length);
      } else if (visibleProjectsCountEl) {
        visibleProjectsCountEl.textContent = visibleProjects.length;
      }
    }

    // Sort projects function
    function sortProjects() {
      if (!projectSortEl || !projectsGrid) return;
      
      const sortValue = projectSortEl.value;
      const allProjects = Array.from(projectsGrid.querySelectorAll('.card, article.card'));
      
      if (sortValue === 'default') {
        allProjects.forEach(card => projectsGrid.appendChild(card));
        return;
      }
      
      const sorted = allProjects.sort((a, b) => {
        const titleA = (a.querySelector('h3')?.textContent || '').toLowerCase();
        const titleB = (b.querySelector('h3')?.textContent || '').toLowerCase();
        const featuredA = a.classList.contains('featured-project');
        const featuredB = b.classList.contains('featured-project');
        
        switch(sortValue) {
          case 'featured':
            if (featuredA && !featuredB) return -1;
            if (!featuredA && featuredB) return 1;
            return titleA.localeCompare(titleB);
          case 'recent':
            return titleB.localeCompare(titleA);
          case 'name':
            return titleA.localeCompare(titleB);
          default:
            return 0;
        }
      });
      
      sorted.forEach(card => projectsGrid.appendChild(card));
    }

    // Toggle view (grid/list) - using globally declared variables (already handled above)

    // Sort projects when sort changes
    if (projectSortEl) {
      projectSortEl.addEventListener('change', () => {
        sortProjects();
        filterProjects();
      });
    }

    // Clear filters from empty state - using globally declared clearFiltersEmptyEl
    if (clearFiltersEmptyEl && clearFiltersBtn) {
      clearFiltersEmptyEl.addEventListener('click', () => {
        clearFiltersBtn.click();
      });
    }

    // Make filterProjects available globally so loadProjects can trigger it
    window.triggerFilterProjects = function() {
      filterProjects();
      updateProjectStats();
    };

    // Initial filter and stats (delay to ensure projects are loaded)
    setTimeout(() => {
      filterProjects();
      updateProjectStats();
      const projectsLoadingEl = document.getElementById('projects-loading');
      if (projectsLoadingEl) projectsLoadingEl.style.display = 'none';
    }, 100);
  }

  // Lightbox for images
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = '<span class="lightbox-close">&times;</span><img class="lightbox-content" src="" alt="" />';
  document.body.appendChild(lightbox);

  document.querySelectorAll('img[data-lightbox]').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      const lightboxImg = lightbox.querySelector('.lightbox-content');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Social Share
  window.sharePortfolio = function(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    let shareUrl = '';

    switch(platform) {
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${title}&body=${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  // Load testimonials dynamically from admin data
  function loadTestimonials() {
    const testimonialsContainer = document.getElementById('testimonials-container');
    const testimonialsSection = document.getElementById('testimonials-section');
    
    if (!testimonialsContainer) return;

    try {
      const portfolioData = localStorage.getItem('portfolioData');
      if (!portfolioData) {
        // Hide section if no data
        if (testimonialsSection) testimonialsSection.style.display = 'none';
        return;
      }

      const data = JSON.parse(portfolioData);
      const testimonials = data.testimonials || [];

      if (testimonials.length === 0) {
        // Hide section if no testimonials
        if (testimonialsSection) testimonialsSection.style.display = 'none';
        return;
      }

      // Show section and render testimonials
      if (testimonialsSection) testimonialsSection.style.display = 'block';
      testimonialsContainer.innerHTML = '';

      testimonials.forEach(testimonial => {
        const stars = '⭐'.repeat(testimonial.rating || 5);
        const card = document.createElement('div');
        card.className = 'card testimonial-card';
        card.innerHTML = `
          <div class="testimonial-rating">${stars}</div>
          <p>"${testimonial.text}"</p>
          <div class="testimonial-author">
            <div>
              <strong>${testimonial.author}</strong>
              ${testimonial.role ? `<div class="muted" style="font-size: 12px;">${testimonial.role}</div>` : ''}
            </div>
          </div>
        `;
        testimonialsContainer.appendChild(card);
      });
    } catch (error) {
      console.error('Error loading testimonials:', error);
      if (testimonialsSection) testimonialsSection.style.display = 'none';
    }
  }

  // Load testimonials on page load
  loadTestimonials();

  // Also load timeline, services dynamically if they exist
  function loadTimeline() {
    const timelineContainer = document.querySelector('.timeline-container');
    if (!timelineContainer) return;

    try {
      const portfolioData = localStorage.getItem('portfolioData');
      if (!portfolioData) {
        // Keep original HTML content if no data
        return;
      }

      const data = JSON.parse(portfolioData);
      const timeline = data.timeline || [];

      // Only replace content if there are actual timeline items from admin
      // Check if timeline container already has data-attribute to know if it's been loaded before
      const hasExistingContent = timelineContainer.querySelector('.timeline-item');
      
      if (timeline.length === 0) {
        // If there's existing HTML content, keep it
        // Only clear if this was previously loaded dynamically
        if (timelineContainer.dataset.loaded === 'true') {
          timelineContainer.innerHTML = '';
        }
        return;
      }

      // Mark that we're loading dynamically
      timelineContainer.dataset.loaded = 'true';
      timelineContainer.innerHTML = '';
      timeline.forEach(item => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.innerHTML = `
          <div class="timeline-date">${item.date || ''}</div>
          <h3>${item.title || ''}</h3>
          ${item.subtitle ? `<p class="muted">${item.subtitle}</p>` : ''}
          <p>${item.description || ''}</p>
        `;
        timelineContainer.appendChild(timelineItem);
      });
    } catch (error) {
      console.error('Error loading timeline:', error);
      // On error, keep original content
    }
  }

  function loadServices() {
    const servicesGrid = document.querySelector('#services-section .grid');
    if (!servicesGrid) return;

    try {
      const portfolioData = localStorage.getItem('portfolioData');
      if (!portfolioData) {
        // Keep original HTML content if no data
        return;
      }

      const data = JSON.parse(portfolioData);
      const services = data.services || [];

      // Only replace content if there are actual services from admin
      const hasExistingContent = servicesGrid.querySelector('.service-card');

      if (services.length === 0) {
        // If there's existing HTML content, keep it
        // Only clear if this was previously loaded dynamically
        if (servicesGrid.dataset.loaded === 'true') {
          servicesGrid.innerHTML = '';
        }
        return;
      }

      // Mark that we're loading dynamically
      servicesGrid.dataset.loaded = 'true';
      servicesGrid.innerHTML = '';
      services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'card service-card';
        serviceCard.innerHTML = `
          <span class="service-icon">${service.icon || '💼'}</span>
          <h3>${service.title || ''}</h3>
          <p class="muted">${service.description || ''}</p>
          ${service.features && service.features.length > 0 ? `
            <ul style="text-align: left; margin-top: 16px; font-size: 14px;">
              ${service.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
          ` : ''}
        `;
        servicesGrid.appendChild(serviceCard);
      });
    } catch (error) {
      console.error('Error loading services:', error);
      // On error, keep original content
    }
  }

  // Load certifications
  function loadCertifications() {
    const certificationsContainer = document.getElementById('certifications-container');
    const certificationsSection = document.getElementById('certifications-section');
    const certificationsEmpty = document.getElementById('certifications-empty');
    
    if (!certificationsContainer) return;

    try {
      const portfolioData = localStorage.getItem('portfolioData');
      if (!portfolioData) {
        // Keep section visible by default, just hide empty message
        if (certificationsSection) certificationsSection.style.display = 'block';
        if (certificationsEmpty) certificationsEmpty.style.display = 'none';
        return;
      }

      const data = JSON.parse(portfolioData);
      const certifications = data.certifications || [];

      if (certifications.length === 0) {
        // Show section with empty message
        if (certificationsSection) certificationsSection.style.display = 'block';
        if (certificationsEmpty) certificationsEmpty.style.display = 'block';
        // Don't clear container if it has default content
        return;
      }

      // Show section and hide empty message
      if (certificationsSection) certificationsSection.style.display = 'block';
      if (certificationsEmpty) certificationsEmpty.style.display = 'none';
      certificationsContainer.innerHTML = '';

      certifications.forEach(cert => {
        const card = document.createElement('div');
        card.className = 'card cert-card';
        card.innerHTML = `
          ${cert.image ? `<img src="${cert.image}" alt="${cert.name}" class="cert-image" />` : '<div class="cert-image" style="background: var(--line); display: flex; align-items: center; justify-content: center; font-size: 48px;">🏆</div>'}
          <div class="cert-name">${cert.name || ''}</div>
          <div class="cert-issuer">${cert.issuer || ''}</div>
          ${cert.date ? `<div class="cert-date">${cert.date}</div>` : ''}
          ${cert.url ? `<a href="${cert.url}" target="_blank" class="btn secondary" style="margin-top: 12px; font-size: 12px;">Voir la certification</a>` : ''}
        `;
        certificationsContainer.appendChild(card);
      });
    } catch (error) {
      console.error('Error loading certifications:', error);
      // On error, show section anyway
      if (certificationsSection) certificationsSection.style.display = 'block';
    }
  }

  // Load FAQ
  function loadFAQ() {
    const faqContainer = document.getElementById('faq-container');
    const faqSection = document.getElementById('faq-section');
    
    if (!faqContainer) return;

    try {
      const portfolioData = localStorage.getItem('portfolioData');
      if (!portfolioData) {
        if (faqSection) faqSection.style.display = 'none';
        return;
      }

      const data = JSON.parse(portfolioData);
      const faqs = data.faq || [];

      if (faqs.length === 0) {
        if (faqSection) faqSection.style.display = 'none';
        return;
      }

      if (faqSection) faqSection.style.display = 'block';
      faqContainer.innerHTML = '';

      faqs.forEach((faq, index) => {
        const faqItem = document.createElement('div');
        faqItem.className = 'faq-item';
        faqItem.innerHTML = `
          <div class="faq-question">${faq.question || ''}</div>
          <div class="faq-answer">${faq.answer || ''}</div>
        `;
        
        faqItem.querySelector('.faq-question').addEventListener('click', () => {
          const isActive = faqItem.classList.contains('active');
          document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
          if (!isActive) faqItem.classList.add('active');
        });
        
        faqContainer.appendChild(faqItem);
      });
    } catch (error) {
      console.error('Error loading FAQ:', error);
      if (faqSection) faqSection.style.display = 'none';
    }
  }

  // Load Personal Information
  function loadPersonalInfo() {
    try {
      // Run migration before loading
      migrateOldPaths();
      
      const portfolioData = localStorage.getItem('portfolioData');
      if (!portfolioData) return;

      const data = JSON.parse(portfolioData);
      if (!data.personal) return;

      // Update hero section name
      const heroName = document.querySelector('.hero h1');
      if (heroName && data.personal.fullName) {
        heroName.textContent = data.personal.fullName;
      }

      // Update hero description
      const heroDesc = document.querySelector('.hero p');
      if (heroDesc && data.about && data.about.heroDescription) {
        heroDesc.textContent = data.about.heroDescription;
      }

      // Update profile photo - try multiple selectors
      let profilePhotos = document.querySelectorAll('.avatar');
      if (profilePhotos.length === 0) {
        // Try alternative selector for about page
        profilePhotos = document.querySelectorAll('img[alt*="Photo de"]');
      }
      if (profilePhotos.length === 0) {
        // Try any img in hero section
        profilePhotos = document.querySelectorAll('.hero img');
      }
      
      console.log('📸 Recherche de photos de profil:', {
        photoData: data.personal.photo,
        foundPhotos: profilePhotos.length,
        selectors: ['.avatar', 'img[alt*="Photo de"]', '.hero img']
      });
      
      if (data.personal.photo && profilePhotos.length > 0) {
        const photoSrc = data.personal.photo.trim();
        if (!photoSrc) {
          console.log('⚠️ Photo source vide');
          return;
        }
        
        console.log('✅ Mise à jour de la photo:', photoSrc);
        
        profilePhotos.forEach((img) => {
          // Update all profile photos
          img.alt = `Photo de ${data.personal.fullName || 'Nema Elisée Kourouma'}`;
          
          // Remove lazy loading first
          img.removeAttribute('loading');
          
          // Handle base64 images
          if (photoSrc.startsWith('data:image')) {
            img.src = photoSrc;
          } else {
            // For file paths, ensure they're relative
            const cleanPath = photoSrc.startsWith('/') ? photoSrc.substring(1) : photoSrc;
            img.src = cleanPath;
          }
          
          // Ensure image is visible
          img.style.display = '';
          img.style.visibility = 'visible';
          img.style.opacity = '1';
          
          // Add error handler
          img.onerror = function() {
            console.error('❌ Erreur de chargement de l\'image:', photoSrc);
            // Fallback to default photo
            this.src = 'assets/photo.jpeg';
          };
          
          // Add load handler
          img.onload = function() {
            console.log('✅ Photo chargée avec succès:', photoSrc);
          };
        });
      } else {
        console.log('⚠️ Aucune photo trouvée ou pas de photo dans les données:', {
          hasPhotoData: !!data.personal.photo,
          photosFound: profilePhotos.length
        });
      }

      // Update about section
      const aboutDesc = document.querySelector('section h2 + p');
      if (aboutDesc && data.about && data.about.aboutDescription) {
        aboutDesc.textContent = data.about.aboutDescription;
      }

      // Update footer contact info
      const footerLinks = document.querySelectorAll('.footer a[href^="mailto:"], .footer a[href^="tel:"]');
      footerLinks.forEach(link => {
        if (link.href.startsWith('mailto:') && data.personal.email) {
          link.href = `mailto:${data.personal.email}`;
          link.textContent = data.personal.email;
        }
        if (link.href.startsWith('tel:') && data.personal.phone) {
          link.href = `tel:${data.personal.phone.replace(/\s/g, '')}`;
          link.textContent = data.personal.phone;
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des informations personnelles:', error);
    }
  }

  // Load Skills
  function loadSkills() {
    try {
      const portfolioData = localStorage.getItem('portfolioData');
      if (!portfolioData) return;

      const data = JSON.parse(portfolioData);
      const skills = data.skills || [];

      if (skills.length === 0) return;

      // Find skills section by looking for h2 with "Compétences"
      const allSections = document.querySelectorAll('section');
      let skillsSection = null;
      for (const section of allSections) {
        const h2 = section.querySelector('h2');
        if (h2 && h2.textContent.includes('Compétences')) {
          skillsSection = section;
          break;
        }
      }

      if (!skillsSection) return;

      const skillsGrid = skillsSection.querySelector('.grid');
      if (!skillsGrid) return;

      // Only replace if skills were loaded from admin
      if (skillsGrid.dataset.loaded === 'true' || skills.length > 0) {
        skillsGrid.dataset.loaded = 'true';
        skillsGrid.innerHTML = '';

        skills.forEach(skill => {
          const skillCard = document.createElement('div');
          skillCard.className = 'card skill-card';
          skillCard.innerHTML = `
            <div class="skill-icon">${skill.icon || '💼'}</div>
            <h3>${skill.name || ''}</h3>
            <div class="skill-tags">
              ${(skill.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('')}
            </div>
          `;
          skillsGrid.appendChild(skillCard);
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des compétences:', error);
    }
  }

  // Load Stats
  function loadStats() {
    try {
      const portfolioData = localStorage.getItem('portfolioData');
      if (!portfolioData) {
        console.log('📊 Stats: Aucune donnée portfolio trouvée');
        return;
      }

      const data = JSON.parse(portfolioData);
      if (!data.about || !data.about.stats) {
        console.log('📊 Stats: Aucune statistique trouvée dans les données');
        return;
      }

      const stats = data.about.stats;
      console.log('📊 Stats chargées depuis localStorage:', stats);

      // Update all stat numbers
      const statNumbers = document.querySelectorAll('.stat-number[data-count]');
      console.log(`📊 Trouvé ${statNumbers.length} élément(s) de statistiques dans le DOM`);
      
      statNumbers.forEach((stat, index) => {
        const label = stat.parentElement.querySelector('.stat-label');
        if (!label) {
          console.log(`📊 Stats ${index + 1}: Aucun label trouvé`);
          return;
        }

        const labelText = label.textContent.toLowerCase();
        let newValue = null;
        let statName = '';
        
        if (labelText.includes('projet')) {
          newValue = stats.projects !== undefined && stats.projects !== null ? parseInt(stats.projects) : 0;
          statName = 'projets';
        } else if (labelText.includes('expérience')) {
          newValue = stats.experience !== undefined && stats.experience !== null ? parseFloat(stats.experience) : 0;
          statName = 'expérience';
        } else if (labelText.includes('technologie')) {
          newValue = stats.technologies !== undefined && stats.technologies !== null ? parseInt(stats.technologies) : 0;
          statName = 'technologies';
        }
        
        if (newValue !== null) {
          const oldValue = stat.getAttribute('data-count');
          console.log(`📊 Stats ${index + 1} (${statName}): "${label.textContent}" → ${oldValue} → ${newValue}`);
          stat.setAttribute('data-count', newValue);
          stat.dataset.animated = 'false'; // Allow re-animation
          
          // Set initial value immediately
          stat.textContent = newValue.toString();
          
          // Trigger animation if element is visible and value is greater than 0
          if (stat.offsetParent !== null && newValue > 0) {
            stat.textContent = '0'; // Reset for animation
            setTimeout(() => {
              const target = parseInt(stat.getAttribute('data-count'));
              if (target > 0 && (!stat.dataset.animated || stat.dataset.animated === 'false')) {
                animateCounter(stat, target);
                stat.dataset.animated = 'true';
              }
            }, 100);
          } else {
            // If value is 0, just display it immediately
            stat.textContent = newValue.toString();
            stat.dataset.animated = 'true';
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  }

  // Load Social Links
  function loadSocialLinks() {
    try {
      // Don't add social links on index.html (home page)
      const isIndexPage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
      if (isIndexPage) {
        // Remove any existing WhatsApp and Facebook links from hero section
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
          const linksContainer = heroSection.querySelector('div[style*="display:flex"]');
          if (linksContainer) {
            const whatsappLinks = linksContainer.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]');
            const facebookLinks = linksContainer.querySelectorAll('a[href*="facebook.com"]');
            whatsappLinks.forEach(link => {
              if (link.textContent.includes('WhatsApp') || link.href.includes('wa.me')) {
                link.remove();
              }
            });
            facebookLinks.forEach(link => {
              if (link.textContent.includes('Facebook') || link.href.includes('facebook.com')) {
                link.remove();
              }
            });
          }
        }
        return; // Exit early, don't add social links on index page
      }

      const portfolioData = localStorage.getItem('portfolioData');
      if (!portfolioData) return;

      const data = JSON.parse(portfolioData);
      if (!data.links || !data.links.social) return;

      const socialLinks = data.links.social || [];

      // Update WhatsApp link
      const whatsappLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]');
      const whatsappLink = socialLinks.find(link => link.name.toLowerCase().includes('whatsapp'));
      if (whatsappLink && whatsappLinks.length > 0) {
        whatsappLinks.forEach(link => {
          link.href = whatsappLink.url;
          if (!link.textContent.includes('WhatsApp')) {
            link.textContent = link.textContent.replace(/💬|WhatsApp/g, '').trim() || '💬 WhatsApp';
          }
        });
      }

      // Update Facebook link
      const facebookLinks = document.querySelectorAll('a[href*="facebook.com"]');
      const facebookLink = socialLinks.find(link => link.name.toLowerCase().includes('facebook'));
      if (facebookLink && facebookLinks.length > 0) {
        facebookLinks.forEach(link => {
          link.href = facebookLink.url;
          if (!link.textContent.includes('Facebook')) {
            link.textContent = link.textContent.replace(/📘|Facebook/g, '').trim() || '📘 Facebook';
          }
        });
      }

      // Update LinkedIn link
      const linkedinLinks = document.querySelectorAll('a[href*="linkedin.com"]');
      const linkedinLink = socialLinks.find(link => link.name.toLowerCase().includes('linkedin'));
      if (linkedinLink && linkedinLinks.length > 0) {
        linkedinLinks.forEach(link => {
          link.href = linkedinLink.url;
        });
      }

      // Update GitHub link
      const githubLinks = document.querySelectorAll('a[href*="github.com"]');
      const githubLink = socialLinks.find(link => link.name.toLowerCase().includes('github'));
      if (githubLink && githubLinks.length > 0) {
        githubLinks.forEach(link => {
          link.href = githubLink.url;
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des liens sociaux:', error);
    }
  }

  // Load timeline, services, certifications and FAQ
  loadTimeline();
  loadServices();
  loadCertifications();
  loadFAQ();
  loadPersonalInfo();
  loadSkills();
  loadStats();
  loadSocialLinks();
  
  // Load about page specific content
  function loadAboutPageContent() {
    // Only run on about.html
    if (!window.location.pathname.includes('about.html')) return;
    
    try {
      const portfolioData = localStorage.getItem('portfolioData');
      if (!portfolioData) {
        console.log('⚠️ Aucune donnée portfolio trouvée pour la page À propos');
        return;
      }
      
      const data = JSON.parse(portfolioData);
      console.log('📊 Données chargées pour la page À propos:', {
        hasTimeline: !!(data.timeline && data.timeline.length > 0),
        timelineCount: data.timeline ? data.timeline.length : 0,
        timeline: data.timeline
      });
      
      // Load hero description
      const heroDesc = document.getElementById('about-hero-description');
      if (heroDesc && data.about && data.about.heroDescription) {
        heroDesc.textContent = data.about.heroDescription;
      }
      
      // Load about description
      const aboutDesc = document.getElementById('about-description-content');
      if (aboutDesc && data.about && data.about.aboutDescription) {
        aboutDesc.innerHTML = `<p>${data.about.aboutDescription.replace(/\n/g, '</p><p>')}</p>`;
      }
      
      // Load name and title
      const aboutName = document.getElementById('about-name');
      const aboutTitle = document.getElementById('about-title');
      if (data.personal) {
        if (aboutName && data.personal.fullName) {
          aboutName.textContent = data.personal.fullName;
        }
        if (aboutTitle && data.personal.title) {
          aboutTitle.textContent = data.personal.title;
        } else if (aboutTitle && data.personal.jobTitle) {
          aboutTitle.textContent = data.personal.jobTitle;
        }
      }
      
      // Load timeline specifically for about page
      const aboutTimeline = document.getElementById('about-timeline');
      if (aboutTimeline) {
        console.log('🎯 Conteneur timeline trouvé:', aboutTimeline);
        
        if (data.timeline && Array.isArray(data.timeline) && data.timeline.length > 0) {
          console.log('✅ Chargement de la timeline depuis localStorage:', data.timeline.length, 'élément(s)');
          aboutTimeline.innerHTML = '';
          
          data.timeline.forEach((item, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.style.opacity = '0';
            timelineItem.style.transform = 'translateY(20px)';
            timelineItem.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
            timelineItem.innerHTML = `
              <div class="timeline-date">${item.date || ''}</div>
              <h3>${item.title || ''}</h3>
              ${item.subtitle ? `<p class="muted">${item.subtitle}</p>` : ''}
              <p>${item.description || ''}</p>
            `;
            aboutTimeline.appendChild(timelineItem);
            
            // Trigger animation
            setTimeout(() => {
              timelineItem.style.opacity = '1';
              timelineItem.style.transform = 'translateY(0)';
            }, 100 + index * 100);
          });
        } else {
          console.log('⚠️ Aucune donnée timeline trouvée, utilisation du contenu par défaut');
          // Default timeline content if no data
          aboutTimeline.innerHTML = `
            <div class="timeline-item" style="opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease;">
              <div class="timeline-date">2025 - Présent</div>
              <h3>Master 1 en Intelligence Artificielle</h3>
              <p class="muted">École Supérieure d'Informatique de Paris (SUPINFO)</p>
              <p>Spécialisation en IA, Machine Learning et traitement du langage naturel. Réalisation de projets majeurs incluant SUPFile (plateforme cloud) et Kairos (assistant pédagogique IA).</p>
            </div>
            <div class="timeline-item" style="opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s;">
              <div class="timeline-date">2021 - 2024</div>
              <h3>Licence en Mathématiques et Informatique</h3>
              <p class="muted">Université Sidi Mohamed Ben Abdellah, Fès</p>
              <p>Formation solide en mathématiques appliquées et informatique fondamentale. Acquisition de compétences en algorithmique, structures de données et développement logiciel.</p>
            </div>
          `;
          
          // Animate default items
          setTimeout(() => {
            const items = aboutTimeline.querySelectorAll('.timeline-item');
            items.forEach((item, index) => {
              setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
              }, index * 100);
            });
          }, 100);
        }
      } else {
        console.error('❌ Conteneur timeline non trouvé: #about-timeline');
      }
      
      // Load skills specifically for about page
      const aboutSkills = document.getElementById('about-skills');
      if (aboutSkills) {
        console.log('🎯 Conteneur skills trouvé:', aboutSkills);
        console.log('📊 Données skills:', data.skills);
        
        if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
          console.log('✅ Chargement des compétences depuis localStorage:', data.skills.length, 'catégorie(s)');
          aboutSkills.innerHTML = '';
          
          data.skills.forEach((skill, index) => {
            const skillCard = document.createElement('div');
            skillCard.className = 'card skill-card';
            skillCard.style.opacity = '0';
            skillCard.style.transform = 'translateY(20px)';
            skillCard.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
            
            // Support both 'skills' and 'items' for backward compatibility
            const skillItems = skill.skills || skill.items || [];
            
            skillCard.innerHTML = `
              <div class="skill-icon" style="font-size: 48px; margin-bottom: 16px;">${skill.icon || '💻'}</div>
              <h3 style="margin-bottom: 16px;">${skill.name || ''}</h3>
              <div class="skill-tags" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
                ${skillItems.map(item => `<span class="skill-tag" style="padding: 6px 12px; background: rgba(91, 124, 250, 0.1); color: var(--accent); border: 1px solid rgba(91, 124, 250, 0.3); border-radius: 20px; font-size: 13px;">${item}</span>`).join('')}
              </div>
            `;
            aboutSkills.appendChild(skillCard);
            
            // Trigger animation
            setTimeout(() => {
              skillCard.style.opacity = '1';
              skillCard.style.transform = 'translateY(0)';
            }, 100 + index * 100);
          });
        } else {
          console.log('⚠️ Aucune donnée skills trouvée dans localStorage');
          // Don't hide, show default message or empty state
          aboutSkills.innerHTML = '<p class="muted" style="text-align: center; padding: 40px;">Aucune compétence ajoutée pour le moment.</p>';
        }
      } else {
        console.error('❌ Conteneur skills non trouvé: #about-skills');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du contenu de la page À propos:', error);
    }
  }
  loadAboutPageContent();
  
  // Listen for stats updates from admin or storage events
  window.addEventListener('storage', (e) => {
    if (e.key === 'portfolioData' || e.key === 'portfolioLastUpdate') {
      console.log('📥 Événement de stockage reçu - rechargement des statistiques...');
      setTimeout(() => {
        loadStats();
        loadAboutPageContent();
      }, 100);
    }
  });
  
  window.addEventListener('portfolioDataUpdated', (e) => {
    if (e.detail && (e.detail.stats || e.detail.about)) {
      console.log('📥 Événement personnalisé reçu - rechargement des statistiques...', e.detail);
      setTimeout(() => {
        loadStats();
        loadAboutPageContent();
      }, 100);
    }
  });

  // Update meta tags dynamically from admin data
  function updateMetaTags() {
    try {
      const portfolioData = localStorage.getItem('portfolioData');
      if (!portfolioData) return;

      const data = JSON.parse(portfolioData);
      if (data.settings) {
        // Update title
        if (data.settings.metaTitle) {
          document.title = data.settings.metaTitle;
          
          // Update Open Graph title
          let ogTitle = document.querySelector('meta[property="og:title"]');
          if (!ogTitle) {
            ogTitle = document.createElement('meta');
            ogTitle.setAttribute('property', 'og:title');
            document.head.appendChild(ogTitle);
          }
          ogTitle.content = data.settings.metaTitle;
        }

        // Update description
        if (data.settings.metaDescription) {
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
          }
          metaDesc.content = data.settings.metaDescription;
          
          // Update Open Graph description
          let ogDesc = document.querySelector('meta[property="og:description"]');
          if (!ogDesc) {
            ogDesc = document.createElement('meta');
            ogDesc.setAttribute('property', 'og:description');
            document.head.appendChild(ogDesc);
          }
          ogDesc.content = data.settings.metaDescription;
        }

        // Update keywords
        if (data.settings.metaKeywords) {
          let metaKeywords = document.querySelector('meta[name="keywords"]');
          if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
          }
          metaKeywords.content = data.settings.metaKeywords;
        }

        // Update Open Graph URL
        let ogUrl = document.querySelector('meta[property="og:url"]');
        if (!ogUrl) {
          ogUrl = document.createElement('meta');
          ogUrl.setAttribute('property', 'og:url');
          document.head.appendChild(ogUrl);
        }
        ogUrl.content = window.location.href;
      }
    } catch (error) {
      console.error('Error updating meta tags:', error);
    }
  }

  updateMetaTags();

  // Add reading progress indicator
  const readingProgress = document.createElement('div');
  readingProgress.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#93a5ff,#5b7cfa);z-index:1000;transition:width 0.1s;width:0%';
  document.body.appendChild(readingProgress);

  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    readingProgress.style.width = scrolled + '%';
  }, { passive: true });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Lazy loading images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
  }

  // Add loading states to buttons
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitBtn && !submitBtn.disabled) {
        const originalText = submitBtn.textContent || submitBtn.value;
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
        submitBtn.textContent = submitBtn.textContent ? 'Envoi en cours...' : submitBtn.value;
        submitBtn.value = submitBtn.value ? 'Envoi en cours...' : submitBtn.value;
        
        // Reset after 5 seconds if form doesn't redirect
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.textContent = originalText;
          submitBtn.value = originalText;
        }, 5000);
      }
    });
  });

  // Add copy to clipboard functionality for email/phone
  document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', function(e) {
      if (navigator.clipboard && e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const text = this.href.replace(/^(mailto:|tel:)/, '');
        navigator.clipboard.writeText(text).then(() => {
          const originalText = this.textContent;
          this.textContent = '✓ Copié !';
          setTimeout(() => {
            this.textContent = originalText;
          }, 2000);
        });
      }
    });
  });

  // Enhanced keyboard shortcuts and navigation
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus search (global search)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      // Try project search first
      const projectSearch = document.getElementById('project-search');
      if (projectSearch) {
        projectSearch.focus();
        return;
      }
      // Try global search
      const globalSearch = document.getElementById('global-search');
      if (globalSearch) {
        globalSearch.focus();
      }
    }
    // Escape to close mobile menu, modals, lightbox
    if (e.key === 'Escape') {
      // Close mobile menu
      if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
        if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
      // Close lightbox
      const lightbox = document.querySelector('.lightbox');
      if (lightbox && lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
      // Close any modals
      const activeModal = document.querySelector('[style*="display: block"]');
      if (activeModal && activeModal.classList.contains('modal')) {
        activeModal.style.display = 'none';
      }
    }
    // Alt + H to go to home
    if (e.altKey && e.key === 'h') {
      e.preventDefault();
      window.location.href = '/';
    }
    // Alt + P to go to projects
    if (e.altKey && e.key === 'p') {
      e.preventDefault();
      window.location.href = 'projects.html';
    }
    // Alt + C to go to contact
    if (e.altKey && e.key === 'c') {
      e.preventDefault();
      window.location.href = 'contact.html';
    }
  });

  // Add touch gestures for mobile (swipe to close menu)
  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    if (navLinks && navLinks.classList.contains('active') && touchEndX < touchStartX - 50) {
      navLinks.classList.remove('active');
      if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
      if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }, { passive: true });

  // Performance: Debounce scroll events
  let ticking = false;
  function updateOnScroll() {
    ticking = false;
    // Scroll-dependent updates here
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  }, { passive: true });

  // Toast Notification System
  function createToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  window.showToast = function(message, type = 'info', duration = 3000) {
    const container = createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠'
    };
    
    toast.innerHTML = `
      <span style="font-size: 20px;">${icons[type] || icons.info}</span>
      <span style="flex: 1;">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // Add CSS for slideOut animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideOut {
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Viewport height fix for mobile
  function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  setViewportHeight();
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', setViewportHeight);
});

