# 📚 Documentation de Déploiement - elisee-kourouma.fr

## 🎯 Par où commencer ?

### Si vous avez accès à Render :
→ Lisez **`DEPLOIEMENT.md`**

### Si vous n'avez PAS accès à Render (recommandé) :
→ Lisez **`GUIDE_RAPIDE.md`** pour un guide étape par étape
→ Consultez **`ALTERNATIVES_DEPLOIEMENT.md`** pour toutes les options disponibles

---

## 📁 Fichiers de Documentation

### `GUIDE_RAPIDE.md` ⭐ COMMENCEZ ICI
Guide étape par étape pour déployer avec **Netlify + Railway** (100% gratuit)
- MongoDB Atlas setup
- Backend sur Railway
- Frontend sur Netlify
- Configuration DNS
- Checklist complète

### `ALTERNATIVES_DEPLOIEMENT.md`
Comparaison détaillée de toutes les options :
- Netlify + Railway (recommandé)
- Vercel + Fly.io
- Cloudflare Pages + Cyclic
- GitHub Pages + Railway
- Avantages/inconvénients de chaque option

### `DEPLOIEMENT.md`
Guide spécifique pour Render (si vous avez accès)

---

## 📦 Fichiers de Configuration Créés

### Frontend
- **`netlify.toml`** - Configuration Netlify (redirections, headers, cache)
- **`vercel.json`** - Configuration Vercel (alternative à Netlify)
- **`static.json`** - Configuration pour services statiques génériques
- **`render.yaml`** - Configuration Render (si vous l'utilisez)

### Backend
- **`server/railway.json`** - Configuration Railway
- **`server/fly.toml`** - Configuration Fly.io
- **`server/Procfile`** - Pour Heroku/Cyclic et autres plateformes

---

## 🚀 Solution Recommandée (Gratuite)

### Netlify (Frontend) + Railway (Backend)

**Pourquoi cette combinaison ?**
- ✅ 100% gratuit pour commencer
- ✅ Facile à configurer
- ✅ SSL automatique
- ✅ Déploiement automatique depuis Git
- ✅ Support des domaines personnalisés
- ✅ Bonne documentation

**Coûts :**
- Netlify : Gratuit (100GB/mois)
- Railway : Gratuit (500 heures/mois)
- MongoDB Atlas : Gratuit (512MB)
- **Total : 0€/mois**

---

## 📋 Checklist Rapide

1. [ ] Lire `GUIDE_RAPIDE.md`
2. [ ] Créer MongoDB Atlas (gratuit)
3. [ ] Déployer backend sur Railway
4. [ ] Mettre à jour les URLs backend dans les fichiers JS
5. [ ] Déployer frontend sur Netlify
6. [ ] Configurer le domaine `elisee-kourouma.fr`
7. [ ] Configurer DNS
8. [ ] Tester tout le site

---

## 🔧 Configuration des URLs Backend

Après avoir déployé votre backend, mettez à jour ces fichiers :

- `assets/js/portfolio.js` (ligne 35)
- `assets/js/admin.js` (ligne 27)
- `assets/js/projects.js` (ligne 11)

Remplacer :
```javascript
: 'https://portfolio-backend-x47u.onrender.com/api';
```

Par votre nouvelle URL backend :
```javascript
: 'https://votre-backend.railway.app/api';
```

---

## 🆘 Besoin d'aide ?

1. Consultez `GUIDE_RAPIDE.md` pour les étapes détaillées
2. Vérifiez la section "Problèmes Courants" dans `GUIDE_RAPIDE.md`
3. Consultez `ALTERNATIVES_DEPLOIEMENT.md` si une option ne fonctionne pas

---

## 📝 Notes Importantes

- Le domaine `elisee-kourouma.fr` est déjà configuré dans tous les fichiers HTML
- Les fichiers JavaScript détectent automatiquement localhost vs production
- MongoDB Atlas est gratuit jusqu'à 512MB (suffisant pour un portfolio)
- Tous les services recommandés offrent un plan gratuit pour commencer
