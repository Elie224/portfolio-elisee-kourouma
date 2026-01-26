# Script PowerShell pour pousser le code sur GitHub
# Exécutez ce script dans PowerShell : .\push-to-github.ps1

Write-Host "🚀 Configuration du repository GitHub..." -ForegroundColor Cyan

# Vérifier si on est dans le bon dossier
if (-not (Test-Path ".git")) {
    Write-Host "❌ Erreur : Ce script doit être exécuté dans le dossier du projet" -ForegroundColor Red
    exit 1
}

# Mettre à jour le remote (HTTPS pour éviter les problèmes de clé SSH)
Write-Host "📡 Mise à jour du remote GitHub (HTTPS)..." -ForegroundColor Yellow
git remote set-url origin https://github.com/Elie224/portfolio-elisee-kourouma.git

# Vérifier le remote
Write-Host "✅ Remote configuré :" -ForegroundColor Green
git remote -v

# Vérifier le statut
Write-Host "`n📊 Statut des fichiers :" -ForegroundColor Cyan
git status --short

# Demander confirmation
Write-Host "`n❓ Voulez-vous continuer avec le commit et le push ? (O/N)" -ForegroundColor Yellow
$confirmation = Read-Host

if ($confirmation -ne "O" -and $confirmation -ne "o" -and $confirmation -ne "Oui" -and $confirmation -ne "oui") {
    Write-Host "❌ Opération annulée" -ForegroundColor Red
    exit 0
}

# Faire le commit
Write-Host "`n💾 Création du commit..." -ForegroundColor Yellow
$commitMessage = "✨ Mise à jour : Configuration pour elisee-kourouma.fr

- Mise à jour du domaine dans tous les fichiers HTML
- Ajout des fichiers de configuration pour Netlify, Railway, Vercel
- Documentation complète de déploiement
- Configuration SEO optimisée
- Support du domaine personnalisé elisee-kourouma.fr"

git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du commit" -ForegroundColor Red
    exit 1
}

# Push vers GitHub
Write-Host "`n📤 Push vers GitHub..." -ForegroundColor Yellow
Write-Host "⚠️  Vous devrez peut-être vous authentifier avec GitHub" -ForegroundColor Yellow

# Essayer de push sur main
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Code poussé avec succès sur GitHub !" -ForegroundColor Green
    Write-Host "🔗 Repository : https://github.com/Elie224/portfolio-elisee-kourouma" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Erreur lors du push. Vérifiez votre authentification GitHub." -ForegroundColor Red
    Write-Host "💡 Vous pouvez aussi faire manuellement : git push -u origin main" -ForegroundColor Yellow
    Write-Host "💡 Si vous utilisez SSH, assurez-vous d'avoir configuré votre clé SSH GitHub" -ForegroundColor Yellow
}
