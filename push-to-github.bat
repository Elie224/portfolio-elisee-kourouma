@echo off
REM Script batch pour pousser le code sur GitHub
REM Double-cliquez sur ce fichier pour l'exécuter

echo.
echo ========================================
echo   Push vers GitHub - Portfolio
echo ========================================
echo.

REM Vérifier si Git est installé
git --version >nul 2>&1
if errorlevel 1 (
    echo Erreur: Git n'est pas installe ou n'est pas dans le PATH
    pause
    exit /b 1
)

REM Mettre à jour le remote
echo [1/4] Mise a jour du remote GitHub...
git remote set-url origin https://github.com/Elie224/portfolio-elisee-kourouma.git
if errorlevel 1 (
    echo Erreur lors de la mise a jour du remote
    pause
    exit /b 1
)

REM Afficher le remote
echo.
echo Remote configure:
git remote -v
echo.

REM Afficher le statut
echo [2/4] Statut des fichiers:
git status --short
echo.

REM Demander confirmation
echo ========================================
echo   Voulez-vous continuer ? (O/N)
echo ========================================
set /p confirmation="> "

if /i not "%confirmation%"=="O" if /i not "%confirmation%"=="Oui" (
    echo Operation annulee
    pause
    exit /b 0
)

REM Faire le commit
echo.
echo [3/4] Creation du commit...
git commit -m "<svg class=emoji-icon aria-hidden=true></svg> Mise à jour : Configuration pour elisee-kourouma.fr

- Mise à jour du domaine dans tous les fichiers HTML
- Ajout des fichiers de configuration pour Netlify, Railway, Vercel
- Documentation complète de déploiement
- Configuration SEO optimisée
- Support du domaine personnalisé elisee-kourouma.fr"

if errorlevel 1 (
    echo Erreur lors du commit
    pause
    exit /b 1
)

REM Push vers GitHub
echo.
echo [4/4] Push vers GitHub...
echo <svg class=emoji-icon aria-hidden=true></svg>  Vous devrez peut-être vous authentifier avec GitHub
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo <svg class=emoji-icon aria-hidden=true></svg> Erreur lors du push
    echo <svg class=emoji-icon aria-hidden=true></svg> Vous pouvez aussi faire manuellement : git push -u origin main
    pause
    exit /b 1
) else (
    echo.
    echo <svg class=emoji-icon aria-hidden=true></svg> Code pousse avec succes sur GitHub !
    echo <svg class=emoji-icon aria-hidden=true></svg> Repository : https://github.com/Elie224/portfolio-elisee-kourouma
    echo.
)

pause
