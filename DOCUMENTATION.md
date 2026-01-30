# 📚 Documentation Complète - Portfolio de Nema Elisée Kourouma

> **Documentation consolidée** - Toutes les informations importantes en un seul endroit  
> **Auteur :** Nema Elisée Kourouma  
> **Date :** 2026  
> **Site web :** [elisee-kourouma.fr](https://elisee-kourouma.fr)

---

## 📋 Table des matières

1. [Introduction](#introduction)
2. [Structure du projet](#structure-du-projet)
3. [Installation et démarrage](#installation-et-démarrage)
4. [Déploiement](#déploiement)
5. [Configuration](#configuration)
6. [Sécurité](#sécurité)
7. [Dépannage](#dépannage)
8. [Architecture technique](#architecture-technique)

---

## 🎯 Introduction

Ce portfolio est un site web moderne et professionnel développé avec :
- **Frontend :** HTML5, CSS3, JavaScript vanilla (code lisible et maintenable)
- **Backend :** Node.js/Express avec MongoDB Atlas
- **Déploiement :** Netlify (frontend) + Fly.io (backend)
- **Sécurité :** Protection XSS, rate limiting, authentification JWT

**Caractéristiques principales :**
- ✅ Design moderne et responsive (mobile, tablette, desktop)
- ✅ Performance optimisée (lazy loading, cache)
- ✅ Accessibilité WCAG 2.1 AAA
- ✅ Sécurité renforcée (validation, sanitization, headers)
- ✅ Code lisible et bien commenté (écrit pour être compris par un humain)

---

## 📁 Structure du projet

```
Portfelio/
├── 📄 Pages HTML
│   ├── index.html          # Page d'accueil
│   ├── about.html          # À propos
│   ├── projects.html       # Projets
│   ├── contact.html        # Contact
│   ├── admin.html          # Administration
│   └── project-details.html # Détails d'un projet
│
├── 🎨 Assets
│   ├── css/
│   │   ├── styles.css      # Styles principaux (bien commentés)
│   │   └── contact.css     # Styles spécifiques contact
│   ├── js/
│   │   ├── portfolio.js    # Script principal (commenté en français)
│   │   ├── admin.js        # Interface d'administration
│   │   ├── projects.js     # Gestion des projets
│   │   └── mobile-fix.js   # Correctif mobile (compatible tous navigateurs)
│   ├── photo.jpeg          # Photo de profil
│   └── CV.pdf              # CV téléchargeable
│
├── 🔧 Backend (server/)
│   ├── server.js           # Serveur Express principal
│   ├── routes/
│   │   └── portfolio.js    # Routes API
│   ├── models/
│   │   └── Portfolio.js   # Modèle MongoDB
│   ├── middleware/
│   │   ├── auth.js         # Authentification JWT
│   │   └── validation.js  # Validation et sanitization
│   └── utils/
│       └── logger.js       # Système de logging centralisé
│
└── 📚 Documentation
    ├── README.md           # Ce fichier (documentation principale)
    ├── DOCUMENTATION.md    # Documentation complète consolidée
    └── SECURITE.md         # Guide de sécurité
```

---

## 🚀 Installation et démarrage

### Prérequis

- Node.js 18+ (pour le backend)
- MongoDB Atlas (compte gratuit suffit)
- Git (pour le versioning)

### Démarrage local

#### Frontend

1. Ouvrir `index.html` dans un navigateur
2. Ou utiliser un serveur local :
   ```bash
   # Avec Python
   python -m http.server 8000
   
   # Avec Node.js (http-server)
   npx http-server -p 8000
   ```

#### Backend

```bash
cd server
npm install
npm start
```

Le serveur démarre sur `http://localhost:3000`

---

## 🌐 Déploiement

### Frontend (Netlify)

1. Connecter le repository GitHub à Netlify
2. Configuration automatique détectée
3. Le site est déployé automatiquement

### Backend (Fly.io)

1. Installer Fly CLI : `powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"`
2. Se connecter : `fly auth login`
3. Dans le dossier `server/` : `fly launch`
4. Configurer les secrets :
   ```bash
   fly secrets set MONGODB_URI="mongodb+srv://..."
   fly secrets set JWT_SECRET="votre_secret"
   fly secrets set ADMIN_EMAIL="votre_email@example.com"
   fly secrets set ADMIN_PASSWORD_HASH="$2b$12$..."
   fly secrets set ALLOWED_ORIGINS="https://elisee-kourouma.fr"
   ```
5. Déployer : `fly deploy`

**Note :** Pour générer le hash du mot de passe admin :
```bash
cd server
node generate-password-hash.js votre_mot_de_passe
```

---

## ⚙️ Configuration

### Variables d'environnement (Backend)

Créer un fichier `server/.env` :

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
JWT_SECRET=votre_secret_jwt_long_et_aleatoire
ADMIN_EMAIL=votre_email@example.com
ADMIN_PASSWORD_HASH=$2b$12$votre_hash_bcrypt
ALLOWED_ORIGINS=http://localhost:8000,https://elisee-kourouma.fr
PORTFOLIO_DOMAIN=https://elisee-kourouma.fr
```

### Configuration Google Analytics

1. Aller sur [Google Analytics](https://analytics.google.com)
2. Créer une propriété
3. Obtenir l'ID de mesure (format : `G-XXXXXXXXXX`)
4. Dans `admin.html`, section "Paramètres", coller l'ID
5. Sauvegarder

---

## 🔒 Sécurité

### Mesures de sécurité implémentées

1. **Protection XSS :** Sanitization de toutes les données entrantes
2. **Rate Limiting :** Limitation des requêtes (1000/15min général, 5/15min auth)
3. **Authentification JWT :** Tokens sécurisés avec expiration 24h
4. **Validation stricte :** Validation des données avec express-validator
5. **Headers de sécurité :** Helmet.js pour les headers HTTP sécurisés
6. **CORS :** Origines autorisées configurées
7. **Logging conditionnel :** Logs uniquement en développement (sauf erreurs)

### Checklist de sécurité

- [x] Tous les secrets dans les variables d'environnement
- [x] `.env` dans `.gitignore`
- [x] Validation et sanitization des données
- [x] Rate limiting activé
- [x] Authentification JWT sécurisée
- [x] Headers de sécurité (Helmet)
- [x] CORS configuré
- [x] Logs conditionnels (pas de fuite d'info en production)

---

## 🐛 Dépannage

### Problèmes courants

#### Le site affiche une page noire sur mobile

**Solution :** Le correctif mobile est déjà implémenté. Si le problème persiste :
1. Vider le cache du navigateur (Ctrl+Shift+Delete)
2. Vérifier que `mobile-fix.js` se charge (onglet Network dans DevTools)
3. Vérifier la console pour les erreurs JavaScript

#### Le backend ne démarre pas

**Vérifier :**
- Les variables d'environnement sont définies
- MongoDB Atlas est accessible (IP autorisée)
- Le port 3000 n'est pas déjà utilisé

#### Erreur CORS

**Vérifier :**
- `ALLOWED_ORIGINS` contient votre domaine
- L'origine de la requête correspond exactement

#### Je n'ai plus accès à la page admin (identifiants refusés)

**Cause :** La connexion admin est vérifiée **uniquement côté serveur** via les variables d'environnement du backend (Fly.io, etc.) : `ADMIN_EMAIL` et `ADMIN_PASSWORD_HASH`. Ces valeurs ne sont **pas** dans le code ; elles sont configurées sur le serveur. Si tu as un jour changé l'email de contact dans le code et mis à jour les secrets Fly.io en conséquence, puis qu'on a tout remis à `kouroumaelisee@gmail.com`, le backend peut encore attendre l'ancien email → la connexion échoue.

**Solution :**

1. **Sur Fly.io** (backend en ligne), remettre l'email admin et le hash du mot de passe :
   ```bash
   cd server
   fly secrets set ADMIN_EMAIL=kouroumaelisee@gmail.com
   fly secrets set ADMIN_PASSWORD_HASH='<hash_généré_ci-dessous>'
   fly apps restart
   ```

2. **Générer le hash** du mot de passe que tu utilises (ex. `kourouma`) :
   ```bash
   cd server
   node generate-password-hash.js kourouma
   ```
   Copier la ligne `ADMIN_PASSWORD_HASH=...` affichée et l'utiliser dans la commande `fly secrets set` (sans le préfixe `ADMIN_PASSWORD_HASH=`).

3. **En local** : vérifier que `server/.env` contient bien `ADMIN_EMAIL=kouroumaelisee@gmail.com` et `ADMIN_PASSWORD_HASH=<même hash>`, puis redémarrer le serveur.

---

## 🏗️ Architecture technique

### Frontend

- **HTML5 sémantique** : Structure claire et accessible
- **CSS3 moderne** : Variables CSS, Flexbox, Grid, animations
- **JavaScript vanilla** : Code lisible, commenté, sans dépendances lourdes
- **Responsive design** : Mobile-first, breakpoints à 768px et 1024px

### Backend

- **Express.js** : Framework web minimaliste
- **MongoDB/Mongoose** : Base de données NoSQL
- **JWT** : Authentification stateless
- **Bcrypt** : Hashage des mots de passe
- **Helmet** : Sécurisation des headers HTTP
- **express-rate-limit** : Protection contre les attaques DDoS

### Performance

- **Lazy loading** : Images chargées à la demande
- **Cache** : Headers Cache-Control configurés
- **Minification** : CSS et JS minifiés en production
- **CDN** : Assets servis via CDN (Netlify)

---

## 📞 Support

**Nema Elisée Kourouma**  
📧 Email : [kouroumaelisee@gmail.com](mailto:kouroumaelisee@gmail.com)  
📱 Téléphone : +33 6 89 30 64 32  
💼 LinkedIn : [linkedin.com/in/nema-kourouma](https://linkedin.com/in/nema-kourouma)  
🌐 Site web : [elisee-kourouma.fr](https://elisee-kourouma.fr)  
👨‍💻 GitHub : [@Elie224](https://github.com/Elie224)

---

> *Documentation maintenue à jour - Code écrit pour être facilement compris et modifié par un humain* 🤝
