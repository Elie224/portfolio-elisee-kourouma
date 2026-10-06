# <svg class=emoji-icon aria-hidden=true></svg> Architecture du Déploiement

## <svg class=emoji-icon aria-hidden=true></svg> Vue d'ensemble

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

## <svg class=emoji-icon aria-hidden=true></svg> Frontend (Netlify)

### Ce qui est hébergé sur Netlify :
- <svg class=emoji-icon aria-hidden=true></svg> Tous les fichiers HTML (`index.html`, `about.html`, etc.)
- <svg class=emoji-icon aria-hidden=true></svg> Tous les fichiers CSS (`assets/css/`)
- <svg class=emoji-icon aria-hidden=true></svg> Tous les fichiers JavaScript (`assets/js/`)
- <svg class=emoji-icon aria-hidden=true></svg> Toutes les images (`assets/photo.jpeg`, etc.)
- <svg class=emoji-icon aria-hidden=true></svg> Tous les fichiers statiques

### Pourquoi Netlify ?
- <svg class=emoji-icon aria-hidden=true></svg> **Gratuit** (100GB/mois)
- <svg class=emoji-icon aria-hidden=true></svg> **CDN global** (rapide partout dans le monde)
- <svg class=emoji-icon aria-hidden=true></svg> **SSL automatique** (HTTPS gratuit)
- <svg class=emoji-icon aria-hidden=true></svg> **Déploiement automatique** depuis Git
- <svg class=emoji-icon aria-hidden=true></svg> **Support domaines personnalisés** (`elisee-kourouma.fr`)
- <svg class=emoji-icon aria-hidden=true></svg> **Parfait pour sites statiques**

### Ce que Netlify NE fait PAS :
- <svg class=emoji-icon aria-hidden=true></svg> Ne peut pas exécuter Node.js
- <svg class=emoji-icon aria-hidden=true></svg> Ne peut pas gérer une base de données
- <svg class=emoji-icon aria-hidden=true></svg> Ne peut pas traiter des requêtes API côté serveur

---

## <svg class=emoji-icon aria-hidden=true></svg> Backend (Railway)

### Ce qui est hébergé sur Railway :
- <svg class=emoji-icon aria-hidden=true></svg> Le dossier `server/` (tout le code backend)
- <svg class=emoji-icon aria-hidden=true></svg> L'API Node.js/Express
- <svg class=emoji-icon aria-hidden=true></svg> Les routes API (`/api/portfolio`)
- <svg class=emoji-icon aria-hidden=true></svg> L'authentification admin
- <svg class=emoji-icon aria-hidden=true></svg> La gestion des données

### Pourquoi Railway ?
- <svg class=emoji-icon aria-hidden=true></svg> **Gratuit** (500 heures/mois)
- <svg class=emoji-icon aria-hidden=true></svg> **Support Node.js** natif
- <svg class=emoji-icon aria-hidden=true></svg> **Variables d'environnement** faciles
- <svg class=emoji-icon aria-hidden=true></svg> **Déploiement automatique** depuis Git
- <svg class=emoji-icon aria-hidden=true></svg> **Logs en temps réel**
- <svg class=emoji-icon aria-hidden=true></svg> **Redémarrage automatique**

### Ce que Railway NE fait PAS :
- <svg class=emoji-icon aria-hidden=true></svg> Ne sert pas les fichiers HTML/CSS/JS
- <svg class=emoji-icon aria-hidden=true></svg> N'est pas optimisé pour servir du contenu statique

---

## <svg class=emoji-icon aria-hidden=true></svg> Base de données (MongoDB Atlas)

### Ce qui est hébergé sur MongoDB Atlas :
- <svg class=emoji-icon aria-hidden=true></svg> Toutes vos données (projets, compétences, CV, etc.)
- <svg class=emoji-icon aria-hidden=true></svg> Les paramètres (maintenance mode, SEO, etc.)
- <svg class=emoji-icon aria-hidden=true></svg> Les messages de contact
- <svg class=emoji-icon aria-hidden=true></svg> Les informations admin

### Pourquoi MongoDB Atlas ?
- <svg class=emoji-icon aria-hidden=true></svg> **Gratuit** (512MB - suffisant pour un portfolio)
- <svg class=emoji-icon aria-hidden=true></svg> **Cloud** (accessible depuis n'importe où)
- <svg class=emoji-icon aria-hidden=true></svg> **Sécurisé** (chiffrement, authentification)
- <svg class=emoji-icon aria-hidden=true></svg> **Backup automatique**

---

## <svg class=emoji-icon aria-hidden=true></svg> Comment ça fonctionne ensemble ?

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

## <svg class=emoji-icon aria-hidden=true></svg> Exemple Concret

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

## <svg class=emoji-icon aria-hidden=true></svg> Pourquoi cette architecture ?

### Avantages :
- <svg class=emoji-icon aria-hidden=true></svg> **Séparation des responsabilités** (frontend ≠ backend)
- <svg class=emoji-icon aria-hidden=true></svg> **Scalabilité** (chaque partie peut évoluer indépendamment)
- <svg class=emoji-icon aria-hidden=true></svg> **Sécurité** (le backend n'est pas exposé directement)
- <svg class=emoji-icon aria-hidden=true></svg> **Performance** (CDN pour le frontend, serveur optimisé pour l'API)
- <svg class=emoji-icon aria-hidden=true></svg> **Coût** (chaque service a un plan gratuit)

### Alternative (tout sur un seul service) :
- <svg class=emoji-icon aria-hidden=true></svg> Plus cher (besoin d'un serveur complet)
- <svg class=emoji-icon aria-hidden=true></svg> Moins performant (même serveur pour tout)
- <svg class=emoji-icon aria-hidden=true></svg> Plus complexe à gérer

---

## <svg class=emoji-icon aria-hidden=true></svg> Configuration

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

## <svg class=emoji-icon aria-hidden=true></svg> Coûts

| Service | Plan Gratuit | Limites |
|---------|-------------|---------|
| **Netlify** | <svg class=emoji-icon aria-hidden=true></svg> Gratuit | 100GB bande passante/mois |
| **Railway** | <svg class=emoji-icon aria-hidden=true></svg> Gratuit | 500 heures/mois |
| **MongoDB Atlas** | <svg class=emoji-icon aria-hidden=true></svg> Gratuit | 512MB de stockage |

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

## <svg class=emoji-icon aria-hidden=true></svg> Documentation

- `GUIDE_RAPIDE.md` - Guide étape par étape
- `ALTERNATIVES_DEPLOIEMENT.md` - Autres options
- `DEPLOIEMENT.md` - Guide Render (si vous l'utilisez)
