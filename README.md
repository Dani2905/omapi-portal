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
npm run test:users
```

## Déploiement Netlify

Le fichier `netlify.toml` configure la commande de build `npm run build`, le dossier publié `dist`, et la redirection SPA vers `index.html` pour permettre le rechargement direct des routes React.

Importer le dépôt GitHub du portail dans Netlify puis déployer. Le front-end appelle l’API OMAPI à `https://www.omapi.ciprabemananjara.mg`; aucun mot de passe ni secret d’API n’est requis dans Netlify.

## Authentification et données

La connexion Admin, la vérification de session, la déconnexion et la mise à jour du profil passent par l’API OMAPI. Le jeton Bearer est conservé dans `sessionStorage` et expire côté serveur après 12 heures. Le backend et ses consignes cPanel sont dans `backend/README.md`.

Les autres données de l’administration restent actuellement dans le stockage local du navigateur et ne sont pas centralisées. Les candidatures web restent en mode local, conformément au périmètre convenu. Toute connexion PostgreSQL doit passer par le backend; ne jamais intégrer d’identifiants ou de secrets dans le front-end, GitHub ou Netlify.
