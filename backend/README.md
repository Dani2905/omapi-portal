# OMAPI API (cPanel)

Application Express dédiée à OMAPI, séparée du site et des données du Cabinet. Le service comprend les contrôles de santé PostgreSQL, l'authentification Admin et la mise à jour sécurisée du profil. Les données CRUD métier restent encore locales au front-end.

## cPanel Setup Node.js App

- Node.js : `22.23.4`
- Mode : `Production`
- Application root : `omapi-api` (hors de `public_html`)
- Startup file : `app.js`
- URL cPanel : le sous-domaine OMAPI; l'alias `www` peut pointer vers la même application.

## Variables à saisir dans cPanel

- `PGHOST=localhost`
- `PGPORT=5432`
- `PGDATABASE=ciprabem_omapi_portal`
- `PGUSER=ciprabem_omapi_api`
- `PGPASSWORD` : mot de passe, uniquement dans cPanel
- `ALLOWED_ORIGINS=https://omapiportal.netlify.app`

Pour créer le premier administrateur, renseigner temporairement ces variables dans cPanel, puis redémarrer l'application :

- `OMAPI_BOOTSTRAP_ADMIN_NAME`
- `OMAPI_BOOTSTRAP_ADMIN_EMAIL`
- `OMAPI_BOOTSTRAP_ADMIN_PASSWORD` (12 caractères minimum, saisi uniquement dans cPanel)

Au démarrage, l'application crée ce compte Admin uniquement si `app_users` est vide. Après la création, supprimer les trois variables `OMAPI_BOOTSTRAP_ADMIN_*` de cPanel et redémarrer l'application. Aucun compte n'est créé par défaut et aucune inscription publique n'est offerte.

Ne placez aucun mot de passe, jeton ou secret dans GitHub, Netlify ou les fichiers source.

## Routes disponibles

- `GET /health` — processus API.
- `GET /api/health/database` — test PostgreSQL (`SELECT 1`).
- `POST /api/auth/login` — connexion par e-mail/mot de passe; retourne un jeton Bearer de 12 heures.
- `GET /api/auth/me` — informations du compte de la session Bearer.
- `PATCH /api/auth/profile` — mise à jour du nom et de l'e-mail; changement de mot de passe avec vérification du mot de passe actuel et 12 caractères minimum.
- `POST /api/auth/logout` — révocation de la session courante.
- `GET /api/admin/users` — liste des comptes, réservée au rôle `Admin`.
- `POST /api/admin/users` — création d’un compte; le mot de passe est haché côté serveur.
- `PATCH /api/admin/users/:id` — modification du compte, des droits et du mot de passe temporaire éventuel.
- `DELETE /api/admin/users/:id` — suppression protégée contre l’auto-suppression, la suppression du compte principal et celle du dernier Admin actif.

Les mots de passe sont hachés avec scrypt; seuls les condensats des jetons de session sont stockés dans PostgreSQL. Les secrets ne sont jamais renvoyés dans les réponses.

Le formulaire de connexion Netlify, la vérification du guard Admin, la déconnexion, la modification du profil et la gestion des comptes Admin/Éditeur utilisent ces routes. Le jeton Bearer est conservé dans `sessionStorage` (onglet courant). Les autres données/CRUD de l'administration restent pour l'instant côté navigateur; les comptes de démonstration locaux ne sont pas importés automatiquement et aucune migration des candidatures web n'est incluse.
