# Guide de déploiement du Backend

## Étape 1 : Configuration MongoDB

### Option A : MongoDB Atlas (Recommandé - Gratuit)

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un nouveau cluster (gratuit M0)
3. Créer un utilisateur de base de données
4. Ajouter votre IP à la whitelist (ou 0.0.0.0/0 pour toutes les IPs)
5. Récupérer la connection string :
   - Cliquer sur "Connect" → "Connect your application"
   - Copier la chaîne de connexion
   - Remplacer `<password>` par votre mot de passe

### Option B : MongoDB Local

Installer MongoDB localement et utiliser :
```
mongodb://localhost:27017/portfolio
```

## Étape 2 : Configuration du Backend

1. Dans le dossier `server`, créer un fichier `.env` :
```bash
cd server
cp .env.example .env
```

2. Éditer `.env` avec vos valeurs :
```env
PORT=3000
MONGODB_URI=votre_connection_string_mongodb_atlas
JWT_SECRET=votre_secret_jwt_tres_securise
ADMIN_EMAIL=votre_email_admin
```

Pour obtenir la connection string MongoDB :
- Aller sur MongoDB Atlas Dashboard
- Connect → Connect your application
- Copier la connection string fournie

## Étape 3 : Installation locale (test)

```bash
cd server
npm install
npm start
```

Le serveur devrait démarrer sur `http://localhost:3000`

## Étape 4 : Déploiement sur Render

1. **Créer un nouveau service Web sur Render** :
   - Aller sur [Render Dashboard](https://dashboard.render.com)
   - Cliquer sur "New" → "Web Service"
   - Connecter votre repository GitHub

2. **Configuration du service** :
   - **Name** : `portfolio-backend` (ou autre nom)
   - **Environment** : `Node`
   - **Build Command** : `cd server && npm install`
   - **Start Command** : `cd server && npm start`
   - **Root Directory** : `/` (racine du repo)

3. **Variables d'environnement** :
   - Cliquer sur "Environment" dans le dashboard
   - Ajouter toutes les variables de `.env` :
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `ADMIN_EMAIL`
     - `PORT` (Render le définit automatiquement, mais vous pouvez le laisser)

4. **Déployer** :
   - Render déploiera automatiquement
   - Notez l'URL du service (ex: `https://portfolio-backend-xxx.onrender.com`)

## Étape 5 : Mettre à jour le Frontend

1. Dans `assets/js/admin.js` et `assets/js/main.js`, modifier :
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : 'https://votre-backend.onrender.com/api'; // Remplacer par votre URL Render
```

2. Commiter et pousser les modifications

## Étape 6 : Tester

1. Ouvrir la page admin
2. Se connecter
3. Faire une modification
4. Vérifier que les données sont sauvegardées sur le serveur
5. Ouvrir le portfolio dans un autre navigateur (ou mode navigation privée)
6. Vérifier que les modifications sont visibles

## Dépannage

### Erreur de connexion MongoDB
- Vérifier que l'IP est dans la whitelist MongoDB Atlas
- Vérifier les identifiants dans `MONGODB_URI`

### Erreur CORS
- Le backend a déjà CORS activé pour toutes les origines
- Si problème, vérifier la configuration dans `server.js`

### Erreur 401 (Non autorisé)
- Vérifier que le token JWT est bien stocké dans `localStorage`
- Vérifier que `JWT_SECRET` est le même partout

### Le backend ne démarre pas
- Vérifier les logs dans Render
- Vérifier que toutes les dépendances sont installées
- Vérifier que le port est correctement configuré
