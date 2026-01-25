# 🚀 Guide de Déploiement Netlify - Étape par Étape

## 📋 Prérequis

- ✅ Compte Netlify créé
- ✅ Projet sur GitHub (ou GitLab/Bitbucket)
- ✅ Fichier `netlify.toml` déjà présent dans votre projet (✅ configuré)

---

## 📝 Étape 1 : Connecter votre Repository GitHub

1. **Connectez-vous à Netlify** : https://app.netlify.com
2. Cliquez sur **"Add new site"** → **"Import an existing project"**
3. Choisissez **"Deploy with GitHub"** (ou GitLab/Bitbucket selon votre cas)
4. Autorisez Netlify à accéder à votre compte GitHub
5. Sélectionnez votre repository **"Portfelio"** (ou le nom de votre repo)

---

## ⚙️ Étape 2 : Configurer les Paramètres de Déploiement

Netlify devrait détecter automatiquement votre configuration grâce au fichier `netlify.toml`, mais vérifiez :

### Paramètres de Build

- **Build command** : *(laisser vide - pas de build nécessaire pour un site statique)*
- **Publish directory** : `.` (point - le répertoire racine)

> 💡 **Note** : Votre fichier `netlify.toml` configure déjà tout automatiquement, donc ces paramètres devraient être détectés.

### Cliquez sur **"Deploy site"**

---

## ⏳ Étape 3 : Attendre le Déploiement

1. Netlify va déployer votre site
2. Vous verrez une URL temporaire comme : `https://random-name-12345.netlify.app`
3. Le déploiement prend généralement **1-2 minutes**

---

## 🌐 Étape 4 : Ajouter votre Domaine Personnalisé

1. Dans votre dashboard Netlify, allez dans **"Site settings"**
2. Cliquez sur **"Domain management"** dans le menu de gauche
3. Cliquez sur **"Add custom domain"**
4. Entrez votre domaine : `elisee-kourouma.fr`
5. Cliquez sur **"Verify"**

---

## 🔍 Étape 4.5 : Voir les Instructions DNS dans Netlify

Si vous voyez **"Pending DNS verification"** (comme sur votre écran), voici comment voir les instructions :

### Méthode 1 : Via le bouton "Options"

1. Dans **"Domain management"**, vous devriez voir votre domaine `elisee-kourouma.fr`
2. À droite du domaine, il y a un bouton **"Options"** (ou trois points `⋯`)
3. Cliquez sur **"Options"**
4. Dans le menu déroulant, cherchez :
   - **"Verify DNS configuration"**
   - **"Check DNS configuration"**
   - **"DNS settings"**
   - Ou **"View DNS configuration"**
5. Cliquez dessus → Netlify vous affichera les **instructions DNS exactes**

### Méthode 2 : Directement dans la page

1. Dans **"Domain management"**, cherchez une section qui dit :
   - **"DNS configuration"**
   - **"Point your DNS to Netlify"**
   - **"Configure DNS"**
2. Cliquez dessus pour voir les instructions

### Méthode 3 : Via "Verify DNS configuration"

1. Cliquez directement sur le domaine `elisee-kourouma.fr` (pas sur Options)
2. Netlify devrait afficher une page avec les instructions DNS
3. Vous verrez soit :
   - **Des serveurs DNS** à configurer (plus simple)
   - **Des enregistrements DNS** à créer (A ou CNAME)

### Ce que vous verrez dans Netlify :

**Option A - Serveurs DNS (Recommandé) :**
```
dns1.p01.nsone.net
dns2.p01.nsone.net
```
→ Vous devez changer les serveurs DNS chez votre registrar

**Option B - Enregistrements DNS :**
```
Type: A
Name: @
Value: 75.2.60.5
```
OU
```
Type: CNAME
Name: @
Value: dapper-hotteok-569259.netlify.app
```
→ Vous devez créer ces enregistrements chez votre registrar

---

## 📍 Comment Trouver Votre Registrar (Où vous avez acheté le domaine)

Le **registrar** est le service où vous avez acheté votre domaine `elisee-kourouma.fr`. Voici comment le trouver :

### Méthode 1 : Vérifier vos emails
- Cherchez dans vos emails les mots-clés : "domaine", "domain", "elisee-kourouma.fr"
- Vous devriez trouver des emails de confirmation d'achat de domaine
- Le nom du service sera dans l'expéditeur (ex: OVH, Namecheap, GoDaddy, etc.)

### Méthode 2 : Utiliser un outil en ligne
1. Allez sur : https://whois.net ou https://whois.com
2. Entrez : `elisee-kourouma.fr`
3. Cherchez la ligne **"Registrar"** ou **"Registrar Name"**
4. Cela vous dira où votre domaine est enregistré

### Méthode 3 : Vérifier vos comptes
Les registrars les plus courants en France :
- **OVH** : https://www.ovh.com
- **Gandi** : https://www.gandi.net
- **Namecheap** : https://www.namecheap.com
- **GoDaddy** : https://www.godaddy.com
- **1&1 IONOS** : https://www.ionos.fr

Connectez-vous à ces services pour voir si vous avez un compte.

---

## ⚙️ Option A : Si Netlify peut vérifier automatiquement
- Netlify configurera automatiquement le DNS
- Suivez les instructions à l'écran

## ⚙️ Option B : Si vous devez configurer manuellement le DNS

### Étape 1 : Voir les instructions dans Netlify

1. Dans **"Domain management"**, cliquez sur **"Options"** à côté de `elisee-kourouma.fr`
2. Ou cherchez un bouton **"DNS configuration"** ou **"Verify DNS"**
3. Netlify vous donnera **deux options** :

#### Option B1 : Utiliser les serveurs DNS de Netlify (RECOMMANDÉ - Plus simple)

Netlify vous donnera des serveurs DNS comme :
```
dns1.p01.nsone.net
dns2.p01.nsone.net
```

**Chez votre registrar :**
1. Connectez-vous à votre compte registrar
2. Allez dans la gestion de votre domaine
3. Cherchez **"DNS servers"**, **"Name servers"** ou **"Serveurs DNS"**
4. Remplacez les serveurs DNS actuels par ceux fournis par Netlify
5. Sauvegardez

**Avantage** : Netlify gère tout automatiquement, vous n'avez rien d'autre à faire !

#### Option B2 : Configurer les enregistrements DNS manuellement

Si vous gardez les serveurs DNS de votre registrar, vous devez créer des enregistrements :

**Chez votre Registrar de Domaine :**

1. **Connectez-vous** à votre compte registrar (OVH, Gandi, etc.)
2. Allez dans la **gestion DNS** de votre domaine (cherchez "DNS", "Zone DNS", "DNS Management")
3. **Ajoutez/modifiez** ces enregistrements selon ce que Netlify vous indique :

**Pour le domaine principal (`elisee-kourouma.fr`) :**

Netlify vous donnera soit :
- **Une adresse IP** (ex: `75.2.60.5`) → Créer un enregistrement **A**
- **Un CNAME** (ex: `dapper-hotteok-569259.netlify.app`) → Créer un enregistrement **CNAME**

**Si Netlify donne une IP :**
```
Type: A
Nom: @ (ou elisee-kourouma.fr ou laisser vide)
Valeur: [IP fournie par Netlify - ex: 75.2.60.5]
TTL: 3600 (ou Auto)
```

**Si Netlify donne un CNAME :**
```
Type: CNAME
Nom: @ (ou elisee-kourouma.fr ou laisser vide)
Valeur: [votre-site].netlify.app (ex: dapper-hotteok-569259.netlify.app)
TTL: 3600
```

**Pour le sous-domaine www (optionnel) :**
```
Type: CNAME
Nom: www
Valeur: [votre-site].netlify.app (ex: dapper-hotteok-569259.netlify.app)
TTL: 3600
```

4. **Sauvegardez** les modifications

> ⚠️ **Important** : Les valeurs exactes (IP ou CNAME) sont affichées dans Netlify. Utilisez celles que Netlify vous donne, pas celles de cet exemple !

---

## 📝 Instructions par Registrar (Exemples)

### OVH (France)
1. Connectez-vous : https://www.ovh.com/manager/
2. **Web Cloud** → **Domaines** → Sélectionnez `elisee-kourouma.fr`
3. **Zone DNS** → Cliquez sur **"Ajouter une entrée"**
4. Choisissez le type (A ou CNAME) et remplissez selon les instructions Netlify
5. Cliquez sur **"Valider"**

### Gandi
1. Connectez-vous : https://www.gandi.net/fr
2. **Domaines** → Cliquez sur `elisee-kourouma.fr`
3. **Enregistrements DNS** → **"Ajouter"**
4. Remplissez selon les instructions Netlify
5. **"Soumettre"**

### Namecheap
1. Connectez-vous : https://www.namecheap.com
2. **Domain List** → Cliquez sur **"Manage"** à côté de `elisee-kourouma.fr`
3. **Advanced DNS** → **"Add New Record"**
4. Remplissez selon les instructions Netlify
5. **"Save"**

### GoDaddy
1. Connectez-vous : https://www.godaddy.com
2. **My Products** → **DNS** à côté de `elisee-kourouma.fr`
3. **"Add"** dans la section Records
4. Remplissez selon les instructions Netlify
5. **"Save"**

---

## 🔒 Étape 5 : Activer le SSL/HTTPS

1. Netlify configure automatiquement le SSL via Let's Encrypt
2. Dans **"Domain management"**, vous verrez **"SSL certificate"**
3. Attendez quelques minutes que le certificat soit généré
4. Le statut passera de "Pending" à "Active"

> ⚠️ **Important** : Le SSL ne sera actif qu'après que le DNS soit correctement configuré et propagé.

---

## ⏱️ Étape 6 : Attendre la Propagation DNS

- **Temps moyen** : 1-24 heures (souvent moins de 1 heure)
- Vous pouvez vérifier la propagation avec : https://dnschecker.org
- Entrez votre domaine et vérifiez que les enregistrements pointent vers Netlify

---

## ✅ Étape 7 : Vérifier le Déploiement

### Vérifications à faire :

1. **URL temporaire Netlify** :
   - [ ] `https://votre-site.netlify.app` fonctionne
   - [ ] Toutes les pages se chargent correctement

2. **Domaine personnalisé** (après propagation DNS) :
   - [ ] `https://elisee-kourouma.fr` fonctionne
   - [ ] `https://www.elisee-kourouma.fr` fonctionne (si configuré)
   - [ ] Le certificat SSL est actif (cadenas vert dans le navigateur)

3. **Pages du site** :
   - [ ] `https://elisee-kourouma.fr/` - Page d'accueil
   - [ ] `https://elisee-kourouma.fr/about.html` - À propos
   - [ ] `https://elisee-kourouma.fr/projects.html` - Projets
   - [ ] `https://elisee-kourouma.fr/contact.html` - Contact

4. **Fichiers statiques** :
   - [ ] `https://elisee-kourouma.fr/sitemap.xml` - Sitemap
   - [ ] `https://elisee-kourouma.fr/robots.txt` - Robots.txt

---

## 🔄 Étape 8 : Configurer le Déploiement Automatique

Par défaut, Netlify déploie automatiquement à chaque push sur la branche `main` (ou `master`).

### Pour vérifier/modifier :

1. **Site settings** → **"Build & deploy"**
2. **"Continuous Deployment"** :
   - Branche de production : `main` (ou `master`)
   - Build command : *(vide)*
   - Publish directory : `.`

### Options supplémentaires :

- **Deploy previews** : Netlify crée automatiquement une preview pour chaque Pull Request
- **Branch deploys** : Déploiement automatique pour d'autres branches

---

## 🎯 Configuration Avancée (Déjà Configurée)

Votre fichier `netlify.toml` configure déjà :

✅ **Redirections SPA** : Toutes les routes pointent vers `index.html`  
✅ **Headers de sécurité** : Protection XSS, Clickjacking, etc.  
✅ **Cache optimisé** : Assets statiques mis en cache, HTML toujours frais  
✅ **Content-Type corrects** : Pour CSS, JS, images, PDF  

Aucune action supplémentaire nécessaire ! 🎉

---

## 🔧 Mettre à Jour l'URL du Backend

⚠️ **Important** : Si vous n'avez pas encore déployé le backend, vous devrez mettre à jour l'URL dans les fichiers JavaScript après le déploiement du backend.

Fichiers à modifier :
- `assets/js/portfolio.js` (ligne ~35)
- `assets/js/admin.js` (ligne ~27)
- `assets/js/projects.js` (ligne ~11)

Remplacer :
```javascript
: 'https://portfolio-backend-x47u.onrender.com/api';
```

Par votre nouvelle URL backend (ex: Railway, Fly.io, etc.) :
```javascript
: 'https://votre-backend.railway.app/api';
```

Puis **commit et push** sur GitHub → Netlify redéploiera automatiquement !

---

## 🆘 Problèmes Courants

### ❌ Le site ne se charge pas
- Vérifiez les logs de déploiement dans Netlify
- Vérifiez que tous les fichiers sont bien dans le repository
- Vérifiez que le "Publish directory" est bien `.`

### ❌ Erreur DNS / Domaine ne fonctionne pas
- Attendez 24-48h pour la propagation complète
- Vérifiez les enregistrements DNS avec `dig elisee-kourouma.fr` ou https://dnschecker.org
- Vérifiez que les enregistrements DNS sont corrects chez votre registrar

### ❌ Certificat SSL en attente
- Le SSL ne s'active qu'après la propagation DNS
- Vérifiez que le DNS pointe bien vers Netlify
- Attendez quelques heures après la propagation DNS

### ❌ Les pages ne se chargent pas (404)
- Vérifiez que le fichier `netlify.toml` est bien présent
- Vérifiez que la redirection `/*` → `/index.html` est configurée
- Vérifiez les logs de déploiement dans Netlify

### ❌ Les assets (CSS/JS/images) ne se chargent pas
- Vérifiez les chemins dans vos fichiers HTML (doivent être relatifs)
- Vérifiez que les fichiers existent dans le repository
- Vérifiez la console du navigateur pour les erreurs 404

---

## 📊 Monitoring et Analytics (Optionnel)

Netlify offre des analytics gratuits :

1. **Site settings** → **"Analytics"**
2. Activez **"Netlify Analytics"** (plan gratuit disponible)
3. Vous verrez :
   - Nombre de visiteurs
   - Pages les plus visitées
   - Référents
   - Géolocalisation des visiteurs

---

## 🎉 Félicitations !

Votre site est maintenant déployé sur Netlify ! 

**Prochaines étapes** :
1. Déployer le backend (Railway, Fly.io, etc.) - voir `GUIDE_RAPIDE.md`
2. Mettre à jour les URLs backend dans les fichiers JS
3. Tester toutes les fonctionnalités
4. Configurer le backend pour accepter les requêtes depuis `elisee-kourouma.fr`

---

## 📚 Ressources Utiles

- [Documentation Netlify](https://docs.netlify.com/)
- [Netlify Community](https://answers.netlify.com/)
- [Guide de déploiement complet](README_DEPLOIEMENT.md)
- [Guide rapide avec backend](GUIDE_RAPIDE.md)

---

**Besoin d'aide ?** Consultez les logs de déploiement dans Netlify ou la section "Problèmes Courants" ci-dessus.
