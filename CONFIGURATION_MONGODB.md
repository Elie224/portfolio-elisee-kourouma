# ✅ Configuration MongoDB Atlas - Terminée

## Identifiants configurés

Votre backend est maintenant configuré avec MongoDB Atlas :

- **Username** : `portfolio`
- **Cluster** : `cluster0.u3cxqhm.mongodb.net`
- **Base de données** : `portfolio`

## Fichier .env créé

Le fichier `server/.env` contient :
```
PORT=3000
MONGODB_URI=mongodb+srv://portfolio:YyNCfVI4Xm66zcmA@cluster0.u3cxqhm.mongodb.net/portfolio?retryWrites=true&w=majority
JWT_SECRET=portfolio_jwt_secret_2024_changez_moi_en_production
ADMIN_EMAIL=kouroumaelisee@gmail.com
```

## ✅ Dépendances installées

Les packages Node.js ont été installés avec succès.

## Tester le serveur

Pour démarrer le serveur localement :

```bash
cd server
npm start
```

Vous devriez voir :
```
✅ Connecté à MongoDB
🚀 Serveur démarré sur le port 3000
📡 API disponible sur http://localhost:3000/api/portfolio
```

## Important : Whitelist IP dans MongoDB Atlas

⚠️ **Avant de déployer sur Render**, vous devez :

1. Aller sur [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
2. Cliquer sur "Network Access" (Accès réseau)
3. Ajouter l'IP `0.0.0.0/0` pour autoriser toutes les IPs (ou l'IP de Render)

Sinon, la connexion échouera depuis Render.

## Déploiement sur Render

Quand vous déployez sur Render, ajouter ces variables d'environnement :

- `MONGODB_URI` : `mongodb+srv://portfolio:YyNCfVI4Xm66zcmA@cluster0.u3cxqhm.mongodb.net/portfolio?retryWrites=true&w=majority`
- `JWT_SECRET` : `portfolio_jwt_secret_2024_changez_moi_en_production`
- `ADMIN_EMAIL` : `kouroumaelisee@gmail.com`
- `PORT` : (Render le définit automatiquement)

## Sécurité

⚠️ Le fichier `.env` contient des informations sensibles et est dans `.gitignore`. Il ne sera jamais commité sur GitHub.

Pour le déploiement, ajouter les variables dans le dashboard Render, pas dans le code.
