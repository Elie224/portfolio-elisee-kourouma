@echo off
echo ========================================
echo   Demarrage du Portfolio en Local
echo ========================================
echo.

REM Vérifier si Node.js est installé
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installe ou n'est pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Verification des dependances du backend...
cd server
if not exist "node_modules" (
    echo Installation des dependances...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Echec de l'installation des dependances
        pause
        exit /b 1
    )
) else (
    echo Dependances deja installees.
)

echo.
echo [2/3] Verification du fichier .env...
if not exist ".env" (
    echo [ATTENTION] Le fichier .env n'existe pas!
    echo.
    echo Veuillez creer un fichier .env dans le dossier server/
    echo Vous pouvez copier .env.example et le modifier:
    echo   copy .env.example .env
    echo.
    echo Variables requises:
    echo   - MONGODB_URI
    echo   - JWT_SECRET
    echo   - ADMIN_EMAIL
    echo   - ADMIN_PASSWORD_HASH
    echo.
    pause
    exit /b 1
) else (
    echo Fichier .env trouve.
)

echo.
echo [3/3] Demarrage du serveur backend...
echo.
echo Le serveur va demarrer sur http://localhost:3000
echo.
echo Pour servir le frontend, ouvrez un autre terminal et:
echo   - Avec Python: python -m http.server 8000
echo   - Avec Node.js: npx http-server -p 8000
echo   - Ou utilisez VS Code Live Server
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
echo ========================================
echo.

call npm run dev
