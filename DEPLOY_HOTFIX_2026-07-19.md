# Deploiement hotfix - 2026-07-19

Objectif: publier les correctifs sans embarquer les suppressions/fichiers non relies presents dans le worktree local.

## Correctifs inclus
- Securite frontend: chargement de `safe-dom.js` sur admin + project-details + about.
- Securite backend: anti-bruteforce sur `/api/portfolio/login`.
- Correctif prod mobile: ajout de `assets/js/mobile-fix.js` en racine.
- UX: texte d introduction pre-rendu dans `index.html` et `about.html` (affichage immediat).

## Fichiers a publier
- about.html
- admin.html
- index.html
- project-details.html
- assets/js/safe-dom.js
- assets/js/mobile-fix.js
- server/server.js
- server/middleware/bruteForce.js
- SECURITE.md
- ARCHITECTURE.md

## Procedure recommandee (worktree propre)
1. Ouvrir un terminal a la racine du repo.
2. Recuperer l etat distant:
   - `git fetch origin`
3. Creer un worktree propre depuis `origin/main`:
   - `git worktree add ../Portfelio-hotfix origin/main`
4. Copier uniquement les fichiers hotfix depuis le dossier courant:
   - `Copy-Item .\about.html ..\Portfelio-hotfix\about.html -Force`
   - `Copy-Item .\admin.html ..\Portfelio-hotfix\admin.html -Force`
   - `Copy-Item .\index.html ..\Portfelio-hotfix\index.html -Force`
   - `Copy-Item .\project-details.html ..\Portfelio-hotfix\project-details.html -Force`
   - `Copy-Item .\assets\js\safe-dom.js ..\Portfelio-hotfix\assets\js\safe-dom.js -Force`
   - `Copy-Item .\assets\js\mobile-fix.js ..\Portfelio-hotfix\assets\js\mobile-fix.js -Force`
   - `Copy-Item .\server\server.js ..\Portfelio-hotfix\server\server.js -Force`
   - `Copy-Item .\server\middleware\bruteForce.js ..\Portfelio-hotfix\server\middleware\bruteForce.js -Force`
   - `Copy-Item .\SECURITE.md ..\Portfelio-hotfix\SECURITE.md -Force`
   - `Copy-Item .\ARCHITECTURE.md ..\Portfelio-hotfix\ARCHITECTURE.md -Force`
5. Commit dans le worktree propre:
   - `cd ..\Portfelio-hotfix`
   - `git status --short`
   - `git add about.html admin.html index.html project-details.html assets/js/safe-dom.js assets/js/mobile-fix.js server/server.js server/middleware/bruteForce.js SECURITE.md ARCHITECTURE.md`
   - `git commit -m "Hotfix: security hardening + immediate intro rendering"`
6. Push:
   - `git push origin HEAD:main`
7. Nettoyage local du worktree temporaire:
   - `cd ..\Portfelio`
   - `git worktree remove ..\Portfelio-hotfix`

## Verification post-deploiement
- Ouvrir `/index.html` et `/about.html`: le texte long doit etre visible immediatement au chargement.
- Ouvrir `/contact.html` sur mobile: aucun 404 sur `assets/js/mobile-fix.js`.
- Ouvrir `/admin.html`: verifier en console que `safe-dom.js` est charge avant `admin.js`.
- Tester 6 tentatives de login invalide rapides: la route login doit finir en 429 (lock temporaire).
