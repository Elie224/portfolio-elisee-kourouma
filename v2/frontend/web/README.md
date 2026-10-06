# Frontend V2 - Cloudflare First

Ce frontend Next.js est prevu pour un deploiement Cloudflare Workers via OpenNext.

## Commandes locales

```bash
pnpm dev
pnpm lint
pnpm build
```

Notes:
- `pnpm build` lance le build Next standard (verification application).
- `pnpm build:cloudflare` produit le bundle Cloudflare (`.open-next`).

## Preview Cloudflare local

```bash
pnpm cf:preview
```

Cela lance un build OpenNext puis un `wrangler dev` avec les bindings Cloudflare.

## Important sur Windows

OpenNext Cloudflare utilise des symlinks pendant le bundling. Sur Windows natif, tu peux avoir une erreur `EPERM`.

Recommandation:
- executer les commandes Cloudflare dans WSL.
- ou activer le mode developpeur Windows / privileges symlink adequats.

## Deploiement Cloudflare

```bash
pnpm cf:deploy
```

## Migrations D1 (depuis la racine v2)

```bash
pnpm cf:d1:migrate:local
pnpm cf:d1:migrate:remote
```

Ces commandes appliquent les SQL de `backend/db/migrations` a la base D1 via Wrangler.

Prerequis:
- `frontend/web/wrangler.toml` configure avec le vrai `database_id` D1.
- bucket R2 configure si upload image actif (`PROJECT_IMAGES_BUCKET`).
- variables runtime configurees (`APP_NAME`, `PROJECT_IMAGES_PUBLIC_BASE_URL` optionnel).

## Runtime cible

- Cloudflare Workers
- D1 (binding `DB`)
- R2 optionnel pour les images projets (binding `PROJECT_IMAGES_BUCKET`)
