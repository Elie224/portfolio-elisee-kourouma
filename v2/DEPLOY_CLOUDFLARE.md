# Deploiement Cloudflare (Frontend + Backend)

Ce projet V2 est deployee sur Cloudflare pour le frontend et le backend API.

## 1) Prerequis

- Compte Cloudflare connecte via Wrangler:

```bash
pnpm --filter web exec wrangler login
```

- Depuis la racine `v2`, installer les dependances:

```bash
pnpm install
```

## 2) Configurer Wrangler

Fichier: `frontend/web/wrangler.toml`

Champs a renseigner:
- `database_id` (D1 production)
- `preview_database_id` (optionnel, recommande)
- `bucket_name` (R2)

Exemple (structure deja presente):

```toml
[[d1_databases]]
binding = "DB"
database_name = "portfolio-v2-db"
database_id = "<D1_PROD_ID>"
preview_database_id = "<D1_PREVIEW_ID>"
migrations_dir = "../../backend/db/migrations"

[[r2_buckets]]
binding = "PROJECT_IMAGES_BUCKET"
bucket_name = "<R2_BUCKET_NAME>"
```

## 3) Variables runtime

Configurer les secrets/vars necessaires:

```bash
pnpm --filter web exec wrangler secret put ADMIN_EMAIL
pnpm --filter web exec wrangler secret put ADMIN_PASSWORD
pnpm --filter web exec wrangler secret put ADMIN_SESSION_TOKEN
```

Optionnel (URL publique CDN/R2 pour images):

```bash
pnpm --filter web exec wrangler secret put PROJECT_IMAGES_PUBLIC_BASE_URL
```

Variable non-secrete deja prevue dans `wrangler.toml`:
- `APP_NAME`

## 4) Appliquer les migrations D1

Depuis `v2`:

```bash
pnpm cf:d1:migrate:local
pnpm cf:d1:migrate:remote
```

Migrations sources:
- `backend/db/migrations/0001_messages.sql`
- `backend/db/migrations/0002_projects.sql`
- `backend/db/migrations/0003_projects_image_url.sql`
- `backend/db/migrations/0004_projects_thumbnail_url.sql`
- `backend/db/migrations/0005_site_content.sql`

## 5) Build + Preview Cloudflare

```bash
pnpm build:cloudflare
pnpm cf:preview
```

## 6) Deploy production Cloudflare

```bash
pnpm cf:deploy
```

## 7) Verification post-deploiement

- Health API: `/api/health`
- Public projects: `/projects`
- Admin login: `/admin/login`
- Upload image admin + fallback/thumbnail

## Notes Windows

OpenNext Cloudflare peut echouer sur Windows natif (symlink `EPERM`).

Recommande:
- executer les commandes Cloudflare dans WSL
- ou activer les permissions symlink (mode developpeur + droits adequats)
