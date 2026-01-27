// FIX MOBILE ULTIME - Compatible avec tous les navigateurs (y compris Phoenix)
// Ce script doit être chargé dans le <head> avant le CSS

(function() {
  'use strict';
  
  console.log('🚀 FIX MOBILE: Script inline démarré');
  
  // Détection mobile robuste avec plusieurs fallbacks pour navigateurs moins standards
  function detectMobile() {
    // Méthode 1: matchMedia (le plus fiable)
    try {
      if (window.matchMedia && window.matchMedia('(max-width: 1024px)').matches) {
        return true;
      }
    } catch(e) {
      console.log('⚠️ matchMedia non supporté, utilisation fallback');
    }
    
    // Méthode 2: Viewport width
    const viewportWidth = document.documentElement.clientWidth || 
                         (document.body ? document.body.clientWidth : 0) || 
                         window.innerWidth;
    if (viewportWidth <= 1024) {
      return true;
    }
    
    // Méthode 3: User agent (fallback ultime)
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua.toLowerCase())) {
      return true;
    }
    
    return false;
  }
  
  const isMobile = detectMobile();
  const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
  console.log('📱 Détection mobile:', isMobile, 'Viewport:', viewportWidth, 'Window:', window.innerWidth);
  
  if (isMobile) {
    // SOLUTION RADICALE : Injecter un style tag dans le head AVANT que le CSS ne charge
    // Compatible avec tous les navigateurs (y compris Phoenix)
    try {
      const styleTag = document.createElement('style');
      styleTag.id = 'mobile-fix-inline';
      styleTag.setAttribute('type', 'text/css');
      // CSS minifié pour compatibilité maximale
      const cssRules = 'body::before,body.no-before-pseudo::before,html body::before,html body.no-before-pseudo::before{content:none!important;display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;position:absolute!important;width:0!important;height:0!important;z-index:-9999!important;background:none!important;background-image:none!important;background-color:transparent!important;transform:scale(0)!important;overflow:hidden!important}@media (max-width:1024px){body::before,body.no-before-pseudo::before,html body::before,html body.no-before-pseudo::before{content:none!important;display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;position:absolute!important;width:0!important;height:0!important;z-index:-9999!important;background:none!important;background-image:none!important;background-color:transparent!important;transform:scale(0)!important;overflow:hidden!important}';
      
      // Utiliser textContent (plus compatible que innerHTML)
      if (styleTag.styleSheet) {
        // IE8 et anciens navigateurs
        styleTag.styleSheet.cssText = cssRules;
      } else {
        styleTag.textContent = cssRules;
      }
      
      // Insérer dans le head (compatible avec tous les navigateurs)
      const head = document.head || document.getElementsByTagName('head')[0];
      if (head) {
        head.insertBefore(styleTag, head.firstChild);
        console.log('✅ Style tag injecté dans head pour forcer body::before à être supprimé');
      } else {
        // Fallback si head n'existe pas encore
        if (document.addEventListener) {
          document.addEventListener('DOMContentLoaded', function() {
            const h = document.head || document.getElementsByTagName('head')[0];
            if (h) h.insertBefore(styleTag, h.firstChild);
          });
        } else if (document.attachEvent) {
          // IE8
          document.attachEvent('onreadystatechange', function() {
            if (document.readyState === 'complete') {
              const h = document.head || document.getElementsByTagName('head')[0];
              if (h) h.insertBefore(styleTag, h.firstChild);
            }
          });
        }
      }
    } catch(e) {
      console.error('❌ Erreur injection style tag:', e);
    }
    
    // Attendre que le body existe, puis appliquer immédiatement
    function applyMobileFix() {
      if (document.body) {
        console.log('✅ Body trouvé, application du fix mobile...');
        
        // Ajouter la classe pour désactiver body::before (compatible avec tous les navigateurs)
        if (document.body.classList) {
          document.body.classList.add('no-before-pseudo');
        } else {
          // Fallback pour navigateurs anciens
          document.body.className += ' no-before-pseudo';
        }
        
        // Forcer les styles inline immédiatement (méthode compatible)
        try {
          document.body.style.setProperty('background', '#0a0a0f', 'important');
          document.body.style.setProperty('background-image', 'none', 'important');
          document.body.style.setProperty('background-attachment', 'scroll', 'important');
          document.body.style.setProperty('background-color', '#0a0a0f', 'important');
        } catch(e) {
          // Fallback pour navigateurs qui ne supportent pas setProperty
          document.body.style.background = '#0a0a0f';
          document.body.style.backgroundImage = 'none';
          document.body.style.backgroundAttachment = 'scroll';
          document.body.style.backgroundColor = '#0a0a0f';
        }
        
        // Forcer aussi le html
        try {
          document.documentElement.style.setProperty('background', '#0a0a0f', 'important');
          document.documentElement.style.setProperty('background-image', 'none', 'important');
          document.documentElement.style.setProperty('background-attachment', 'scroll', 'important');
        } catch(e) {
          document.documentElement.style.background = '#0a0a0f';
          document.documentElement.style.backgroundImage = 'none';
          document.documentElement.style.backgroundAttachment = 'scroll';
        }
        
        // Désactiver l'overlay
        const overlay = document.getElementById('mobile-menu-overlay');
        if (overlay) {
          try {
            overlay.style.setProperty('background', 'transparent', 'important');
            overlay.style.setProperty('backdrop-filter', 'none', 'important');
            overlay.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
          } catch(e) {
            overlay.style.background = 'transparent';
            overlay.style.backdropFilter = 'none';
            overlay.style.webkitBackdropFilter = 'none';
          }
          console.log('✅ Overlay désactivé');
        }
        
        // Désactiver .noise
        const noise = document.querySelector('.noise');
        if (noise) {
          try {
            noise.style.setProperty('display', 'none', 'important');
          } catch(e) {
            noise.style.display = 'none';
          }
          console.log('✅ Noise désactivé');
        }
        
        console.log('✅ Fix mobile appliqué avec succès!', {
          hasClass: document.body.className.indexOf('no-before-pseudo') !== -1,
          bodyBg: document.body.style.background || document.body.style.backgroundColor
        });
        
        return true; // Body trouvé et fix appliqué
      }
      return false;
    }
    
    // Essayer immédiatement (si le body existe déjà)
    if (!applyMobileFix()) {
      console.log('⏳ Body pas encore créé, attente...');
      
      // Utiliser MutationObserver si disponible (navigateurs modernes)
      if (window.MutationObserver) {
        try {
          const observer = new MutationObserver(function(mutations, obs) {
            if (applyMobileFix()) {
              obs.disconnect();
            }
          });
          observer.observe(document.documentElement, {
            childList: true,
            subtree: true
          });
          
          // Timeout de sécurité
          setTimeout(function() {
            applyMobileFix();
            if (observer) observer.disconnect();
          }, 100);
        } catch(e) {
          console.log('⚠️ MutationObserver non supporté, utilisation fallback');
        }
      }
      
      // Fallback pour navigateurs anciens (Phoenix, etc.) : utiliser plusieurs timeouts
      var attempts = 0;
      var maxAttempts = 20; // 2 secondes max
      var interval = setInterval(function() {
        attempts++;
        if (applyMobileFix() || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 100);
      
      // Aussi au chargement complet (compatible avec tous les navigateurs)
      if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', applyMobileFix);
        window.addEventListener('load', applyMobileFix);
      } else if (document.attachEvent) {
        // IE8
        document.attachEvent('onreadystatechange', function() {
          if (document.readyState === 'complete') {
            applyMobileFix();
          }
        });
        window.attachEvent('onload', applyMobileFix);
      }
    }
  } else {
    console.log('🖥️ Desktop détecté, fix mobile ignoré');
  }
})();
