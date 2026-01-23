# ✅ Configuration MongoDB Atlas - Terminée

## Configuration MongoDB Atlas

Votre backend est configuré pour utiliser MongoDB Atlas.

Pour obtenir votre connection string :
1. Aller sur [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
2. Cliquer sur "Connect" → "Connect your application"
3. Copier la connection string fournie

## Fichier .env créé

Le fichier `server/.env` doit contenir :
```
PORT=3000
MONGODB_URI=votre_connection_string_mongodb_atlas
JWT_SECRET=votre_secret_jwt_securise
ADMIN_EMAIL=votre_email_admin
```

Pour obtenir la connection string MongoDB :
1. Aller sur MongoDB Atlas Dashboard
2. Connect → Connect your application
3. Copier la connection string fournie

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

- `MONGODB_URI` : Récupérer depuis MongoDB Atlas Dashboard
- `JWT_SECRET` : Générer un secret JWT sécurisé
- `ADMIN_EMAIL` : Votre email administrateur
- `PORT` : (Render le définit automatiquement)

## Sécurité

⚠️ Le fichier `.env` contient des informations sensibles et est dans `.gitignore`. Il ne sera jamais commité sur GitHub.

Pour le déploiement, ajouter les variables dans le dashboard Render, pas dans le code.
