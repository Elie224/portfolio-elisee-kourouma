# Script PowerShell pour démarrer le portfolio en local
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Démarrage du Portfolio en Local" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Node.js est installé
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js installé : $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Node.js n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "Veuillez installer Node.js depuis https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

Write-Host ""
Write-Host "[1/3] Vérification des dépendances du backend..." -ForegroundColor Yellow
Set-Location server

if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dépendances..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERREUR] Échec de l'installation des dépendances" -ForegroundColor Red
        Read-Host "Appuyez sur Entrée pour quitter"
        exit 1
    }
} else {
    Write-Host "Dépendances déjà installées." -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/3] Vérification du fichier .env..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "[ATTENTION] Le fichier .env n'existe pas!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez créer un fichier .env dans le dossier server/" -ForegroundColor Yellow
    Write-Host "Vous pouvez copier .env.example et le modifier:" -ForegroundColor Yellow
    Write-Host "  Copy-Item .env.example .env" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Variables requises:" -ForegroundColor Yellow
    Write-Host "  - MONGODB_URI" -ForegroundColor White
    Write-Host "  - JWT_SECRET" -ForegroundColor White
    Write-Host "  - ADMIN_EMAIL" -ForegroundColor White
    Write-Host "  - ADMIN_PASSWORD_HASH" -ForegroundColor White
    Write-Host ""
    Write-Host "Consultez GUIDE_DEMARRAGE_LOCAL.md pour plus d'informations" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
} else {
    Write-Host "Fichier .env trouvé." -ForegroundColor Green
}

Write-Host ""
Write-Host "[3/3] Démarrage du serveur backend..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Le serveur va démarrer sur http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour servir le frontend, ouvrez un autre terminal et:" -ForegroundColor Yellow
Write-Host "  - Avec Python: python -m http.server 8000" -ForegroundColor White
Write-Host "  - Avec Node.js: npx http-server -p 8000" -ForegroundColor White
Write-Host "  - Ou utilisez VS Code Live Server" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Démarrer le serveur en mode développement
npm run dev
