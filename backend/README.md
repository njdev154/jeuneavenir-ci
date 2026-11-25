# Backend JeuneAvenir CI

Application Laravel de développement local. Elle sert les pages du dépôt parent sur la même origine, expose une première API d’orientation et contient une tranche expérimentale d'authentification serveur, désactivée par défaut.

## Prérequis

- PHP 8.3 ou plus récent
- Composer

## Démarrer en local

Depuis le dossier `backend/` :

```powershell
composer install
php artisan serve --host 127.0.0.1 --port 8000
```

Le site et l’API sont disponibles sur `http://127.0.0.1:8000`. La route web ne sert que les pages HTML à la racine et les fichiers publics des répertoires `assets/`, `css/`, `data/` et `js/`; les fichiers du backend, de la documentation et de configuration restent hors de cette liste.

## Authentification de développement

Les routes `/auth/status`, `/auth/register`, `/auth/login`, `/auth/current` et `/auth/logout` sont réservées aux environnements Laravel `local` et `testing`. L'inscription/connexion des pages HTML s'active seulement si le statut serveur indique `ACCOUNTS_ENABLED=true`; le réglage est `false` par défaut. Les contrôleurs refusent les opérations en production, même si l'indicateur est activé; les écritures sans jeton CSRF sont bloquées avant le contrôleur. Pour les tester localement, définir `ACCOUNTS_ENABLED=true` dans `backend/.env`, puis exécuter `php artisan migrate` et démarrer le serveur lié à `127.0.0.1`.

L'inscription crée uniquement un rôle `jeune`; toute tentative d'envoyer un rôle est refusée. Les mots de passe sont hachés, les sessions Laravel sont régénérées après inscription/connexion et invalidées à la déconnexion, et les routes sont limitées en fréquence. Le rôle n'est pas auto-assignable depuis le modèle. N'utilise que des données synthétiques pour le développement.

La page ne déverrouille que le formulaire d'inscription et de connexion Jeune, et seulement après confirmation du statut local et réception d'un jeton CSRF. Les données de compte vont au backend local; aucune donnée n'est conservée dans `localStorage`. Les autres rôles et formulaires restent fermés.

Lorsque les comptes locaux sont activés, `/dashboard.html` redirige les visiteurs non connectés vers la connexion et affiche uniquement l'identité de la session Jeune. Les résultats du quiz, le profil détaillé, les favoris, le mentorat et les candidatures ne sont pas liés à ce compte. Cette tranche ne configure ni validation d'adresse e-mail, ni récupération de mot de passe, ni politique approuvée pour l'âge/consentement, ni procédure de vérification des mentors/organisations. Elle ne sert qu'aux essais avec des données synthétiques en local. Aucun compte ne doit être ouvert au public avant validation de ces sujets, du stockage, de la conservation et de l'exploitation.

## Routes disponibles

- `GET /api/v1/orientation/questionnaire` : renvoie sept questions publiques tirées de la banque locale et un jeton de parcours temporaire. Les pondérations ne sont pas envoyées au navigateur.
- `POST /api/v1/orientation/results` : accepte `serie_id`, `questionnaire_token` et sept réponses (`question_id`, `option_index`); renvoie des pistes exploratoires, leurs données présentes et les champs manquants.

Le quiz servi par Laravel utilise ces deux routes : il charge sept questions, puis envoie seulement la série choisie, le jeton et les indices de réponse. Le profil facultatif et le texte libre ne sont pas envoyés. Le jeton est chiffré avec la clé Laravel, expire après une heure et lie les réponses aux questions retournées, y compris à leur contenu et à leurs pondérations. Si une question sélectionnée change entre le chargement et l'envoi, l'API demande de recommencer le questionnaire. Seuls les champs indiqués sont acceptés; le texte libre n’est pas pris en charge. Les réponses ne sont ni enregistrées par l’application, ni transmises à un service externe; l’API renvoie `Cache-Control: no-store`. Le résultat contenant les réponses est gardé temporairement dans `sessionStorage` pour l’afficher dans l’onglet courant et n’est pas lié au compte Jeune. Sur une prévisualisation statique sans API, le quiz conserve son ancien calcul local.

## Tests

```powershell
php artisan test
```

Cette tranche reste locale et non prête pour la production. Les décisions sur le nombre/version des questions, la conservation en hébergement, l’âge/consentement, la validation des comptes et l’exploitation restent ouvertes dans les documents de conception.
