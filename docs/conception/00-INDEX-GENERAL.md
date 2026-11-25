# Référentiel central — JeuneAvenir CI

**Statut documentaire :** RÉDIGÉ — point d'entrée de travail; non approuvé en tant que document complet
**Dernière mise à jour :** 18 novembre 2026
**Autorité :** le registre unique des décisions est [06-decisions-et-points-a-valider.md](06-decisions-et-points-a-valider.md)

## A. Présentation du projet

### Vision

JeuneAvenir CI est une plateforme ivoirienne destinée à accompagner les jeunes, notamment les lycéens et nouveaux bacheliers, du choix de leurs études jusqu'à l'emploi. Elle relie orientation, découverte des formations et métiers, mentorat, insertion professionnelle et espace personnel.

### Problème traité

Les jeunes peuvent manquer d'informations vérifiées, de conseils personnalisés, de mise en relation et de visibilité auprès des employeurs ou organismes de formation. Le produit vise à réduire ces ruptures sans présenter une recommandation comme une affectation officielle ou une promesse d'admission.

### Publics concernés

- Visiteurs cherchant à explorer les études, établissements et métiers.
- Jeunes ou candidats qui veulent suivre un parcours d'orientation, gérer leurs favoris et préparer leur insertion.
- Mentors proposant un accompagnement vérifié.
- Représentants d'organisations vérifiées publiant des offres et recevant des candidatures autorisées.
- Administrateurs éditoriaux vérifiant et publiant les contenus.
- Administrateurs techniques responsables de l'exploitation et de la sécurité.

Les mineurs sont potentiellement dans le public. Toute interaction directe avec mentors, organisations ou communautés reste bloquée jusqu'à une règle dédiée validée.

### Objectifs

- Donner des pistes d'orientation explicables et traçables.
- Centraliser des données vérifiées sur les filières, formations, établissements et métiers.
- Permettre une mise en relation encadrée avec des mentors.
- Soutenir les candidatures vers des offres réellement vérifiées.
- Offrir un espace personnel organisé par univers plutôt qu'un tableau de bord indifférencié.
- Distinguer clairement les fonctionnalités existantes, simulées, partielles et absentes.

### Proposition de valeur

JeuneAvenir CI vise à devenir un outil de navigation pratique, fiable et honnête pour la jeunesse ivoirienne. Les résultats du quiz sont des pistes d'auto-réflexion, pas un test psychométrique, une affectation ou une garantie d'admission. Les contenus publics doivent avoir une source, une portée de vérification, une date et un responsable.

### Principes de conception

- Préserver l'identité Horizon : bleu nuit, bleu intermédiaire, bleu accent, Instrument Serif, Manrope et boussole.
- Construire pour mobile d'abord, puis tablette et desktop.
- Conserver les composants, textes et parcours déjà réalisés sans réécriture générale injustifiée.
- Faire évoluer le JavaScript vers TypeScript par modules.
- Séparer les états éditoriaux des états métier.
- Refuser toute donnée fictive présentée comme réelle.
- Appliquer les permissions côté serveur.
- Journaliser les opérations sensibles sans recopier inutilement des données personnelles.
- Documenter les erreurs, chargements, états vides et succès réels.
- Ne pas annoncer une conformité juridique ou une authentification réelle tant que les preuves nécessaires n'existent pas.

## B. Organisation fonctionnelle

### Cinq piliers du lancement

Ces cinq piliers sont validés dans le périmètre de lancement :

| Pilier | Rôle |
|---|---|
| Orientation | Questionnaire, pistes expliquées, résultats, comparaison et historique futur. |
| Découverte | Filières, formations, établissements, écoles, métiers et recherche multi-contenu. |
| Mentorat | Profils vérifiés et demandes encadrées de mise en relation. |
| Insertion professionnelle | Organisations vérifiées, offres réelles, candidatures et suivi. |
| Compte | Inscription, profil, favoris, espaces personnels et historique autorisé. |

La validation du périmètre ne signifie pas que chaque pilier est actuellement opérationnel. L'état réel est distingué dans les documents 01 et 05.

### Vision globale des huit univers

Les huit univers décrivent la vision à long terme; ils ne sont pas automatiquement disponibles au lancement :

1. Orientation et découverte.
2. Parcours académique et études.
3. Apprentissage et développement des compétences.
4. Profil personnel et portfolios.
5. Mentorat et accompagnement.
6. Carrière et insertion professionnelle.
7. Communauté et opportunités.
8. Assistant intelligent intégré.

L'espace personnel central doit être organisé en univers distincts plutôt qu'en un tableau de bord qui mélange toutes les fonctions. Les univers futurs restent à arbitrer selon besoin, sécurité et priorité.

## C. Décisions confirmées

Toutes les décisions ci-dessous doivent être vérifiées dans [06-decisions-et-points-a-valider.md](06-decisions-et-points-a-valider.md).

| Décision | Statut | Référence |
|---|---|---|
| Les cinq piliers restent dans le périmètre du lancement. | Validée | DEC-001 |
| Toute donnée publiée doit être traçable, vérifiée et associée à un responsable de validation. | Validée | DEC-002 |
| L'architecture complète doit être étudiée et validée avant toute mise en production; le développement local limité est autorisé par DEC-015. | Validée, portée locale précisée par DEC-015 | DEC-003, DEC-015 |
| La direction visuelle Horizon est conservée. | Validée | DEC-004 |
| Le référentiel fonctionnel est composé des documents de conception, sans deuxième cahier des charges concurrent. | Validée | DEC-005 |
| L'architecture détaillée est un livrable distinct validé avant toute implémentation backend. | Validée | DEC-006 |
| Laravel en monolithe modulaire organisé par domaines est la cible backend. | Validée comme cible d'architecture; un prototype local limité est autorisé par DEC-015. | DEC-008, DEC-015 |
| Le frontend existant doit être préservé et certains scripts JavaScript migrés progressivement vers TypeScript. | Validée comme cible d'évolution | DEC-009 |
| PostgreSQL est une préférence technique, à confirmer définitivement après hébergement, compatibilité, coûts et maintenance. | Préférence validée; décision définitive ouverte | DEC-010 |
| Les permissions sont contrôlées côté serveur; une interface masquée ne constitue pas une autorisation. | Validée | DEC-008 et documents 03/07 |
| L'API doit être documentée et les permissions contrôlées côté serveur. | Validée comme cible d'architecture | DEC-008 |
| Des tests de contrats et de permissions sont recommandés avant la mise en production. | PROPOSÉE, pas confirmée comme décision du propriétaire | DEC-014 |
| React, Tailwind, Redis et une IA générative ne sont pas retenus au lancement sans besoin justifié et nouvel arbitrage. | Principe confirmé pour éviter une réécriture ou un fournisseur prématuré | Voir DEC-009, OPEN-017 et document 07 |

## D. Architecture

La cible recommandée à étudier est un monolithe Laravel modulaire :

```text
Frontend HTML/CSS/JavaScript existant
  migrations ciblées vers TypeScript
          |
          v
Application Laravel de même origine en priorité
  authentification et sessions
  autorisations/policies
  services métier par domaine
  API documentée
          |
          v
PostgreSQL de préférence ou alternative SQL validée
```

Un prototype local existe désormais : Laravel sert le frontend sur la même origine, expose l'API d'orientation et permet des essais de session Jeune lorsque le flag est explicitement activé. Ce prototype ne constitue ni une architecture de production validée, ni une ouverture publique; les comptes restent désactivés par défaut et les parcours métier ne sont pas reliés au compte.

Les modules de travail doivent couvrir au minimum identité, découverte, orientation, mentorat, insertion, espace personnel, administration éditoriale et audit.

### Décisions confirmées

- Laravel comme cible backend.
- Monolithe modulaire plutôt que microservices.
- Frontend existant conservé.
- TypeScript progressivement.
- Permissions côté serveur.
- API documentée.
- PostgreSQL comme préférence.

### Recommandations techniques

- Application Laravel de même origine en priorité pour limiter CORS et les problèmes de session.
- Séparation par domaines métier dans le code.
- Sessions serveur sécurisées, cookies HttpOnly/Secure/SameSite et protection CSRF.
- Modèle relationnel normalisé, migrations versionnées et contraintes.
- OpenAPI une fois les contrats stabilisés.
- Playwright pour les parcours, Laravel/Pest pour les tests backend et Vitest pour les modules frontend si TypeScript est adopté.

Ces recommandations restent soumises à preuve, compatibilité d'hébergement et revue technique.

### Choix provisoires

- PostgreSQL comme moteur préféré.
- Même origine ou API séparée.
- Blade partiellement réutilisé ou intégration ciblée des vues existantes.
- Hébergeur, domaine, budgets et niveaux de service.
- Fournisseur d'authentification sociale et mécanisme de récupération.
- OpenAPI comme format de documentation.

### Décisions bloquantes ouvertes

- Rôles canoniques et mappings Professeur/Mentor/Candidat.
- Capacité minimale opérationnelle de chacun des cinq piliers.
- Nombre et méthode de calcul du quiz.
- Responsables de validation des données.
- Durées de conservation et obligations locales.
- Règle mineurs avant mentorat, organisation ou communauté.
- Hébergement compatible Laravel/PostgreSQL ou alternative validée.
- Sauvegardes, restauration, incidents et supervision.
- Origine unique ou frontend/API séparés.

## E. Documentation

| Document | Objectif | Statut documentaire | Dépendances | Points à vérifier |
|---|---|---|---|---|
| [01-reference-et-perimetre.md](01-reference-et-perimetre.md) | Périmètre, sources, cinq piliers, huit univers et feuille de route. | **RÉDIGÉ** — arbitrages produit et source consolidée restent ouverts. | Document 06. | PDF consolidé absent; les priorités P0/P1 sont proposées. |
| [02-regles-metier.md](02-regles-metier.md) | Règles des parcours, transitions et cas limites. | **RÉDIGÉ** — règles proposées et inconnues signalées. | Documents 03, 04, 05 et 06. | Mineurs, états mentorat/candidature/offres. |
| [03-roles-et-permissions.md](03-roles-et-permissions.md) | Rôles cibles, matrice d'accès et tests d'autorisation. | **RÉDIGÉ** — matrice cible, mappings non arbitrés. | Décision OPEN-004. | Rôles canoniques et séparation des administrations. |
| [04-gouvernance-des-donnees.md](04-gouvernance-des-donnees.md) | Provenance, statuts éditoriaux, catégories et cycles de vie. | **RÉDIGÉ** — durées et responsables restent ouverts. | Vérification compétente, documents 06/08. | Responsables, conservation, suppression, mineurs. |
| [05-registre-des-exigences.md](05-registre-des-exigences.md) | 41 exigences traçables, priorités proposées, états et critères. | **RÉDIGÉ** — exigences tracées, priorités à valider. | Documents 02 à 04, code/JSON, CDC consolidé. | 14/18, P0/P1, critères opérationnels. |
| [06-decisions-et-points-a-valider.md](06-decisions-et-points-a-valider.md) | Registre officiel unique des décisions et arbitrages. | **REVU** — décisions individuelles distinguées des propositions et points ouverts. | Sources et confirmations du propriétaire. | PostgreSQL définitif, hébergement, mineurs, rôles; DEC-014 proposée. |
| [07-architecture-cible.md](07-architecture-cible.md) | Cible technique, modules, sécurité, hébergement et validation. | **RÉDIGÉ** — cible technique confirmée, architecture complète non approuvée. | Décisions OPEN-006/022/023/025. | Hébergement, moteur SQL, origine/API. |
| [08-modele-de-donnees.md](08-modele-de-donnees.md) | Domaines conceptuels, entités, relations et invariants. | **RÉDIGÉ** — modèle conceptuel, pas un schéma SQL approuvé. | Documents 02 à 04 et 06. | Cardinalités, suppression, consentements, rôles. |
| [09-contrats-api.md](09-contrats-api.md) | Conventions, ressources candidates, réponses et sécurité API. | **RÉDIGÉ** — contrats candidats, endpoints non approuvés; DEC-014 reste proposée. | Documents 02/03/08 et 06. | Endpoints définitifs, CORS/session, version API, tests de contrat. |
| [10-risques-et-blocages.md](10-risques-et-blocages.md) | Registre central des risques et préconditions. | **RÉDIGÉ** — risques documentés, aucun blocage résolu. | Documents 02 à 09. | Mise à jour après arbitrages et preuves. |
| [Guide de reprise](../REPRISE-PROJET.md) | Guide de reprise pour toute nouvelle session. | **REVU** — liens contrôlés et références documentaires complétées. | Index et documents de conception. | Mettre à jour après chaque mission. |

**Légende documentaire :**

- **RÉDIGÉ** : document développé, pas nécessairement validé.
- **REVU** : contenu examiné; les incohérences, contradictions ou arbitrages ouverts sont signalés.
- **VALIDÉ** : document approuvé explicitement par le propriétaire ou une autorité compétente.
- **PRÊT POUR IMPLÉMENTATION** : dépendances, décisions et critères d'acceptation résolus.

Aucun des documents 01 à 10 n'est actuellement classé « PRÊT POUR IMPLÉMENTATION ». Les décisions produit confirmées ne valent pas approbation intégrale de tous les documents qui les décrivent.

## F. État d'avancement

### Étapes documentaires réalisées

- Audit global initial du projet.
- Clarification du périmètre des cinq piliers et huit univers.
- Création du référentiel fonctionnel 01 à 06.
- Création des documents techniques 07 à 09.
- Confirmation des décisions de cible Laravel, préservation du frontend, TypeScript progressif et PostgreSQL comme préférence conditionnelle; cette confirmation n'approuve pas l'architecture complète.
- Mise en place du journal de travail.
- Développement local autorisé par DEC-015 : routage Laravel même origine, API du quiz sans conservation des réponses, session Jeune de développement désactivée par défaut; ces tranches n'approuvent pas la production.

### RÉDIGÉ, mais non prêt pour implémentation

- Modèle logique de données.
- Contrats API candidats.
- Priorités P0/P1.
- Règles détaillées des mentorats, candidatures, offres et mineurs.
- Architecture d'hébergement et de données.

### Décisions explicitement validées (pas les documents entiers)

- Périmètre des cinq piliers.
- Traçabilité des données publiées.
- Architecture conçue avant backend.
- Horizon comme identité visuelle.
- Laravel modulaire comme cible d'architecture.
- Frontend conservé avec TypeScript progressif.
- PostgreSQL comme préférence.
- Permissions côté serveur et API documentée.
- L'exigence supplémentaire de tests API avant production reste une proposition (DEC-014).

### À faire

- Obtenir ou identifier le CDC consolidé du 3 novembre s'il existe.
- Nommer les responsables métier et les responsables de validation.
- Choisir le moteur SQL définitif après analyse d'hébergement.
- Résoudre les rôles, mineurs, conservation, mentorat, candidatures et offres.
- Valider les critères P0/P1 et la capacité opérationnelle minimale.
- Valider les contrats API et le modèle conceptuel.
- Définir hébergement, sauvegardes, supervision et incidents.

### Non commencé

- Schéma métier de production et migrations liées au moteur SQL définitif.
- Authentification publique complète : vérification d'e-mail, récupération, gouvernance des mineurs et exploitation.
- Stockage réel de documents.
- Notifications opérationnelles.
- Administration réelle.
- Import des données vérifiées en production.
- Portfolios, apprentissage, communauté et assistant génératif.
