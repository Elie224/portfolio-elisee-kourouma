# Mon Portfolio

Portfolio professionnel de Nema Elisée Kourouma - Développeur Full-Stack spécialisé en Intelligence Artificielle.

## 🚀 Fonctionnalités

- **Page d'accueil** : Présentation, statistiques, compétences, projets en vedette
- **Page À propos** : Description détaillée, parcours, valeurs, statistiques
- **Page Projets** : Liste complète des projets avec filtres et recherche
- **Page Contact** : Formulaire de contact et informations
- **Page Admin** : Interface d'administration complète (CRUD)
  - Gestion des informations personnelles
  - Gestion des projets (ajout, modification, suppression)
  - Gestion des compétences
  - Gestion des témoignages
  - Gestion de la timeline
  - Gestion des services
  - Gestion des certifications
  - Gestion de la FAQ
  - Paramètres SEO et Analytics

## 🛠️ Technologies

- HTML5
- CSS3 (avec animations avancées)
- JavaScript (Vanilla)
- LocalStorage pour le stockage des données
- Design responsive avec support mobile complet

## 📦 Installation

1. Clonez le repository :
```bash
git clone https://github.com/Elie224/Mon_Portfolio.git
cd Mon_Portfolio
```

2. Ouvrez `index.html` dans votre navigateur ou utilisez un serveur local :
```bash
# Avec Python
python -m http.server 8000

# Avec Node.js (http-server)
npx http-server
```

## 🔐 Accès Admin

- **Email** : kouroumaelisee@gmail.com
- **Mot de passe** : admin123

## 📱 Responsive Design

Le portfolio est entièrement responsive et optimisé pour :
- 📱 Mobile (< 480px)
- 📱 Tablette (481px - 768px)
- 💻 Desktop (> 768px)

## 🚀 Déploiement sur Render

Le portfolio est prêt pour le déploiement sur Render :

1. Créez un nouveau service **Static Site** sur Render
2. Connectez votre repository GitHub : `Elie224/Mon_Portfolio`
3. Configuration :
   - **Build Command** : (vide, pas de build nécessaire)
   - **Publish Directory** : `.` (racine du projet)
4. Déployez !

## 📄 Structure du Projet

```
Mon_Portfolio/
├── index.html          # Page d'accueil
├── about.html          # Page À propos
├── projects.html       # Page Projets
├── project-details.html # Page détails projet
├── contact.html        # Page Contact
├── admin.html          # Page Admin
├── 404.html           # Page 404
├── assets/
│   ├── css/
│   │   └── styles.css  # Styles principaux
│   ├── js/
│   │   ├── main.js     # JavaScript public
│   │   └── admin.js    # JavaScript admin
│   ├── photo.jpeg      # Photo de profil
│   └── CV.pdf          # CV
├── render.yaml         # Configuration Render
└── README.md           # Documentation
```

## 📝 Notes

- Les données sont stockées dans le `localStorage` du navigateur
- Pour un déploiement en production, envisagez d'utiliser une base de données backend
- Le fichier `render.yaml` est configuré pour le déploiement sur Render

## 📧 Contact

Pour toute question ou suggestion, n'hésitez pas à me contacter !

---

© 2024 Mon Portfolio - Tous droits réservés
