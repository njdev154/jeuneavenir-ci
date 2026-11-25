# Journal du projet

## 2026-11-18 — Assistant Copilot (Inventaire des dépendances)
- Vérification de l'environnement : PHP 8.5.3, Composer 2.11.2, Node.js 24.18.0, npm 11.16.0 et Python 3.14.6 sont présents; les extensions PDO pour MySQL, PostgreSQL et SQLite sont disponibles.
- Aucun manifeste Composer ou npm n'est présent à la racine; le frontend HTML/CSS/JavaScript actuel utilise les outils natifs et n'a pas de dépendance applicative à installer.
- Aucun paquet backend ni serveur SQL n'a été ajouté : les documents 08/09 restent « RÉDIGÉ », l'hébergement et le moteur SQL définitif restent ouverts, et le document 07 exige leur validation avant le démarrage du backend.
- Suite recommandée : revoir et valider le modèle de données et les contrats API, vérifier le support de PHP/Laravel et l'hébergement, puis installer les dépendances Laravel dans le projet backend sans réécrire le frontend.

## 2026-11-18 — Assistant Copilot (Mission 01 : socle frontend)
- État initial préservé : les changements documentaires et fichiers non suivis déjà présents n'ont pas été réinitialisés ni remplacés.
- Mise en place d'une navigation commune responsive pour les cinq piliers sur les pages principales, avec indication du pilier actif, état ARIA et fermeture du menu par clavier ou activation d'un lien.
- Ajout de `css/app-shell.css` et évolution du tableau de bord pour relier les cinq espaces tout en signalant les catalogues partiels et les démarches stockées uniquement dans ce navigateur; aucune authentification serveur ni donnée réelle n'a été ajoutée.
- Vérifications : `node --test` (51 réussites), contrôles `node --check`, `git diff --check` et rendu desktop/mobile, dont une largeur de 390 px sans débordement horizontal.
- Limite : les pages qui chargent leurs données avec `fetch()` n'ont pas pu être testées par HTTP depuis le navigateur intégré. Aucun commit ni push. À faire : tester via `python -m http.server 8000` dans un navigateur accessible avant de poursuivre les modules.

## 2026-11-18 — Assistant Copilot (Mission de consolidation et sauvegarde documentaire)
- Objectif : rendre le projet durablement reprenable sans modifier le code ni commencer le backend.
- État Git initial : branche `assistant-ia` alignée avec `origin/assistant-ia`; modifications préexistantes sur les documents 01, 03, 04, 06 et le journal; fichiers non suivis préexistants : CDC Markdown, `docs/conception/07-architecture-cible.md`, `docs/conception/08-modele-de-donnees.md`, `docs/conception/09-contrats-api.md`, `docs/maquettes/` et `pack-assistant-ia-v2/`.
- Documents examinés : les neuf documents 00 à 09 lorsqu'ils ont été présents ou créés, README, journal, CDC provisoire du 16 août, documents Horizon utiles et fichiers de conception existants.
- Création du [référentiel central](docs/conception/00-INDEX-GENERAL.md), du [registre des risques](docs/conception/10-risques-et-blocages.md) et du [guide de reprise](docs/REPRISE-PROJET.md).
- Mise à jour du [registre officiel](docs/conception/06-decisions-et-points-a-valider.md) avec les décisions DEC-011 à DEC-014 : univers distincts, construction modulaire, absence de React/Tailwind/Redis/IA générative au lancement sans justification, permissions/API documentées. Les préférences techniques et les arbitrages restent distingués des décisions acquises.
- Contradictions conservées : CDC16 en terracotta/Fraunces/Inter contre Horizon bleu/Instrument Serif/Manrope; 14/18 questions; 50/10 000 utilisateurs; Supabase contre Laravel/PostgreSQL comme cible documentée; Mongo/absence de SQL; PDF consolidé du 3 novembre absent.
- Points ouverts maintenus : hébergement, moteur SQL définitif, rôles, mineurs, conservation, modèles de mentorat/candidature/offre, fichier/portfolios, notifications, origine API, charge et validation juridique.
- Contrôles effectués : liens Markdown locaux, identifiants des documents, espaces finaux et `git diff --check`. Aucun test applicatif n'a été relancé, aucune application ni base de données n'a été modifiée.
- Aucun commit ni push n'a été effectué. Prochaine étape recommandée : valider le référentiel central, arbitrer les blocages P0/P1 puis définir l'hébergement et le moteur SQL avant toute autorisation de démarrer Laravel.

## 2026-11-17 — Assistant Copilot (Validation de la cible et dossier d’architecture)
- Le propriétaire a validé Laravel en monolithe modulaire organisé par domaines, les permissions côté serveur, une API documentée et la conservation du frontend avec adoption progressive de TypeScript. Cette validation définit la cible de conception, pas une autorisation de développer le backend.
- PostgreSQL est enregistré comme préférence; le choix définitif reste conditionné à l'hébergement, la compatibilité, les coûts et la maintenance, avec comparaison MySQL requise.
- Décisions DEC-008 à DEC-010 ajoutées au registre officiel; les points d'hébergement, de moteur SQL définitif, d'origine/API, de rôles, de mineurs, de conservation et de transitions restent ouverts.
- Extension du dossier technique : architecture dans `docs/conception/07-architecture-cible.md`, modèle logique dans `docs/conception/08-modele-de-donnees.md`, contrats API dans `docs/conception/09-contrats-api.md`; mise à jour des documents de rôles/permissions et gouvernance pour référencer cette cible.
- Les noms de routes, réponses et relations des documents 08/09 sont des contrats de conception à valider, pas des éléments implémentés. Aucun code applicatif, backend, schéma SQL, migration, dépendance ou configuration d'hébergement n'a été ajouté.
- Reste à relire et valider le dossier complet, résoudre les dépendances bloquantes dans le registre 06 et vérifier les contraintes d'hébergement avant toute implémentation.

## 2026-11-17 — Assistant Copilot (Étude de l’architecture cible)
- Vérification de l’état Git avant l’étape : branche `assistant-ia` alignée avec `origin/assistant-ia`; les ressources non suivies préexistantes (CDC Markdown, `docs/maquettes/`, `pack-assistant-ia-v2/`) ont été préservées.
- Lecture du référentiel produit, des rôles, de la gouvernance, du registre de décisions et du README; confirmation que le dépôt actuel est un frontend HTML/CSS/JavaScript avec JSON et stockage local simulé, sans projet Laravel/TypeScript/SQL.
- Création de `docs/conception/07-architecture-cible.md` comme étude technique distincte du référentiel fonctionnel : proposition de monolithe Laravel modulaire, comparatif PostgreSQL/MySQL, comparaison frontend progressif/React, modules, sécurité, données, hébergement et stratégie de validation.
- Le propriétaire a demandé de comparer les moteurs PostgreSQL/MySQL et les stratégies frontend; aucun choix final de base ou de framework frontend n'est acté. Laravel reste un candidat recommandé; la base de données et l'approche frontend sont ouvertes.
- Mise à jour des références dans les documents 01 et 06; les arbitrages techniques restent centralisés dans le registre officiel.
- Aucun code applicatif, backend, migration, dépendance, base ou configuration d'hébergement n'a été modifié. Reste à valider l'architecture avant toute implémentation backend.

## 2026-11-17 — Assistant Copilot (Mission 10, cadrage fonctionnel et gouvernance)
- Vérification préalable de Git et de `docs/conception/` : branche `assistant-ia`; les ressources non suivies préexistantes `docs/`, le CDC Markdown et `pack-assistant-ia-v2/` ont été préservés; `docs/conception/` n'existait pas.
- Comparaison du CDC Markdown disponible (16 août 2026), de la Mission Directrice jointe, des documents Horizon, du README, des audits historiques, du journal, des scripts et des JSON. Le PDF consolidé du 3 novembre et les scripts SQL Supabase ne sont pas présents dans la copie examinée.
- Création des six documents retenus par le propriétaire dans `docs/conception/` : référentiel/périmètre, règles métier, rôles/permissions, gouvernance des données, registre des exigences et décisions.
- Le dossier conserve les cinq piliers comme socle du lancement et les huit univers comme vision; les simulations locales, fonctions partielles, absences et états non vérifiés sont distingués. Les priorités P0/P1 restent des propositions à valider.
- Le registre contient 41 exigences identifiées sans doublon; les écarts 14/18 questions, 50 simultanés/10 000 utilisateurs, rôles, Supabase, capacités opérationnelles et extensions de vision restent inscrits comme ouverts.
- Vérifications documentaires : six fichiers attendus présents; tous les liens Markdown locaux résolvent; aucun ID d'exigence dupliqué; aucun espace final dans les six nouveaux documents. Aucun test applicatif n'a été exécuté, aucun fichier de code/donnée/configuration n'a été modifié.
- Aucun commit ni push. Les décisions listées dans le document 06 et les priorités du registre attendent validation; l'architecture détaillée demeure le livrable d'une phase ultérieure, avant tout backend.

## 2026-11-17 — Assistant Copilot (Mission 08, pages institutionnelles)
- Audit Git avant modification : branche `assistant-ia`, sept commits d’avance sur `origin/assistant-ia`, aucun fichier suivi modifié. Les éléments non suivis préexistants `docs/`, `pack-assistant-ia-v2/` et le cahier des charges ont été préservés.
- Relecture du CDC, des décisions du projet, des quatre pages existantes, des sources HTML et du système de design des maquettes Horizon, de `js/contact.js`, de `js/main.js`, du Motion Design System et des mécanismes de stockage.
- FAQ réorganisée en thèmes, avec recherche instantanée accent-insensible, filtres combinables, état vide, liens vers les pages concernées et accordéons natifs utilisables au clavier. Le contenu reprend les limites actuelles des catalogues, des comptes, du mentorat, des candidatures et du mode hors connexion.
- Page À propos clarifiée autour de la vision, du public pilote et des cinq piliers, sans chiffres d’impact, partenaires ou équipe inventés.
- Formulaire Contact corrigé : validation native et contrôle des champs non vides; aucun envoi, stockage local ni message de succès de transmission. Sans JavaScript, les champs sans attribut `name` ne sont pas inclus dans la requête GET; l’état explique explicitement que le service n’est pas connecté.
- Politique de confidentialité corrigée à partir des clés `localStorage` réellement utilisées. Elle distingue les profils, résultat du quiz, favoris, démarches et avis; elle signale l’ancienne clé locale de Contact, les polices Google Fonts, les requêtes à l’hébergeur et l’absence de suppression automatique configurée. Les évolutions futures restent décrites comme non actives.
- Les quatre pages réutilisent `css/style.css`, `css/motion.css` et `js/motion.js`; une extension partagée `css/institutional.css` et le script `js/faq.js` ont été ajoutés.
- Tests : `node --test tests/*.test.js` — 47 réussis, 0 échec. `node --check` sur tous les scripts `js/*.js` et `git diff --check` réussis. Tests de recherche/filtres FAQ, accordéons, validation Contact sans écriture locale, transparence stockage et liens internes.
- Contrôles navigateur : six dimensions (360×800, 390×844, 768×900, 1024×900, 1440×900, 1899×876) sans débordement horizontal sur les quatre pages; `prefers-reduced-motion` donne une durée d’animation calculée à `0s`; ouverture d’un accordéon au clavier et filtrage FAQ vérifiés. Contact testé avec saisie invalide puis valide; aucune entrée `localStorage` n’a été créée.
- Limite des captures : l’outil navigateur a indiqué `document.visibilityState === "hidden"` et a rendu une capture vide ou incohérente avec les dimensions DOM. Aucune capture n’est livrée comme preuve visuelle.
- Reste à faire : revue du diff, commit et vérification Git finale. Aucun push ni début de Mission 09.

## 2026-11-17 — Assistant Copilot (Mission 07, finalisation du pilier Compte)
- Audit Git initial : branche `assistant-ia`, quatre commits d’avance sur `origin/assistant-ia`, avant la Mission 07 aucune modification suivie n’était enregistrée pour cette mission. Les dossiers préexistants `docs/`, `pack-assistant-ia-v2/`, le cahier des charges non suivi et les maquettes ont été conservés.
- Audit des pages `dashboard.html`, `profil.html`, `favoris.html`, des inscriptions et connexions, des scripts `auth.js`, `profil.js`, `favoris.js`, `favoris-page.js`, `dashboard.js`, des favoris et des données locales. Les cinq catégories de favoris sont disponibles; les catalogues Mentor et Offres restent vides avec le statut `aucune_publication`.
- Finalisation du profil Jeune/Mentor/Professeur/Entreprise avec données locales réellement disponibles, champs facultatifs, valeurs déjà enregistrées, validation du nom, erreurs de stockage et sauvegarde dans `jac_utilisateurs` + `jac_utilisateur_connecte`. Les sauvegardes distantes ne sont pas prétendues.
- Les favoris utilisent exclusivement `jac_favoris` pour les filières, écoles, métiers, mentors et offres. Ajout/retrait, persistance, liens, références absentes, états vides, filtres et `aria-pressed` sont cohérents. Les mentors/offres non publiés restent absents.
- Les tableaux de bord sont désormais filtrés par rôle. Le Jeune voit ses favoris, son résultat de quiz, ses candidatures locales et ses demandes locales par courriel. Mentor ne relie les demandes que par `mentorId`, jamais par nom seul. Entreprise ne montre que les offres filtrées par son courriel et aucune candidature reçue inventée.
- Vérifications techniques : `node --test tests/*.test.js` — 40 tests sur 40 réussis; `node --check` sur les scripts Compte et `git diff --check` réussis.
- Vérifications navigateur réalisées sur les pages déconnectées Tableau de bord, Profil et Favoris aux dimensions 360×800, 390×844, 768×900, 1024×900, 1440×900 et 1899×876 : aucun débordement horizontal. Navigation clavier vérifiée sur les tableaux de bord déconnecté et profil; `prefers-reduced-motion: reduce` désactive les animations calculées.
- Captures navigateur représentatives du tableau de bord déconnecté prises en desktop 1440×900 et mobile 390×844; la page Favoris a aussi été contrôlée par snapshot accessible et mesures DOM aux six dimensions. Les captures obsolètes ou masquées ne sont pas présentées comme preuves.
- Limites V1 conservées : aucune authentification réelle, aucune sauvegarde serveur, aucun mentor ou offre publique disponible, aucune réponse mentor ni candidature transmise. Le stockage local n’est pas présenté comme sécurisé.
- Mission 07 livrée dans les commits `a544625`, `ae5a825` et `0408fae`; aucun push. La Mission 08 est commencée dans une étape distincte.

## 2026-11-17 — Assistant Copilot (Mission 05, annuaire et parcours mentorat V1)
- Audit Git effectué avant l’étape : branche `assistant-ia`, commit précédent `386bbeb`; les fichiers mentorat déjà modifiés ainsi que les dossiers non suivis préexistants `docs/`, `pack-assistant-ia-v2/` et le cahier des charges ont été préservés.
- Relecture de l’annuaire, du script, du JSON mentors, des favoris, des rôles, du Motion Design System et des maquettes Horizon desktop « annuaire mentor » / « fiche mentor ». Aucune maquette mobile dédiée au mentorat n’est présente.
- L’annuaire conserve l’état vide honnête : `data/mentors.json` est explicitement `aucune_publication` et ne contient aucun mentor vérifié. Aucun profil de démonstration n’a été ajouté aux données du projet.
- Amélioration de la recherche (accents ignorés et filtres combinables), du récapitulatif local de demande et de l’annonce explicite que les états en attente/accepté/refusé sont des simulations, sans notification ni réponse réelle. Le favori mentor continue d’utiliser le stockage partagé `jac_favoris`.
- Tests automatisés : `node --test tests/mentors.test.js tests/assistant.test.js` (9 réussis), `node --check js/mentors.js` et `git diff --check`.
- Tests navigateur avec données de profil temporaires non conservées : filtrage, accès direct à une fiche via URL stable, ajout/retrait de favori, demande locale et récapitulatif, statuts simulés. Annuaire et fiche contrôlés à 360×800, 390×844, 768×900, 1024×900, 1440×900 et 1899×876 : aucun débordement horizontal. Réduction des animations vérifiée.
- Les captures intégrées ont été tentées, mais l’outil a fourni une vue desktop décalée puis une vue mobile blanche malgré les dimensions DOM correctes; elles ne sont donc pas retenues comme preuves visuelles. Les contrôles responsive ont été mesurés dans le navigateur.
- Reste à faire : valider la livraison. Aucun backend, mentor vérifié, demande réelle ou réponse mentor n’est disponible en V1; ne pas commencer la Mission 06.

## 2026-11-17 — Assistant Copilot (authentification mobile et profils différenciés)
- Ajustement du schéma mobile des pages d’authentification pour éviter la version desktop trop lourde sur petits écrans : le panneau d’introduction devient compact, plus lisible et mieux ancré au-dessus du formulaire.
- Les profils Jeune, Professeur, Mentor et Entreprise reçoivent désormais des repères visuels distincts sur le formulaire et le panneau de présentation, sans créer de doublon de système ni modifier les flux de données V1.
- Le comportement reste cohérent avec le système de profil existant dans `js/auth-ui.js` : le choix de compte est toujours respecté, les champs spécifiques restent activés uniquement pour le bon profil, et les liens de navigation conservent le bon contexte.
- Vérification technique : `node --check` sur les scripts `js/auth.js` et `js/auth-ui.js`, puis `node --test tests/assistant.test.js` réussis. Aucune régression sur les scripts de compte ni sur les tests existants.
- Reste à faire : poursuivre la validation UX côté navigateur sur les largeurs 360/390/768/1024/1440 si le prochain cycle de travail porte sur les maquettes de compte ou le module mentorat.

## 2026-11-16 — Assistant Copilot (correction du menu mobile/tablette)
- Les liens « Se connecter » et « S'inscrire » apparaissent désormais dans le menu ouvert sur l'accueil et les pages avec navigation partagée; l'état du menu et ses attributs ARIA sont synchronisés sur toutes ces pages.
- Ajustement du seuil responsive pour éviter que les actions de compte disparaissent autour de 899 px.
- Vérifications navigateur avec réduction des animations : menu clavier ouvert/fermé et liens visibles sur l'accueil et les catalogues à 390, 768 et 899 px; comportement desktop vérifié à 900, 1024 px. Aucun débordement horizontal; la navigation vers l'inscription et l'ARIA sont vérifiés.
- Contrôles `node --check js/main.js` et `git diff --check` réussis.
- Le remote `origin` est configuré; le push GitHub a été refusé (403) car l'identité Git utilisée n'a pas le droit d'écriture sur le dépôt. À retenter après correction de l'accès.

## 2026-11-16 — Assistant Copilot (authentification responsive et profils)
- Recomposition des pages d'inscription et de connexion : panneaux bleu et clair côte à côte sur grand écran, panneau bleu compact au-dessus du formulaire sur mobile.
- Formulaires distincts pour Jeune/étudiant, Professeur, Mentor et Entreprise; seuls les champs du profil choisi sont actifs. Les champs collectés sont limités au parcours (niveau/formation), à l'enseignement, à l'expérience de mentor ou à l'organisation, avec la ville facultative.
- Le CDC prévoit trois types de compte techniques; Professeur est donc enregistré comme sous-profil de Mentor et reçoit son libellé propre au tableau de bord. La connexion vérifie aussi le profil sélectionné. Les mots de passe ne sont ni stockés ni vérifiés en V1; les données de profil restent locales.
- Vérifications navigateur aux largeurs 360, 390, 768, 1024 et 1440 px sur les deux pages : aucun débordement horizontal, panneau mobile compact, disposition desktop en deux colonnes. Parcours des quatre profils, sauvegarde des champs sans mot de passe, connexion professeur, refus d'un mauvais profil et navigation clavier vérifiés; comptes de test retirés.
- `node --check` des scripts concernés, les 6 tests Node existants et `git diff --check` réussis.
- Reste à faire : retenter le push après reconnexion GitHub avec un compte ayant accès en écriture au dépôt. L'authentification demeure une démonstration locale, sans backend.

## 2026-11-16 — Assistant Copilot (Mission 04, étape 3 : métiers et recherche transversale)
- Refonte des fiches métiers et ajout de la recherche multi-contenu dans `recherche.html`, avec résultats séparés par filières, établissements et métiers.
- Contrôles navigateur : 21 métiers, filtre Informatique (3 résultats), fiche Développeur web; requête « droit » (12 résultats dans les trois catégories) et état sans résultat.
- Contrôles responsive des quatre pages aux tailles 360 × 800, 390 × 844, 768 × 900, 1024 × 900, 1440 × 900 et 1899 × 876 : aucun débordement horizontal. Avec `prefers-reduced-motion: reduce`, aucune animation active.
- Captures représentatives réalisées dans le navigateur intégré : annuaire desktop et catalogue filières mobile. Courte démonstration vidéo Playwright enregistrée après validation du scénario; le script et la vidéo restent dans le dossier de session et ne sont pas ajoutés au dépôt.
- Le parcours enregistré montre la recherche « informatique », l’ouverture de la fiche Informatique, puis la navigation vers la fiche Développeur web. Assertions finales réussies. L’inspection technique de la durée vidéo n’a pas pu être faite : l’accès au binaire ffmpeg a été refusé par le sandbox.
- Limite restante : les données des catalogues restent un premier relevé non exhaustif; les informations absentes (notamment admissions et coordonnées) ne sont pas inventées.

## 2026-11-16 — Assistant Copilot (Mission 04, étape 2 : écoles)
- Refonte de l’annuaire : recherche par nom, sigle, ville et filière; filtres combinables selon les valeurs documentées; fiches avec sources, coordonnées et admission uniquement lorsqu’elles sont présentes.
- Les données manquantes sont explicitement signalées; le badge de rattachement documenté ne prétend pas vérifier l’ensemble de la fiche.
- Contrôles navigateur : 30 établissements, recherche UVCI (1 résultat), combinaison Abidjan/public/informatique (3 résultats), fiche UVCI et absence de conditions d’admission explicitée.
- Reste à faire : finaliser métiers et recherche transversale, valider des captures visuelles fiables, puis vérifier les commits et l’état Git. Aucune Mission 05.

## 2026-11-16 — Assistant Copilot (Mission 04, étape 1 : filières)
- Refonte du catalogue des filières : recherche accent-insensible, filtres combinables, cartes de découverte et fiches détaillées liées aux métiers et établissements du catalogue.
- Les données financières absentes ne sont pas inventées; les salaires renseignés restent signalés comme estimations à vérifier. Correction d’un lien de métier associé qui pointait vers `#undefined`.
- Contrôles navigateur : 7 filières chargées, état sans résultat, référence de fiche invalide, fiche Informatique, retour clavier vers la liste et lien vers `metiers.html#developpeur-web`.
- Vérifications techniques : `node --check` sur les scripts Découverte, 6 tests Node et `git diff --check` réussis.
- Reste à faire : valider des captures visuelles fiables, finaliser les étapes écoles, métiers et recherche transversale, puis vérifier les commits et l’état Git. Aucune Mission 05.

## 2026-11-16 — Assistant Copilot
- Mission 03, étape 2 : refonte du quiz, des résultats et du comparateur avec `css/orientation.css`, sans modifier les données JSON ni le calcul d'orientation.
- Le quiz conserve ses 7 questions tirées du catalogue et ses scores; ajout de la progression accessible, de la navigation précédent/suivant et de la reprise d'une réponse. Parcours A2 complet vérifié au clavier, avec correction d'une réponse; le score enregistré correspond exactement aux points des choix finaux.
- Les résultats utilisent uniquement les filières accessibles et les données du catalogue; les ex æquo restent tous visibles, y compris une égalité à trois pistes. Le comparateur signale les différences, prévient les doublons, permet le retrait au clavier et n'affiche pas de frais absents des données.
- Contrôles navigateur aux largeurs 360, 390, 768, 1024, 1440 et 1899 px sur quiz, résultats et comparateur : aucun débordement horizontal. Réduction des animations vérifiée; aucune erreur JavaScript observée. Régression mobile sans débordement sur accueil et trois pages d'authentification.
- Vérifications : `node --check` sur les trois scripts, 6 tests Node existants et `git diff --check` réussis.
- Captures navigateur : vues desktop du quiz, des résultats et du comparateur, ainsi qu'une vue mobile du résultat. Le navigateur intégré a parfois renvoyé une capture desktop périmée après le passage au viewport mobile pour le quiz et le comparateur; leurs vues mobiles ont donc été validées par mesures DOM plutôt que par capture.
- Reste à faire : créer le commit dédié de l'étape 2, vérifier son contenu et l'état Git; ne pas commencer la Mission 04 et ne pas pousser.

## 2026-11-16 — Assistant Copilot
- Mission 03, étape 1 : création des fondations réutilisables dans `css/motion.css` et `js/motion.js`, avec entrées au défilement, décalage des groupes, micro-retours, variables communes et respect de `prefers-reduced-motion`.
- Application à l’accueil et aux trois pages d’authentification. Le contenu reste visible sans JavaScript; le comportement reveal historique est conservé sur les pages pas encore migrées.
- Vérifications : 6 tests Node existants, `node --check` sur les scripts concernés et `git diff --check` réussis. Contrôle navigateur des quatre pages aux formats 1899 × 876, 1440 × 900, 768 × 900, 390 × 844 et 360 × 800 selon la page; aucun débordement horizontal ni erreur JavaScript. Menu mobile, sélection du type de compte, bascule du mot de passe, confirmation de réinitialisation sans e-mail et réduction des animations vérifiés.
- Reste à faire : appliquer le système au quiz, aux résultats et au comparateur; valider les parcours, les ex æquo et les six dimensions responsive; créer le second commit après validation.

## 2026-11-15 — Assistant Copilot
- Mission 02 réalisée : refonte cohérente des pages `inscription.html`, `connexion.html` et `mot-de-passe-oublie.html`, avec une feuille dédiée `css/auth-pages.css` et le script d'interface `js/auth-ui.js`.
- Les identifiants attendus par `js/auth.js` et `js/mot-de-passe-oublie.js` sont conservés. Le choix Jeune/Mentor/Entreprise, les validations, le message d'erreur, les liens, les boutons Google/Apple et leurs notices restent branchés au fonctionnement V1.
- Ajout de l'affichage/masquage des mots de passe et d'une explication explicite sur la démo locale. Aucune authentification serveur, connexion sociale réelle, ni réinitialisation par e-mail n'est prétendue; `js/auth.js` n'a pas été modifié.
- Vérifications : parcours d'inscription (champs requis, choix Mentor, mot de passe visible/masqué, confirmation erronée puis succès) et connexion avec compte de test; comptes temporaires nettoyés. Confirmation de mot de passe oublié testée sans envoi d'e-mail. Aucun débordement horizontal à 360, 390, 768 et 1440 px; aucune erreur JavaScript observée sur les pages testées.
- `node --test tests/assistant.test.js` : 6 tests réussis. `node --check` sur les scripts concernés et `git diff --check` réussis.
- Références : les trois maquettes desktop et la maquette mobile d'inscription ont été consultées. Aucune maquette mobile de connexion ou de mot de passe oublié n'est présente dans le dossier; ces deux mises en page ont été adaptées et contrôlées aux tailles mobiles.
- Reste à faire : faire valider cette livraison avant de commencer la Mission 03.

## 2026-11-15 — Assistant Copilot
- Mission 01 réalisée : fondations visuelles isolées dans `css/accueil.css`, hero Horizon plein écran, navigation responsive et présentation retravaillée des cinq piliers. Les contenus, liens, logo original, statistiques et limites V1 sont conservés.
- `index.html` reçoit la feuille de style dédiée, une hiérarchie accessible pour le menu, le point final accentué dans « horizon. » et la signature de la maquette. `js/main.js` met à jour l’état ARIA du menu uniquement sur l’accueil.
- Vérifications navigateur : 1899 × 876, 1440 × 900 et 390 × 844; contrôle complémentaire à 360, 768, 1023 et 1024 px. Aucun débordement horizontal; logo et polices chargés; menu ouvert/fermé et lien « À propos » vérifiés; aucune erreur JavaScript observée.
- `node --check js/main.js` et `git diff --check` réussis. Le serveur local n’a pas été joignable depuis le sandbox; les contrôles navigateur ont été faits sur l’URL locale `file://`.
- Reste à faire : faire valider les captures et l’accueil avant toute autre mission. Aucune autre page ni donnée JSON n’a été modifiée.

## 2026-11-15 — Assistant Copilot
- Intégration du verrou de compte de l'assistant v2, avec contrôle du statut de publication des mentors/offres et filtrage des rattachements école-domaine confirmés; aucune donnée fictive n'a été réintroduite.
- Mise à jour du README et des tests de l'assistant; correction de l'accord singulier/pluriel dans le message des résultats d'écoles.
- Vérifications : 6 tests Node réussis, syntaxe de tous les scripts JavaScript valide, tous les JSON lisibles et `git diff --check` sans erreur.
- Validation navigateur : verrou déconnecté (aucune carte), accueil personnalisé avec un compte de test, affichage mobile contenu dans 360 px, et aucune erreur JavaScript sur index, quiz et filières.
- Parcours complet vérifié avec un compte de test : quiz A2 terminé, résultat enregistré puis repris par l'assistant, qui a proposé Droit, Communication & Marketing et Gestion & Commerce. Les questions filières, écoles d'informatique à Abidjan, salaire, stage, mentor et météo ont aussi été testées avec les JSON du projet. Les données de test du navigateur ont ensuite été effacées.
- Reste à faire : restaurer/comparer le JavaScript original du pack si nécessaire; l'archive externe reste bloquée par le sandbox. Aucun remote Git n'est configuré, donc pas de push.

## 2026-11-15 — Assistant Copilot
- Intégration de l'assistant local dans les 21 pages HTML; les fichiers actifs sont rangés dans `js/assistant.js` et `css/assistant.css`. Les sources du pack redondantes ont été retirées après extraction des éléments nécessaires.
- Garde-fous de fiabilité : les mentors/offres ne sont chargés qu'avec le statut `verifie` (leurs listes sont maintenant vides, statut `aucune_publication`); les écoles recherchées par domaine doivent avoir un rattachement confirmé et montrent leurs sources; les séries, durées, métiers et salaires sont présentés comme des repères, sans promesse d'admission.
- README actualisé et ajout de tests ciblés dans `tests/assistant.test.js`.
- Retrait des enregistrements fictifs des fichiers publics mentors/offres; leurs listes sont maintenant vides avec un statut `aucune_publication`.
- Nettoyage avant publication : suppression des copies redondantes du pack assistant et mise à jour des textes du site pour annoncer clairement l'absence de mentors et d'offres réels.
- Avant tout push, réécriture des branches locales pour retirer des versions historiques les JSON contenant des profils/offres fictifs et les copies du pack; les fichiers JSON vides sont conservés dans la version actuelle.
- Vérifications antérieures : 4 tests Node; syntaxe des scripts `js/*.js`, parse des JSON, références uniques dans les 21 pages et `git diff --check`. Test navigateur avec données simulées : filières A2, écoles/sources, salaire, exclusion des profils/offres non publiés, question hostile rendue comme texte, ouverture/fermeture et viewport mobile 360 px; aucune erreur JavaScript.
- Contrôles de ce nettoyage : 4 tests Node réussis; syntaxe des 18 scripts JavaScript, parse des 8 fichiers JSON et `git diff --check` réussis. Aucune référence obsolète au pack ou aux exemples fictifs ne reste dans les textes actifs.
- Le navigateur intégré ne pouvait pas joindre le serveur local lancé par le terminal; le test navigateur a donc utilisé des réponses JSON contrôlées. L'assistant doit être servi en HTTP (Live Server) pour charger les fichiers JSON réels.
- À faire : examiner les sources des métiers et des estimations avant d'élargir les réponses; confirmer le remote Git et la branche à publier avant le premier push. Le cahier des charges non suivi reste exclu de la sauvegarde.

## 2026-11-15 — Assistant Copilot
- Analyse comparative du projet avec le cahier des charges définitif : inventaire des pages, scripts, données, limites V1 et écarts prioritaires.
- Vérification statique des références locales : aucun lien ou fichier script introuvable; fichiers JSON lisibles et identifiants de données uniques pour les collections contrôlées.
- Décision produit avec le client : le premier public pilote sera les lycéens et nouveaux bacheliers ivoiriens; priorité à une orientation fiable et actionnable avant l’élargissement aux autres publics.
- Correction du parcours d’orientation : tous les ex æquo au meilleur score sont maintenant affichés, au lieu de limiter arbitrairement la liste à deux filières; le titre s’adapte aux longues listes. Vérifié par un test Node ciblé avec trois filières à égalité et `node --check`.
- À faire : cadrer le parcours pilote, valider les arbitrages produit (banque de questions, fiches écoles, favoris et espace entreprise), actualiser le README, puis traiter les écarts V1 prioritaires. Confirmer également la cible de déploiement.

## 2026-11-15 — Assistant Copilot
- Audit des sources du catalogue scolaire : l'URL MESRS précédemment utilisée ne confirme ni les établissements publics ni les filières; les 30 fiches restent à réexaminer.
- Masquage des mentors et offres fictifs maintenu; clarification de la démonstration locale, des limites de l'inscription/connexion et de l'absence de demandes réelles.
- Révision des textes de présentation et de la FAQ pour ne plus prétendre que les écoles sont vérifiées, que les filières sont confirmées accessibles, ou que mentors/offres sont disponibles.
- Précision sur le quiz : score interne d'auto-réflexion, non psychométriquement validé, sans garantie d'affectation ni d'admission; le résultat conserve tous les ex æquo au meilleur score.
- README ajusté pour décrire les limites documentées; intitulé du catalogue filières corrigé et lien externe renommé « Site indiqué » plutôt que « Site officiel ».
- Vérifications : scripts JavaScript modifiés passés à `node --check`; tests ciblés d'affichage des données fictives, parse des JSON, liens locaux et `git diff --check` réussis.
- À faire : vérifier établissement, campus, statut, programmes et sources un par un; rapprocher le CSV MESRS des fiches sans le présenter comme exhaustif; choisir une première source de données validée pour le pilote.

## 2026-11-15 — Assistant Copilot
- Consultation directe des deux listes MESRS : neuf fiches privées (dont une grande école) ont un rapprochement nom/sigle + localité; leurs sources, date, libellé et limites sont enregistrés dans `data/ecoles.json`.
- Les fiches école affichent maintenant leur lien MESRS et précisent que la liste ne renseigne pas les filières; aucun rattachement filière n'a été validé par cette vérification.
- Correction de la commune de l'EIPC à Cocody, conformément à l'entrée MESRS; les mentions d'évaluation et les autres données restent à vérifier séparément.
- Comparaison du relevé local (145 lignes, 18 villes) et de la page MESRS, numérotée jusqu'à 146 lors de la consultation : ils ne sont pas synchronisés, donc le CSV n'a pas été importé.
- Vérifications : 9 liens-source rendus dans les fiches; sources réservées à des établissements privés; aucun domaine passé à confirmé; JSON, liens locaux, syntaxe JS et `git diff --check` valides.
- À faire : rapprocher les 21 fiches restantes et confirmer les programmes auprès des écoles; examiner séparément les variantes de noms du CSV, sans en déduire une couverture nationale.

## 2026-11-17 — Assistant Copilot
- Mission 06 : refonte du catalogue des offres avec recherche et filtres combinables; aucune offre n'a été ajoutée, car `data/offres.json` ne contient aucune annonce vérifiée.
- Ajout de fiches partageables par identifiant, intégration des favoris existants et candidature locale réservée au rôle Jeune; l'interface indique explicitement qu'aucune donnée n'est transmise à une entreprise.
- Ajout d'un historique local des candidatures et d'un espace Entreprise pour préparer, prévisualiser, modifier et supprimer des brouillons ou des annonces « à vérifier » stockés uniquement dans le navigateur.
- Tableau de bord relié aux candidatures locales et aux annonces locales; aucune candidature reçue ni aucun entretien n'est inventé.
- Vérifications : 22 tests Node réussis; `node --check` sur les scripts modifiés; `git diff --check`; parcours navigateur du catalogue vide, recherche, historique sans connexion et blocage de publication sans rôle Entreprise.
- Responsive mesuré à 360 × 800, 390 × 844, 768 × 900, 1024 × 900, 1440 × 900 et 1899 × 876 sur les trois pages; aucun débordement horizontal. Réduction des animations vérifiée.
- Vidéo de démonstration enregistrée; captures navigateur du catalogue à 1440 × 900 et 390 × 844 réalisées. Aucun compte ni annonce de test créé.
- Navigation clavier vérifiée : la tabulation atteint les liens, la recherche et chaque filtre. Limites : le formulaire Entreprise n'a pas été soumis dans le navigateur et le parcours de candidature ne peut pas être exercé de bout en bout tant qu'aucune offre vérifiée n'est publiée. Le rôle V1 et les données restent locaux; aucune autorisation serveur ou intégration Supabase n'existe.
- À faire : connecter une API sécurisée en V2, publier une première offre après vérification réelle, puis tester le parcours complet avec des données et comptes autorisés.

## 2026-11-15 — Assistant Copilot
- Consultation des pages officielles de l'UFHB (annuaire des UFR), du MESRS (filières UVCI), de l'ESATIC (parcours de licence) et de l'INFAS.
- Six rattachements école-domaine sont maintenant marqués confirmés avec date et source directe : trois UFR de l'UFHB, UVCI, ESATIC et INFAS. Les sources précisent les limites; elles ne certifient pas les admissions ni tous les niveaux.
- Le catalogue affiche maintenant une source pour 15 fiches au total; le badge « Domaine confirmé » apparaît seulement pour les six rattachements sourcés.
- Les quatre liens INP-HB pointaient vers un hôte inaccessible; ils renvoient désormais vers le site institutionnel actif `https://inphb.edu.ci/`. Les domaines des écoles de l'INP-HB restent à confirmer.
- Vérifications : 15 notes de source visibles, 6 badges confirmés, accents UTF-8 contrôlés, JSON, `node --check`, liens locaux et `git diff --check` valides.
- À faire : examiner les 15 fiches sans source directe et vérifier les niveaux, conditions d'admission, campus et rattachements restants. Une entrée ETIC Bondoukou apparaît dans les listes avec des variantes de nom/type; ne pas fusionner avant confirmation.

## 2026-11-15 — Assistant Copilot
- Poursuite de la vérification des fiches : consultation des pages institutionnelles de l'UAO, l'UPGC, l'UNA et l'UJLoG, ainsi que des pages formations de l'ENSEA, Pigier, ISA Santé et de l'ISTC.
- Les domaines Droit de l'UAO et Droit/Gestion-Commerce de l'UPGC sont désormais étayés par les pages de leurs UFR. L'ISTC est sourcé par ses pages École de journalisme et École de publicité-marketing; pour l'ISA, la source est la page publiée par l'école et ne constitue pas une confirmation indépendante de l'agrément.
- 10 fiches privées correspondent maintenant à une entrée MESRS pour le nom/sigle et la localité. La fiche ETIC de Bondoukou reste distincte des autres entrées ETIC : seul le libellé de la liste des universités privées lui est rattaché.
- Le catalogue compte 26 fiches avec au moins une référence et 27 liens de source; 11 correspondances école-domaine sont sourcées. Le badge de confirmation est cohérent sur les fiches Écoles et Filières.
- Les pages officielles de l'UNA et de l'ENSEA confirment l'identité/l'offre de l'établissement, mais pas tous les domaines génériques actuels; ces rattachements restent non confirmés. Le site public de Pigier ne permet pas de confirmer le campus par campus.
- Contrôles : sources MESRS réservées aux établissements privés, caractères UTF-8 vérifiés, JSON, scripts JS, rendu des sources/badges, liens locaux et `git diff --check`.
- À faire : vérifier les 4 fiches INP-HB composante par composante, retrouver une source MESRS indépendante pour l'agrément ISA, et réexaminer les niveaux et les associations encore non sourcés. La liste publique MESRS n'ayant pas de filières renseignées, ne pas les inférer de cette liste.

## 2026-11-18 — Assistant Copilot (Parcours d'orientation)
- Vérification finale complémentaire : 65 tests Node réussis après ajout des tests du comparateur et du rendu résultat; syntaxe JavaScript sur tous les scripts et tests, et `git diff --check` réussis. Serveur local toujours inaccessible depuis le sandbox, donc la vérification inter-pages sous HTTP reste à faire.
- Ajout d'une progression d'orientation locale versionnée avec profil facultatif, reprise, retour aux questions et modification des réponses; les sept questions et la méthode existante sont conservées.
- Refonte des résultats : situation, pistes principales et ex æquo, filières alternatives non classées, réponses, données disponibles, références d'établissements et limites explicites. Aucun pourcentage ni promesse d'admission n'est affiché.
- Ajout de l'accès aux favoris depuis les pistes et du préremplissage du comparateur par URL; les données absentes restent indiquées.
- Correction d'un défaut d'affichage où les éléments `hidden` étaient rendus visibles par les styles de boutons.
- Tests : 61 tests Node réussis; contrôles de syntaxe JavaScript et `git diff --check` réussis. Le parcours questionnaire, retour arrière et reprise a été exercé dans le navigateur fichier, mais `file://` sépare le stockage entre pages. Le serveur local n'a pas répondu dans le sandbox; le résultat inter-pages et le comparateur restent à vérifier sous HTTP accessible.

## 2026-11-21 — Assistant Copilot (Première API Laravel d'orientation)
- Ajout de `GET /api/v1/orientation/questionnaire` et `POST /api/v1/orientation/results`, branchés sur les référentiels JSON locaux du dépôt.
- Le questionnaire expose sept questions sans pondérations. Un jeton Laravel chiffré lie les réponses à ces questions et expire après une heure.
- Le calcul vérifie la série, les questions et les choix; les deux routes sont limitées en fréquence, et le POST rejette les champs non pris en charge dont le texte libre. Il retourne pistes principales et alternatives sans score ni pourcentage. Les réponses ne sont pas persistées, et les informations absentes (établissements, sources, vérification) sont signalées.
- Ajout de tests de contrat Laravel, d'une documentation backend, et mise à jour du README et du contrat API sans fermer les décisions produit encore ouvertes.
- Contrôles : routes API enregistrées, syntaxe PHP et `git diff --check` valides; test du noyau Laravel réussi. Le lancement HTTP externe local n'a pas été joignable depuis le sandbox et PHPUnit n'a pas pu y charger son bootstrap. Le propriétaire a ensuite vérifié les deux routes en HTTP local (7 questions, résultat sans score ni persistance, jeton invalide rejeté) et exécuté `php artisan test` : 8 tests et 82 assertions réussis.
- Décision du propriétaire : conserver le quiz frontend local pour l'instant; l'API reste indépendante et aucun texte libre n'est transmis.
- À faire : traiter séparément les décisions OPEN et valider le contrat d'intégration avant de connecter le frontend ou toute mise en production.

## 2026-11-21 — Cadrage hébergement, base et confidentialité
- État réel mis à jour dans l'architecture : Laravel 13.43.0/PHP 8.5.3 local; API d'orientation testée, sans compte, migration métier ni écriture de réponse en base.
- Comparaison officielle consultée le 21 novembre : Railway Hobby à 5 $/mois avec consommation variable et sauvegardes PostgreSQL à activer; DigitalOcean App Platform dès 5 $/mois, PostgreSQL managé dès 15,15 $/mois plus stockage, sauvegardes quotidiennes/PITR 7 jours et buildpack PHP 8.3–8.5.
- Recommandation non validée : PostgreSQL (préférence DEC-010) et DigitalOcean pour un futur pilote avec données réelles si budget d'environ 23 $/mois ou plus, région app/base vérifiée et revue des transferts; Railway reste une option de démo sans données personnelles.
- Mise à jour des documents 04, 06, 07 et 08 : aucun hébergeur n'est approuvé juridiquement, aucune ressource cloud n'est provisionnée, aucune migration ou collecte personnelle n'est autorisée par cette recommandation.
- À faire : confirmer le budget et le type de pilote, vérifier la région partagée et faire examiner par une personne compétente les obligations ivoiriennes, la localisation/transmission des données et la protection des mineurs avant tout déploiement réel.

## 2026-11-21 — Budget de démonstration
- Le propriétaire indique un budget de 0 $/mois, souhaite présenter une démo avec les données disponibles et vise la Côte d'Ivoire; la région précise et la personne responsable restent à déterminer.
- Recommandation ajustée dans les documents 06 et 07 : conserver une démo locale gratuite utilisant le référentiel existant et ses statuts de vérification; ne pas inventer de données ni collecter de données personnelles.
- Aucun hébergement n'est choisi ni provisionné. Une option publique gratuite devra être vérifiée pour sa région, ses limites et le risque de frais avant toute publication; le mode local ne fournit pas d'URL publique.

## 2026-11-21 — Pilote statique en lecture seule
- Le propriétaire choisit de rendre toutes les pages consultables sans compte ni transmission de formulaires; des mineurs peuvent faire partie des utilisateurs.
- Comptes, profils, Contact, Avis, candidatures, demandes de mentorat et publication d'offres désactivés. Le quiz et les favoris restent locaux; l'assistant rappelle de ne pas saisir d'informations personnelles. Un contrôle permet d'effacer les clés locales JeuneAvenir.
- Mise à jour des textes de confidentialité et des tests pour distinguer les fonctionnalités locales réelles des anciennes démonstrations. Résultat : 68 tests Node réussis, syntaxe vérifiée sur 39 fichiers JavaScript et `git diff --check` réussi.
- Aucun déploiement n'a été effectué. La région et les conditions de l'hébergeur, la personne responsable, les exigences relatives aux mineurs et les requêtes vers Google Fonts restent à examiner; le parcours réel sous HTTP et sur mobile reste à vérifier.

## 2026-11-21 — Mise en forme du profil d'orientation
- Remplacement du fieldset natif non stylé par un panneau Horizon avec champs alignés et adaptés aux petits écrans.
- Contrôle dans le navigateur à 1024 px et 390 px : grille responsive et aucun débordement horizontal.
- À faire : poursuivre la réalisation des comptes réels dans le backend Laravel, en respectant les décisions de rôles, mineurs, consentement et conservation encore ouvertes.

## 2026-11-21 — Servir le frontend par Laravel
- Ajout d'une route Laravel de même origine pour la page d'accueil, les pages HTML et une liste bornée de fichiers frontend publics; les chemins de documentation et de configuration restent refusés. Les types MIME des ressources sont définis explicitement.
- Vérification navigateur sur `127.0.0.1:8000` : quiz et catalogue chargés, CSS servi en `text/css`, API questionnaire répondant avec 7 questions, fichiers de documentation/configuration renvoyant 404. Le premier essai a révélé puis corrigé une erreur de type de réponse et un mauvais type MIME.
- 68 tests frontend Node et syntaxe PHP réussis; `git diff --check` réussi. Les tests Laravel n'ont pas pu être lancés car les dépendances Composer sont absentes; leur restauration a été bloquée par la politique sandbox lors de l'écriture dans `C:\Users\DELL\AppData\Local\Packages\sandbox...\AC\Composer\repo`.
- La vraie authentification et les démarches réelles ne sont pas encore implémentées. L'âge des comptes, la vérification des rôles et les règles de confidentialité restent ouverts; aucun compte réel n'est activé.

## 2026-11-21 — Cible comptes réels, étape locale
- Le propriétaire confirme que la cible finale est un site complet avec de vrais comptes, et choisit de commencer en local. Seul le rôle Jeune pourra être autonome; Mentor, Professeur et Entreprise nécessiteront une vérification manuelle. Les comptes de mineurs restent bloqués avant définition et validation de la procédure de consentement et de protection.
- DEC-003 et DEC-007 sont marquées supersédées uniquement pour le développement local; la mise en production et la collecte réelle restent interdites tant que les règles de confidentialité, de mineurs, de rôles, d'hébergement et de messagerie ne sont pas validées.
- À faire : reprendre la tranche d'authentification Laravel avec des données synthétiques, restaurer Composer après autorisation d'écriture du cache bloqué par le sandbox, puis exécuter les tests backend avant de raccorder les formulaires.

## 2026-11-22 — Restauration Composer et tests Laravel
- Après confirmation du propriétaire que l'autorisation sandbox était corrigée, `composer install --no-interaction` s'est terminé sans ajouter ni modifier de dépendance; Laravel 13.43.0 démarre correctement. Le dossier `backend/vendor` est ignoré par Git.
- `php artisan test` : 11 tests réussis, 108 assertions. Le premier passage a identifié que les tests Laravel ne matérialisent pas le corps d'une `BinaryFileResponse`; le test du site vérifie maintenant le type de réponse, les en-têtes et le contenu du fichier effectivement ciblé.
- Suite frontend `node --test tests/*.test.js` : 68 tests réussis, 0 échec. `php -l backend\tests\Feature\PublicSiteTest.php` et `git diff --check` réussis.
- Comptes réels et parcours métier restent non implémentés; les formulaires demeurent désactivés. Prochaine tranche : authentification locale sécurisée et tests de ses routes, sans ouverture publique ni compte de mineur.

## 2026-11-25 — Première tranche de sessions Laravel
- Ajout de routes locales d'inscription, connexion, lecture de session et déconnexion; désactivées par défaut via `ACCOUNTS_ENABLED=false` et limitées aux environnements `local`/`testing`. Nouveau compte affecté au rôle `jeune` par défaut SQL; le rôle envoyé par le client est refusé. Mots de passe hachés via le cast Laravel, sessions régénérées/invalidate et requêtes limitées en fréquence.
- Ajout de tests de fonctionnalités couvrant inscription, hachage, refus de rôle, mot de passe faible, authentification, déconnexion et fermeture en production; ajout des instructions de développement local. Aucun compte public, validation d'âge/consentement ou validation d'e-mail n'est prétendu.
- Vérifications initiales : 16 tests Laravel passent après correction de deux défauts détectés et ajout du test d'état CSRF. 69 tests frontend passent; syntaxe PHP/JS et `git diff --check` passent; les 5 routes auth sont visibles avec `php artisan route:list --path=auth`.
- Un premier lancement PHPUnit a été bloqué par l'accès au bootstrap Composer; après mise à jour de la sandbox par le propriétaire, `php artisan test` s'est exécuté normalement.

## 2026-11-25 — Branchement local des formulaires Jeune
- Ajout de `GET /auth/status` qui ne fournit un jeton CSRF et un état activé que lorsque le flag est vrai en environnement `local`/`testing`. Les formulaires d'inscription/connexion se déverrouillent alors; sinon ils restent désactivés. Le client envoie les identifiants uniquement au backend local, sans compte ni mot de passe dans `localStorage`.
- L'interface limite explicitement cette tranche au rôle Jeune et aux données synthétiques; les profils et champs de profil non stockés, les rôles privilégiés et les autres soumissions restent fermés. Les consignes README et OPEN-025 sont mises à jour.
- Vérifications finales : `php artisan test` 16/16, 149 assertions; `node --test tests/*.test.js` 69/69; syntaxe JavaScript et PHP vérifiée; `git diff --check` réussi. Les tests Node confirment fermeture par défaut et envoi des seules données du compte avec le jeton CSRF.
- Pas encore de vérification du parcours par navigateur avec `ACCOUNTS_ENABLED=true`; le tableau de bord reste désactivé/non raccordé. Ne pas utiliser de données personnelles ni ouvrir les comptes au public avant arbitrage mineurs/consentement, validation e-mail, récupération et exploitation.

## 2026-11-25 — Tableau de bord lié à la session locale
- Protection de `/dashboard.html` quand les comptes locaux sont activés : les visiteurs non connectés reviennent à la connexion; la session Jeune authentifiée voit son identité.
- Le tableau de bord récupère l'état du compte via Laravel et se déconnecte via POST protégé par CSRF. Les données de profil, quiz, favoris, mentorat et candidatures sont explicitement signalées comme non synchronisées; aucun compte n'est conservé dans `localStorage`.
- Inscription et connexion redirigent vers le tableau de bord après succès. Documentation README et OPEN-025 mise à jour.
- Vérifications : `php artisan test` 17/17 (155 assertions), `node --test tests/*.test.js` 71/71, syntaxe JavaScript/PHP et `git diff --check` réussis. Parcours navigateur local réel réussi sur une base SQLite temporaire isolée : inscription, affichage de l'identité, reconnexion, déconnexion et redirection d'un visiteur; base et fichiers de session de test supprimés après l'essai. Ne pas ouvrir les comptes au public.

## 2026-11-25 — Quiz d'orientation relié à l'API Laravel
- Le quiz récupère sept questions et un jeton temporaire depuis l'API locale, puis envoie uniquement la série et les indices de réponse. Le parcours statique historique reste disponible si l'API renvoie 404; les autres erreurs sont présentées clairement.
- Le résultat API demeure exploratoire, montre les sources/établissements/vérifications manquants au lieu de les inventer, et n'est pas enregistré côté serveur. Les réponses affichées restent temporairement dans `sessionStorage` jusqu'à fermeture ou effacement de l'onglet. La politique de journalisation d'un hébergeur futur doit encore être définie.
- Vérifications : 81 tests Node; 17 tests Laravel (157 assertions); syntaxe JavaScript/PHP et `git diff --check` réussis. Parcours navigateur local complet vérifié : série A1, sept réponses, résultat API, limites et données manquantes affichées; le bouton d'effacement vide ensuite le stockage de session.
- Le produit n'est pas prêt pour une ouverture publique : les comptes et autres parcours métier restent désactivés ou non raccordés; poursuivre le cadrage consentement/âge, validation et récupération d'e-mail, règles de conservation et gouvernance des sources avant tout déploiement. Aucun commit ni push effectué.

## 2026-11-25 — Intégrité du jeton de questionnaire
- Le jeton chiffré lie maintenant le parcours au contenu exact des sept questions sélectionnées, y compris les options et pondérations. Si une question change entre son affichage et l'envoi des réponses, l'API refuse le résultat et demande de recommencer au lieu d'interpréter les réponses selon une autre version.
- Ajout d'un test de régression qui modifie une copie temporaire de la banque entre les deux requêtes. Le code de test n'altère pas les données du dépôt.
- Mise à jour du guide de reprise, du référentiel central, du registre des risques et du registre des décisions afin de distinguer le prototype local autorisé des prérequis encore bloquants pour la production.
- Vérifications : suite Laravel 18 tests / 164 assertions; 7 tests ciblés d'orientation; Pint, syntaxe PHP et `git diff --check` réussis. Parcours navigateur sur le serveur à jour réussi avec sept réponses et effacement vérifié. Aucun déploiement, commit ni push.

## 2026-11-25 — Préparation à une ouverture publique
- Inventaire des prérequis : aucun hébergeur, domaine ou pipeline de déploiement n'est configuré. Le budget enregistré est de 0 $; les comptes restent limités au développement local, sans validation d'e-mail ni récupération de mot de passe. Mentorat, offres et candidatures réelles ne sont pas publiés.
- Ajout de GitHub Actions pour exécuter les tests Node et Laravel et l'audit Composer sur les push et pull requests; le workflow ne déploie pas l'application.
- Vérifications locales : 81 tests Node, 18 tests Laravel / 164 assertions, audit Composer sans avis de sécurité. Aucun lockfile npm n'existe dans le backend; le frontend de dépôt n'a pas de dépendance npm racine.
- L'ouverture complète reste bloquée par le choix d'un hébergeur et d'un budget, la base et l'e-mail de production, les règles de conservation et de protection des mineurs, ainsi que les responsables de vérification des données et des rôles. Aucun déploiement, commit ni push.

## 2026-11-25 — Préparation de l'export Netlify
- Le propriétaire a choisi un pilote informatif statique, sans comptes ni envois, avec Netlify et un budget de 0 $/mois. Ajout de la configuration de build/publication et d'un export à liste blanche, limité aux pages et ressources du site; le backend, les tests et la documentation interne en sont exclus.
- Ajout du contrôle automatisé de l'export et d'une CI de tests/audit sans étape de déploiement. Documentation des commandes manuelles et des limites du pilote dans le README.
- Vérifications : 83 tests Node réussis; quiz statique parcouru jusqu'aux résultats avec sept réponses; le formulaire d'inscription et les comptes restent désactivés. Le 404 attendu de l'API en mode statique conserve l'avertissement de pilote; les données de test du navigateur ont été effacées.
- Le déploiement n'a pas été effectué : aucun site Netlify ni domaine n'est associé, et la vérification/validation éditoriale du catalogue reste à faire.
