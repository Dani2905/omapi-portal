# OMAPI API (cPanel)

Application Express dédiée à OMAPI, séparée du site et des données du Cabinet. Le service comprend les contrôles de santé PostgreSQL, l'authentification Admin, la gestion des comptes autorisés et le stockage API des contenus OMAPI. Pour les formulaires, guides, législation et réglages, exécuter `schema/create_resources_library_settings.sql` sur `ciprabem_omapi_portal`. Les tables des programmes, événements, emplois, GOPI et du journal d’activité existent déjà; les scripts `schema/grant_programme_permissions.sql` et `schema/grant_jobs_gopi_permissions.sql` accordent les droits de l’API. Pour l’état lu/non lu, `schema/create_activity_notifications.sql` crée la seule table manquante (`notification_reads`) et accorde les droits du journal. Aucun ancien journal ni état local n'est importé.

Les copies localStorage des modules raccordés sont supprimées uniquement après une réponse API réussie pour leur collection. Pour ce module, seules `omapi_activities` et `omapi_read_notifications` sont concernées; aucune autre clé du navigateur n'est touchée et rien n'est importé.

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

Au démarrage, l'application crée ce compte Admin uniquement si `app_users` est vide. Après la création, supprimer les trois variables `OMAPI_BOOTSTRAP_ADMIN_*` de cPanel et redémarrer l'application. Aucun compte n'est créé par défaut et aucune inscription publique de compte n'est offerte.

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
- `GET /api/content/forms|guides|legislation|formations|events|jobs|gopi` — lecture publique des catalogues (pour les événements, seul un compte agrégé d'inscriptions est renvoyé; aucune candidature ni commande nominative n'est exposée).
- `POST|PATCH|DELETE /api/admin/library/:collection[/:id]` — gestion sécurisée des collections documentaires par Admin/Éditeur.
- `GET /api/admin/programs/:collection` et `POST|PATCH|DELETE /api/admin/programs/:collection[/:id]` — gestion authentifiée des catalogues formations, événements, emplois et GOPI.
- `POST /api/public/registrations/formations|events` — soumission publique d'une inscription; validation, prévention des doublons et limitation de débit côté serveur.
- `GET /api/admin/registrations/formations|events` — consultation authentifiée des inscriptions nominatives.
- `DELETE /api/admin/registrations/formations|events/:id` — suppression authentifiée d’une inscription.
- `POST /api/public/job-applications` — candidature publique avec CV/lettre (PDF, DOC ou DOCX vérifiés côté serveur).
- `GET /api/admin/job-applications`, `PATCH|DELETE /api/admin/job-applications/:id` — consultation, changement de statut et suppression authentifiés.
- `POST /api/public/gopi-orders` — demande GOPI publique, prix et statut initial établis côté serveur.
- `GET /api/admin/gopi/orders`, `PATCH|DELETE /api/admin/gopi/orders/:id` — consultation et gestion authentifiées des commandes.
- `GET /api/admin/activity-logs` — lecture authentifiée du journal d’activité; les écritures d’administration sont enregistrées sans données personnelles dans le détail.
- `GET|PUT /api/admin/notification-reads` — lecture et sauvegarde authentifiées des notifications lues, séparément pour chaque compte.
- `GET /api/content/settings` — lecture publique des réglages autorisés.
- `PUT /api/admin/settings/site_config|home_resources` — sauvegarde sécurisée des réglages du site et des ressources d’accueil.
- Les routes éditoriales restent disponibles pour actualités, carrousel et annonces.

Les mots de passe sont hachés avec scrypt; seuls les condensats des jetons de session sont stockés dans PostgreSQL. Les secrets ne sont jamais renvoyés dans les réponses. Les données personnelles des participants ne sont jamais retournées par les routes publiques.

Le portail admin, le profil, la gestion des comptes, les contenus éditoriaux, les documents et réglages, les formations/événements et leurs inscriptions, les offres/candidatures, les publications/commandes GOPI, le journal d’activité et l’état des notifications utilisent l’API. Les catalogues restent publics; candidatures, coordonnées et commandes ne sont accessibles qu’aux Admin/Éditeurs authentifiés. Le journal ne conserve pas de détails personnels de formulaire; les notifications lues sont associées au compte connecté. Le jeton Bearer est conservé dans `sessionStorage` (onglet courant). GOPI ne déclenche ni paiement ni envoi automatique de PDF/e-mail.
