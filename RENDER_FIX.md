# Fix pour les erreurs MIME type sur Render

## Problème

Les fichiers CSS et JavaScript sont servis avec le mauvais MIME type (`text/plain` au lieu de `text/css` et `application/javascript`).

## Solution

1. **Mettre à jour render.yaml** (déjà fait) avec les bons Content-Type headers
2. **Créer un fichier static.json** pour Render (si render.yaml ne fonctionne pas)

## Actions à prendre sur Render

### Option 1 : Utiliser render.yaml (recommandé)

Le fichier `render.yaml` a été mis à jour avec les bons MIME types. Assurez-vous que :

1. Dans le dashboard Render, le fichier `render.yaml` est détecté
2. Les headers sont correctement appliqués

### Option 2 : Configuration manuelle dans Render

Si le fichier `render.yaml` ne fonctionne pas, configurez manuellement dans Render :

1. Allez dans **Settings** > **Headers**
2. Ajoutez ces headers :

```
Path: /assets/css/*
Header: Content-Type
Value: text/css; charset=utf-8

Path: /assets/js/*
Header: Content-Type
Value: application/javascript; charset=utf-8

Path: /assets/*.jpeg
Header: Content-Type
Value: image/jpeg

Path: /assets/*.pdf
Header: Content-Type
Value: application/pdf

Path: /*.html
Header: Content-Type
Value: text/html; charset=utf-8
```

### Option 3 : Utiliser un fichier .htaccess (si Render utilise Apache)

Créer un fichier `.htaccess` à la racine :

```apache
<IfModule mod_mime.c>
    AddType text/css .css
    AddType application/javascript .js
    AddType image/jpeg .jpeg .jpg
    AddType image/png .png
    AddType application/pdf .pdf
</IfModule>
```

## Vérification

Après le déploiement, vérifiez les headers avec :

```bash
curl -I https://mon-portfolio-sdlk.onrender.com/assets/css/styles.css
curl -I https://mon-portfolio-sdlk.onrender.com/assets/js/main.js
```

Les headers doivent montrer :
- `Content-Type: text/css` pour les CSS
- `Content-Type: application/javascript` pour les JS

## Redéploiement

1. Les fichiers ont été poussés sur GitHub
2. Render devrait redéployer automatiquement
3. Si ce n'est pas le cas, allez dans Render > **Manual Deploy** > **Deploy latest commit**
