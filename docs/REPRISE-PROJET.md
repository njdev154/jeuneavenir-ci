# Guide de reprise — JeuneAvenir CI

**Dernière mise à jour :** 25 novembre 2026
**Objet :** permettre à toute nouvelle session ou tout nouvel agent de reprendre JeuneAvenir CI sans perdre l'état du projet.

## 1. Présentation

JeuneAvenir CI accompagne les jeunes ivoiriens dans l'orientation, les études, le mentorat et l'insertion professionnelle. Le dépôt contient un frontend HTML/CSS/JavaScript avec des données JSON et une première application Laravel destinée au développement local, sous l'identité Horizon.

## 2. Vision du produit

Construire une plateforme réelle, vérifiable et utile, pas un simple site vitrine. Les contenus publiés doivent être sourcés, vérifiés et reliés à un responsable. Les parcours peuvent devenir opérationnels seulement avec persistance, autorisations, gestion d'erreurs et tests.

## 3. Périmètre de lancement

Les cinq piliers sont confirmés :

1. Orientation.
2. Découverte.
3. Mentorat.
4. Insertion professionnelle.
5. Compte.

Les huit univers de la vision globale ne sont pas tous inclus automatiquement au lancement.

## 4. Décisions confirmées

- Cinq piliers dans le lancement.
- Toute donnée publiée doit être traçable, vérifiée et associée à un responsable de validation.
- Le développement local du backend a été autorisé par DEC-015; cela ne vaut ni validation de l'architecture complète, ni autorisation de collecte réelle ou d'ouverture publique.
- Identité Horizon conservée.
- Laravel en monolithe modulaire organisé par domaines est la cible backend.
- Frontend HTML/CSS/JavaScript existant conservé.
- Adoption progressive de certains scripts JavaScript vers TypeScript.
- PostgreSQL est une préférence, pas une décision définitive.
- Permissions côté serveur obligatoires.
- API documentée obligatoire.
- Pas de React, Tailwind, Redis ou IA générative au lancement sans besoin justifié et nouvelle décision.
- Espace personnel organisé en univers distincts.

## 5. Recommandations techniques

- Préférer une application de même origine pour limiter CORS/session tant qu'une séparation n'est pas démontrée nécessaire.
- Organiser Laravel par domaines fonctionnels.
- Stocker les données dans un moteur SQL relationnel choisi après comparaison.
- Utiliser des migrations, politiques/permissions serveur, sessions sécurisées, audit minimal et tests négatifs.
- Conserver les styles Horizon et faire migrer TypeScript progressivement.
- Ne pas créer une SPA React ou une API publique juste pour anticiper une croissance non démontrée.

## 6. Choix encore ouverts

Voir le registre officiel [06-decisions-et-points-a-valider.md](conception/06-decisions-et-points-a-valider.md). Les principaux sont :

- PDF consolidé du 3 novembre.
- PostgreSQL contre MySQL.
- Hébergement, coûts, sauvegardes et support.
- Rôles canoniques et Professeur/Mentor.
- Comptes, récupération et fournisseurs sociaux.
- Mineurs et interactions mentor/organisation/communauté.
- 14/18 questions et nombre réellement tiré.
- 50 simultanés contre 10 000 utilisateurs.
- Capacités minimales P0/P1 des cinq piliers.
- Conservation/export/suppression des données.
- États des offres, demandes de mentorat et candidatures.
- Application même origine ou frontend/API séparés.

## 7. Documents à lire en priorité

1. [Guide de reprise](./REPRISE-PROJET.md).
2. [Index général](./conception/00-INDEX-GENERAL.md).
3. [Décisions et points à valider](./conception/06-decisions-et-points-a-valider.md).
4. [Référence et périmètre](./conception/01-reference-et-perimetre.md).
5. [Règles métier](./conception/02-regles-metier.md).
6. [Rôles et permissions](./conception/03-roles-et-permissions.md).
7. [Gouvernance des données](./conception/04-gouvernance-des-donnees.md).
8. [Registre des exigences](./conception/05-registre-des-exigences.md).
9. [Architecture cible](./conception/07-architecture-cible.md).
10. [Modèle de données](./conception/08-modele-de-donnees.md).
11. [Contrats API](./conception/09-contrats-api.md).
12. [Risques et blocages](./conception/10-risques-et-blocages.md).

Consulter également le [README racine](../README.md) et le [journal du projet](../journal.md) dans le dépôt. Ce sont des documents de référence existants; ne pas les recréer ni les modifier sans demande. Leur absence dans une archive ou une copie partielle ne signifie pas qu'ils sont absents du dépôt : vérifier l'arborescence et l'état Git du dépôt lui-même.

## 8. État réel du dépôt

- Frontend HTML/CSS/JavaScript multipage.
- Backend Laravel local en monolithe même origine : routage des pages, API d'orientation et tranche de session Jeune réservée aux essais locaux.
- L'API du quiz renvoie sept questions et calcule une piste exploratoire sans enregistrer les réponses; le résultat reste temporairement dans l'onglet. La méthode du quiz n'est pas validée psychométriquement.
- L'inscription locale est désactivée par défaut; lorsqu'elle est activée en local, elle crée un compte Jeune et un tableau de bord limité à l'identité. Le quiz, le profil, les favoris, le mentorat et les candidatures ne sont pas liés au compte.
- Quiz, résultat et comparateur existent mais les données et la méthode restent à valider.
- Catalogues partiels de filières, écoles et métiers avec provenance variable.
- Mentors et offres réels absents; les JSON sont vides.
- Inscription, connexion, profil, favoris, demandes et candidatures sont surtout locaux/simulés.
- `localStorage` ne constitue pas une authentification sécurisée ni une autorisation serveur.
- Assistant actuel : règles locales, pas IA générative ni service externe.
- Aucun hébergement public, moteur SQL de production, configuration distante ni script Supabase n'est retenu.
- Aucun PDF consolidé du 3 novembre n'a été identifié dans la copie examinée.

## 9. Élément déjà réalisés

- Refonte Horizon du frontend.
- Pages et navigation responsive.
- Quiz, résultat, comparateur, catalogues, recherche et fiches.
- Étude initiale des écoles et métiers.
- Favoris locaux et tableaux de bord de démonstration.
- Assistant local à règles.
- Prototype Laravel local : pages servies sur la même origine, comptes Jeune de développement fermés par défaut et quiz API non persistant.
- Référentiel fonctionnel 01 à 06.
- Architecture cible 07.
- Modèle logique 08.
- Contrats API 09.
- Registre des risques 10.
- Journal historique du projet.

## 10. Éléments non commencés

- Backend Laravel déployé ou préparé pour la production.
- Authentification publique complète : vérification d'e-mail, récupération de compte et règles approuvées pour les mineurs restent absentes.
- Modèle de données métier et moteur SQL de production validés.
- Autorisations serveur pour tous les parcours.
- Base de données PostgreSQL/MySQL.
- Migrations et imports vérifiés.
- Publications mentor/offre réelles.
- Candidatures et mentorat transmis.
- CV, portfolios et stockage de documents.
- Notifications opérationnelles.
- Administration et modération.
- Sauvegardes, observabilité et incidents.
- Assistant génératif et intégrations IA.

## 11. Restrictions à respecter

- Ne pas modifier le code sans une mission ou une autorisation explicite.
- Ne pas créer une migration, une configuration Laravel, une base, une clé API ou une dépendance pendant une mission documentaire.
- Ne pas committer ni pousser sans validation explicite.
- Ne pas supprimer ni remplacer un document existant sans autorisation.
- Ne pas transformer une simulation locale en fonctionnalité opérationnelle dans un rapport.
- Ne pas publier de mentor, offre, école, témoignage ou donnée réelle sans traçabilité et responsable.
- Ne pas réintroduire React, Tailwind, Redis ou une IA générative uniquement sur une proposition générale.
- Ne pas annoncer une conformité juridique avant revue compétente.
- Ne pas inventer un hébergeur, un budget, des durées ou des responsables.
- Préserver les modifications préexistantes non liées à la mission.

## 12. Prochaine étape recommandée

Le développement local peut continuer avec des données synthétiques, selon DEC-015. Avant toute collecte réelle, ouverture publique ou déploiement, résoudre les blocages de sécurité et de gouvernance :

1. Valider les rôles canoniques.
2. Valider les règles mineurs.
3. Nommer les responsables de saisie et validation.
4. Valider les durées de conservation.
5. Finaliser les transitions mentorat/offres/candidatures.
6. Comparer les hébergements compatibles Laravel.
7. Choisir PostgreSQL ou MySQL avec justification.
8. Valider le modèle logique et les contrats API.
9. Ensuite seulement préparer un pilote hébergé limité, avec tests d'exploitation et vérification humaine.

## Instructions impératives pour tout nouvel agent IA

- Lire ce fichier avant toute intervention.
- Lire ensuite `docs/conception/00-INDEX-GENERAL.md`.
- Consulter les documents de conception concernés.
- Vérifier `journal.md` et l'état Git avant toute modification.
- Respecter les décisions du propriétaire inscrites dans le document 06.
- Ne pas redemander les décisions déjà prises.
- Ne pas réintroduire des technologies précédemment écartées sans justification.
- Ne pas développer avant validation des éléments bloquants.
- Ne jamais inventer des fonctionnalités, données, responsables ou validations.
- Présenter ses propositions avant toute action nécessitant une autorisation.
