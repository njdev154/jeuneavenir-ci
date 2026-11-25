# Architecture cible proposée — JeuneAvenir CI

**Statut :** cible de conception validée par le propriétaire le 17 novembre 2026; les choix d'hébergement et le moteur SQL définitif restent ouverts. Un prototype Laravel local d'orientation existe depuis le 21 novembre 2026; il ne vaut ni validation de l'architecture complète, ni autorisation de collecter des données personnelles.
**Date :** 17 novembre 2026.
**Décisions liées :** le registre unique reste [le document 06](06-decisions-et-points-a-valider.md).

## 1. Objet et limites

Ce document précise la direction technique validée par le propriétaire : backend Laravel en monolithe modulaire organisé par domaines, frontend existant préservé avec adoption progressive de TypeScript, autorisations côté serveur et API documentée. PostgreSQL est la préférence de base de données, mais son adoption définitive reste conditionnée à l'hébergement, à la compatibilité, aux coûts et à la maintenance.

Le périmètre produit reste celui des cinq piliers validés et des huit univers décrits dans le [référentiel produit](01-reference-et-perimetre.md). Cette architecture ne signifie pas que les cinq piliers sont déjà opérationnels ni que toutes les extensions seront construites en même temps.

La conception reste la référence pour les prochaines étapes. Depuis sa rédaction, une première tranche locale a été réalisée :

- l'API Laravel locale d'orientation lit les référentiels JSON, sans compte ni persistance des réponses;
- Laravel sert maintenant les pages statiques et leurs ressources publiques via une liste de chemins autorisés, sur la même origine que l'API en local;
- aucune migration métier, table applicative, authentification ou configuration d'hébergement n'a été ajoutée;
- le quiz du frontend reste local, conformément au choix du propriétaire du 21 novembre;
- aucun compte réel, document, mentor ou offre fictive n'est publié;
- aucun service d'authentification, d'e-mail, de stockage ou d'IA n'est sélectionné.

Le prototype permet de tester une route, pas de lever les prérequis de gouvernance, sécurité, hébergement et modèle de données avant toute collecte réelle.

Les arbitrages attendus sont recensés dans le [registre officiel des décisions](06-decisions-et-points-a-valider.md). Les règles métier, les rôles et la gouvernance restent dans les documents [02](02-regles-metier.md), [03](03-roles-et-permissions.md) et [04](04-gouvernance-des-donnees.md).

## 2. État de départ constaté

Le dépôt contient un frontend multipage statique ainsi qu'un prototype backend local :

- pages en HTML, styles CSS partagés et scripts JavaScript modulaires;
- données de catalogue chargées depuis des fichiers JSON;
- comptes, profils, résultats de quiz, demandes, candidatures et favoris simulés dans `localStorage`;
- mentors et offres sans publication vérifiée;
- le dossier `backend/` contient Laravel 13.43.0 (PHP 8.5.3 local), deux routes d'orientation et des tests Laravel;
- `php artisan test` a été exécuté localement le 21 novembre 2026 : 8 tests et 82 assertions réussis;
- les migrations métier, comptes et authentification ne sont pas présents; la base SQLite locale du squelette n'est pas utilisée par l'API d'orientation;
- aucun hébergeur, compte cloud, service de production ni budget n'a été provisionné ou validé.

Le [README](../../README.md) précise que l'authentification actuelle est une démonstration locale, que le mot de passe n'est pas vérifié à la connexion et que les contenus de plusieurs catalogues restent partiels. La fonction de ces fichiers est de décrire l'état existant, non de prescrire la cible.

Le frontend ne doit donc pas être traité comme une application React ou TypeScript déjà en place. Une migration doit conserver les parcours utiles, l'identité visuelle Horizon et les contrôles d'accessibilité sans présenter le stockage local comme une vraie session.

## 3. Cible validée et arbitrages résiduels

### Cible de conception

1. **Backend :** application Laravel en monolithe modulaire, organisée par domaines fonctionnels; pas de microservices sans besoin démontré.
2. **Données :** PostgreSQL est la préférence; la comparaison avec MySQL reste requise avant la décision définitive.
3. **Frontend :** conserver les pages et le CSS existants; adopter TypeScript progressivement, sans réécriture React/Tailwind injustifiée.
4. **Communication web :** API documentée avec autorisations côté serveur. Même origine recommandée pour réduire la complexité de session et de CORS; séparation des déploiements encore à arbitrer.
5. **Exploitation :** choisir un hébergement compatible PHP/Laravel et SQL; préproduction, sauvegardes testées, supervision et gestion des secrets sont des prérequis.

La direction des points 1 et 3 est validée par DEC-008 et DEC-009. PostgreSQL est une préférence conditionnelle (DEC-010); l'hébergement, le choix final du moteur et le déploiement de l'API restent ouverts dans le document 06.

### Pourquoi un monolithe modulaire

Les cinq piliers partagent comptes, rôles, contenus, publications et audit. Une application Laravel unique permet de partager transactions et politiques d'accès sans déployer et superviser plusieurs services. La séparation doit se faire d'abord par domaines métier dans le code; un découpage en microservices n'est pas justifié par les besoins vérifiés du dépôt.

## 4. Vue logique proposée

```text
Navigateur
  Pages HTML/Blade + CSS Horizon + JavaScript/TypeScript compilé
                  │ HTTPS, même origine en priorité
                  ▼
Application Laravel — monolithe modulaire
  Routes web / routes JSON utiles
  Authentification et sessions
  Validation des requêtes
  Policies / autorisations côté serveur
  Services métier et transactions
  Workflow éditorial, audit et tâches planifiées
                  │ accès privé, comptes applicatifs à privilèges minimaux
                  ▼
Base relationnelle SQL — PostgreSQL ou MySQL à arbitrer

Services externes éventuels, non sélectionnés :
  e-mail / stockage privé de documents / file de tâches / IA
```

Le navigateur ne doit jamais se connecter directement à la base de données. Les secrets, clés privilégiées, contrôles d'accès et décisions métier restent côté serveur. Un service optionnel ne devient une dépendance que lorsque son usage, son responsable, son coût et son mode de défaillance sont définis.

## 5. Frontend : comparer l'évolution progressive et React

| Critère | Évolution progressive du frontend actuel | React + TypeScript + Tailwind |
|---|---|---|
| Principe | Conserver les pages HTML/CSS et le système Horizon; intégrer les pages à Laravel progressivement; introduire TypeScript pour les interactions qui évoluent. | Réécrire les interfaces en composants React, compiler avec Vite, remplacer ou adapter les styles avec Tailwind et consommer l'API Laravel. |
| Réutilisation | Forte : les pages, styles, textes, comportements et tests existants servent de base, sous réserve de validation lors de l'intégration. | Partielle : les références visuelles et contenus peuvent être repris, mais les pages, formulaires, navigation et tests d'interface doivent être reconstruits ou adaptés. |
| Authentification web | Une origine Laravel facilite les cookies de session sécurisés et la protection CSRF. | Si l'application est séparée, cookies, CORS, CSRF et domaines doivent être conçus ensemble. Une application React de même origine peut éviter une partie de cette complexité. |
| Maintenabilité | Moins de nouvelles conventions au début; TypeScript peut être introduit par module. Il faudra définir progressivement compilation, lint et typage des échanges avec le backend. | Composants et contrats TypeScript cohérents pour une interface très interactive, au prix d'un nouvel outillage et d'une migration d'ensemble plus importante. |
| Design et accessibilité | Préserve directement le CSS Horizon; les composants doivent continuer à respecter les mêmes règles d'accessibilité. | React ne garantit pas l'accessibilité. Tailwind ne remplace pas un design system; tokens, composants, clavier et lecteurs d'écran restent à concevoir et tester. |
| Risque principal | Maintenir temporairement deux styles de rendu si les pages ne sont pas migrées de manière cohérente. | Réécriture large, duplication de styles et régression de parcours si l'étendue n'est pas limitée et mesurée. |

### Recommandation

Commencer la cible par une migration verticale limitée : intégrer un parcours de bout en bout à Laravel, conserver son apparence Horizon et mesurer si TypeScript apporte une fiabilité utile à ce module. Ne pas réécrire tous les écrans avec React par principe.

React + TypeScript reste une option viable si un prototype comparatif démontre un bénéfice concret pour plusieurs interactions complexes et si le plan de migration, la couverture de tests et le budget de maintenance sont acceptés. Tailwind est optionnel; il ne doit pas entraîner le remplacement du système visuel confirmé.

Le choix final doit préciser :

- pages rendues par Blade, pages statiques intégrées ou application React;
- organisation et compilation du TypeScript;
- frontière entre rendu serveur et routes JSON;
- stratégie de migration écran par écran et critères d'arrêt/retour;
- compatibilité avec les tests, l'accessibilité et le déploiement.

## 6. Base relationnelle : comparer PostgreSQL et MySQL

Les deux moteurs conviennent au modèle relationnel de comptes, catalogues, offres, candidatures, mentorat et traçabilité, et sont compatibles avec Laravel. La proposition utilisateur cite MySQL; une réponse précédente a choisi PostgreSQL, puis le propriétaire a demandé une comparaison. Aucun moteur n'est donc retenu ici.

| Critère à vérifier | PostgreSQL | MySQL |
|---|---|---|
| Compatibilité Laravel | Supporté par l'écosystème Laravel; tester la version PHP/Laravel retenue et les extensions du serveur. | Supporté par l'écosystème Laravel; vérifier de la même façon les versions et extensions. |
| Contraintes relationnelles | Contraintes, transactions et indexation adaptés à la cohérence du modèle; les fonctionnalités spécifiques doivent être utilisées consciemment. | Contraintes, transactions et indexation adaptés à la cohérence du modèle; vérifier le moteur de stockage réellement configuré et les mêmes règles de migration. |
| Recherche et données semi-structurées | Fonctionnalités SQL et JSON riches; ne pas choisir le moteur uniquement pour une fonctionnalité avant d'avoir défini les requêtes. | Fonctionnalités JSON et de recherche disponibles selon version/configuration; valider les mêmes requêtes sur une version supportée. |
| Hébergement et coût | Dépendent du fournisseur, de la région, des sauvegardes, du stockage et du support; aucune comparaison de prix n'est possible sans cible d'hébergement. | Même dépendance au fournisseur et au plan; la disponibilité plus large d'une option sur un hébergement donné doit être vérifiée, pas présumée. |
| Compétences d'exploitation | Formation, supervision, sauvegarde/restauration et diagnostic doivent être assurés par l'équipe ou le prestataire choisi. | Mêmes exigences; l'expérience réelle de l'équipe et le niveau de support disponible sont à vérifier. |
| Portabilité | Les migrations Laravel et les tests doivent éviter les fonctions spécifiques non nécessaires. | Les mêmes règles s'appliquent; certaines différences SQL peuvent rendre une migration ultérieure coûteuse. |

### Procédure de décision recommandée

1. Identifier deux offres d'hébergement réellement accessibles qui exécutent Laravel, avec prix, limites, sauvegardes et accès à la restauration.
2. Construire un petit modèle conceptuel commun et exécuter les migrations de test sur les deux moteurs, sans y importer de données personnelles.
3. Tester les contraintes, transactions, filtres de catalogue, recherche, export et restauration sur les versions supportées.
4. Comparer les coûts récurrents et les compétences disponibles pour la maintenance en Côte d'Ivoire.
5. Consigner le choix motivé dans le document 06 avant le développement des migrations applicatives.

Les données JSON et CSV actuelles ne doivent pas être importées directement dans une base de production comme si elles étaient toutes validées. Les règles de provenance et de publication du [document 04](04-gouvernance-des-donnees.md) prévalent.

## 7. Modules métier et responsabilité serveur

Le monolithe peut être organisé autour de domaines métier. Les noms de dossiers et la granularité ne sont pas encore figés.

| Domaine | Responsabilité cible | Références fonctionnelles |
|---|---|---|
| Identité et accès | Compte, session, vérification, récupération, consentements, état du compte et attribution contrôlée des rôles. | [Règles métier](02-regles-metier.md), [rôles](03-roles-et-permissions.md) |
| Référentiels et découverte | Filières, formations, établissements, métiers, filtres, sources, vérifications et publication. | [Gouvernance des données](04-gouvernance-des-donnees.md), [exigences](05-registre-des-exigences.md) |
| Orientation | Versions du questionnaire, questions, réponses, calculs, résultats et explication des limites du score. | [Règles métier](02-regles-metier.md), décision quiz dans [06](06-decisions-et-points-a-valider.md) |
| Mentorat | Profils vérifiés, demandes, destinataire, transitions, consentements et traitement des signalements. | [Règles métier](02-regles-metier.md), [permissions](03-roles-et-permissions.md) |
| Insertion | Organisations vérifiées, offres, expiration, candidatures, décisions et historique d'accès. | [Règles métier](02-regles-metier.md), [gouvernance](04-gouvernance-des-donnees.md) |
| Espace personnel | Profil, favoris, préférences et historique auquel le titulaire a droit. | [Rôles et permissions](03-roles-et-permissions.md) |
| Administration éditoriale | Saisie, preuve, vérification, publication, révision, archivage et modération selon des privilèges limités. | [Gouvernance des données](04-gouvernance-des-donnees.md) |
| Transverse | Journal d'audit, notifications réelles, tâches planifiées et rapports techniques minimisés. | [Exigences](05-registre-des-exigences.md), [décisions](06-decisions-et-points-a-valider.md) |

Un module ne peut pas contourner les permissions d'un autre. Les transitions métier et les transactions qui mettent à jour plusieurs objets doivent être contrôlées côté serveur.

## 8. Modèle de données conceptuel — sans schéma SQL

Le [modèle logique détaillé](08-modele-de-donnees.md) décrit les domaines, entités, liens, responsabilités et inconnues sans figer de tables ni de DDL. Les catégories minimales sont :

- **Identité :** compte, profil, rôle attribué, consentement et état de session; un choix de profil dans un formulaire n'est pas une preuve de rôle privilégié.
- **Référentiels :** filière/formation, établissement, métier et faits publiables reliés à une ou plusieurs sources, à des dates de vérification et à un responsable.
- **Orientation :** version du quiz, question, réponse, méthode de calcul et résultat lié au compte si la conservation est validée.
- **Mentorat :** profil mentor et demande avec un auteur, un destinataire et un historique d'états.
- **Insertion :** organisation, représentants autorisés, offre, candidature et changements d'état.
- **Espace personnel :** favoris et historiques rattachés au propriétaire.
- **Gouvernance :** révisions éditoriales, événements de publication, preuves, signalements et journal d'audit.

Les clés, relations exactes, règles de suppression, versions, unicité, durées, index et moteur restent à arbitrer comme indiqué dans le document 08. Aucun DDL ou nom de table n'est approuvé dans ce document.

## 9. Authentification, API et autorisations

### Authentification web

Pour une application de même origine, l'option à évaluer en premier est une session Laravel côté serveur avec cookie `HttpOnly`, `Secure` en production et politique `SameSite` adaptée. Les formulaires qui modifient l'état doivent être protégés contre les requêtes intersites. Les détails dépendent du rendu choisi et seront testés sur la configuration réelle.

Les mots de passe doivent être hachés par le mécanisme de Laravel avec une configuration actuelle et revue; ils ne sont jamais journalisés ou renvoyés au navigateur. Les procédures de vérification d'adresse, récupération, révocation de session, limitation des tentatives et traitement des comptes compromis doivent être spécifiées et testées avant collecte réelle.

L'authentification sociale, les fournisseurs, une application mobile et un système de jetons public ne sont pas approuvés par cette proposition. Si une SPA de première partie est retenue, évaluer le mécanisme officiellement supporté par Laravel pour son cas d'usage plutôt que créer un stockage de jeton personnalisé.

### Routes web et REST

Les contrats des ressources, acteurs, formats JSON et erreurs sont décrits dans le [document API](09-contrats-api.md). La couverture de tests de ces contrats et des autorisations avant mise en production est la proposition DEC-014, à confirmer; elle n'est pas présentée comme une décision personnelle du propriétaire. L'API doit fournir un contrat stable aux pages TypeScript, inclure validation, pagination si nécessaire, réponses d'erreur cohérentes, limitation de débit et autorisation par ressource. La documentation machine lisible OpenAPI est proposée; sa version et son mode de publication restent à valider. Une API destinée à des clients tiers ou mobiles ne doit être construite que si ce besoin est confirmé.

Si frontend et backend sont déployés sur des origines distinctes, il faut définir avant implémentation les origines CORS permises, la stratégie de session, CSRF, cookies, protection contre les abus et tests d'intégration. Une configuration CORS permissive ne doit pas servir de solution de facilité.

### Contrôles d'accès

Les contrôles décrits dans le [document 03](03-roles-et-permissions.md) sont appliqués par des politiques côté serveur à chaque opération. Le serveur vérifie le propriétaire, le destinataire, l'organisation, l'état du contenu et la transition demandée; masquer un bouton ne protège pas la ressource.

Selon la proposition DEC-014, à confirmer avant mise en production, le plan de tests devrait couvrir les accès croisés entre deux jeunes, deux mentors et deux organisations; l'élévation de rôle; l'accès par défaut d'un administrateur éditorial aux candidatures ou documents; et la révocation de session après modification des droits.

## 10. Sécurité, confidentialité et mineurs

- **Entrées et sorties :** valider côté serveur; encoder les sorties HTML au contexte approprié; éviter l'interpolation SQL et utiliser les requêtes paramétrées/ORM.
- **Sessions et formulaires :** HTTPS obligatoire en production, protection CSRF, cookies sécurisés, expiration et révocation définies.
- **Accès :** refus par défaut, moindre privilège, isolation par propriétaire/destinataire/organisation, séparation des comptes éditoriaux et techniques.
- **Abus :** limites de fréquence sur connexion, récupération, formulaires publics et actions sensibles; messages d'erreur qui ne divulguent pas l'existence inutile de comptes.
- **Secrets :** variables d'environnement/gestionnaire de secrets côté serveur; aucune clé privée dans HTML, JavaScript, dépôt public ou journal.
- **Audit :** journaliser les changements de rôle, publication, modération et transitions sensibles sans enregistrer mots de passe, jetons ou contenu personnel superflu.
- **Documents :** stockage privé par défaut; limiter taille et type, contrôler les accès, prévoir analyse de fichiers et URLs temporaires si le partage est approuvé. Le stockage n'est pas défini tant que les règles des documents ne le sont pas.
- **Dépendances :** versions supportées, inventaire et alertes de sécurité; procédure de mise à jour et de retour arrière.
- **Mineurs :** ne pas activer les échanges directs avec mentors ou organisations, la communauté ou la publication de portfolios tant que les règles d'âge, consentement, visibilité, modération et incidents ne sont pas validées.
- **Cadre légal :** faire vérifier les obligations et responsabilités applicables en Côte d'Ivoire par une personne compétente. Aucune conformité n'est déclarée par cette proposition.

## 11. Données réelles et migration depuis les JSON

La base de données ne rend pas les données vraies par elle-même. La confiance dépend de la source, de sa portée, de la date, de la vérification humaine et de la procédure de correction prévues au [document 04](04-gouvernance-des-donnees.md).

Ordre de migration proposé :

1. Inventorier chaque fichier, champ, identifiant, source, date et limite connue.
2. Établir une table de correspondance des champs et un rapport de qualité; les ambiguïtés sont bloquantes pour la publication.
3. Importer d'abord en environnement de préparation, dans un état non publié, avec provenance conservée.
4. Dédupliquer et faire valider les assertions par un responsable; ne pas transformer une correspondance de nom en preuve d'agrément ou de programme.
5. Comparer comptages, échantillons, erreurs et liens avant approbation; conserver une possibilité de retour arrière.
6. Publier seulement les éléments qui passent le workflow de gouvernance; garder les états vides pour les mentors et offres tant qu'aucune donnée vérifiée n'est disponible.

Le README signale un CSV de 145 entrées dont la liste consultée avait 146 entrées, ainsi que des variantes et des rapprochements à revoir. Il signale aussi des questions de quiz dont le nombre diffère entre la source disponible et le JSON. Ces données exigent un rapprochement et les arbitrages du document 06; aucun import automatique n'est recommandé.

## 12. Hébergement, tâches et exploitation

Un hébergement statique seul ne peut pas exécuter Laravel. La cible exige un environnement supporté par PHP/Laravel, une base SQL privée, HTTPS, stockage persistant pour les sauvegardes, configuration de tâches planifiées si nécessaire et sortie e-mail si une notification réelle est activée.

### Comparaison initiale (21 novembre 2026)

Les prix ci-dessous sont les tarifs publics consultés à cette date, en USD, hors taxes, domaine, e-mail, trafic dépassant les quotas, haute disponibilité et support supplémentaire. Ils ne constituent pas une offre commerciale ni une estimation de charge.

Le budget communiqué pour la démo actuelle est de **0 $/mois**. Les options payantes ci-dessous ne sont donc pas des choix pour cette étape. La démo peut rester locale et s'appuyer sur le frontend et le référentiel déjà présents; elle n'aura alors pas d'URL publique. Côte d'Ivoire est la zone souhaitée, mais aucune région d'hébergement gratuite dans le pays n'est confirmée.

| Critère | Railway | DigitalOcean App Platform |
|---|---|---|
| Déploiement Laravel | Guide officiel Laravel; détection PHP et exécution PHP-FPM/Caddy annoncées. | PHP Buildpack officiel; PHP 8.3 à 8.5 pris en charge dans la documentation consultée. Le dossier `backend/` devra être sélectionné comme répertoire source du monorepo. |
| Service applicatif | Hobby : 5 $/mois, dont 5 $ de crédit d'usage; RAM, CPU, volume et trafic sont ensuite mesurés. Un petit service peut dépasser ou rester dans le crédit selon son usage réel. | Offre applicative payante dès 5 $/mois; le palier fixe d'entrée affiché est 1 vCPU / 512 MiB RAM. |
| Base PostgreSQL | Service PostgreSQL par usage; le tarif dépend des ressources consommées. Le modèle par défaut est un nœud unique. Les sauvegardes/PITR doivent être configurées explicitement. | PostgreSQL managé standard à partir de 15,15 $/mois pour le nœud 1 GiB / 1 vCPU; stockage annoncé séparément à 0,215 $/GiB/mois. Avec 10 GiB, l'ordre de grandeur app + base est d'environ 22,30 $/mois avant extras. |
| Sauvegarde et exploitation | La documentation demande d'activer les sauvegardes ou la récupération à un point dans le temps; la haute disponibilité est une option séparée. | Sauvegardes quotidiennes et journaux permettant une restauration à un instant des sept derniers jours; chiffrement en transit et au repos. Le nœud d'entrée seul ne constitue pas une garantie de haute disponibilité. |
| Région | Amsterdam (EU West) est listé. | La région exacte commune à l'app et à la base reste à vérifier dans le panneau avant tout provisionnement. |
| Prévisibilité | Démarrage moins cher, mais facture liée aux ressources consommées et au trafic. Le forfait gratuit met les services en veille et n'est pas retenu pour un service fiable. | Base mensuelle plus prévisible; coût initial supérieur. Il faut aussi tester la procédure de restauration et contrôler les options facturées. |

Sources officielles : [Railway tarifs](https://railway.com/pricing), [déploiement Laravel sur Railway](https://railway.com/guides/laravel), [régions Railway](https://docs.railway.com/deployments/regions), [PostgreSQL Railway](https://docs.railway.com/databases/postgresql), [DigitalOcean App Platform tarifs](https://www.digitalocean.com/pricing/app-platform), [bases de données DigitalOcean tarifs](https://www.digitalocean.com/pricing/managed-databases), [fonctionnalités PostgreSQL managé](https://docs.digitalocean.com/products/databases/postgresql/details/features/), [buildpack PHP DigitalOcean](https://docs.digitalocean.com/products/app-platform/reference/buildpacks/php/).

### Recommandation conditionnelle

- **Moteur : PostgreSQL** pour la future persistance, en cohérence avec DEC-010. Les grilles DigitalOcean consultées affichent le même prix de départ pour les nœuds PostgreSQL et MySQL; aucun avantage de coût immédiat ne justifie d'abandonner la préférence existante. Ce choix reste à confirmer avec la région, le budget et les tests de restauration.
- **Démo actuelle :** rester en local à 0 $ et utiliser seulement les références déjà présentes dans le dépôt, en respectant leurs statuts de vérification et en signalant les champs manquants. Ne pas ajouter de fausses écoles, sources, frais, débouchés ou autres faits pour remplir l'interface. Cette option ne fournit pas d'URL publique.
- **Hébergement éventuel :** le budget de 0 $ exclut les offres payantes comparées et ne garantit pas qu'un hébergeur gratuit puisse exécuter Laravel et sa base sans mise en veille, limites ou dépassement facturé. Avant toute publication, vérifier les conditions tarifaires, la région disponible (Côte d'Ivoire souhaitée), les journaux, les sauvegardes et la présence de tout traitement de données. Aucune mise en ligne n'est autorisée par cette recommandation.
- **Origine web :** garder le quiz local comme décidé. Pour les futurs comptes et fonctions privées, privilégier une seule origine Laravel plutôt qu'un frontend/API séparés; cela demandera d'intégrer/servir les pages statiques dans cette application. Aucune configuration CORS ou session inter-origines n'est recommandée à ce stade.
- **Confidentialité :** ne pas déployer de comptes, réponses nominatives, CV, demandes de mentorat ou données de mineurs avant une revue compétente des obligations ivoiriennes, du transfert transfrontalier, des finalités, du consentement, de l'accès et de la conservation. Une région européenne ne vaut pas validation juridique.

La recommandation ne provisionne aucun service. Le budget actuel de 0 $ et le souhait de démonstration sont communiqués par le propriétaire; le responsable d'exploitation et la région exacte restent à déterminer. Aucune ressource cloud n'est créée et le pilote avec données réelles reste soumis à validation juridique et opérationnelle.

Recommandations opérationnelles à valider :

- environnements de développement, préproduction et production séparés;
- configuration et secrets différents dans chaque environnement;
- migrations versionnées, réversibles autant que possible et appliquées par procédure;
- sauvegardes chiffrées et test de restauration périodique;
- logs structurés, minimisés en données personnelles, avec alertes sur erreurs et disponibilité;
- tâches asynchrones et Redis seulement si un besoin mesuré de file/cache le justifie;
- procédure de déploiement, rollback, incident, contact de support et responsabilité d'exploitation.

La mention d'un fichier `.nojekyll` dans le dépôt ne prouve pas l'hébergeur actuellement utilisé. Elle rappelle seulement qu'un site statique et un backend PHP ne partagent pas les mêmes exigences d'exécution.

## 13. Tests et critères de validation

Avant toute persistance ou extension du backend au-delà du prototype local, la matrice de tests et les environnements restent à valider. La suite cible proposée devrait inclure :

1. **Tests unitaires métier :** transitions, règles de calcul versionnées, validation, expiration, publication et corrections.
2. **Tests d'intégration SQL :** contraintes, transactions, migrations propres, import contrôlé, sauvegarde/restauration sur le moteur choisi.
3. **Tests de fonctionnalités Laravel :** authentification, récupération, routes, réponses d'erreur, CSRF selon rendu et accès par rôle.
4. **Tests négatifs d'autorisation :** tentatives horizontales et verticales sur les dossiers, organisations, candidatures, demandes, documents et publication.
5. **Tests frontend :** formulaires et états chargement/erreur/vide/succès réel, clavier, lecteur d'écran, responsive et réduction des animations.
6. **Tests de bout en bout :** parcours complet pour chacun des cinq piliers, y compris les refus et les cas où aucun contenu vérifié n'est disponible.
7. **Tests de performance :** protocole, jeux de données, seuils et profil de charge d'abord résolus dans OPEN-003/OPEN-021; ne pas transformer les nombres historiques en garantie sans test.
8. **Tests opérationnels :** déploiement de préproduction, sauvegarde, restauration, migration et retour arrière.

Un parcours n'est accepté comme opérationnel que si les tests démontrent persistance côté serveur, autorisation, erreurs explicites, traçabilité et comportement utilisable sur mobile. Les critères fonctionnels détaillés restent dans le [registre des exigences](05-registre-des-exigences.md).

## 14. Ordre de réalisation proposé

| Étape | Résultat requis | Condition de passage |
|---|---|---|
| A. Validation de conception | Modèle logique, contrats API, permissions, sécurité, moteur SQL, origine, hébergement et contraintes d'exploitation relus; le prototype local d'orientation reste isolé sans compte ni persistance. | Décisions restantes enregistrées dans le document 06; aucune hypothèse présentée comme décision; aucun élargissement du backend avant revue. |
| B. Préparation technique | Environnements reproductibles, tests, gestion des secrets, déploiement de préproduction, sauvegarde et restauration documentés. | Revue technique et sécurité; données de production absentes. |
| C. Première tranche verticale | Un parcours limité relie interface, session réelle, autorisation serveur, persistance relationnelle et tests. | Critères d'acceptation atteints; pas de collecte sensible avant revue sécurité/confidentialité. |
| D. Socle progressif | Capacités minimales validées pour chacun des cinq piliers, construites selon les priorités acceptées. | Chaque pilier a des données, responsables, états vides, tests et permissions contrôlés. |
| E. Pilote | Exploitation réelle surveillée, support, restauration vérifiée, contenus gouvernés et incidents traitables. | Accord explicite sur mineurs, obligations, budget, qualité et conditions de lancement. |
| F. Extensions | React si justifié, apprentissage, portfolios, communauté, IA générative ou clients externes. | Besoin, consentements, risques, coûts, sécurité et valeur utilisateur démontrés séparément. |

Les priorités P0/P1 et les conditions du socle restent celles des documents 01 et 05. L'architecture ne les réordonne pas et ne retire aucun pilier.

## 15. Décisions restant à valider

Le document 06 demeure l'unique registre officiel. La cible Laravel modulaire, le frontend préservé et l'adoption progressive de TypeScript sont validés. Le modèle logique et les contrats API sont précisés dans les documents 08 et 09; ils doivent être relus et acceptés avant toute persistance ou extension du backend. Les arbitrages suivants conditionnent encore l'implémentation :

- **OPEN-006 :** PostgreSQL contre MySQL, évalués sur hébergement, coût, opérations, tests et restauration.
- **OPEN-023 :** versions PHP/Laravel supportées, extensions, hébergement et capacité de maintenance.
- **OPEN-025 :** application de même origine contre frontend et API déployés séparément.
- **OPEN-022 :** hébergement, budget, sauvegardes, supervision et support.
- Les rôles, les capacités minimales des piliers, le quiz, la charge, les mineurs, les durées de conservation, les documents et la vérification des données restent également ouverts dans le registre.

**Décision requise avant persistance ou pilote réel :** confirmer le fournisseur, le responsable et la région après examen des obligations, du modèle logique, des contrats API, des règles d'accès et des sauvegardes. Le prototype local ne ferme aucun point OPEN et ne doit pas recevoir de données personnelles. Pour la démo, conserver le mode local tant qu'une option publique réellement sans frais et adaptée n'a pas été vérifiée.
