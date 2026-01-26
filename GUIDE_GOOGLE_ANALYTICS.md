# 📊 Guide d'Installation Google Analytics

## 🎯 Objectif
Suivre le trafic de votre site web avec Google Analytics pour voir :
- Nombre de visiteurs
- Pages les plus visitées
- Durée de visite
- Provenance des visiteurs
- Appareils utilisés (mobile, desktop, tablette)

## 📋 Étapes d'installation

### 1. **Créer un compte Google Analytics**

1. Allez sur : https://analytics.google.com/
2. Connectez-vous avec votre compte Google
3. Cliquez sur **"Commencer la mesure"**
4. Créez un compte Analytics (si vous n'en avez pas)
5. Créez une propriété pour votre site :
   - Nom de la propriété : `elisee-kourouma.fr`
   - Fuseau horaire : `(GMT+01:00) Paris`
   - Devise : `Euro (€)`
6. Cliquez sur **"Créer"**

### 2. **Obtenir votre ID de mesure (Measurement ID)**

1. Dans Google Analytics, allez dans **"Administration"** (icône ⚙️ en bas à gauche)
2. Cliquez sur **"Flux de données"** dans la section "Propriété"
3. Cliquez sur votre flux de données (ou créez-en un nouveau)
4. Vous verrez votre **ID de mesure** (format : `G-XXXXXXXXXX`)
5. **Copiez cet ID** (exemple : `G-ABC123XYZ`)

### 3. **Configurer Google Analytics dans votre portfolio**

1. Connectez-vous à votre interface admin :
   - https://elisee-kourouma.fr/admin.html
   - Ou : https://dapper-hotteok-569259.netlify.app/admin.html

2. Allez dans l'onglet **"⚙️ Paramètres"**

3. Dans la section **"Analytics"**, entrez votre ID Google Analytics :
   - Champ : **"ID Google Analytics (optionnel)"**
   - Exemple : `G-ABC123XYZ`
   - ⚠️ **Important** : Entrez uniquement l'ID (ex: `G-ABC123XYZ`), pas l'URL complète

4. Cliquez sur **"💾 Enregistrer les paramètres du portfolio"**

5. **Rechargez votre site** pour que Google Analytics soit activé

### 4. **Vérifier que Google Analytics fonctionne**

1. Visitez votre site : https://elisee-kourouma.fr
2. Ouvrez les outils de développement (F12)
3. Allez dans l'onglet **"Réseau"** (Network)
4. Filtrez par **"gtag"** ou **"analytics"**
5. Vous devriez voir des requêtes vers `googletagmanager.com`

**OU** utilisez l'extension Chrome "Google Analytics Debugger" pour vérifier que les événements sont envoyés.

### 5. **Voir vos statistiques**

1. Retournez sur https://analytics.google.com/
2. Attendez **24-48 heures** pour voir les premières données
3. Dans le menu de gauche, allez dans **"Rapports"** → **"Temps réel"** pour voir les visiteurs en direct
4. **"Rapports"** → **"Acquisition"** pour voir d'où viennent vos visiteurs
5. **"Rapports"** → **"Engagement"** pour voir les pages les plus visitées

## 📊 Données disponibles

Une fois configuré, vous pourrez voir :

- **Visiteurs en temps réel** : Qui visite votre site maintenant
- **Nombre de visiteurs** : Par jour, semaine, mois
- **Pages les plus visitées** : Quelles pages sont les plus populaires
- **Durée de session** : Combien de temps les visiteurs restent
- **Taux de rebond** : Pourcentage de visiteurs qui quittent immédiatement
- **Provenance** : D'où viennent vos visiteurs (Google, réseaux sociaux, liens directs)
- **Appareils** : Mobile, desktop, tablette
- **Pays/Villes** : Géolocalisation des visiteurs

## 🔧 Dépannage

### Google Analytics ne fonctionne pas ?

1. **Vérifiez l'ID** :
   - Format correct : `G-XXXXXXXXXX` (commence par G-)
   - Pas d'espaces avant/après
   - Pas d'URL complète, juste l'ID

2. **Videz le cache** :
   - Appuyez sur `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)
   - Ou videz le cache du navigateur

3. **Vérifiez la console** :
   - Ouvrez F12 → Console
   - Cherchez les erreurs liées à Google Analytics

4. **Vérifiez les paramètres** :
   - Retournez dans l'admin
   - Vérifiez que l'ID est bien sauvegardé
   - Rechargez la page

### Les données n'apparaissent pas ?

- ⏰ **Attendez 24-48 heures** : Google Analytics met du temps à collecter et afficher les données
- 📊 Utilisez **"Temps réel"** pour voir les visiteurs immédiatement
- 🔍 Vérifiez que vous êtes sur la bonne propriété dans Google Analytics

## 🔗 Liens utiles

- **Google Analytics** : https://analytics.google.com/
- **Documentation GA4** : https://support.google.com/analytics/answer/10089681
- **Google Tag Assistant** : Extension Chrome pour tester Google Analytics

## ✅ Checklist

- [ ] Compte Google Analytics créé
- [ ] ID de mesure obtenu (format `G-XXXXXXXXXX`)
- [ ] ID configuré dans l'interface admin
- [ ] Paramètres sauvegardés
- [ ] Site rechargé
- [ ] Vérification dans la console (F12)
- [ ] Données visibles dans Google Analytics (après 24-48h)

---

**Note** : Google Analytics est gratuit et respecte la vie privée. Les données sont anonymisées et utilisées uniquement pour les statistiques.
