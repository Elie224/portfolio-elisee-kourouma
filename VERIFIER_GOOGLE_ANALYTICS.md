# 🔍 Guide : Vérifier que Google Analytics fonctionne

## 📋 Problème
Google Analytics montre 0 visiteurs alors que votre site est sur Google.

## ✅ Vérifications à faire

### 1. Vérifier que l'ID est bien configuré dans l'admin

1. **Connectez-vous à votre admin** :
   - https://elisee-kourouma.fr/admin.html
   - Ou : https://dapper-hotteok-569259.netlify.app/admin.html

2. **Allez dans l'onglet "⚙️ Paramètres"**

3. **Vérifiez le champ "ID Google Analytics"** :
   - Doit contenir un ID au format : `G-XXXXXXXXXX`
   - Exemple : `G-ABC123XYZ`
   - ⚠️ **Important** : Pas d'espaces avant ou après
   - ⚠️ **Important** : Commence par `G-` suivi de lettres et chiffres

4. **Si l'ID est vide ou incorrect** :
   - Entrez votre ID Google Analytics
   - Cliquez sur "💾 Enregistrer les paramètres du portfolio"
   - Attendez 2-3 secondes
   - Rechargez la page admin pour vérifier que c'est bien sauvegardé

### 2. Vérifier que Google Analytics est chargé sur votre site

1. **Visitez votre site** : https://elisee-kourouma.fr

2. **Ouvrez les outils de développement** (F12)

3. **Allez dans l'onglet "Console"** :
   - Cherchez les messages avec "📊" ou "Google Analytics"
   - Vous devriez voir : "📊 Chargement de Google Analytics: G-XXXXXXXXXX"
   - Puis : "✅ Google Analytics initialisé avec succès"

4. **Allez dans l'onglet "Réseau" (Network)** :
   - Filtrez par "gtag" ou "analytics"
   - Vous devriez voir des requêtes vers `googletagmanager.com`
   - Les requêtes doivent avoir le statut `200` (succès)

5. **Vérifiez dans l'onglet "Application" (Chrome)** :
   - Allez dans "Storage" > "Cookies" > "https://elisee-kourouma.fr"
   - Vous devriez voir des cookies commençant par `_ga` ou `_gid`

### 3. Vérifier dans Google Analytics

1. **Allez sur** : https://analytics.google.com/

2. **Vérifiez que vous êtes sur la bonne propriété** :
   - En haut à gauche, vérifiez le nom de la propriété
   - Doit correspondre à `elisee-kourouma.fr`

3. **Allez dans "Rapports" > "Temps réel"** :
   - Visitez votre site dans un autre onglet
   - Vous devriez voir apparaître 1 visiteur en temps réel
   - ⚠️ **Note** : Le temps réel fonctionne immédiatement, mais les rapports standards prennent 24-48h

4. **Vérifiez les "Flux de données"** :
   - Administration (⚙️) > Propriété > Flux de données
   - Vérifiez que l'URL de votre site est bien configurée
   - L'URL doit être : `https://elisee-kourouma.fr`

### 4. Tester avec Google Tag Assistant

1. **Installez l'extension Chrome** : "Google Tag Assistant" (Legacy)

2. **Visitez votre site** : https://elisee-kourouma.fr

3. **Cliquez sur l'icône Tag Assistant** dans Chrome

4. **Cliquez sur "Enable"** puis rechargez la page

5. **Vérifiez les tags détectés** :
   - Vous devriez voir "Google Analytics" avec un statut vert
   - Si c'est rouge, il y a un problème de configuration

### 5. Vérifier que l'ID est correct

1. **Dans Google Analytics** :
   - Administration (⚙️) > Propriété > Flux de données
   - Cliquez sur votre flux de données
   - **Copiez l'ID de mesure** (format : `G-XXXXXXXXXX`)

2. **Comparez avec l'ID dans votre admin** :
   - Les deux doivent être identiques
   - Pas d'espaces, pas de caractères supplémentaires

## 🔧 Solutions aux problèmes courants

### Problème : "Google Analytics non configuré - ID manquant"
**Solution** : L'ID n'est pas configuré dans l'admin. Allez dans Paramètres > Analytics et entrez votre ID.

### Problème : "Format ID Google Analytics invalide"
**Solution** : L'ID n'est pas au bon format. Il doit être : `G-XXXXXXXXXX` (G- suivi de lettres et chiffres).

### Problème : Aucune requête vers googletagmanager.com
**Solution** : 
- Vérifiez que l'ID est bien sauvegardé dans l'admin
- Videz le cache du navigateur (Ctrl+Shift+Delete)
- Rechargez la page en mode privé

### Problème : Les données n'apparaissent pas dans Google Analytics
**Solutions** :
- ⏰ **Attendez 24-48 heures** : Les rapports standards prennent du temps
- ✅ **Vérifiez le temps réel** : Ça fonctionne immédiatement
- 🔍 **Vérifiez que vous êtes sur la bonne propriété** dans Google Analytics
- 🌐 **Vérifiez que l'URL du flux de données** correspond à votre site

## 📝 Checklist de vérification

- [ ] ID Google Analytics configuré dans l'admin (format G-XXXXXXXXXX)
- [ ] Paramètres sauvegardés dans l'admin
- [ ] Messages "Google Analytics" visibles dans la console (F12)
- [ ] Requêtes vers googletagmanager.com visibles dans l'onglet Réseau
- [ ] Cookies `_ga` ou `_gid` présents
- [ ] Visiteurs visibles en temps réel dans Google Analytics
- [ ] URL du flux de données correcte dans Google Analytics

## 🆘 Si rien ne fonctionne

1. **Vérifiez que votre ID est correct** :
   - Administration > Propriété > Flux de données
   - Copiez l'ID exact

2. **Supprimez et recréez l'ID dans l'admin** :
   - Effacez le champ "ID Google Analytics"
   - Sauvegardez
   - Rechargez la page
   - Entrez à nouveau l'ID
   - Sauvegardez

3. **Videz le cache** :
   - Ctrl+Shift+Delete
   - Cochez "Images et fichiers en cache"
   - Effacez

4. **Testez en mode privé** :
   - Ouvrez une fenêtre de navigation privée
   - Visitez votre site
   - Vérifiez la console (F12)

## 📊 Liens utiles

- **Google Analytics** : https://analytics.google.com/
- **Google Tag Assistant** : Extension Chrome
- **Documentation GA4** : https://support.google.com/analytics/answer/10089681
