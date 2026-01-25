# Guide de Déploiement - elisee-kourouma.fr

> ⚠️ **Note** : Ce guide est pour Render. Si vous avez des accès limités sur Render, consultez **`ALTERNATIVES_DEPLOIEMENT.md`** pour des solutions gratuites (Netlify + Railway, Vercel + Fly.io, etc.)

## Configuration du Domaine

Le site est configuré pour utiliser le domaine **elisee-kourouma.fr**.

### Fichiers mis à jour

Tous les fichiers suivants ont été mis à jour avec le nouveau domaine :
- `index.html` - Meta tags, Open Graph, Twitter Card, JSON-LD
- `about.html` - Meta tags SEO
- `projects.html` - Meta tags SEO
- `contact.html` - Meta tags SEO
- `sitemap.xml` - Toutes les URLs
- `robots.txt` - URL du sitemap

## Configuration Backend (Render)

### Variables d'environnement requises

Sur votre service Render pour le backend, configurez les variables d'environnement suivantes :

```env
ALLOWED_ORIGINS=https://elisee-kourouma.fr,https://www.elisee-kourouma.fr
PORTFOLIO_DOMAIN=https://elisee-kourouma.fr
NODE_ENV=production
```

### Configuration CORS

Le serveur backend (`server/server.js`) est configuré pour accepter les requêtes depuis :
- `https://elisee-kourouma.fr`
- `https://www.elisee-kourouma.fr` (si vous configurez le www)

Les origines sont définies via la variable d'environnement `ALLOWED_ORIGINS` sur Render.

## Configuration DNS

### Pointage du domaine vers Render

1. **Pour le frontend (site statique)** :
   - Si vous utilisez Render pour le frontend :
     - Allez dans votre service Render
     - Ajoutez un domaine personnalisé : `elisee-kourouma.fr`
     - Suivez les instructions pour configurer les enregistrements DNS

2. **Enregistrements DNS à créer** :
   ```
   Type: CNAME
   Nom: @ (ou elisee-kourouma.fr)
   Valeur: [votre-service-render].onrender.com
   ```

   Ou si vous utilisez un autre hébergeur :
   ```
   Type: A
   Nom: @
   Valeur: [IP de votre serveur]
   ```

3. **Pour le sous-domaine www** (optionnel) :
   ```
   Type: CNAME
   Nom: www
   Valeur: [votre-service-render].onrender.com
   ```

## Vérification Post-Déploiement

### 1. Vérifier les URLs
- [ ] `https://elisee-kourouma.fr/` - Page d'accueil
- [ ] `https://elisee-kourouma.fr/about.html` - À propos
- [ ] `https://elisee-kourouma.fr/projects.html` - Projets
- [ ] `https://elisee-kourouma.fr/contact.html` - Contact
- [ ] `https://elisee-kourouma.fr/sitemap.xml` - Sitemap
- [ ] `https://elisee-kourouma.fr/robots.txt` - Robots.txt

### 2. Vérifier le backend
- [ ] L'API backend répond : `https://portfolio-backend-x47u.onrender.com/health`
- [ ] Les requêtes depuis `elisee-kourouma.fr` sont acceptées (pas d'erreur CORS)

### 3. Vérifier le SSL/HTTPS
- [ ] Le certificat SSL est actif (https://)
- [ ] Pas d'avertissement de sécurité dans le navigateur

### 4. Vérifier les meta tags
Utilisez un outil comme [Open Graph Preview](https://www.opengraph.xyz/) pour vérifier :
- [ ] Les images Open Graph s'affichent correctement
- [ ] Les meta descriptions sont correctes
- [ ] Les URLs canoniques pointent vers `elisee-kourouma.fr`

## Configuration du Backend sur Render

### Étapes

1. **Aller sur Render Dashboard** : https://dashboard.render.com
2. **Sélectionner votre service backend**
3. **Onglet "Environment"** :
   - Ajouter `ALLOWED_ORIGINS` = `https://elisee-kourouma.fr,https://www.elisee-kourouma.fr`
   - Ajouter `PORTFOLIO_DOMAIN` = `https://elisee-kourouma.fr`
   - Vérifier que `NODE_ENV` = `production`
4. **Redémarrer le service** après modification des variables d'environnement

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs du backend sur Render
2. Vérifiez la console du navigateur pour les erreurs CORS
3. Vérifiez que les variables d'environnement sont correctement configurées
4. Vérifiez que le DNS est correctement pointé

## Notes importantes

- Le backend utilise actuellement : `https://portfolio-backend-x47u.onrender.com/api`
- Les fichiers JavaScript détectent automatiquement si on est en localhost ou en production
- En production, les logs de debug sont désactivés automatiquement
- Le port local est `3001` pour le backend (vérifiez votre `.env` si différent)
