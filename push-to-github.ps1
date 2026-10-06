# Script PowerShell pour pousser le code sur GitHub
# Exécutez ce script dans PowerShell : .\push-to-github.ps1

Write-Host "<svg class=emoji-icon aria-hidden=true></svg> Configuration du repository GitHub..." -ForegroundColor Cyan

# Vérifier si on est dans le bon dossier
if (-not (Test-Path ".git")) {
    Write-Host "<svg class=emoji-icon aria-hidden=true></svg> Erreur : Ce script doit être exécuté dans le dossier du projet" -ForegroundColor Red
    exit 1
}

# Mettre à jour le remote (HTTPS pour éviter les problèmes de clé SSH)
Write-Host "<svg class=emoji-icon aria-hidden=true></svg> Mise à jour du remote GitHub (HTTPS)..." -ForegroundColor Yellow
git remote set-url origin https://github.com/Elie224/portfolio-elisee-kourouma.git

# Vérifier le remote
Write-Host "<svg class=emoji-icon aria-hidden=true></svg> Remote configuré :" -ForegroundColor Green
git remote -v

# Vérifier le statut
Write-Host "`n<svg class=emoji-icon aria-hidden=true></svg> Statut des fichiers :" -ForegroundColor Cyan
git status --short

# Demander confirmation
Write-Host "`n<svg class=emoji-icon aria-hidden=true></svg> Voulez-vous continuer avec le commit et le push ? (O/N)" -ForegroundColor Yellow
$confirmation = Read-Host

if ($confirmation -ne "O" -and $confirmation -ne "o" -and $confirmation -ne "Oui" -and $confirmation -ne "oui") {
    Write-Host "<svg class=emoji-icon aria-hidden=true></svg> Opération annulée" -ForegroundColor Red
    exit 0
}

# Faire le commit
Write-Host "`n<svg class=emoji-icon aria-hidden=true></svg> Création du commit..." -ForegroundColor Yellow
$commitMessage = "<svg class=emoji-icon aria-hidden=true></svg> Mise à jour : Configuration pour elisee-kourouma.fr

- Mise à jour du domaine dans tous les fichiers HTML
- Ajout des fichiers de configuration pour Netlify, Railway, Vercel
- Documentation complète de déploiement
- Configuration SEO optimisée
- Support du domaine personnalisé elisee-kourouma.fr"

git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "<svg class=emoji-icon aria-hidden=true></svg> Erreur lors du commit" -ForegroundColor Red
    exit 1
}

# Push vers GitHub
Write-Host "`n<svg class=emoji-icon aria-hidden=true></svg> Push vers GitHub..." -ForegroundColor Yellow
Write-Host "<svg class=emoji-icon aria-hidden=true></svg>  Vous devrez peut-être vous authentifier avec GitHub" -ForegroundColor Yellow

# Essayer de push sur main
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n<svg class=emoji-icon aria-hidden=true></svg> Code poussé avec succès sur GitHub !" -ForegroundColor Green
    Write-Host "<svg class=emoji-icon aria-hidden=true></svg> Repository : https://github.com/Elie224/portfolio-elisee-kourouma" -ForegroundColor Cyan
} else {
    Write-Host "`n<svg class=emoji-icon aria-hidden=true></svg> Erreur lors du push. Vérifiez votre authentification GitHub." -ForegroundColor Red
    Write-Host "<svg class=emoji-icon aria-hidden=true></svg> Vous pouvez aussi faire manuellement : git push -u origin main" -ForegroundColor Yellow
    Write-Host "<svg class=emoji-icon aria-hidden=true></svg> Si vous utilisez SSH, assurez-vous d'avoir configuré votre clé SSH GitHub" -ForegroundColor Yellow
}
