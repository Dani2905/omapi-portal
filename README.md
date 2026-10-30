# Portail OMAPI

Application web de l’Office Malgache de la Propriété Industrielle. Le site est construit avec React, TypeScript et Vite.

## Développement local

Prérequis : Node.js et npm.

```bash
npm install
npm run dev
```

Vérifications disponibles :

```bash
npm run lint
npm run build
npm run test:resources
```

## Déploiement Netlify

Le fichier `netlify.toml` configure automatiquement le site : commande de build `npm run build`, dossier publié `dist`, et redirection SPA vers `index.html` pour permettre le rechargement direct des routes React.

Dans Netlify, importer le dépôt GitHub du portail et lancer le déploiement. Aucun secret d’API n’est requis pour le front-end actuel.

## Données et base de données

À ce stade, plusieurs réglages et données de l’administration sont conservés dans le stockage local du navigateur (`localStorage`). Ils ne sont donc pas partagés entre visiteurs et navigateurs et ne constituent pas une base centrale.

La connexion PostgreSQL devra passer par un backend/API sécurisé. Ne jamais placer des identifiants PostgreSQL ou d’autres secrets dans le code front-end ou dans les variables exposées au navigateur.
