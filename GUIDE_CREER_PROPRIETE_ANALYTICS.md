# 📊 Guide : Créer une Propriété Google Analytics

## 🎯 Objectif
Créer une propriété Google Analytics pour suivre le trafic de votre site `elisee-kourouma.fr`

## 📋 Étapes détaillées

### Étape 1 : Accéder à Google Analytics

1. **Allez sur** : https://analytics.google.com/
2. **Connectez-vous** avec votre compte Google (le même que Gmail)

### Étape 2 : Créer un compte (si vous n'en avez pas)

Si c'est votre première fois sur Google Analytics :

1. Cliquez sur **"Commencer la mesure"** ou **"Créer un compte"**
2. **Nom du compte** : Entrez un nom (ex: "Mon Portfolio" ou "Nema Kourouma")
3. Cliquez sur **"Suivant"**

### Étape 3 : Créer une propriété

Une propriété = un site web à suivre

1. **Nom de la propriété** : 
   - Entrez : `elisee-kourouma.fr`
   - Ou : `Portfolio Nema Kourouma`

2. **Fuseau horaire** :
   - Sélectionnez : `(GMT+01:00) Paris`

3. **Devise** :
   - Sélectionnez : `Euro (€)`

4. Cliquez sur **"Suivant"**

### Étape 4 : Informations sur votre entreprise

1. **Secteur d'activité** :
   - Sélectionnez : `Technologie` ou `Éducation`
   - Ou : `Autre`

2. **Taille de l'entreprise** :
   - Sélectionnez : `1-10 employés` ou `Juste moi`

3. **Comment comptez-vous utiliser Google Analytics ?** :
   - Cochez : `Mesurer les performances de mon site web`
   - Vous pouvez cocher plusieurs options

4. Cliquez sur **"Créer"**

### Étape 5 : Accepter les conditions

1. Lisez les conditions d'utilisation
2. Cochez les cases d'acceptation
3. Cliquez sur **"J'accepte"**

### Étape 6 : Obtenir votre ID de mesure

Une fois la propriété créée :

1. **Google Analytics vous montre votre ID de mesure**
   - Format : `G-XXXXXXXXXX` (exemple : `G-ABC123XYZ`)
   - **⚠️ IMPORTANT : Copiez cet ID immédiatement !**

2. **OU si vous ne voyez pas l'ID** :
   - Cliquez sur **"Administration"** (icône ⚙️ en bas à gauche)
   - Dans la colonne **"Propriété"**, cliquez sur **"Flux de données"**
   - Cliquez sur votre flux de données (ou créez-en un nouveau)
   - Vous verrez votre **ID de mesure** (format : `G-XXXXXXXXXX`)
   - **Copiez cet ID**

### Étape 7 : Configurer dans votre portfolio

1. **Connectez-vous à votre admin** :
   - https://elisee-kourouma.fr/admin.html

2. **Allez dans l'onglet "⚙️ Paramètres"**

3. **Section "Analytics"** :
   - Champ : **"ID Google Analytics (optionnel)"**
   - Collez votre ID : `G-XXXXXXXXXX`
   - ⚠️ **Important** : Entrez uniquement l'ID, pas l'URL complète

4. **Cliquez sur "💾 Enregistrer les paramètres du portfolio"**

5. **Rechargez votre site** pour activer Google Analytics

## 🖼️ À quoi ressemble l'interface ?

```
Google Analytics
├── Administration (⚙️)
│   ├── Compte
│   │   └── [Votre compte]
│   └── Propriété
│       ├── Détails de la propriété
│       ├── Flux de données ← ICI pour trouver l'ID
│       └── Paramètres
└── Rapports
    ├── Temps réel
    ├── Acquisition
    └── Engagement
```

## 📝 Exemple concret

**Nom du compte** : `Mon Portfolio`  
**Nom de la propriété** : `elisee-kourouma.fr`  
**Fuseau horaire** : `(GMT+01:00) Paris`  
**Devise** : `Euro (€)`  
**ID de mesure** : `G-ABC123XYZ` ← **À copier dans l'admin**

## ✅ Checklist

- [ ] Compte Google Analytics créé
- [ ] Propriété créée pour `elisee-kourouma.fr`
- [ ] ID de mesure obtenu (format `G-XXXXXXXXXX`)
- [ ] ID copié
- [ ] ID configuré dans l'interface admin
- [ ] Paramètres sauvegardés
- [ ] Site rechargé

## 🔗 Liens directs

- **Google Analytics** : https://analytics.google.com/
- **Créer un compte** : https://analytics.google.com/ (cliquez sur "Commencer la mesure")
- **Administration** : https://analytics.google.com/ (icône ⚙️ en bas à gauche)

## 💡 Astuce

Si vous avez déjà un compte Google Analytics :
- Allez dans **"Administration"** (⚙️)
- Cliquez sur **"Créer une propriété"** en haut
- Suivez les étapes 3 à 7 ci-dessus

---

**Note** : La création d'une propriété est gratuite et prend environ 2 minutes.
