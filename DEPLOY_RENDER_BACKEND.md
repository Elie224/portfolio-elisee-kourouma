# 🚀 Guide de Déploiement Backend sur Render

## Étape 1 : Préparer MongoDB Atlas (IMPORTANT)

### 1.1 Whitelist IP pour Render

1. Aller sur [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
2. Cliquer sur **"Network Access"** (menu de gauche)
3. Cliquer sur **"Add IP Address"**
4. Choisir **"Allow Access from Anywhere"** ou ajouter `0.0.0.0/0`
5. Cliquer sur **"Confirm"**

⚠️ **Sans cette étape, le backend ne pourra pas se connecter à MongoDB !**

## Étape 2 : Créer le Service Web sur Render

### 2.1 Créer un nouveau service

1. Aller sur [Render Dashboard](https://dashboard.render.com)
2. Cliquer sur **"New +"** (en haut à droite)
3. Sélectionner **"Web Service"**

### 2.2 Connecter le Repository GitHub

1. Si pas encore connecté, cliquer sur **"Connect account"** pour connecter GitHub
2. Sélectionner votre repository : **`Elie224/Mon_Portfolio`**
3. Cliquer sur **"Connect"**

### 2.3 Configuration du Service

Remplir les champs suivants :

- **Name** : `portfolio-backend` (ou autre nom de votre choix)
- **Environment** : `Node`
- **Region** : Choisir la région la plus proche (ex: `Frankfurt` pour l'Europe)
- **Branch** : `main`
- **Root Directory** : Laisser vide (racine du repo)
- **Build Command** : 
  ```
  cd server && npm install
  ```
- **Start Command** : 
  ```
  cd server && npm start
  ```

### 2.4 Variables d'Environnement

Cliquer sur **"Advanced"** → **"Add Environment Variable"** et ajouter :

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://portfolio:YyNCfVI4Xm66zcmA@cluster0.u3cxqhm.mongodb.net/portfolio?retryWrites=true&w=majority` |
| `JWT_SECRET` | `portfolio_jwt_secret_2024_changez_moi_en_production` |
| `ADMIN_EMAIL` | `kouroumaelisee@gmail.com` |
| `PORT` | Laisser vide (Render le définit automatiquement) |

⚠️ **Important** : Ne pas mettre d'espaces avant ou après les valeurs !

### 2.5 Plan de Service

- Choisir **"Free"** (gratuit) pour commencer
- Note : Le service gratuit peut prendre quelques secondes à démarrer après inactivité

### 2.6 Créer le Service

1. Cliquer sur **"Create Web Service"**
2. Render va commencer à déployer votre backend
3. Attendre la fin du déploiement (2-5 minutes)

## Étape 3 : Vérifier le Déploiement

### 3.1 Vérifier les Logs

Dans le dashboard Render, cliquer sur **"Logs"** et vérifier :

```
✅ Connecté à MongoDB
🚀 Serveur démarré sur le port XXXX
```

Si vous voyez des erreurs, vérifier :
- Les variables d'environnement sont correctes
- MongoDB Atlas whitelist est configurée
- La connection string est valide

### 3.2 Tester l'API

Une fois déployé, Render vous donne une URL comme :
`https://portfolio-backend-xxx.onrender.com`

Tester dans le navigateur :
- `https://votre-backend.onrender.com/health` → Devrait retourner `{"status":"OK","message":"Serveur actif"}`
- `https://votre-backend.onrender.com/api/portfolio` → Devrait retourner les données du portfolio (vide au début)

## Étape 4 : Mettre à jour le Frontend

### 4.1 Mettre à jour l'URL de l'API

Une fois le backend déployé, noter l'URL (ex: `https://portfolio-backend-xxx.onrender.com`)

Dans `assets/js/admin.js` et `assets/js/main.js`, ligne ~9, remplacer :

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : 'https://votre-backend.onrender.com/api'; // ← Modifier cette ligne
```

Par votre URL Render :

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : 'https://portfolio-backend-xxx.onrender.com/api'; // ← Votre URL Render
```

### 4.2 Commiter et Pousser

```bash
git add assets/js/admin.js assets/js/main.js
git commit -m "Mise à jour URL API backend Render"
git push
```

## Étape 5 : Tester le Système Complet

1. Aller sur votre site portfolio déployé
2. Se connecter à la page admin
3. Faire une modification (ex: modifier un projet)
4. Ouvrir le portfolio dans un autre navigateur (ou navigation privée)
5. Vérifier que les modifications sont visibles

## Dépannage

### Erreur : "Cannot connect to MongoDB"
- Vérifier que la whitelist IP est configurée dans MongoDB Atlas
- Vérifier que `MONGODB_URI` est correct dans Render
- Vérifier les logs Render pour plus de détails

### Erreur : "401 Unauthorized"
- Vérifier que `JWT_SECRET` est le même dans Render et dans le code
- Vérifier que `ADMIN_EMAIL` correspond

### Le backend ne démarre pas
- Vérifier les logs Render
- Vérifier que `package.json` est correct
- Vérifier que le "Start Command" est `cd server && npm start`

### CORS Error
- Le backend a déjà CORS activé pour toutes les origines
- Si problème, vérifier la configuration dans `server/server.js`

## URLs Importantes

- **Render Dashboard** : https://dashboard.render.com
- **MongoDB Atlas** : https://cloud.mongodb.com
- **Votre Backend** : `https://votre-backend.onrender.com` (à noter après déploiement)

## Support

Si vous rencontrez des problèmes :
1. Vérifier les logs dans Render Dashboard
2. Vérifier les logs MongoDB Atlas
3. Tester l'API avec Postman ou curl
4. Vérifier que toutes les variables d'environnement sont correctes
