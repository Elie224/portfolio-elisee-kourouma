# Alternatives de Déploiement - elisee-kourouma.fr

## 🎯 Architecture du Projet

- **Frontend** : Site statique (HTML, CSS, JavaScript)
- **Backend** : Node.js/Express avec MongoDB
- **Base de données** : MongoDB (MongoDB Atlas gratuit disponible)

## ✅ Solutions Recommandées (Gratuites ou Peu Coûteuses)

### Option 1 : Netlify (Frontend) + Railway (Backend) ⭐ RECOMMANDÉ

#### Frontend sur Netlify (GRATUIT)
- ✅ Hébergement gratuit illimité
- ✅ SSL automatique
- ✅ CDN global
- ✅ Déploiement automatique depuis Git
- ✅ Support des domaines personnalisés
- ✅ Redirections et headers personnalisés

**Configuration :**
1. Créer un compte sur [Netlify](https://www.netlify.com)
2. Connecter votre dépôt Git (GitHub, GitLab, Bitbucket)
3. Configuration de build :
   - Build command : (vide, site statique)
   - Publish directory : `.` (racine)
4. Ajouter le domaine `elisee-kourouma.fr` dans les paramètres
5. Configurer les DNS selon les instructions Netlify

**Fichier `netlify.toml` à créer :**
```toml
[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

#### Backend sur Railway (GRATUIT avec limites)
- ✅ 500 heures gratuites/mois
- ✅ Support Node.js natif
- ✅ Variables d'environnement faciles
- ✅ MongoDB Atlas gratuit séparé

**Configuration :**
1. Créer un compte sur [Railway](https://railway.app)
2. Nouveau projet → Deploy from GitHub repo
3. Sélectionner le dossier `server/`
4. Variables d'environnement à configurer :
   ```
   PORT=3000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://... (MongoDB Atlas)
   JWT_SECRET=votre_secret_jwt
   ADMIN_EMAIL=votre_email
   ADMIN_PASSWORD_HASH=votre_hash_bcrypt
   ALLOWED_ORIGINS=https://elisee-kourouma.fr,https://www.elisee-kourouma.fr
   PORTFOLIO_DOMAIN=https://elisee-kourouma.fr
   ```
5. Railway génère automatiquement une URL (ex: `votre-app.railway.app`)
6. Mettre à jour `MON_SERVEUR` dans les fichiers JS avec cette URL

---

### Option 2 : Vercel (Frontend) + Fly.io (Backend)

#### Frontend sur Vercel (GRATUIT)
- ✅ Hébergement gratuit
- ✅ SSL automatique
- ✅ Déploiement depuis Git
- ✅ Support domaines personnalisés

**Configuration :**
1. Créer un compte sur [Vercel](https://vercel.com)
2. Importer votre projet Git
3. Configuration :
   - Framework Preset : Other
   - Build Command : (vide)
   - Output Directory : `.`
4. Ajouter le domaine dans les paramètres

**Fichier `vercel.json` à créer :**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1 },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

#### Backend sur Fly.io (GRATUIT avec limites)
- ✅ 3 VMs gratuites (256MB RAM chacune)
- ✅ Support Node.js
- ✅ SSL automatique

**Configuration :**
1. Installer Fly CLI : `curl -L https://fly.io/install.sh | sh`
2. Créer un compte : `fly auth signup`
3. Dans le dossier `server/`, créer `fly.toml` :
   ```toml
   app = "votre-app-backend"
   primary_region = "cdg"  # Paris

   [build]

   [http_service]
     internal_port = 3000
     force_https = true
     auto_stop_machines = true
     auto_start_machines = true
     min_machines_running = 0
     processes = ["app"]

   [[vm]]
     cpu_kind = "shared"
     cpus = 1
     memory_mb = 256
   ```
4. Déployer : `fly deploy`
5. Configurer les variables d'environnement : `fly secrets set KEY=value`

---

### Option 3 : Cloudflare Pages (Frontend) + Cyclic (Backend)

#### Frontend sur Cloudflare Pages (GRATUIT)
- ✅ Hébergement gratuit illimité
- ✅ CDN global
- ✅ SSL automatique
- ✅ Déploiement depuis Git

**Configuration :**
1. Créer un compte sur [Cloudflare](https://pages.cloudflare.com)
2. Connecter votre dépôt Git
3. Configuration :
   - Framework preset : None
   - Build command : (vide)
   - Build output directory : `.`
4. Ajouter le domaine personnalisé

#### Backend sur Cyclic (GRATUIT)
- ✅ Hébergement gratuit
- ✅ Support Node.js
- ✅ MongoDB Atlas gratuit séparé

**Configuration :**
1. Créer un compte sur [Cyclic](https://www.cyclic.sh)
2. Connecter votre dépôt GitHub
3. Sélectionner le dossier `server/`
4. Configurer les variables d'environnement dans le dashboard

---

### Option 4 : GitHub Pages (Frontend) + Railway (Backend)

#### Frontend sur GitHub Pages (GRATUIT)
- ✅ Gratuit pour les repos publics
- ✅ SSL automatique
- ✅ Facile à configurer

**Limitation :** Pas de redirections serveur, mais peut fonctionner avec du JavaScript.

**Configuration :**
1. Aller dans Settings → Pages de votre repo GitHub
2. Source : Deploy from a branch
3. Branch : `main` / `root`
4. Ajouter un domaine personnalisé dans les paramètres

---

## 🗄️ MongoDB Atlas (GRATUIT)

Toutes les options nécessitent MongoDB. Utilisez **MongoDB Atlas** (gratuit) :

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un cluster gratuit (M0 - 512MB)
3. Créer un utilisateur de base de données
4. Whitelist IP : `0.0.0.0/0` (pour permettre toutes les IPs)
5. Récupérer la connection string : `mongodb+srv://user:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority`

---

## 📝 Configuration des Fichiers JavaScript

Après avoir déployé le backend, mettez à jour l'URL dans :

### `assets/js/portfolio.js` et `assets/js/admin.js` et `assets/js/projects.js`

```javascript
const MON_SERVEUR = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api'
  : 'https://votre-backend-url.railway.app/api';  // ← Mettre votre URL backend ici
```

---

## 🎯 Ma Recommandation Finale

**Netlify (Frontend) + Railway (Backend)** car :
- ✅ Entièrement gratuit pour commencer
- ✅ Facile à configurer
- ✅ Bonne documentation
- ✅ Support des domaines personnalisés
- ✅ SSL automatique
- ✅ Déploiement automatique depuis Git

---

## 📋 Checklist de Déploiement

### Frontend
- [ ] Créer compte sur Netlify/Vercel/Cloudflare Pages
- [ ] Connecter le dépôt Git
- [ ] Configurer le domaine `elisee-kourouma.fr`
- [ ] Configurer les DNS
- [ ] Vérifier le SSL

### Backend
- [ ] Créer compte sur Railway/Fly.io/Cyclic
- [ ] Déployer le dossier `server/`
- [ ] Configurer MongoDB Atlas
- [ ] Configurer toutes les variables d'environnement
- [ ] Mettre à jour `MON_SERVEUR` dans les fichiers JS
- [ ] Tester l'API backend
- [ ] Vérifier CORS

### Tests
- [ ] Tester toutes les pages du site
- [ ] Tester l'admin panel
- [ ] Vérifier les requêtes API
- [ ] Vérifier le mode maintenance
- [ ] Tester sur mobile

---

## 🔧 Fichiers de Configuration à Créer

Je vais créer les fichiers de configuration nécessaires pour chaque option.
