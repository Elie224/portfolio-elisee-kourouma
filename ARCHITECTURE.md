# 🏗️ Architecture du Déploiement

## 📊 Vue d'ensemble

Votre portfolio est divisé en **2 parties distinctes** qui doivent être hébergées séparément :

```
┌─────────────────────────────────────────────────────────┐
│                    UTILISATEUR                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  elisee-kourouma.fr   │  ← Frontend (Netlify)
         │  (Site statique)      │
         └───────────┬───────────┘
                     │
                     │ Requêtes API
                     ▼
         ┌───────────────────────┐
         │  Backend API          │  ← Backend (Railway)
         │  (Node.js/Express)     │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  MongoDB Atlas        │  ← Base de données
         │  (Cloud Database)     │
         └───────────────────────┘
```

---

## 🎨 Frontend (Netlify)

### Ce qui est hébergé sur Netlify :
- ✅ Tous les fichiers HTML (`index.html`, `about.html`, etc.)
- ✅ Tous les fichiers CSS (`assets/css/`)
- ✅ Tous les fichiers JavaScript (`assets/js/`)
- ✅ Toutes les images (`assets/photo.jpeg`, etc.)
- ✅ Tous les fichiers statiques

### Pourquoi Netlify ?
- ✅ **Gratuit** (100GB/mois)
- ✅ **CDN global** (rapide partout dans le monde)
- ✅ **SSL automatique** (HTTPS gratuit)
- ✅ **Déploiement automatique** depuis Git
- ✅ **Support domaines personnalisés** (`elisee-kourouma.fr`)
- ✅ **Parfait pour sites statiques**

### Ce que Netlify NE fait PAS :
- ❌ Ne peut pas exécuter Node.js
- ❌ Ne peut pas gérer une base de données
- ❌ Ne peut pas traiter des requêtes API côté serveur

---

## ⚙️ Backend (Railway)

### Ce qui est hébergé sur Railway :
- ✅ Le dossier `server/` (tout le code backend)
- ✅ L'API Node.js/Express
- ✅ Les routes API (`/api/portfolio`)
- ✅ L'authentification admin
- ✅ La gestion des données

### Pourquoi Railway ?
- ✅ **Gratuit** (500 heures/mois)
- ✅ **Support Node.js** natif
- ✅ **Variables d'environnement** faciles
- ✅ **Déploiement automatique** depuis Git
- ✅ **Logs en temps réel**
- ✅ **Redémarrage automatique**

### Ce que Railway NE fait PAS :
- ❌ Ne sert pas les fichiers HTML/CSS/JS
- ❌ N'est pas optimisé pour servir du contenu statique

---

## 🗄️ Base de données (MongoDB Atlas)

### Ce qui est hébergé sur MongoDB Atlas :
- ✅ Toutes vos données (projets, compétences, CV, etc.)
- ✅ Les paramètres (maintenance mode, SEO, etc.)
- ✅ Les messages de contact
- ✅ Les informations admin

### Pourquoi MongoDB Atlas ?
- ✅ **Gratuit** (512MB - suffisant pour un portfolio)
- ✅ **Cloud** (accessible depuis n'importe où)
- ✅ **Sécurisé** (chiffrement, authentification)
- ✅ **Backup automatique**

---

## 🔄 Comment ça fonctionne ensemble ?

### 1. L'utilisateur visite `elisee-kourouma.fr`
   - Netlify sert les fichiers HTML/CSS/JS
   - Le site se charge dans le navigateur

### 2. Le JavaScript charge les données
   - `portfolio.js` fait une requête vers l'API backend
   - Exemple : `fetch('https://votre-backend.railway.app/api/portfolio')`

### 3. Le backend traite la requête
   - Railway reçoit la requête
   - Le serveur Node.js interroge MongoDB Atlas
   - Les données sont renvoyées au frontend

### 4. Le frontend affiche les données
   - Le JavaScript reçoit les données
   - Le site se met à jour avec le contenu

---

## 📝 Exemple Concret

### Quand vous visitez `elisee-kourouma.fr` :

1. **Netlify** sert `index.html`
2. Le navigateur charge `portfolio.js`
3. `portfolio.js` fait : 
   ```javascript
   fetch('https://votre-backend.railway.app/api/portfolio')
   ```
4. **Railway** reçoit la requête
5. Le backend interroge **MongoDB Atlas**
6. Les données reviennent au frontend
7. Le site affiche vos projets, compétences, etc.

---

## 🎯 Pourquoi cette architecture ?

### Avantages :
- ✅ **Séparation des responsabilités** (frontend ≠ backend)
- ✅ **Scalabilité** (chaque partie peut évoluer indépendamment)
- ✅ **Sécurité** (le backend n'est pas exposé directement)
- ✅ **Performance** (CDN pour le frontend, serveur optimisé pour l'API)
- ✅ **Coût** (chaque service a un plan gratuit)

### Alternative (tout sur un seul service) :
- ❌ Plus cher (besoin d'un serveur complet)
- ❌ Moins performant (même serveur pour tout)
- ❌ Plus complexe à gérer

---

## 🔧 Configuration

### Frontend (Netlify)
- Fichier de config : `netlify.toml`
- Domaine : `elisee-kourouma.fr`
- Build : Aucun (site statique)

### Backend (Railway)
- Fichier de config : `server/railway.json`
- Dossier : `server/`
- Variables d'environnement : MongoDB URI, JWT Secret, etc.

### Base de données (MongoDB Atlas)
- Cluster gratuit M0
- Connection string dans les variables d'environnement Railway

---

## 💰 Coûts

| Service | Plan Gratuit | Limites |
|---------|-------------|---------|
| **Netlify** | ✅ Gratuit | 100GB bande passante/mois |
| **Railway** | ✅ Gratuit | 500 heures/mois |
| **MongoDB Atlas** | ✅ Gratuit | 512MB de stockage |

**Total : 0€/mois** (tant que vous restez dans les limites)

---

## 🆘 Questions Fréquentes

### Q: Pourquoi pas tout sur Netlify ?
**R:** Netlify ne peut pas exécuter Node.js. Il sert uniquement des fichiers statiques.

### Q: Pourquoi pas tout sur Railway ?
**R:** Railway peut servir du statique, mais Netlify est gratuit, plus rapide (CDN), et optimisé pour ça.

### Q: Puis-je utiliser un autre service pour le backend ?
**R:** Oui ! Voir `ALTERNATIVES_DEPLOIEMENT.md` pour Fly.io, Cyclic, etc.

### Q: Puis-je utiliser un autre service pour le frontend ?
**R:** Oui ! Vercel, Cloudflare Pages, GitHub Pages fonctionnent aussi.

### Q: Dois-je payer quelque chose ?
**R:** Non, tout est gratuit pour commencer. Vous payerez seulement si vous dépassez les limites.

---

## 📚 Documentation

- `GUIDE_RAPIDE.md` - Guide étape par étape
- `ALTERNATIVES_DEPLOIEMENT.md` - Autres options
- `DEPLOIEMENT.md` - Guide Render (si vous l'utilisez)
