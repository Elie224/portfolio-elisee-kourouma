# <svg class=emoji-icon aria-hidden=true></svg> Sécurité - Secrets MongoDB

## <svg class=emoji-icon aria-hidden=true></svg> Important : Secrets exposés

Si vous avez accidentellement exposé des secrets MongoDB dans votre repository GitHub :

### 1. Supprimer les secrets du code
<svg class=emoji-icon aria-hidden=true></svg> **FAIT** - Tous les exemples ont été remplacés par des placeholders sécurisés

### 2. ROTATION OBLIGATOIRE des secrets exposés

**URGENT** : Si de vrais secrets ont été exposés, vous DEVEZ :

1. **Changer le mot de passe MongoDB Atlas** :
   - Allez sur MongoDB Atlas Dashboard
   - Database Access → Sélectionnez l'utilisateur
   - Edit → Change Password
   - Créez un nouveau mot de passe fort

2. **Mettre à jour toutes les variables d'environnement** :
   - Sur Railway/Fly.io/Render : Mettez à jour `MONGODB_URI` avec le nouveau mot de passe
   - Redémarrez le service backend

3. **Révoquer les anciennes connexions** (si possible)

### 3. Vérifier l'historique Git

Si des secrets ont été commités dans l'historique Git :

```bash
# Voir l'historique des commits
git log --all --full-history --source

# Si nécessaire, utiliser git-filter-repo pour nettoyer l'historique
# (ATTENTION : Cela réécrit l'historique Git)
```

### 4. Prévention future

- <svg class=emoji-icon aria-hidden=true></svg> Utiliser `.env.example` avec des placeholders
- <svg class=emoji-icon aria-hidden=true></svg> Ne JAMAIS commiter le fichier `.env`
- <svg class=emoji-icon aria-hidden=true></svg> Utiliser des variables d'environnement sur les plateformes de déploiement
- <svg class=emoji-icon aria-hidden=true></svg> Utiliser des secrets managers pour les projets sensibles

## <svg class=emoji-icon aria-hidden=true></svg> Checklist de sécurité

- [ ] Tous les secrets supprimés du code
- [ ] Mot de passe MongoDB changé (si exposé)
- [ ] Variables d'environnement mises à jour
- [ ] Services redémarrés avec les nouveaux secrets
- [ ] `.gitignore` vérifié (`.env` doit être ignoré)
- [ ] Aucun secret dans l'historique Git récent

## <svg class=emoji-icon aria-hidden=true></svg> Ressources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [MongoDB Atlas Security](https://www.mongodb.com/docs/atlas/security/)
- [OWASP Secrets Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_cryptographic_key)
