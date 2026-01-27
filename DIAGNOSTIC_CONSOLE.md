# 🔍 Commandes de Diagnostic Console

## Commande 1 : Voir les détails des overlays sombres détectés
```javascript
Array.from(document.querySelectorAll('*')).filter(el => {
  const style = window.getComputedStyle(el);
  const bg = style.backgroundColor || style.background || '';
  return style.position === 'fixed' && 
         (bg.toLowerCase().includes('rgba(0') || bg.toLowerCase().includes('rgb(0') || 
          bg.toLowerCase().includes('#000') || bg.toLowerCase().includes('#0a0a0f'));
}).map(el => {
  const style = window.getComputedStyle(el);
  return {
    element: el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ')[0] : ''),
    zIndex: style.zIndex,
    background: bg,
    display: style.display,
    opacity: style.opacity,
    visibility: style.visibility,
    pointerEvents: style.pointerEvents
  };
})
```

## Commande 2 : Voir les détails de l'élément fixed avec z-index > 100
```javascript
Array.from(document.querySelectorAll('*')).filter(el => {
  const style = window.getComputedStyle(el);
  const zIndex = parseInt(style.zIndex);
  return style.position === 'fixed' && !isNaN(zIndex) && zIndex > 100;
}).map(el => {
  const style = window.getComputedStyle(el);
  return {
    tag: el.tagName,
    id: el.id,
    class: el.className,
    zIndex: style.zIndex,
    background: style.background || style.backgroundColor,
    display: style.display,
    opacity: style.opacity,
    visibility: style.visibility
  };
})
```

## Commande 3 : Vérifier si on est sur mobile (largeur < 768px)
```javascript
console.log({
  isMobile: window.innerWidth <= 768,
  width: window.innerWidth,
  height: window.innerHeight,
  userAgent: navigator.userAgent
});
```

## Commande 4 : Vérifier le body background sur mobile
```javascript
const bodyStyle = window.getComputedStyle(document.body);
const isMobile = window.innerWidth <= 768;
console.log({
  isMobile: isMobile,
  backgroundAttachment: bodyStyle.backgroundAttachment,
  background: bodyStyle.background.substring(0, 100) + '...',
  backgroundColor: bodyStyle.backgroundColor,
  hasGradients: bodyStyle.backgroundImage.includes('gradient')
});
```

## Commande 5 : Diagnostic complet amélioré (tout-en-un)
```javascript
(function() {
  console.clear();
  console.log('🔍 DIAGNOSTIC COMPLET - Problèmes potentiels d\'overlay mobile\n');
  
  const isMobile = window.innerWidth <= 768;
  console.log('📱 Mode:', isMobile ? 'MOBILE' : 'DESKTOP', `(${window.innerWidth}x${window.innerHeight})`);
  
  // 1. Éléments fixed avec z-index élevé
  const fixedHighZ = Array.from(document.querySelectorAll('*')).filter(el => {
    const style = window.getComputedStyle(el);
    const zIndex = parseInt(style.zIndex);
    return style.position === 'fixed' && !isNaN(zIndex) && zIndex > 100;
  });
  
  if (fixedHighZ.length > 0) {
    console.log('\n⚠️ Éléments position:fixed avec z-index > 100:');
    fixedHighZ.forEach(el => {
      const style = window.getComputedStyle(el);
      console.log({
        tag: el.tagName,
        id: el.id || '(pas d\'id)',
        class: el.className || '(pas de class)',
        zIndex: style.zIndex,
        background: (style.background || style.backgroundColor || 'transparent').substring(0, 80),
        display: style.display,
        opacity: style.opacity,
        visibility: style.visibility
      });
    });
  } else {
    console.log('\n✅ Aucun élément fixed avec z-index > 100');
  }
  
  // 2. Body background
  const bodyStyle = window.getComputedStyle(document.body);
  console.log('\n📋 Body styles:');
  console.log({
    backgroundAttachment: bodyStyle.backgroundAttachment,
    hasGradients: bodyStyle.backgroundImage.includes('gradient'),
    backgroundColor: bodyStyle.backgroundColor
  });
  
  if (isMobile && bodyStyle.backgroundAttachment === 'fixed') {
    console.log('❌ PROBLÈME: Body a background-attachment: fixed sur mobile !');
  }
  
  // 3. Main visibility
  const main = document.querySelector('main');
  if (main) {
    const mainStyle = window.getComputedStyle(main);
    console.log('\n📄 Main element:');
    console.log({
      display: mainStyle.display,
      opacity: mainStyle.opacity,
      visibility: mainStyle.visibility,
      zIndex: mainStyle.zIndex,
      position: mainStyle.position
    });
    
    if (mainStyle.display === 'none' || mainStyle.opacity === '0') {
      console.log('❌ PROBLÈME: <main> est caché !');
    } else {
      console.log('✅ <main> est visible');
    }
  } else {
    console.log('❌ Aucun élément <main> trouvé');
  }
  
  // 4. Overlays sombres
  const darkOverlays = Array.from(document.querySelectorAll('*')).filter(el => {
    const style = window.getComputedStyle(el);
    const bg = (style.backgroundColor || style.background || '').toLowerCase();
    return style.position === 'fixed' && 
           (bg.includes('rgba(0') || bg.includes('rgb(0') || 
            bg.includes('#000') || bg.includes('#0a0a0f'));
  });
  
  if (darkOverlays.length > 0) {
    console.log('\n⚠️ Overlays sombres détectés:');
    darkOverlays.forEach(el => {
      const style = window.getComputedStyle(el);
      console.log({
        tag: el.tagName,
        id: el.id || '(pas d\'id)',
        class: el.className || '(pas de class)',
        zIndex: style.zIndex,
        background: (style.background || style.backgroundColor || '').substring(0, 80),
        display: style.display,
        opacity: style.opacity,
        visibility: style.visibility,
        pointerEvents: style.pointerEvents
      });
    });
  } else {
    console.log('\n✅ Aucun overlay sombre détecté');
  }
  
  // 5. Vérifier les media queries appliquées
  if (isMobile) {
    console.log('\n📱 Vérification mobile:');
    const bodyBg = bodyStyle.background;
    if (bodyBg.includes('gradient')) {
      console.log('⚠️ Body a encore des gradients sur mobile (devrait être simplifié)');
    } else {
      console.log('✅ Body background simplifié sur mobile');
    }
  }
  
  console.log('\n✅ Diagnostic terminé');
})();
```

## Utilisation

1. Ouvrez la console (F12 → Console)
2. Collez la **Commande 5** (diagnostic complet)
3. Appuyez sur Entrée
4. Développez les objets `[{…}]` en cliquant dessus pour voir les détails

## Interprétation des résultats

- **Éléments fixed avec z-index > 100** : Peuvent créer des overlays
- **Overlays sombres** : Éléments avec fond noir qui peuvent masquer le contenu
- **Body background-attachment: fixed sur mobile** : Problème connu sur Chrome Android
- **Main caché** : Le contenu principal est invisible
