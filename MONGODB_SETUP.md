# Configuration MongoDB Atlas

## Comment obtenir votre Connection String

1. Aller sur [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
2. Se connecter à votre compte
3. Sélectionner votre cluster
4. Cliquer sur **"Connect"**
5. Choisir **"Connect your application"**
6. Copier la connection string fournie
7. Remplacer `<password>` par votre mot de passe MongoDB
8. Remplacer `<dbname>` par le nom de votre base de données (ex: `portfolio`)

## Format de la Connection String

```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

## Configuration dans le Backend

### Fichier .env local

Créer un fichier `server/.env` avec :

```env
PORT=3000
MONGODB_URI=votre_connection_string_ici
JWT_SECRET=votre_secret_jwt_securise
ADMIN_EMAIL=kouroumaelisee@gmail.com
```

### Variables d'environnement sur Render

Dans le dashboard Render, ajouter :

- `MONGODB_URI` : Votre connection string complète
- `JWT_SECRET` : Votre secret JWT
- `ADMIN_EMAIL` : kouroumaelisee@gmail.com

## Sécurité

⚠️ **Ne JAMAIS** :
- Commiter le fichier `.env` sur GitHub
- Mettre des identifiants dans le code
- Partager votre connection string publiquement

✅ **Toujours** :
- Utiliser des variables d'environnement
- Garder les secrets dans `.env` (local) ou dans le dashboard Render (production)
- Utiliser des placeholders dans la documentation
