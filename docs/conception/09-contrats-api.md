# Contrats API — JeuneAvenir CI

**Statut :** contrat de conception à valider. Une première API Laravel locale d'orientation existe, mais elle ne valide ni ce contrat complet ni les décisions encore ouvertes.
**Cible :** Laravel modulaire, permissions côté serveur; PostgreSQL est une préférence conditionnelle.
**Documents liés :** [architecture](07-architecture-cible.md), [modèle logique](08-modele-de-donnees.md), [rôles](03-roles-et-permissions.md), [règles métier](02-regles-metier.md), [décisions](06-decisions-et-points-a-valider.md).

## 1. Objet et limites

Ce document définit une première forme de contrat entre les pages web et le backend : conventions, ressources candidates, acteurs, protections et réponses attendues. Il doit être finalisé avant l'implémentation et maintenu avec chaque évolution d'API.

Les noms de routes et payloads proposés ci-dessous sont un **brouillon de contrat**, pas des endpoints implémentés. Les règles produit ou permissions marquées ouvertes restent ouvertes dans les documents 02, 03 et 06. Aucun service tiers, client mobile ou API publique n'est présumé.

## 2. Principes de contrat

1. Le backend est l'autorité pour authentification, autorisation, validation, états et calcul métier.
2. Les données publiques retournées proviennent uniquement de contenus vérifiés et publiés; brouillons, preuves privées et notes de validation ne sont jamais renvoyés au visiteur.
3. Les objets privés sont filtrés côté serveur par propriétaire, destinataire, organisation, rôle et état métier avant toute sérialisation.
4. Les requêtes d'écriture acceptent seulement les champs prévus par le contrat; les propriétés `role`, propriétaire, statut de vérification, organisation ou décision ne sont pas modifiables par le client sauf opération autorisée distincte.
5. La documentation et les tests des contrats de réponse et d'erreur sont proposés par DEC-014, qui reste à confirmer. Un bouton masqué ou un identifiant opaque ne constitue pas un contrôle d'accès.
6. Les données personnelles ou secrets ne sont pas placés dans les URL, messages d'erreur, traces ou identifiants de corrélation.

## 3. Conventions proposées

| Élément | Proposition de contrat | Statut |
|---|---|---|
| Préfixe | `/api/v1` pour les échanges JSON documentés. | Proposition; valider si une API versionnée est nécessaire et si elle partage l'origine Laravel (OPEN-025). |
| Format | `application/json; charset=utf-8` pour les corps JSON; HTML reste possible pour les pages rendues par Laravel. | Proposition. |
| Langue | Messages humains en français; codes d'erreur stables et indépendants de la langue. | Proposition cohérente avec l'interface actuelle. |
| Identifiants | Identifiants opaques dans les chemins; ne pas en déduire une permission. | Proposition de sécurité. |
| Dates | Instants transmis en ISO 8601 avec fuseau explicite; UTC côté serveur recommandé. | À confirmer selon les règles de date d'offre et de notification. |
| Listes | Pagination et filtres documentés; taille maximale imposée par le serveur. | Les paramètres et limites exactes dépendent des volumes et de la charge (OPEN-003/018/021). |
| Compatibilité | Toute rupture de contrat public exige une version ou une migration documentée. | À valider avant client externe; une version ne justifie pas une API tierce non demandée. |
| Documentation | Contrat maintenu avec les routes; OpenAPI 3.1 est une option proposée pour une description machine lisible. | Version et outil à confirmer avant l'implémentation. |

### Authentification web

La cible privilégiée est une session Laravel côté serveur en cookie sécurisé pour les clients web de première partie. Toute écriture doit appliquer les protections CSRF nécessaires. Les mécanismes de jetons, OAuth social, domaines séparés et CORS restent conditionnés par les décisions du document 06.

Les mots de passe ne sont jamais transmis dans des URL, conservés dans le navigateur ou renvoyés dans une réponse. Une erreur de connexion ou de récupération ne doit pas révéler plus d'informations qu'il n'en faut sur l'existence d'un compte.

## 4. Ressources et routes candidates

Les routes sont une proposition de contrat. La validation métier doit fixer les champs et transitions avant de figer les schémas de requête.

| Domaine | Méthode et route candidate | Acteur / portée attendue | Règles à respecter |
|---|---|---|---|
| Découverte | `GET /api/v1/institutions` | Visiteur; uniquement fiches publiées. | Filtres limités aux attributs dont la qualité a été validée; inclure les sources publiques et la portée si prévues. |
| Découverte | `GET /api/v1/institutions/{institutionId}` | Visiteur; contenu publié. | Pas de brouillon, de note interne ou d'assertion non vérifiée. |
| Découverte | `GET /api/v1/programs` et `GET /api/v1/programs/{programId}` | Visiteur; formations publiées. | Les informations d'admission, de coût et de disponibilité ne sont pas inférées à partir d'une simple relation. |
| Découverte | `GET /api/v1/occupations` et `GET /api/v1/occupations/{occupationId}` | Visiteur; métiers publiés. | Les salaires et perspectives restent sourcés, datés et qualifiés. |
| Authentification | `POST /api/v1/auth/register` | Visiteur. | La confirmation d'adresse, les champs autorisés, l'âge et les consentements préalables restent à fixer; aucune attribution de rôle privilégié. |
| Authentification | `POST /api/v1/auth/login` / `POST /api/v1/auth/logout` | Visiteur authentifié selon l'action. | Session sécurisée, limitation des tentatives, CSRF, révocation explicite et messages anti-énumération. |
| Authentification | `POST /api/v1/auth/password-reset-requests` / `POST /api/v1/auth/password-resets` | Titulaire du compte ou demandeur. | Jeton de récupération à usage unique et durée définie avant implémentation; réponse de demande uniforme. |
| Compte | `GET /api/v1/me` / `PATCH /api/v1/me/profile` | Titulaire uniquement. | Champs éditables en liste positive; rôle, email vérifié et statut de compte protégés par opérations distinctes. |
| Orientation | `GET /api/v1/orientation/questionnaire` | Visiteur; prototype local uniquement. | Implémenté dans `backend/` et consommé par le quiz quand le site est servi par Laravel; tire sept questions de la banque actuelle, masque les pondérations, renvoie un jeton temporaire et interdit la mise en cache. Le nombre/version ne sont pas validés pour production (OPEN-002). |
| Orientation | `POST /api/v1/orientation/results` | Visiteur; prototype local uniquement. | Implémenté dans `backend/` et consommé par le quiz Laravel; valide la série et les réponses, calcule des pistes exploratoires sans stockage et renvoie `Cache-Control: no-store`. La réponse reste dans `sessionStorage` pour l'onglet courant. La rétention future côté hébergement et le nombre/version des questions restent à décider (OPEN-002). |
| Orientation | `GET /api/v1/me/orientation-attempts/{attemptId}` | Titulaire propriétaire uniquement. | Refuser l'accès à un résultat appartenant à un autre compte; présenter les limites du calcul. |
| Favoris | `GET /api/v1/me/favorites` / `POST /api/v1/me/favorites` | Titulaire uniquement. | Cible limitée aux ressources publiques permises; pas de favori qui révèle une ressource privée. |
| Favoris | `DELETE /api/v1/me/favorites/{favoriteId}` | Titulaire propriétaire uniquement. | Suppression idempotente ou réponse de conflit à préciser dans le contrat final. |
| Mentorat | `GET /api/v1/mentors` / `GET /api/v1/mentors/{mentorId}` | Visiteur; profils vérifiés et publiés seulement. | Coordonnées privées et dossier de vérification exclus de la réponse publique. |
| Mentorat | `POST /api/v1/mentoring-requests` | Jeune/candidat authentifié, sous réserve des règles mineurs. | Destinataire vérifié; consentement et limites d'âge avant activation; soumission enregistrée seulement si elle est réellement transmise. |
| Mentorat | `GET /api/v1/me/mentoring-requests` | Demandeur propriétaire. | Liste limitée à ses demandes; pas aux demandes d'autres jeunes. |
| Mentorat | `GET /api/v1/mentor/requests` / `PATCH /api/v1/mentor/requests/{requestId}` | Mentor vérifié, destinataire assigné. | Lire seulement les demandes destinées à ce mentor; transitions autorisées et historique définis dans OPEN-013. |
| Insertion | `GET /api/v1/offers` / `GET /api/v1/offers/{offerId}` | Visiteur; offres publiées et ouvertes selon règle à confirmer. | État, validité et organisation vérifiée contrôlés côté serveur. |
| Insertion | `POST /api/v1/organizations/{organizationId}/offers` / `PATCH /api/v1/organizations/{organizationId}/offers/{offerId}` | Représentant vérifié et autorisé. | Création en brouillon; vérifier appartenance active, champs et organisation; publication séparée. |
| Insertion | `POST /api/v1/organizations/{organizationId}/offers/{offerId}/submit` | Représentant autorisé. | Soumet à vérification; ne rend pas le contenu public. |
| Insertion | `POST /api/v1/offers/{offerId}/applications` | Jeune/candidat authentifié, si l'offre accepte les candidatures. | Vérifier publication, date, éventuelle candidature antérieure et consentement au partage; règles d'unicité à arbitrer. |
| Insertion | `GET /api/v1/me/applications` | Candidat propriétaire. | Accès aux seules candidatures du titulaire. |
| Insertion | `GET /api/v1/organizations/{organizationId}/applications` | Représentant habilité de l'organisation. | Limité aux candidatures des offres autorisées; aucune recherche globale de candidats. |
| Administration | Routes de contenus, vérification, publication et audit à spécifier. | Administrateur éditorial ou technique selon la matrice 03. | Le workflow, l'attribution des rôles et les accès exceptionnels restent à valider; aucune route d'administration publique. |

Les noms ci-dessus ne fixent pas encore le partage exact entre contrôleurs HTML et routes JSON. Les règles métier restent définies dans le document 02; les périmètres d'accès dans le document 03.

## 5. Formats de réponse proposés

### Succès d'une ressource

```json
{
  "data": {
    "id": "identifiant-opaque",
    "type": "institution",
    "attributes": {}
  }
}
```

### Liste paginée

```json
{
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 0
    }
  }
}
```

Le nombre d'éléments par page illustré ici est un exemple de forme, pas une limite décidée. Les filtres et limites réels doivent être liés aux exigences et testés contre les risques d'abus.

### Erreur métier ou de validation

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Certains champs doivent être corrigés.",
    "fields": {
      "email": ["Adresse invalide."]
    },
    "request_id": "identifiant-de-correlation"
  }
}
```

Les messages destinés à l'utilisateur sont en français; `code` reste stable et documenté. Les détails d'exception, requêtes SQL, chemins locaux, données sensibles et secrets ne sont jamais envoyés.

## 6. Codes HTTP attendus

| Code | Usage attendu |
|---|---|
| `200` | Lecture ou modification réussie avec contenu. |
| `201` | Ressource créée; préciser si elle est en brouillon, en attente ou réellement publiée. |
| `204` | Action réussie sans corps de réponse, si le contrat le prévoit. |
| `400` | Requête mal formée ou impossible à interpréter. |
| `401` | Session absente ou invalide. |
| `403` | Acteur authentifié mais non autorisé, si la distinction ne révèle pas l'existence d'une ressource privée. |
| `404` | Ressource inexistante ou volontairement masquée pour éviter une fuite d'information. |
| `409` | Conflit d'état, doublon métier ou transition non permise selon la règle validée. |
| `422` | Champs compréhensibles mais non valides pour la règle métier; fournir des erreurs de champs non sensibles. |
| `429` | Limite de fréquence atteinte; fournir un délai de reprise sûr si disponible. |
| `5xx` | Erreur serveur sans détail interne; journaliser un identifiant de corrélation côté serveur. |

Le code exact d'une transition, d'un doublon ou d'une ressource privée doit être choisi avec la politique de confidentialité et les règles métier, puis appliqué uniformément.

## 7. Exigences de sécurité et d'autorisation de l'API

- Pour chaque route, définir explicitement acteur, permission, état requis, propriétaire/destinataire et champs inscriptibles.
- Les contrôles sont faits au serveur avec les politiques Laravel validées par DEC-008; ne pas se fier aux gardes frontend.
- Les routes de modification protègent CSRF lorsqu'elles utilisent une session web; un déploiement séparé exige un arbitrage CORS/session spécifique (OPEN-025).
- Limiter les tentatives de connexion, récupération et formulaires publics; définir une protection contre spam et abus avant ouverture.
- Ne pas journaliser mots de passe, cookies, jetons, corps complets de candidatures ou documents.
- Le plan de tests proposé devrait vérifier que les erreurs ne révèlent pas de comptes, ressources privées, rôles ou notes de modération; cette exigence de test reste à confirmer au titre de DEC-014.
- Les opérations sensibles (publication, transitions de candidature/demande, attribution de rôle) produisent une trace d'audit minimisée.
- Le plan de tests recommandé par DEC-014 devrait couvrir les accès horizontaux et verticaux ainsi que les valeurs de propriétaire/organisation forcées dans le corps de requête; cette recommandation reste à confirmer.

## 8. Documentation et tests de contrat

Avant le backend, chaque route retenue devra avoir :

1. identifiant, méthode, chemin et version;
2. description utilisateur et ressource concernée;
3. niveau d'authentification, rôles, périmètre objet et politique;
4. paramètres de chemin, filtres, pagination et règles de validation;
5. schéma de requête et réponse avec champs publics/privés précisés;
6. états et erreurs possibles;
7. règles de limitation, audit, idempotence et confidentialité si applicables;
8. exemples de tests d'accès autorisé et refusé.

OpenAPI est l'option proposée pour publier la description machine lisible une fois le modèle de ressources stabilisé. Le présent document est le contrat de conception humain; il ne prétend pas remplacer un fichier OpenAPI qui n'a pas encore été créé.

La proposition DEC-014 recommande que la validation inclue des tests de contrat pour les succès, erreurs, champs inconnus, accès non autorisés, objets hors périmètre, transitions invalides, pagination et contenus non publiés. Cette recommandation doit être confirmée; toute modification d'une route devrait garder ses tests et sa documentation synchronisés.

## 9. Conditions de validation avant implémentation

- Les rôles canoniques et les permissions sont arbitrés dans le document 03 et OPEN-004.
- Les transitions de demandes, candidatures et offres sont acceptées dans les OPEN-013/014.
- Les règles d'âge, consentement et interaction des mineurs sont décidées dans OPEN-010.
- La persistance des résultats du quiz, les comptes invités et le nombre/version du questionnaire sont tranchés dans OPEN-002 et les règles du document 02.
- Les champs de profil, candidature, CV, consentement, durée et suppression sont cohérents avec les documents 04 et OPEN-009/015.
- Le choix définitif PostgreSQL/MySQL et la stratégie même origine ou séparée ont une décision dans le document 06.
- Les routes retenues ont un contrat accepté et une documentation versionnée avant leur implémentation.

La validation de la cible d'architecture ne vaut pas validation de ces détails. Aucun endpoint, base, compte réel ou parcours de candidature/mentorat ne doit être mis en production tant que les règles et contrôles correspondants ne sont pas approuvés.

### Portée de la première API d'orientation

Le prototype local utilise les fichiers `data/questions.json`, `data/series_filieres.json` et `data/filieres.json` du dépôt parent. Le jeton chiffré par Laravel lie les réponses aux sept questions émises et expire après une heure; il ne représente pas une authentification ni un compte. Le calcul retourne les pistes et les données de catalogue disponibles, sans pourcentage, score interne, réponse libre ou persistance par l'application; le frontend Laravel conserve la réponse temporairement dans `sessionStorage` pour l'afficher dans l'onglet. Le pilote statique conserve son calcul local. Ces choix techniques ne ferment aucun point OPEN et ne constituent pas une approbation de mise en production.
