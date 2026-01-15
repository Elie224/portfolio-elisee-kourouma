# Guide de Déploiement sur Render

## 📋 Prérequis

- Un compte Render (gratuit) : https://render.com
- Un compte GitHub avec le repository `Elie224/Mon_Portfolio`

## 🚀 Étapes de Déploiement

### 1. Connecter le Repository sur Render

1. Connectez-vous à votre compte Render : https://dashboard.render.com
2. Cliquez sur **"New +"** en haut à droite
3. Sélectionnez **"Static Site"**

### 2. Configurer le Service

#### Configuration de base :
- **Name** : `mon-portfolio` (ou le nom de votre choix)
- **Repository** : `Elie224/Mon_Portfolio`
- **Branch** : `main`
- **Root Directory** : `.` (laisser vide ou mettre un point)

#### Build & Deploy :
- **Build Command** : (laisser vide - pas de build nécessaire)
- **Publish Directory** : `.` (racine du projet)

#### Environment :
- **Environment** : `Static Site`
- **Auto-Deploy** : `Yes` (pour déployer automatiquement à chaque push)

### 3. Configuration Avancée (optionnel)

Dans **Advanced Settings**, vous pouvez configurer :

#### Headers personnalisés :
Le fichier `render.yaml` est déjà configuré avec :
- Sécurité (X-Frame-Options, X-XSS-Protection, etc.)
- Cache pour les assets statiques
- Rewrite rules pour les routes

#### Custom Domain (optionnel) :
Si vous avez un domaine personnalisé :
1. Allez dans **Settings** > **Custom Domain**
2. Ajoutez votre domaine
3. Suivez les instructions DNS

### 4. Déployer

1. Cliquez sur **"Create Static Site"**
2. Render va automatiquement :
   - Cloner votre repository
   - Déployer le site statique
   - Générer une URL : `https://mon-portfolio.onrender.com`

### 5. Vérification

Une fois le déploiement terminé :
1. Visitez l'URL fournie par Render
2. Testez toutes les pages :
   - `/` - Page d'accueil
   - `/about.html` - À propos
   - `/projects.html` - Projets
   - `/contact.html` - Contact
   - `/admin.html` - Admin

## 🔧 Configuration du fichier render.yaml

Le fichier `render.yaml` est déjà configuré avec :

```yaml
services:
  - type: web
    name: portfolio
    env: static
    buildCommand: echo "No build needed for static site"
    staticPublishPath: .
    headers:
      - path: /*
        name: Cache-Control
        value: public, max-age=31536000, immutable
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

## 📝 Notes Importantes

### ⚠️ Limitations du Plan Gratuit Render :

1. **Sleep Mode** : Le site entre en "sommeil" après 15 minutes d'inactivité
   - Le premier chargement après le sommeil peut prendre 30-60 secondes
   - Solution : Utiliser un service de "ping" gratuit comme UptimeRobot

2. **Données localStorage** :
   - Les données sont stockées dans le localStorage du navigateur
   - Elles ne persistent pas entre différents appareils/navigateurs
   - Pour un site de production, envisagez un backend avec base de données

### 🔐 Sécurité Admin :

L'interface admin est protégée par :
- Email : `kouroumaelisee@gmail.com`
- Mot de passe : `admin123`

⚠️ **IMPORTANT** : Changez le mot de passe dans `assets/js/admin.js` pour la production !

### 🔄 Mises à jour :

Les mises à jour sont automatiques :
1. Faites vos modifications localement
2. Committez et poussez sur GitHub :
   ```bash
   git add .
   git commit -m "Votre message"
   git push
   ```
3. Render déploie automatiquement la nouvelle version

## 🆘 Dépannage

### Le site ne se déploie pas :
- Vérifiez que la branche est `main`
- Vérifiez que le Root Directory est correct
- Vérifiez les logs de build dans Render

### Les assets ne se chargent pas :
- Vérifiez les chemins relatifs dans les fichiers HTML
- Assurez-vous que le dossier `assets/` est bien inclus

### Le site est lent au premier chargement :
- Normal avec le plan gratuit (sleep mode)
- Utilisez un service de ping pour garder le site actif

## 📞 Support

Pour plus d'aide :
- Documentation Render : https://render.com/docs
- Support Render : https://render.com/docs/help

---

**Bon déploiement ! 🚀**
