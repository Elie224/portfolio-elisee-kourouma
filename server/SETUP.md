# Configuration MongoDB Atlas

## ✅ Configuration terminée

Votre backend est maintenant configuré avec MongoDB Atlas.

### Fichier .env créé avec :
- **MONGODB_URI** : Connecté à votre cluster MongoDB Atlas
- **JWT_SECRET** : Secret pour l'authentification
- **ADMIN_EMAIL** : Email de l'administrateur
- **PORT** : Port du serveur (3000)

## Prochaines étapes

### 1. Installer les dépendances
```bash
cd server
npm install
```

### 2. Tester la connexion MongoDB
```bash
npm start
```

Vous devriez voir :
```
✅ Connecté à MongoDB
🚀 Serveur démarré sur le port 3000
📡 API disponible sur http://localhost:3000/api/portfolio
```

### 3. Tester l'API

Ouvrir dans le navigateur :
- http://localhost:3000/health (vérifier que le serveur fonctionne)
- http://localhost:3000/api/portfolio (récupérer les données)

### 4. Déployer sur Render

1. Aller sur [Render Dashboard](https://dashboard.render.com)
2. Créer un nouveau service Web
3. Connecter votre repository GitHub
4. Configuration :
   - **Build Command** : `cd server && npm install`
   - **Start Command** : `cd server && npm start`
5. Variables d'environnement à ajouter dans Render :
   - `MONGODB_URI` : `mongodb+srv://portfolio:YyNCfVI4Xm66zcmA@cluster0.u3cxqhm.mongodb.net/portfolio?retryWrites=true&w=majority`
   - `JWT_SECRET` : `portfolio_jwt_secret_2024_changez_moi_en_production`
   - `ADMIN_EMAIL` : `kouroumaelisee@gmail.com`
   - `PORT` : (Render le définit automatiquement)

### 5. Mettre à jour l'URL de l'API dans le frontend

Une fois déployé sur Render, noter l'URL (ex: `https://portfolio-backend-xxx.onrender.com`)

Dans `assets/js/admin.js` et `assets/js/main.js`, remplacer :
```javascript
'https://votre-backend.onrender.com/api'
```
par votre URL Render.

## Sécurité

⚠️ **Important** : Le fichier `.env` contient des informations sensibles et est dans `.gitignore`. Ne jamais le commiter sur GitHub.

Pour le déploiement sur Render, ajouter les variables d'environnement dans le dashboard Render (pas dans le code).
