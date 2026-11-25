# Référentiel et périmètre — JeuneAvenir CI

**Statut :** document de cadrage validé le 17 novembre 2026 par le propriétaire
**Version :** 0.1 — référentiel de travail, certaines exigences restent à arbitrer
**Périmètre :** produit, sources, lancement et feuille de route synthétique

## 1. Objet et autorité du référentiel

Les six documents de `docs/conception/` forment ensemble le référentiel fonctionnel de JeuneAvenir CI. Ils ne constituent pas une preuve que les fonctionnalités décrites sont déjà construites ou disponibles en production.

Ordre d'autorité en cas de divergence :

1. Décision explicite la plus récente du propriétaire, consignée dans `06-decisions-et-points-a-valider.md`.
2. Exigences du CDC de référence, une fois leur source et leur version confirmées.
3. Le présent cadrage et les règles réparties dans les autres documents de conception.
4. Les documents spécialisés, limités à leur sujet : le système Horizon décrit l'identité visuelle; il ne décide pas à lui seul du périmètre produit ou de l'architecture.
5. Le code, les JSON, tests, README et journal décrivent l'état observé du dépôt; ils ne valent pas validation d'une exigence.
6. Maquettes, anciens audits et packs de propositions sont des sources historiques ou consultatives, sauf validation explicite.

Une contradiction qui affecte le périmètre, la sécurité, les données ou les coûts doit être inscrite au registre des décisions. Aucun document technique ne peut, à lui seul, modifier une décision produit.

### Sources utilisées et portée

- Le CDC disponible dans le dépôt est `Cahier_des_charges_DEFINITIF_JeuneAvenirCI (1).md`, daté du 16 août 2026. Il est utilisé comme base provisoire et n'est pas présenté comme le CDC consolidé du 3 novembre.
- Le propriétaire a fourni le 17 novembre une « MISSION DIRECTRICE — Référentiel produit, technique et organisationnel ». Elle apporte des principes, des extensions de vision et une première mission de consolidation; elle est complémentaire et ne remplace ni le CDC ni la Mission 10.
- Le propriétaire a confirmé le 17 novembre que les cinq piliers restent dans le socle du lancement, que les données publiées doivent être vérifiées et traçables avec un responsable, et que l'architecture devait précéder le backend. DEC-015 autorise ensuite un prototype local limité; la validation d'architecture reste requise avant la production.
- `docs/maquettes/JeuneAvenir_CI_Maquettes_Horizon/` est la référence visuelle la plus récente identifiée. Le choix Horizon (bleus, Instrument Serif, Manrope, boussole) est confirmé par les consignes du propriétaire.
- `journal.md`, `README.md`, les pages, les scripts, les tests et les données JSON sont des preuves de l'état du projet à la date d'examen, pas des spécifications garanties.
- Aucun PDF intitulé « Cahier des charges JeuneAvenir CI », version 1.0 consolidée du 3 novembre 2026, ni script SQL Supabase n'a été trouvé dans le dépôt examiné. Le référentiel ne prétend donc pas avoir vérifié ces éléments.

Les documents détaillés du référentiel sont :

- [Règles métier](02-regles-metier.md)
- [Rôles et permissions](03-roles-et-permissions.md)
- [Gouvernance des données](04-gouvernance-des-donnees.md)
- [Registre des exigences](05-registre-des-exigences.md)
- [Décisions et points à valider](06-decisions-et-points-a-valider.md)

## 2. Produit et proposition de valeur

JeuneAvenir CI vise à accompagner les jeunes en Côte d'Ivoire dans leur orientation, leurs études, le développement de leurs compétences et leur insertion. La proposition produit relie des informations vérifiables, des outils d'exploration et un espace personnel, sans présenter une recommandation comme une décision officielle.

Le produit ne doit pas être réduit à un site vitrine, un annuaire d'écoles ou un catalogue d'offres. L'espace personnel doit rester organisé en univers adaptés aux objectifs et aux droits de l'utilisateur, et non en un tableau de bord mélangeant toutes les fonctions.

Les contenus doivent être concrets, adaptés aux publics ivoiriens et transparents sur les inconnues. Aucun chiffre d'impact, partenaire, offre, école, mentor ou témoignage fictif ne doit être présenté comme réel.

## 3. Périmètre du lancement : cinq piliers

Le propriétaire a validé que les cinq piliers du CDC restent dans le périmètre du lancement :

1. **Orientation** — questionnaire, pistes, explications, parcours et comparaison.
2. **Découverte** — filières, formations, établissements, écoles et métiers.
3. **Mentorat** — annuaire, profils et demande de mise en relation.
4. **Insertion professionnelle** — opportunités, offres, candidatures et gestion entreprise.
5. **Compte utilisateur** — identité, profil, favoris, historique et espace personnel.

Cette validation porte sur le **périmètre produit**, pas sur l'état opérationnel actuel. Le lancement ne doit pas transformer une simulation en service réel. Pour chaque pilier, le registre définit une capacité minimale proposée, ses dépendances et son statut dans le frontend actuel. Les priorités P0/P1 ci-dessous sont des propositions d'ordonnancement à valider; elles ne retirent aucun pilier du lancement.

### État réel observé du socle

| Pilier | État observé dans le dépôt | Limite importante |
|---|---|---|
| Orientation | Quiz, résultat et comparateur présents; résultat enregistré localement. | Calcul heuristique, banque de 18 questions contre 14 au CDC provisoire; pas de validation psychométrique ni d'affectation officielle. |
| Découverte | Catalogues dynamiques de filières, écoles et métiers fondés sur des JSON; recherche et fiches partiellement disponibles. | Couverture et actualité incomplètes; les correspondances ou sources ne garantissent pas admission ni ouverture. |
| Mentorat | Page, recherche et demande de démonstration locales présentes. | `data/mentors.json` est vide avec `aucune_publication`; aucune demande réelle ni réponse n'est transmise. |
| Insertion professionnelle | Pages d'offres, publication locale, candidature de démonstration et historique local présents. | `data/offres.json` est vide avec `aucune_publication`; aucun dépôt ne reçoit les candidatures ou offres. |
| Compte | Inscription, connexion, profil, favoris et dashboards locaux présents. | La session est simulée dans `localStorage`; le mot de passe n'est pas vérifié à la connexion; aucune autorisation serveur. |

Un service sera qualifié d'« opérationnel » seulement lorsqu'un parcours réel, la persistance, les autorisations, les erreurs, les critères d'acceptation et les tests associés seront démontrés dans l'environnement cible.

## 4. Vision globale : huit univers

La Mission Directrice décrit huit univers. Leur présence dans la vision ne signifie pas qu'ils sont tous disponibles au lancement.

| Univers | Relation au socle | Disponibilité observée | Priorité/version |
|---|---|---|---|
| Orientation et découverte | Correspond directement aux piliers Orientation et Découverte. | Partiellement disponible côté frontend; données locales. | Socle du lancement confirmé; ordre P0/P1 à valider. |
| Parcours académique et études | Extension liée aux résultats, formations et progression. | Aucun espace de progression académique complet n'a été établi. | Extension à spécifier; version à confirmer. |
| Apprentissage et développement des compétences | Extension de la vision, non simple bibliothèque de cours. | Absente comme parcours dédié. | Futur / proposition; ne pas inclure comme fonction disponible. |
| Profil personnel et portfolios | Le Compte existe; un portfolio riche est une extension. | Profil local disponible; aucun système de portfolio/projets public complet. | Profil du socle; portfolios futurs à arbitrer. |
| Mentorat et accompagnement | Pilier Mentor au lancement. | Interface/demande locale; annuaire public vide. | Socle confirmé, mise en relation réelle à cadrer et vérifier. |
| Carrière et insertion professionnelle | Pilier Insertion au lancement. | Interfaces locales; catalogue d'offres vérifiées vide. | Socle confirmé, flux réel à cadrer. |
| Communauté et opportunités | Extension de la vision; interaction sociale à risque accru. | Aucune communauté opérationnelle observée. | Futur / proposition; analyse mineurs et modération préalables. |
| Assistant intelligent intégré | Une phase locale à règles existe; l'ambition générative reste distincte. | Assistant local consultable dans le navigateur, non génératif. | Assistant actuel = existant limité; IA générative = futur, fournisseur à confirmer. |

## 5. Principes de périmètre et de vérité

- Distinguer strictement `EXISTANT`, `SIMULATION_LOCALE`, `PARTIELLEMENT_OPERATIONNEL`, `ABSENT` et `NON_VERIFIE` pour l'état du produit.
- Distinguer ces statuts des états de décision `VALIDÉ`, `À CONFIRMER`, `PROPOSITION` et `FUTUR`.
- Les statuts d'exigence et les critères détaillés sont gérés dans [05-registre-des-exigences.md](05-registre-des-exigences.md); ne pas maintenir une seconde matrice concurrente dans ce document.
- Les règles métier sont dans [02-regles-metier.md](02-regles-metier.md), les droits dans [03-roles-et-permissions.md](03-roles-et-permissions.md), et les règles de contenu dans [04-gouvernance-des-donnees.md](04-gouvernance-des-donnees.md).
- Toute priorité P0/P1 de conception reste marquée **PROPOSITION À VALIDER**, sauf décision du propriétaire enregistrée dans le document 06.
- Les inconnues ne doivent pas être converties en champs obligatoires, règles automatiques ou réponses utilisateur par supposition.

## 6. Feuille de route synthétique proposée

Cette feuille de route ne contient ni date, ni budget, ni promesse de mise en production.

| Étape | Résultat attendu | Dépendances / statut |
|---|---|---|
| 0. Référentiel | CDC applicable, périmètre détaillé, rôles, gouvernance, exigences et décisions ouvertes validés. | Le présent dossier est en cours de validation; plusieurs arbitrages restent ouverts. |
| 1. Architecture détaillée | Options comparées, architecture retenue, schéma conceptuel, frontières de confiance, permissions et stratégie de tests validés. | À achever avant la production; une première tranche Laravel locale est autorisée par DEC-015, sans valider l'architecture complète. |
| 2. Préparation du lancement | Capacités P0 de chacun des cinq piliers définies et évaluables; jeux de données vérifiés; règles de confidentialité et de modération cadrées. | P0 à valider dans le registre; vérification juridique compétente requise pour les obligations locales. |
| 3. Construction progressive du socle | Mise en œuvre module par module, avec tests d'API, d'autorisations, d'accessibilité et de parcours. | Le prototype local couvre le routage, la session Jeune de développement et l'orientation; les autres modules et validations de production restent à faire. |
| 4. Préproduction et pilote | Vérification des opérations réelles, restauration, supervision, capacité mesurée, consentements et support. | Aucun environnement de production ni niveau de service n'est établi dans le dépôt. |
| 5. Extensions de vision | Étude puis arbitrage de l'apprentissage, des portfolios, de l'assistant génératif et de la communauté. | FUTUR / PROPOSITION; aucun engagement de version ou de date. |

Les critères P0/P1 détaillés sont dans le [registre des exigences](05-registre-des-exigences.md). Les décisions requises avant les étapes 1 à 3 sont centralisées dans [06-decisions-et-points-a-valider.md](06-decisions-et-points-a-valider.md).

## 7. Architecture : frontière de cette phase

La cible doit conserver le frontend HTML/CSS/JavaScript modulaire si l'analyse confirme qu'il convient. Le CDC et la Mission Directrice nomment Supabase Auth, PostgreSQL, API et Storage comme options ou cibles à examiner; le choix final est ouvert.

Un backend Laravel local existe conformément à l'autorisation de développement DEC-015 : routage même origine, première API d'orientation et sessions Jeune de développement désactivées par défaut. Cela ne valide pas l'architecture complète et n'autorise ni collecte réelle ni déploiement. Le moteur SQL de production, la configuration distante, la vérification d'e-mail, la récupération de compte, le fournisseur IA et le stockage de fichiers ne sont pas retenus.

La cible de conception validée est détaillée dans [l'architecture](07-architecture-cible.md), le [modèle logique](08-modele-de-donnees.md) et les [contrats API](09-contrats-api.md). Laravel modulaire et la préservation du frontend avec adoption progressive de TypeScript sont validés comme cible. PostgreSQL reste une préférence à confirmer après comparaison des contraintes d'hébergement, de compatibilité, de coûts et de maintenance. Le registre officiel des autres arbitrages demeure le document 06.

## 8. Risques structurants

- Une mise en production de l'authentification locale exposerait à l'usurpation de session et aux accès non autorisés.
- Des offres ou mentors non vérifiés pourraient induire en erreur; aucun contenu fictif ne doit être présenté comme réel.
- Des résultats du quiz pourraient être interprétés comme une décision d'admission malgré leur caractère exploratoire.
- Les mineurs, les échanges avec mentors/organisations, les documents et les consentements exigent des règles spécifiques avant activation.
- Le CDC disponible ne règle pas plusieurs conflits de nombre, de version, de capacité et de périmètre; ces points sont dans le document 06.
- Les risques d'exploitation restent ouverts : aucune configuration de production, sauvegarde/restauration, supervision ni hébergement n'est établi dans le dépôt.

## 9. Évolutions de ce document

Toute modification du périmètre doit référencer une décision du document 06 et indiquer les exigences affectées dans le document 05. Les états du frontend doivent être actualisés à partir de preuves, sans transformer rétroactivement une simulation en service opérationnel.
