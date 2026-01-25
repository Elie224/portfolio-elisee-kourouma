# 🚀 Guide Rapide de Déploiement - elisee-kourouma.fr

## ⚡ Solution Recommandée : Netlify + Railway (100% GRATUIT)

### Étape 1 : Préparer MongoDB Atlas (5 minutes)

1. Aller sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Créer un compte gratuit
3. Créer un cluster gratuit (M0 - 512MB)
4. Créer un utilisateur de base de données
5. Network Access → Add IP Address → `0.0.0.0/0` (autoriser toutes les IPs)
6. Database → Connect → Driver: Node.js → Copier la connection string
   - Remplacer `<password>` par votre mot de passe utilisateur
   - Format : `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority`

### Étape 2 : Déployer le Backend sur Railway (10 minutes)

1. Aller sur [Railway](https://railway.app) → Sign up with GitHub
2. New Project → Deploy from GitHub repo
3. Sélectionner votre repo → Dossier : `server/`
4. Railway détecte automatiquement Node.js
5. Dans Variables, ajouter :
   ```
   PORT=3000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/portfolio?retryWrites=true&w=majority
   JWT_SECRET=votre_secret_jwt_aleatoire_long
   ADMIN_EMAIL=votre_email@example.com
   ADMIN_PASSWORD_HASH=votre_hash_bcrypt
   ALLOWED_ORIGINS=https://elisee-kourouma.fr,https://www.elisee-kourouma.fr
   PORTFOLIO_DOMAIN=https://elisee-kourouma.fr
   ```
6. Railway génère une URL (ex: `portfolio-backend-production.up.railway.app`)
7. **Copier cette URL** - vous en aurez besoin pour le frontend

**Pour générer le hash du mot de passe admin :**
```bash
cd server
node generate-password-hash.js votre_mot_de_passe
```

### Étape 3 : Mettre à jour les fichiers JavaScript

Mettre à jour l'URL du backend dans ces fichiers :
- `assets/js/portfolio.js` (ligne 35)
- `assets/js/admin.js` (ligne 27)
- `assets/js/projects.js` (ligne 11)

Remplacer :
```javascript
: 'https://portfolio-backend-x47u.onrender.com/api';
```

Par :
```javascript
: 'https://votre-url-railway.up.railway.app/api';
```

### Étape 4 : Déployer le Frontend sur Netlify (10 minutes)

1. Aller sur [Netlify](https://www.netlify.com) → Sign up with GitHub
2. Add new site → Import an existing project
3. Connecter votre repo GitHub
4. Build settings :
   - Build command : (laisser vide)
   - Publish directory : `.` (point)
5. Deploy site
6. Site settings → Domain management → Add custom domain
7. Entrer : `elisee-kourouma.fr`
8. Netlify vous donne des instructions DNS

### Étape 5 : Configurer le DNS (5 minutes)

Chez votre registrar de domaine (là où vous avez acheté elisee-kourouma.fr) :

1. Aller dans la gestion DNS
2. Ajouter un enregistrement CNAME :
   - Type : CNAME
   - Nom : `@` ou `elisee-kourouma.fr`
   - Valeur : `votre-site.netlify.app` (Netlify vous le donne)
3. (Optionnel) Pour www :
   - Type : CNAME
   - Nom : `www`
   - Valeur : `votre-site.netlify.app`

**Attendre 24-48h** pour la propagation DNS (souvent moins de 1h).

### Étape 6 : Vérifier

1. ✅ `https://elisee-kourouma.fr` fonctionne
2. ✅ Le backend répond : `https://votre-url-railway.up.railway.app/health`
3. ✅ Pas d'erreur CORS dans la console
4. ✅ L'admin panel fonctionne

---

## 🔄 Alternatives si Railway ne fonctionne pas

### Option B : Fly.io (Backend)

1. Installer Fly CLI : `curl -L https://fly.io/install.sh | sh`
2. `cd server`
3. `fly auth signup`
4. `fly launch` (suivre les instructions)
5. `fly secrets set MONGODB_URI="..."` (pour chaque variable)
6. `fly deploy`

### Option C : Cyclic (Backend)

1. Aller sur [Cyclic](https://www.cyclic.sh)
2. Sign up with GitHub
3. New App → Connect repo → Sélectionner dossier `server/`
4. Configurer les variables d'environnement dans le dashboard

---

## 📝 Checklist Finale

- [ ] MongoDB Atlas configuré
- [ ] Backend déployé (Railway/Fly.io/Cyclic)
- [ ] URL backend copiée
- [ ] Fichiers JS mis à jour avec la nouvelle URL backend
- [ ] Frontend déployé sur Netlify
- [ ] Domaine `elisee-kourouma.fr` ajouté sur Netlify
- [ ] DNS configuré chez le registrar
- [ ] SSL actif (automatique sur Netlify)
- [ ] Test de toutes les pages
- [ ] Test de l'admin panel
- [ ] Pas d'erreur CORS

---

## 🆘 Problèmes Courants

### Erreur CORS
→ Vérifier que `ALLOWED_ORIGINS` contient bien `https://elisee-kourouma.fr`

### Backend ne démarre pas
→ Vérifier toutes les variables d'environnement (MONGODB_URI, JWT_SECRET, etc.)

### DNS ne fonctionne pas
→ Attendre 24-48h, vérifier les enregistrements DNS avec `dig elisee-kourouma.fr`

### Le site charge mais l'API ne répond pas
→ Vérifier l'URL dans les fichiers JS, vérifier que le backend est en ligne

---

## 💰 Coûts

- **Netlify** : Gratuit (100GB bande passante/mois)
- **Railway** : Gratuit (500 heures/mois)
- **MongoDB Atlas** : Gratuit (512MB)
- **Domaine** : ~10-15€/an (déjà acheté)

**Total : 0€/mois** (tant que vous restez dans les limites gratuites)
