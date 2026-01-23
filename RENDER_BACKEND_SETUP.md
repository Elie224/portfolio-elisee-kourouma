# 🚀 Configuration Backend sur Render - Guide Rapide

## ⚠️ ÉTAPE CRITIQUE : Whitelist MongoDB Atlas

**AVANT TOUT**, allez sur [MongoDB Atlas](https://cloud.mongodb.com) :

1. Menu gauche → **"Network Access"**
2. Cliquer **"Add IP Address"**
3. Choisir **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Cliquer **"Confirm"**

Sans ça, le backend ne pourra PAS se connecter ! ❌

---

## 📋 Checklist de Déploiement

### ✅ Étape 1 : Créer le Service sur Render

1. Aller sur https://dashboard.render.com
2. Cliquer **"New +"** → **"Web Service"**
3. Connecter GitHub → Sélectionner **`Elie224/Mon_Portfolio`**

### ✅ Étape 2 : Configuration

**Remplir exactement comme ci-dessous :**

```
Name: portfolio-backend
Environment: Node
Region: Frankfurt (ou votre choix)
Branch: main
Root Directory: (LAISSER VIDE)
Build Command: cd server && npm install
Start Command: cd server && npm start
```

### ✅ Étape 3 : Variables d'Environnement

Cliquer sur **"Advanced"** → Ajouter ces 3 variables :

**Variable 1 :**
- Key: `MONGODB_URI`
- Value: Votre connection string MongoDB Atlas (récupérée depuis MongoDB Atlas Dashboard → Connect → Connect your application)

**Variable 2 :**
- Key: `JWT_SECRET`
- Value: `portfolio_jwt_secret_2024_changez_moi_en_production`

**Variable 3 :**
- Key: `ADMIN_EMAIL`
- Value: `kouroumaelisee@gmail.com`

⚠️ **Ne PAS ajouter `PORT`** - Render le définit automatiquement

### ✅ Étape 4 : Créer et Attendre

1. Cliquer **"Create Web Service"**
2. Attendre 2-5 minutes que Render déploie
3. Noter l'URL générée (ex: `https://portfolio-backend-xxx.onrender.com`)

### ✅ Étape 5 : Vérifier

Dans les **Logs** de Render, vous devriez voir :
```
✅ Connecté à MongoDB
🚀 Serveur démarré sur le port XXXX
```

Tester dans le navigateur :
- `https://votre-backend.onrender.com/health` → Doit afficher `{"status":"OK"}`

### ✅ Étape 6 : Mettre à jour le Frontend

Une fois l'URL notée, modifier dans le code :

**Fichier : `assets/js/admin.js` (ligne ~9)**
**Fichier : `assets/js/main.js` (ligne ~7)**

Remplacer :
```javascript
'https://votre-backend.onrender.com/api'
```

Par votre URL Render :
```javascript
'https://portfolio-backend-xxx.onrender.com/api'
```

Puis :
```bash
git add assets/js/admin.js assets/js/main.js
git commit -m "Mise à jour URL API backend"
git push
```

---

## 🔍 Vérification Finale

1. ✅ MongoDB Atlas whitelist configurée
2. ✅ Service créé sur Render
3. ✅ Variables d'environnement ajoutées
4. ✅ Backend déployé et fonctionnel (logs OK)
5. ✅ URL API mise à jour dans le frontend
6. ✅ Frontend poussé sur GitHub

## 🎯 Test Complet

1. Aller sur votre site portfolio
2. Se connecter à l'admin
3. Modifier un projet
4. Ouvrir le portfolio dans un autre navigateur
5. ✅ Les modifications doivent être visibles !

---

## ❌ Problèmes Courants

**"Cannot connect to MongoDB"**
→ Vérifier la whitelist IP dans MongoDB Atlas

**"401 Unauthorized"**
→ Vérifier que JWT_SECRET est correct

**Le backend ne démarre pas**
→ Vérifier les logs Render et que `package.json` existe

**CORS Error**
→ Le backend a déjà CORS activé, vérifier les logs

---

## 📞 Besoin d'aide ?

Vérifier les logs dans Render Dashboard → Votre service → "Logs"
