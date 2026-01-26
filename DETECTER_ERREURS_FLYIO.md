# 🔍 Guide : Détecter et Corriger les Erreurs sur Fly.io

## 📋 Objectif
Avoir 0% d'erreurs sur votre backend déployé sur Fly.io.

## 🔍 Comment voir les erreurs sur Fly.io

### 1. Voir les logs en temps réel

```powershell
cd C:\Users\KOURO\OneDrive\Desktop\Portfelio\server
flyctl logs -a portfolio-backend-elisee
```

**Options utiles :**
- `flyctl logs -a portfolio-backend-elisee --region all` : Voir les logs de toutes les régions
- `flyctl logs -a portfolio-backend-elisee --json` : Format JSON pour analyse
- `flyctl logs -a portfolio-backend-elisee | grep "❌"` : Filtrer uniquement les erreurs

### 2. Voir les logs récents (sans filtre de temps)

```powershell
# Voir les dernières lignes (par défaut, les 100 dernières)
flyctl logs -a portfolio-backend-elisee -n

# Voir les logs en continu (streaming)
flyctl logs -a portfolio-backend-elisee
```

**Note** : `flyctl logs` ne supporte pas l'option `--since`. Pour filtrer par date, utilisez PowerShell :
```powershell
flyctl logs -a portfolio-backend-elisee | Select-String "2026-01-26"
```

### 3. Voir les logs avec filtres

```powershell
# Voir uniquement les VRAIES erreurs serveur (exclut les erreurs CORS normales)
flyctl logs -a portfolio-backend-elisee | Select-String "❌ Erreur serveur non gérée|❌ Erreur lors|❌ Erreur MongoDB|DATABASE_ERROR|SERVER_ERROR" | Select-String -NotMatch "CORS|cors|Origine requise"

# Voir uniquement les erreurs critiques (500, erreurs MongoDB, etc.)
flyctl logs -a portfolio-backend-elisee | Select-String "❌ Erreur serveur non gérée|DATABASE_ERROR|MongoDB.*erreur|connection.*failed"

# Voir les requêtes API
flyctl logs -a portfolio-backend-elisee | Select-String "📥.*GET|📥.*POST"

# Voir les connexions MongoDB
flyctl logs -a portfolio-backend-elisee | Select-String "MongoDB|connect|✅ Connecté"
```

### 4. Voir les métriques et statistiques

```powershell
# Voir les métriques de l'application
flyctl metrics -a portfolio-backend-elisee

# Voir l'état de santé
flyctl status -a portfolio-backend-elisee
```

## 🐛 Types d'erreurs courantes

### 1. Erreurs 500 (Erreur serveur interne)
**Causes possibles :**
- Erreur de connexion MongoDB
- Erreur de validation des données
- Erreur dans le code JavaScript
- Variable d'environnement manquante

**Comment détecter :**
```powershell
flyctl logs -a portfolio-backend-elisee | Select-String "500|Erreur serveur|Error"
```

### 2. Erreurs 400 (Requête invalide)
**Causes possibles :**
- Données manquantes ou invalides
- Validation échouée
- Format de données incorrect

**Comment détecter :**
```powershell
flyctl logs -a portfolio-backend-elisee | Select-String "400|Validation|invalid"
```

### 3. Erreurs 401/403 (Authentification)
**Causes possibles :**
- Token manquant ou invalide
- Token expiré
- Email non autorisé

**Comment détecter :**
```powershell
flyctl logs -a portfolio-backend-elisee | Select-String "401|403|Token|auth"
```

### 4. Erreurs 429 (Trop de requêtes)
**Causes possibles :**
- Rate limiting activé
- Trop de requêtes depuis la même IP

**Comment détecter :**
```powershell
flyctl logs -a portfolio-backend-elisee | Select-String "429|Rate limit|Trop de"
```

### 5. Erreurs CORS (maintenant gérées silencieusement)
**Causes possibles :**
- Origine non autorisée
- Headers manquants
- Requêtes sans origin (health checks, curl, etc.) - **NORMAL, ne pas considérer comme erreur**

**Note importante** : Les erreurs CORS pour les requêtes sans origin (comme les health checks) sont maintenant gérées silencieusement et ne sont plus loggées comme erreurs serveur. C'est normal et attendu.

**Comment détecter les vraies erreurs CORS :**
```powershell
# Voir uniquement les erreurs CORS avec une vraie origine (pas les health checks)
flyctl logs -a portfolio-backend-elisee | Select-String "🚫 CORS.*Origine non autorisée"
```

## 🔧 Commandes de diagnostic

### Vérifier l'état de l'application
```powershell
flyctl status -a portfolio-backend-elisee
```

### Voir les machines actives
```powershell
flyctl machines list -a portfolio-backend-elisee
```

### Voir les variables d'environnement
```powershell
flyctl secrets list -a portfolio-backend-elisee
```

### Tester l'endpoint health
```powershell
curl https://portfolio-backend-elisee.fly.dev/health
```

### Tester l'endpoint principal
```powershell
curl https://portfolio-backend-elisee.fly.dev/api/portfolio
```

## 📊 Analyser les erreurs

### 1. Compter les erreurs par type
```powershell
flyctl logs -a portfolio-backend-elisee --since 24h | Select-String "❌" | Group-Object | Sort-Object Count -Descending
```

### 2. Voir les erreurs les plus fréquentes
```powershell
flyctl logs -a portfolio-backend-elisee --since 24h | Select-String "ERROR|Error" | ForEach-Object { $_.Line } | Group-Object | Sort-Object Count -Descending | Select-Object -First 10
```

### 3. Voir les requêtes qui échouent
```powershell
flyctl logs -a portfolio-backend-elisee | Select-String "500|400|401|403|429"
```

## ✅ Solutions pour réduire les erreurs

### 1. Améliorer la gestion d'erreurs
- Toutes les routes doivent avoir un `try/catch`
- Retourner des codes d'erreur appropriés (400, 401, 500)
- Logger toutes les erreurs avec des détails

### 2. Valider les données
- Valider toutes les données entrantes
- Vérifier les types et formats
- Rejeter les données invalides avec un message clair

### 3. Gérer les erreurs MongoDB
- Vérifier la connexion avant chaque requête
- Gérer les erreurs de connexion gracieusement
- Retourner des données par défaut en cas d'erreur

### 4. Améliorer les logs
- Logger toutes les erreurs avec contexte
- Inclure le chemin, la méthode, l'origine
- Logger les stack traces pour le débogage

## 🎯 Checklist pour 0% d'erreurs

- [ ] Toutes les routes ont un `try/catch`
- [ ] Toutes les erreurs sont loggées avec `console.error`
- [ ] Les codes d'erreur HTTP sont appropriés (400, 401, 500)
- [ ] Les erreurs MongoDB sont gérées
- [ ] Les erreurs de validation sont claires
- [ ] Les erreurs CORS sont résolues
- [ ] Les variables d'environnement sont toutes configurées
- [ ] Le health check fonctionne
- [ ] Les logs sont consultables et clairs

## 📝 Exemple de commande complète

```powershell
# Voir toutes les erreurs des dernières 24h
cd C:\Users\KOURO\OneDrive\Desktop\Portfelio\server
flyctl logs -a portfolio-backend-elisee --since 24h | Select-String "❌|ERROR|Error|500|400" | Out-File errors.txt
notepad errors.txt
```

## 🔗 Liens utiles

- **Dashboard Fly.io** : https://fly.io/apps/portfolio-backend-elisee
- **Documentation Fly.io** : https://fly.io/docs/
- **Logs en ligne** : https://fly.io/apps/portfolio-backend-elisee/monitoring
