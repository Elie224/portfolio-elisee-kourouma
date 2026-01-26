# 🔧 Guide : Vérifier et Corriger CORS pour le Formulaire de Contact

## 📋 Problème
Le formulaire de contact ne fonctionne pas car le backend bloque les requêtes venant de votre site `elisee-kourouma.fr`.

## ✅ Solution : Configurer CORS sur Fly.io

### Étape 1 : Ouvrir PowerShell
Ouvrez PowerShell sur votre ordinateur.

### Étape 2 : Aller dans le dossier du serveur
```powershell
cd C:\Users\KOURO\OneDrive\Desktop\Portfelio\server
```

### Étape 3 : Vérifier la configuration actuelle
Exécutez cette commande pour voir ce qui est configuré :
```powershell
flyctl secrets list -a portfolio-backend-elisee
```

Cela affichera toutes les variables d'environnement configurées, notamment `ALLOWED_ORIGINS`.

### Étape 4 : Configurer les domaines autorisés
Si `ALLOWED_ORIGINS` n'existe pas ou ne contient pas `elisee-kourouma.fr`, exécutez cette commande :

```powershell
flyctl secrets set ALLOWED_ORIGINS="https://elisee-kourouma.fr,https://www.elisee-kourouma.fr,https://dapper-hotteok-569259.netlify.app" -a portfolio-backend-elisee
```

**Explication :**
- Cette commande dit au backend : "Accepte les requêtes venant de ces 3 sites"
- `https://elisee-kourouma.fr` = votre site principal
- `https://www.elisee-kourouma.fr` = version avec www
- `https://dapper-hotteok-569259.netlify.app` = votre site Netlify (backup)

### Étape 5 : Redéployer (si nécessaire)
Après avoir modifié les secrets, Fly.io redéploie automatiquement. Attendez 1-2 minutes.

### Étape 6 : Tester
1. Allez sur `https://elisee-kourouma.fr/contact.html`
2. Remplissez le formulaire
3. Envoyez un message
4. Ça devrait fonctionner !

## 🔍 Si ça ne fonctionne toujours pas

### Vérifier les logs du serveur
```powershell
flyctl logs -a portfolio-backend-elisee
```

Cherchez les lignes avec "CORS" pour voir quelle origine est bloquée.

### Vérifier dans la console du navigateur
1. Ouvrez `elisee-kourouma.fr/contact.html`
2. Appuyez sur F12 (console développeur)
3. Allez dans l'onglet "Console"
4. Essayez d'envoyer un message
5. Regardez les erreurs affichées

## 📝 Résumé
Le problème vient du fait que le backend ne sait pas qu'il doit accepter les requêtes de votre site. La commande `flyctl secrets set ALLOWED_ORIGINS=...` lui dit quels sites sont autorisés.
