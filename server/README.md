# Backend API Portfolio

Backend Node.js + Express + MongoDB pour gérer les données du portfolio.

## Installation

1. Installer les dépendances :
```bash
cd server
npm install
```

2. Configurer les variables d'environnement :
```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

3. Démarrer MongoDB :
   - Localement : Assurez-vous que MongoDB est installé et démarré
   - Ou utilisez MongoDB Atlas (cloud) : Modifiez `MONGODB_URI` dans `.env`

4. Démarrer le serveur :
```bash
npm start
# ou en mode développement avec auto-reload :
npm run dev
```

## API Endpoints

### GET /api/portfolio
Récupère les données du portfolio (public)

**Réponse :**
```json
{
  "personal": {...},
  "projects": [...],
  "skills": [...],
  ...
}
```

### POST /api/portfolio
Met à jour les données du portfolio (admin seulement)

**Headers :**
```
Authorization: Bearer <JWT_TOKEN>
```

**Body :** Objet portfolio complet

**Réponse :**
```json
{
  "success": true,
  "message": "Portfolio mis à jour avec succès",
  "portfolio": {...}
}
```

### POST /api/portfolio/login
Authentification admin

**Body :**
```json
{
  "email": "kouroumaelisee@gmail.com",
  "password": "votre_mot_de_passe"
}
```

**Réponse :**
```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "expiresIn": "24h"
}
```

## Déploiement

### Sur Render

1. Créer un nouveau service Web
2. Connecter votre repository GitHub
3. Configurer :
   - Build Command : `cd server && npm install`
   - Start Command : `cd server && npm start`
4. Ajouter les variables d'environnement dans Render
5. Pour MongoDB, utiliser MongoDB Atlas (gratuit)

### Variables d'environnement nécessaires

- `PORT` : Port du serveur (Render le définit automatiquement)
- `MONGODB_URI` : URI de connexion MongoDB
- `JWT_SECRET` : Secret pour signer les tokens JWT
- `ADMIN_EMAIL` : Email de l'administrateur
