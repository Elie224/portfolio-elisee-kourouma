# 🚀 Guide de Déploiement Backend - Étape par Étape

## 📋 Prérequis

- ✅ Compte GitHub (votre code doit être sur GitHub)
- ✅ Compte MongoDB Atlas (gratuit) - [Créer un compte](https://www.mongodb.com/cloud/atlas/register)
- ✅ Compte Railway (gratuit) - [Créer un compte](https://railway.app)

---

## 📝 Étape 1 : Préparer MongoDB Atlas (5 minutes)

### 1.1 Créer un Cluster MongoDB

1. Connectez-vous à [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Cliquez sur **"Create"** ou **"Build a Database"**
3. Choisissez le plan **FREE (M0)** - 512MB gratuit
4. Choisissez un provider et une région (ex: AWS, Europe)
5. Cliquez sur **"Create"**

### 1.2 Créer un Utilisateur de Base de Données

1. Dans **"Database Access"** (menu de gauche)
2. Cliquez sur **"Add New Database User"**
3. Choisissez **"Password"** comme méthode d'authentification
4. Entrez un **username** (ex: `portfolio-admin`)
5. Générez un **mot de passe fort** (ou créez-en un)
6. ⚠️ **IMPORTANT** : Copiez et sauvegardez le mot de passe quelque part !
7. Rôle : **"Atlas admin"** ou **"Read and write to any database"**
8. Cliquez sur **"Add User"**

### 1.3 Configurer l'Accès Réseau

1. Dans **"Network Access"** (menu de gauche)
2. Cliquez sur **"Add IP Address"**
3. Cliquez sur **"Allow Access from Anywhere"** (pour simplifier)
   - Ou ajoutez `0.0.0.0/0` manuellement
4. Cliquez sur **"Confirm"**

### 1.5 Obtenir la Connection String

1. Dans **"Database"** (menu de gauche)
2. Cliquez sur **"Connect"** à côté de votre cluster
3. Choisissez **"Connect your application"**
4. Driver : **Node.js**
5. Version : **5.5 or later**
6. **Copiez la connection string** qui ressemble à :
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. **Remplacez** `<username>` et `<password>` par vos identifiants
8. **Ajoutez** le nom de la base de données à la fin :
   ```
   mongodb+srv://portfolio-admin:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
   ```
9. ⚠️ **Sauvegardez cette URI complète** - vous en aurez besoin !

---

## 🔐 Étape 2 : Générer le Hash du Mot de Passe Admin (2 minutes)

### 2.1 Ouvrir un Terminal

1. Ouvrez PowerShell ou Terminal
2. Naviguez vers le dossier `server` :
   ```powershell
   cd C:\Users\KOURO\OneDrive\Desktop\Portfelio\server
   ```

### 2.2 Installer les Dépendances (si pas déjà fait)

```powershell
npm install
```

### 2.3 Générer le Hash

```powershell
node generate-password-hash.js VOTRE_MOT_DE_PASSE_ADMIN
```

**Exemple :**
```powershell
node generate-password-hash.js MonMotDePasse123!
```

### 2.4 Copier le Hash Généré

Le script affichera quelque chose comme :
```
✅ Hash généré avec succès !
📋 Ajoutez cette ligne à votre fichier .env :

ADMIN_PASSWORD_HASH=$2b$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **Copiez ce hash** - vous en aurez besoin pour Railway !

---

## 🚂 Étape 3 : Déployer sur Railway (10 minutes)

### 3.1 Créer un Compte Railway

1. Allez sur [Railway](https://railway.app)
2. Cliquez sur **"Start a New Project"**
3. Choisissez **"Login with GitHub"**
4. Autorisez Railway à accéder à votre compte GitHub

### 3.2 Créer un Nouveau Projet

1. Dans Railway, cliquez sur **"New Project"**
2. Choisissez **"Deploy from GitHub repo"**
3. Sélectionnez votre repository **"Portfelio"** (ou le nom de votre repo)
4. Railway va détecter automatiquement le projet

### 3.3 Configurer le Dossier de Déploiement

1. Railway devrait détecter automatiquement Node.js
2. Si ce n'est pas le cas, cliquez sur **"Settings"**
3. Dans **"Root Directory"**, entrez : `server`
4. Dans **"Build Command"**, laissez vide (ou `npm install`)
5. Dans **"Start Command"**, entrez : `npm start`

### 3.4 Configurer les Variables d'Environnement

1. Dans votre projet Railway, cliquez sur l'onglet **"Variables"**
2. Cliquez sur **"New Variable"** pour chaque variable suivante :

#### Variables à Ajouter :

**1. PORT**
```
Nom: PORT
Valeur: 3000
```

**2. NODE_ENV**
```
Nom: NODE_ENV
Valeur: production
```

**3. MONGODB_URI**
```
Nom: MONGODB_URI
Valeur: mongodb+srv://portfolio-admin:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
```
⚠️ Remplacez par votre vraie URI MongoDB Atlas !

**4. JWT_SECRET**
```
Nom: JWT_SECRET
Valeur: [Générez une clé secrète de 32+ caractères]
```
💡 **Pour générer une clé secrète :**
- Utilisez un générateur en ligne : https://randomkeygen.com/
- Ou utilisez PowerShell :
  ```powershell
  -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
  ```

**5. ADMIN_EMAIL**
```
Nom: ADMIN_EMAIL
Valeur: votre_email@example.com
```
⚠️ Utilisez votre vraie adresse email !

**6. ADMIN_PASSWORD_HASH**
```
Nom: ADMIN_PASSWORD_HASH
Valeur: $2b$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
⚠️ Utilisez le hash généré à l'étape 2.3 !

**7. ALLOWED_ORIGINS**
```
Nom: ALLOWED_ORIGINS
Valeur: https://elisee-kourouma.fr,https://www.elisee-kourouma.fr,https://dapper-hotteok-569259.netlify.app
```
⚠️ Ajoutez votre URL Netlify temporaire aussi pour tester !

**8. PORTFOLIO_DOMAIN**
```
Nom: PORTFOLIO_DOMAIN
Valeur: https://elisee-kourouma.fr
```

### 3.5 Déployer

1. Railway va automatiquement déployer votre backend
2. Attendez que le déploiement se termine (1-2 minutes)
3. Vous verrez des logs de déploiement

### 3.6 Obtenir l'URL du Backend

1. Une fois déployé, Railway génère une URL
2. Cliquez sur l'onglet **"Settings"** de votre service
3. Cherchez **"Generate Domain"** ou **"Custom Domain"**
4. Railway vous donnera une URL comme :
   ```
   https://portfolio-backend-production.up.railway.app
   ```
5. ⚠️ **Copiez cette URL** - vous en aurez besoin pour le frontend !

### 3.7 Tester le Backend

1. Ouvrez votre navigateur
2. Allez sur : `https://votre-url-railway.up.railway.app/health`
3. Vous devriez voir : `{"status":"ok"}`
4. Si ça fonctionne, votre backend est déployé ! ✅

---

## 🔧 Étape 4 : Mettre à Jour le Frontend (5 minutes)

Maintenant, il faut dire au frontend d'utiliser votre nouveau backend Railway.

### 4.1 Mettre à Jour les Fichiers JavaScript

Vous devez modifier ces fichiers pour remplacer l'ancienne URL backend :

**Fichier 1 : `assets/js/portfolio.js`**
- Cherchez la ligne avec l'URL backend (vers la ligne 35)
- Remplacez :
  ```javascript
  : 'https://portfolio-backend-x47u.onrender.com/api';
  ```
- Par :
  ```javascript
  : 'https://votre-url-railway.up.railway.app/api';
  ```

**Fichier 2 : `assets/js/admin.js`**
- Cherchez la ligne avec l'URL backend (vers la ligne 27)
- Remplacez de la même manière

**Fichier 3 : `assets/js/projects.js`**
- Cherchez la ligne avec l'URL backend (vers la ligne 11)
- Remplacez de la même manière

### 4.2 Commit et Push sur GitHub

```powershell
git add .
git commit -m "Mise à jour URL backend vers Railway"
git push
```

### 4.3 Netlify Redéploie Automatiquement

- Netlify détectera automatiquement le push
- Il redéploiera votre site avec la nouvelle URL backend
- Attendez 1-2 minutes

---

## ✅ Étape 5 : Vérifier que Tout Fonctionne

### 5.1 Tester le Backend

1. **Health Check** :
   - `https://votre-url-railway.up.railway.app/health`
   - Devrait retourner : `{"status":"ok"}`

2. **API Portfolio** :
   - `https://votre-url-railway.up.railway.app/api/portfolio`
   - Devrait retourner les données du portfolio

### 5.2 Tester le Frontend

1. Allez sur votre site Netlify :
   - `https://dapper-hotteok-569259.netlify.app` (URL temporaire)
   - Ou `https://elisee-kourouma.fr` (quand DNS propagé)

2. Vérifiez la console du navigateur (F12) :
   - Pas d'erreur CORS
   - Les requêtes vers le backend fonctionnent

3. Testez l'admin panel :
   - Allez sur `/admin.html`
   - Connectez-vous avec votre email et mot de passe admin
   - Vérifiez que la connexion fonctionne

---

## 🆘 Problèmes Courants

### ❌ Le backend ne démarre pas

**Vérifiez :**
- Toutes les variables d'environnement sont définies
- `MONGODB_URI` est correcte (avec le mot de passe)
- `JWT_SECRET` est défini
- `ADMIN_PASSWORD_HASH` est correct

**Voir les logs :**
- Dans Railway, cliquez sur **"Deployments"**
- Cliquez sur le dernier déploiement
- Regardez les logs pour voir l'erreur

### ❌ Erreur CORS dans le frontend

**Vérifiez :**
- `ALLOWED_ORIGINS` contient bien votre URL Netlify
- L'URL dans `ALLOWED_ORIGINS` est exactement la même que celle du frontend
- Pas d'espace avant/après les URLs dans `ALLOWED_ORIGINS`

**Exemple correct :**
```
ALLOWED_ORIGINS=https://elisee-kourouma.fr,https://www.elisee-kourouma.fr,https://dapper-hotteok-569259.netlify.app
```

### ❌ Erreur de connexion MongoDB

**Vérifiez :**
- L'URI MongoDB est correcte
- Le mot de passe dans l'URI est correct (pas d'espaces)
- L'accès réseau est autorisé dans MongoDB Atlas (0.0.0.0/0)
- L'utilisateur MongoDB existe et a les bonnes permissions

### ❌ Le backend répond mais l'admin ne fonctionne pas

**Vérifiez :**
- `ADMIN_EMAIL` est correct
- `ADMIN_PASSWORD_HASH` correspond au mot de passe que vous utilisez
- Regénérez le hash si nécessaire

---

## 📝 Checklist Finale

- [ ] MongoDB Atlas créé et configuré
- [ ] Utilisateur MongoDB créé
- [ ] Accès réseau autorisé (0.0.0.0/0)
- [ ] Connection string MongoDB copiée
- [ ] Hash du mot de passe admin généré
- [ ] Compte Railway créé
- [ ] Projet Railway créé et connecté à GitHub
- [ ] Dossier `server/` configuré dans Railway
- [ ] Toutes les variables d'environnement ajoutées
- [ ] Backend déployé sur Railway
- [ ] URL Railway copiée
- [ ] Health check fonctionne
- [ ] Fichiers JS frontend mis à jour avec la nouvelle URL
- [ ] Code commité et pushé sur GitHub
- [ ] Netlify redéployé automatiquement
- [ ] Frontend teste le backend avec succès
- [ ] Admin panel fonctionne

---

## 🎉 Félicitations !

Votre backend est maintenant déployé sur Railway ! 

**Prochaines étapes :**
1. Attendre que le DNS de Netlify se propage (pour `elisee-kourouma.fr`)
2. Tester toutes les fonctionnalités
3. Mettre à jour `ALLOWED_ORIGINS` si nécessaire quand le domaine sera actif

---

## 📚 Ressources Utiles

- [Documentation Railway](https://docs.railway.app/)
- [Documentation MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Guide de déploiement complet](README_DEPLOIEMENT.md)
- [Guide Netlify](GUIDE_NETLIFY.md)

---

**Besoin d'aide ?** Consultez les logs dans Railway ou la section "Problèmes Courants" ci-dessus.
