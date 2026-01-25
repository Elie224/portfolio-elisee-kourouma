# 🚀 Guide de Déploiement Backend sur Fly.io (GRATUIT)

## 📋 Prérequis

- ✅ Compte GitHub (votre code doit être sur GitHub)
- ✅ Compte MongoDB Atlas (gratuit) - [Créer un compte](https://www.mongodb.com/cloud/atlas/register)
- ✅ Compte Fly.io (gratuit) - [Créer un compte](https://fly.io)

---

## 📝 Étape 1 : Préparer MongoDB Atlas (5 minutes)

Si vous ne l'avez pas encore fait, suivez les étapes de `GUIDE_DEPLOIEMENT_BACKEND.md` section "Étape 1".

**Résumé rapide :**
1. Créer un cluster MongoDB Atlas (gratuit M0)
2. Créer un utilisateur de base de données
3. Autoriser l'accès réseau (0.0.0.0/0)
4. Obtenir la connection string MongoDB

---

## 🔐 Étape 2 : Générer le Hash du Mot de Passe Admin (2 minutes)

### 2.1 Ouvrir PowerShell

```powershell
cd C:\Users\KOURO\OneDrive\Desktop\Portfelio\server
```

### 2.2 Générer le Hash

```powershell
node generate-password-hash.js VOTRE_MOT_DE_PASSE_ADMIN
```

**Exemple :**
```powershell
node generate-password-hash.js MonMotDePasse123!
```

⚠️ **Copiez le hash généré** - vous en aurez besoin !

---

## 🚀 Étape 3 : Installer Fly CLI (5 minutes)

### 3.1 Télécharger Fly CLI

**Option A : Via PowerShell (Recommandé)**

Ouvrez PowerShell en tant qu'administrateur et exécutez :

```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Option B : Via le site web**

1. Allez sur : https://fly.io/docs/hands-on/install-flyctl/
2. Téléchargez l'installateur Windows
3. Installez-le

### 3.2 Vérifier l'Installation

```powershell
fly version
```

Vous devriez voir la version de Fly CLI.

---

## 🔑 Étape 4 : Créer un Compte Fly.io (2 minutes)

### 4.1 Créer le Compte

1. Allez sur [fly.io](https://fly.io)
2. Cliquez sur **"Sign Up"**
3. Choisissez **"Sign up with GitHub"** (recommandé)
4. Autorisez Fly.io à accéder à votre compte GitHub

### 4.2 Se Connecter via CLI

```powershell
fly auth login
```

Suivez les instructions dans le navigateur pour vous connecter.

---

## 📦 Étape 5 : Déployer le Backend sur Fly.io (10 minutes)

### 5.1 Naviguer vers le Dossier Server

```powershell
cd C:\Users\KOURO\OneDrive\Desktop\Portfelio\server
```

### 5.2 Initialiser Fly.io (Première fois seulement)

```powershell
fly launch
```

**Questions posées par Fly.io :**

1. **App name** : Entrez un nom unique (ex: `portfolio-backend-elisee`)
   - Ou laissez vide pour un nom généré automatiquement

2. **Region** : Choisissez une région proche (ex: `cdg` pour Paris)
   - Tapez `cdg` et appuyez sur Entrée

3. **Postgres, Redis, etc.** : Appuyez sur **N** (Non) - vous utilisez MongoDB Atlas

4. **Deploy now?** : Appuyez sur **N** (Non) - on va d'abord configurer les variables

### 5.3 Configurer les Variables d'Environnement

Fly.io utilise des "secrets" pour les variables d'environnement sensibles.

**Ajoutez chaque variable avec :**

```powershell
# 1. PORT (optionnel, déjà dans fly.toml)
fly secrets set PORT=3000

# 2. NODE_ENV
fly secrets set NODE_ENV=production

# 3. MONGODB_URI (remplacez par votre vraie URI)
fly secrets set MONGODB_URI="mongodb+srv://portfolio-admin:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority"

# 4. JWT_SECRET (générez une clé de 32+ caractères)
fly secrets set JWT_SECRET="VOTRE_CLE_SECRETE_ULTRA_LONGUE_ET_ALEATOIRE"

# 5. ADMIN_EMAIL
fly secrets set ADMIN_EMAIL="votre_email@example.com"

# 6. ADMIN_PASSWORD_HASH (utilisez le hash généré à l'étape 2)
fly secrets set ADMIN_PASSWORD_HASH="$2b$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 7. ALLOWED_ORIGINS
fly secrets set ALLOWED_ORIGINS="https://elisee-kourouma.fr,https://www.elisee-kourouma.fr,https://dapper-hotteok-569259.netlify.app"

# 8. PORTFOLIO_DOMAIN
fly secrets set PORTFOLIO_DOMAIN="https://elisee-kourouma.fr"
```

**💡 Pour générer un JWT_SECRET :**

Utilisez PowerShell :
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

Ou utilisez un générateur en ligne : https://randomkeygen.com/

### 5.4 Vérifier le Fichier fly.toml

Le fichier `fly.toml` devrait déjà être configuré. Vérifiez qu'il contient :

```toml
app = "portfolio-backend-elisee"  # ou le nom que vous avez choisi
primary_region = "cdg"

[env]
  PORT = "3000"
  NODE_ENV = "production"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0

  [[http_service.checks]]
    grace_period = "10s"
    interval = "30s"
    method = "GET"
    timeout = "5s"
    path = "/health"

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

### 5.5 Déployer

```powershell
fly deploy
```

Fly.io va :
1. Construire votre application
2. Déployer sur leurs serveurs
3. Vous donner une URL

**Attendez 2-3 minutes** pour le déploiement.

### 5.6 Obtenir l'URL du Backend

Après le déploiement, Fly.io affichera l'URL, ou vous pouvez la voir avec :

```powershell
fly status
```

L'URL ressemblera à :
```
https://portfolio-backend-elisee.fly.dev
```

⚠️ **Copiez cette URL** - vous en aurez besoin pour le frontend !

### 5.7 Tester le Backend

1. Ouvrez votre navigateur
2. Allez sur : `https://votre-app.fly.dev/health`
3. Vous devriez voir : `{"status":"ok"}`
4. Si ça fonctionne, votre backend est déployé ! ✅

---

## 🔧 Étape 6 : Mettre à Jour le Frontend (5 minutes)

### 6.1 Mettre à Jour les Fichiers JavaScript

Vous devez modifier ces fichiers pour remplacer l'ancienne URL backend :

**Fichier 1 : `assets/js/portfolio.js`**
- Cherchez la ligne avec l'URL backend (vers la ligne 35)
- Remplacez :
  ```javascript
  : 'https://portfolio-backend-x47u.onrender.com/api';
  ```
- Par :
  ```javascript
  : 'https://votre-app.fly.dev/api';
  ```

**Fichier 2 : `assets/js/admin.js`**
- Cherchez la ligne avec l'URL backend (vers la ligne 27)
- Remplacez de la même manière

**Fichier 3 : `assets/js/projects.js`**
- Cherchez la ligne avec l'URL backend (vers la ligne 11)
- Remplacez de la même manière

### 6.2 Commit et Push sur GitHub

```powershell
cd C:\Users\KOURO\OneDrive\Desktop\Portfelio
git add .
git commit -m "Mise à jour URL backend vers Fly.io"
git push
```

### 6.3 Netlify Redéploie Automatiquement

- Netlify détectera automatiquement le push
- Il redéploiera votre site avec la nouvelle URL backend
- Attendez 1-2 minutes

---

## ✅ Étape 7 : Vérifier que Tout Fonctionne

### 7.1 Tester le Backend

1. **Health Check** :
   - `https://votre-app.fly.dev/health`
   - Devrait retourner : `{"status":"ok"}`

2. **API Portfolio** :
   - `https://votre-app.fly.dev/api/portfolio`
   - Devrait retourner les données du portfolio

### 7.2 Tester le Frontend

1. Allez sur votre site Netlify :
   - `https://dapper-hotteok-569259.netlify.app` (URL temporaire)
   - Ou `https://elisee-kourouma.fr` (quand DNS propagé)

2. Vérifiez la console du navigateur (F12) :
   - Pas d'erreur CORS
   - Les requêtes vers le backend fonctionnent

3. Testez l'admin panel :
   - Allez sur `/admin.html`
   - Connectez-vous avec votre email et mot de passe admin
   - Vérifiez que la connexion fonctionne

---

## 🆘 Problèmes Courants

### ❌ Le backend ne démarre pas

**Vérifiez :**
- Toutes les variables d'environnement sont définies avec `fly secrets set`
- `MONGODB_URI` est correcte (avec le mot de passe)
- `JWT_SECRET` est défini
- `ADMIN_PASSWORD_HASH` est correct

**Voir les logs :**
```powershell
fly logs
```

### ❌ Erreur CORS dans le frontend

**Vérifiez :**
- `ALLOWED_ORIGINS` contient bien votre URL Netlify
- L'URL dans `ALLOWED_ORIGINS` est exactement la même que celle du frontend
- Pas d'espace avant/après les URLs dans `ALLOWED_ORIGINS`

**Mettre à jour :**
```powershell
fly secrets set ALLOWED_ORIGINS="https://elisee-kourouma.fr,https://www.elisee-kourouma.fr,https://dapper-hotteok-569259.netlify.app"
```

### ❌ Erreur de connexion MongoDB

**Vérifiez :**
- L'URI MongoDB est correcte
- Le mot de passe dans l'URI est correct (pas d'espaces, utilisez des guillemets)
- L'accès réseau est autorisé dans MongoDB Atlas (0.0.0.0/0)
- L'utilisateur MongoDB existe et a les bonnes permissions

### ❌ Le backend répond mais l'admin ne fonctionne pas

**Vérifiez :**
- `ADMIN_EMAIL` est correct
- `ADMIN_PASSWORD_HASH` correspond au mot de passe que vous utilisez
- Regénérez le hash si nécessaire

### ❌ Erreur "fly: command not found"

**Solution :**
- Réinstallez Fly CLI (voir Étape 3)
- Ou utilisez le chemin complet : `C:\Users\VotreNom\.fly\bin\fly.exe`

---

## 📊 Commandes Fly.io Utiles

```powershell
# Voir les logs en temps réel
fly logs

# Voir le statut de l'application
fly status

# Voir les secrets configurés
fly secrets list

# Modifier un secret
fly secrets set NOM_VARIABLE="nouvelle_valeur"

# Redéployer
fly deploy

# Ouvrir l'application dans le navigateur
fly open

# Voir les informations de l'application
fly info
```

---

## 💰 Coûts Fly.io

**Plan Gratuit (Hobby) :**
- ✅ 3 machines partagées gratuites
- ✅ 3GB de stockage gratuit
- ✅ 160GB de bande passante sortante/mois
- ✅ SSL automatique
- ✅ Déploiements illimités

**Pour ce projet :**
- 1 machine (backend) = **0€/mois** ✅
- MongoDB Atlas = **0€/mois** ✅
- **Total : 0€/mois** tant que vous restez dans les limites gratuites

---

## 📝 Checklist Finale

- [ ] MongoDB Atlas créé et configuré
- [ ] Utilisateur MongoDB créé
- [ ] Accès réseau autorisé (0.0.0.0/0)
- [ ] Connection string MongoDB copiée
- [ ] Hash du mot de passe admin généré
- [ ] Fly CLI installé
- [ ] Compte Fly.io créé
- [ ] Connecté via `fly auth login`
- [ ] Application initialisée avec `fly launch`
- [ ] Toutes les variables d'environnement ajoutées avec `fly secrets set`
- [ ] Backend déployé avec `fly deploy`
- [ ] URL Fly.io copiée
- [ ] Health check fonctionne
- [ ] Fichiers JS frontend mis à jour avec la nouvelle URL
- [ ] Code commité et pushé sur GitHub
- [ ] Netlify redéployé automatiquement
- [ ] Frontend teste le backend avec succès
- [ ] Admin panel fonctionne

---

## 🎉 Félicitations !

Votre backend est maintenant déployé sur Fly.io (gratuit) ! 

**Prochaines étapes :**
1. Attendre que le DNS de Netlify se propage (pour `elisee-kourouma.fr`)
2. Tester toutes les fonctionnalités
3. Mettre à jour `ALLOWED_ORIGINS` si nécessaire quand le domaine sera actif

---

## 📚 Ressources Utiles

- [Documentation Fly.io](https://fly.io/docs/)
- [Documentation MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Guide de déploiement complet](README_DEPLOIEMENT.md)
- [Guide Netlify](GUIDE_NETLIFY.md)

---

**Besoin d'aide ?** Consultez les logs avec `fly logs` ou la section "Problèmes Courants" ci-dessus.
