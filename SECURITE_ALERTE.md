# 🚨 ALERTE SÉCURITÉ - Secrets Exposés

## ⚠️ Action Requise Immédiate

Des identifiants MongoDB ont été détectés dans les fichiers commités sur GitHub.

## ✅ Actions Effectuées

1. ✅ Suppression des identifiants des fichiers de documentation
2. ✅ Remplacement par des placeholders (`VOTRE_MOT_DE_PASSE`)

## 🔒 Actions à Faire MAINTENANT

### 1. Révoquer le Mot de Passe MongoDB Exposé

1. Aller sur [MongoDB Atlas](https://cloud.mongodb.com)
2. Menu gauche → **"Database Access"**
3. Trouver l'utilisateur `portfolio`
4. Cliquer sur les **3 points** → **"Edit"**
5. Cliquer sur **"Edit Password"**
6. Générer un **nouveau mot de passe fort**
7. **SAUVEGARDER LE NOUVEAU MOT DE PASSE** (vous en aurez besoin)
8. Cliquer sur **"Update User"**

### 2. Mettre à Jour le Fichier .env Local

Dans `server/.env`, mettre à jour avec le nouveau mot de passe :

```env
MONGODB_URI=mongodb+srv://portfolio:NOUVEAU_MOT_DE_PASSE@cluster0.u3cxqhm.mongodb.net/portfolio?retryWrites=true&w=majority
```

### 3. Mettre à Jour Render (si déjà déployé)

Si vous avez déjà déployé sur Render :

1. Aller sur [Render Dashboard](https://dashboard.render.com)
2. Sélectionner votre service backend
3. Aller dans **"Environment"**
4. Modifier la variable `MONGODB_URI` avec le nouveau mot de passe
5. Redémarrer le service

### 4. Vérifier l'Historique Git

⚠️ **Important** : Les secrets sont toujours dans l'historique Git des commits précédents.

Pour les supprimer complètement (optionnel mais recommandé) :

```bash
# Utiliser git-filter-repo ou BFG Repo-Cleaner
# Ou créer un nouveau repository si possible
```

## 📋 Checklist de Sécurité

- [ ] Mot de passe MongoDB révoqué et changé
- [ ] Fichier `.env` local mis à jour
- [ ] Variables d'environnement Render mises à jour (si déployé)
- [ ] Tous les fichiers de documentation nettoyés (✅ fait)
- [ ] Nouveau mot de passe sauvegardé de manière sécurisée

## 🔐 Bonnes Pratiques

1. **Ne JAMAIS** commiter des secrets dans le code
2. **Toujours** utiliser des variables d'environnement
3. **Vérifier** `.gitignore` contient `.env`
4. **Utiliser** des placeholders dans la documentation
5. **Révoquer immédiatement** tout secret exposé

## 📝 Fichiers Nettoyés

- ✅ `server/SETUP.md`
- ✅ `DEPLOY_RENDER_BACKEND.md`
- ✅ `RENDER_BACKEND_SETUP.md`
- ✅ `CONFIGURATION_MONGODB.md`

Tous les identifiants ont été remplacés par `VOTRE_MOT_DE_PASSE`.
