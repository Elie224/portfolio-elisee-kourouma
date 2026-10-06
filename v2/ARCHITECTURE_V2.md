# Architecture V2 - Portfolio

## Statut
Blueprint de demarrage (Phase 0) active.

## Objectif
Construire une V2 isolee de la V1 avec:
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Runtime cible Cloudflare
- Donnees dynamiques D1
- Contenu stable en MDX

## Structure actuelle

```
v2/
  frontend/
    web/          # App Next.js
  backend/
    db/           # Types et requetes DB partages
  package.json
  pnpm-workspace.yaml
```

## Commandes

```bash
cd v2
pnpm install
pnpm dev
```

## Prochaine etape
- Ajouter les routes publiques (home, projects, contact)
- Ajouter un schema D1 complet (projects, messages, settings)
- Brancher un premier endpoint API `/api/health`

## Etat actuel des messages (contact)
- Le formulaire `/contact` enregistre les messages via l'API.
- Le module `/admin/messages` liste les messages et permet de marquer un message comme lu.
- Persistance: D1 en priorite si binding `DB` disponible, fallback local JSON sinon (`frontend/web/.data/messages.json`).
- Migration SQL de base: `backend/db/migrations/0001_messages.sql`.

## Etat actuel des projets
- Source des projets: couche `D1-first` (fallback sur le catalogue local pour le dev rapide).
- Les pages `/`, `/projects`, `/projects/[slug]` et l'API `/api/projects` lisent via cette couche.
- Migration SQL de base: `backend/db/migrations/0002_projects.sql`.
- Les projets supportent maintenant `imageUrl` (upload via admin et rendu public).
- Upload admin: `POST /api/admin/uploads/project-image` (stockage local `public/uploads/projects` + miroir R2 si binding present).
- Si `PROJECT_IMAGES_PUBLIC_BASE_URL` est defini et le miroir R2 reussi, l'API renvoie automatiquement l'URL publique CDN/R2.
- Nettoyage image: `DELETE /api/admin/uploads/project-image` (suppression locale et suppression R2 quand possible).
- UX admin: upload image avec drag and drop + barre de progression dans `/admin/projects`.
- UX media: compression client (jpeg/png/webp) avant upload pour reduire le poids des images.
- Rendu image: fallback automatique sur placeholder local si l'URL image est invalide/cassee.
- Miniatures: `thumbnailUrl` genere et stocke en plus de `imageUrl` pour alleger les listes (home/catalogue).
- Chargement image: lazy-loading explicite + skeleton de chargement sur les cartes projets.

## Parite admin V1 -> V2 (etat)
- Module V2 ajoute: `/admin/content` pour gerer les sections V1 manquantes en mode centralise.
- Sections prises en charge: `personal`, `about`, `links`, `skills`, `timeline`, `activeSearches`, `certifications`, `stages`, `alternances`, `techEvents`, `services`, `faq`, `reports`.
- Sections prises en charge: `personal`, `about`, `links`, `skills`, `timeline`, `activeSearches`, `certifications`, `stages`, `alternances`, `techEvents`, `services`, `faq`, `reports`, `seo`, `settings`, `account`.
- Persistance: table D1 `site_content` (fallback local JSON en dev) via `lib/portfolio-content-store.ts`.
- Route admin: `GET/PATCH /api/admin/content`.
- Les pages publiques `/`, `/about`, `/services`, `/reports`, `/contact` lisent maintenant ces donnees admin.

## Configuration Cloudflare (D1)
- Fichier pret: `frontend/web/wrangler.toml`.
- Binding requis: `DB` (D1).
- Remplacer `database_id` par l'identifiant de ta base D1 de production.
- Optionnel: binding R2 `PROJECT_IMAGES_BUCKET` pour mirroring des images projets.
- Build/deploy frontend Cloudflare: scripts `build:cloudflare`, `cf:preview`, `cf:deploy` configures.
- Sur Windows natif, OpenNext peut echouer (symlink `EPERM`); execution recommandee via WSL.

## Auth admin (etat actuel)
- Routes protegees: `/admin/*` et `/api/admin/*` via proxy.
- Exception login: `/admin/login` et `/api/admin/login`.
- Session: cookie HTTP-only `portfolio_admin_session`.
- Variables a definir: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_TOKEN`.
- Acces admin non expose en navigation publique.
- Entree admin par lien specifique: `/auth-admin/<ADMIN_ENTRY_TOKEN>` (cookie temporaire avant login).
- Variable additionnelle: `ADMIN_ENTRY_TOKEN`.
- Exemple local: `frontend/web/.env.local.example`.
