# Registre des exigences — JeuneAvenir CI

**Version :** 0.1 — établi à partir du CDC disponible du 16 août 2026, de la Mission Directrice fournie le 17 novembre 2026, des décisions du propriétaire et de l'état inspecté du frontend.
**Important :** le PDF consolidé du 3 novembre n'est pas présent dans le dépôt. Ce registre est exhaustif au regard des sources disponibles, mais doit être recoupé avec ce PDF s'il devient disponible.

## 1. Légende et règles de traçabilité

### Statuts de décision

- **VALIDÉ** : décision explicite du propriétaire.
- **EXISTANT** : élément observé dans le dépôt; ne signifie pas que la cible métier est satisfaite.
- **À CONFIRMER** : arbitrage nécessaire.
- **PROPOSITION** : recommandation de conception/priorité à approuver.
- **FUTUR** : extension de vision, hors fonctionnalité active confirmée.

### État actuel du produit

- **OPÉRATIONNEL** : comportement du périmètre indiqué fonctionne dans l'application actuellement examinée; cela ne prouve ni disponibilité en production ni backend.
- **SIMULATION_LOCALE** : données et décisions restent dans le navigateur ou sont simulées.
- **PARTIELLEMENT_OPERATIONNEL** : un sous-parcours fonctionne, mais il manque des données, services ou garanties requis.
- **ABSENT** : fonctionnalité non présente dans le dépôt examiné.
- **NON_VÉRIFIÉ** : preuve insuffisante pour conclure.

### Priorités

`P0` et `P1` ci-dessous sont **des propositions d'ordonnancement à valider**, pas des décisions acquises. P0 désigne un prérequis proposé pour un lancement sûr ou le premier parcours utilisable; P1 désigne une capacité complémentaire du socle ou une extension. Les cinq piliers restent dans le périmètre du lancement quelle que soit cette séquence.

### Sources abrégées

- **CDC16** : [CDC Markdown du 16 août 2026](../../Cahier_des_charges_DEFINITIF_JeuneAvenirCI%20%281%29.md), provisoire, sections indiquées.
- **MD** : « MISSION DIRECTRICE — Référentiel produit, technique et organisationnel », pièce jointe propriétaire du 17 novembre 2026; source complémentaire, non versionnée dans le dépôt.
- **M10** : consignes Mission 10 du propriétaire.
- **Horizon** : [MISSION_CODEX.md](../maquettes/JeuneAvenir_CI_Maquettes_Horizon/MISSION_CODEX.md), [DESIGN_SYSTEM.md](../maquettes/JeuneAvenir_CI_Maquettes_Horizon/DESIGN_SYSTEM.md), [MAPPING_ECRANS.md](../maquettes/JeuneAvenir_CI_Maquettes_Horizon/MAPPING_ECRANS.md).
- **Repo** : code, JSON, tests, README et [journal.md](../../journal.md); preuves d'état uniquement.
- Les règles, rôles et données détaillés sont dans les documents [02](02-regles-metier.md), [03](03-roles-et-permissions.md) et [04](04-gouvernance-des-donnees.md).

Chaque exigence est autonome pour l'identification et la recette; ses règles de référence ne sont pas recopiées intégralement ici.

## 2. Exigences transversales et compte

| ID | Utilisateurs, objectif et comportement attendu | Données / règles / dépendances | Priorité et version proposées | Critères d'acceptation et tests requis | État actuel observé | Sources |
|---|---|---|---|---|---|---|
| SYS-01 | Visiteur : accéder à l'accueil et aux cinq piliers, comprendre la portée du service et atteindre les pages utiles. | Liens, contenu d'accueil, statut réel des fonctions; dépend du périmètre validé. | P0 — socle lancement; proposition. | Vérifier chaque lien; les appels à l'action aboutissent à une page ou annoncent explicitement l'indisponibilité; test mobile et clavier. | **OPÉRATIONNEL** pour les pages statiques; aucun déploiement de production vérifié. | CDC16 §4; Horizon; Repo (`index.html`). |
| ACC-01 | Jeune, mentor, organisation : créer un compte avec les champs nécessaires au rôle. | Identité, email, preuve/consentement, profil; validation des champs et anti-doublon côté service. | P0 — socle Compte; proposition. | Un compte réel est créé par un flux sûr; mot de passe jamais stocké en clair par l'application; doublon et erreur de confirmation traités; tests d'abus et de compte. | **SIMULATION_LOCALE** : inscription locale; mot de passe non conservé. | CDC16 §3; MD §4-5; Repo (`js/auth.js`). |
| ACC-02 | Tous les titulaires : se connecter, se déconnecter et retrouver une session contrôlée. | Session, rôle fourni par une source de confiance; aucune confiance dans les données de rôle frontend. | P0 — dépend de l'architecture; proposition. | Session créée/révoquée; refus d'identifiants invalides; changement de rôle client refusé; tests session, expiration et révocation. | **SIMULATION_LOCALE** : connexion par email/profil, sans vérification du mot de passe. | CDC16 §3; MD §6-8; Repo (`js/auth.js`). |
| ACC-03 | Titulaire : récupérer l'accès, Google/Apple si activés, fermer/supprimer son compte. | Jeton de récupération, preuve de contrôle, consentements et politique de suppression; fournisseurs et durées à confirmer. | P0 pour récupération sûre; P1 pour fournisseurs sociaux — propositions. | Lien expiré/réutilisé refusé; pas de fuite d'existence de compte; suppression suit la règle approuvée; tests positifs et négatifs par fournisseur. | **PARTIELLEMENT_OPERATIONNEL** : pages/information présentes; aucun email, fournisseur social ou effacement serveur. | CDC16 §3, §9; MD §6, §8; Repo (`mot-de-passe-oublie.html`, `js/mot-de-passe-oublie.js`). |
| ACC-04 | Titulaire : modifier ses données de profil et préférences. | Données minimales; lecture/écriture strictement sur son propre profil; données privées séparées des champs publics. | P0 — profil minimal; P1 — préférences avancées, propositions. | Un utilisateur ne modifie que son profil; validation, erreur de sauvegarde et accès horizontal testés; champs non autorisés inchangés. | **SIMULATION_LOCALE** : profils dans le navigateur, sans synchronisation. | CDC16 §4, §7; MD §4-5; Repo (`js/profil.js`). |
| ACC-05 | Titulaire : comprendre, consulter, corriger, exporter ou supprimer ses données selon les droits applicables. | Finalités, consentement, catégories, destinataires et conservation à définir; dépend des avis compétents. | P0 avant collecte réelle; proposition. | Parcours d'accès/correction/suppression testé et journalisé; aucun droit légal déclaré acquis sans revue. | **PARTIELLEMENT_OPERATIONNEL** : confidentialité décrit le local; pas d'outil complet d'export/suppression sélective. | M10; MD §8; Repo (`confidentialite.html`). |
| ACC-06 | Jeune, mentor, organisation : recevoir un espace/dash adapté au rôle. | Agrégation des données autorisées seulement; aucun chiffre de démonstration présenté comme réel. | P0 — espace minimum; proposition. | Données séparées par rôle et propriétaire; zéro accès aux dossiers non autorisés; tests de permission. | **SIMULATION_LOCALE** : dashboards personnalisés selon session locale. | CDC16 §4, §5; MD §2, §4; Repo (`js/dashboard.js`). |
| ACC-07 | Jeune, mentor, organisation : gérer ses favoris. | Référence type/id vers un élément existant; un favori ne change pas la publication. | P0/P1 — à arbitrer dans le socle; proposition. | Ajout/retrait idempotent; filtres et état vide; accès uniquement aux favoris du titulaire; tests références absentes. | **SIMULATION_LOCALE** : favoris persistés dans `localStorage`. | CDC16 §5, §7; Repo (`js/favoris.js`, `tests/favoris.test.js`). |
| INFO-01 | Visiteur : lire FAQ, À propos, Contact et Confidentialité; obtenir des états honnêtes. | Textes liés au comportement réel; Contact n'affiche pas un envoi sans service. | P0 — information et transparence; proposition. | Liens internes valides; FAQ recherche/filtre accessible; Contact valide sans prétendre transmettre; revue des affirmations de confidentialité. | **OPÉRATIONNEL** pour pages statiques et FAQ; Contact n'envoie rien. | CDC16 §4; M10; Repo (`faq.html`, `contact.html`, `confidentialite.html`, tests institutionnels). |
| UX-01 | Tous : utiliser les parcours sur mobile, tablette et desktop, au clavier et avec préférence de mouvement réduit. | Navigation, noms/labels accessibles, focus, contrastes, erreurs/chargement/états vides, motion; dépend des composants de chaque exigence. | P0 — proposition, applicable aux cinq piliers. | Vérifier les viewports 360×800, 390×844, 768×900, 1024×900, 1440×900, 1899×876; clavier/lecteur d'écran, contrastes, `prefers-reduced-motion`; aucun contrôle sans nom. | **PARTIELLEMENT_OPERATIONNEL** : règles CSS/motion et quelques mesures consignées; audit e2e/accessibilité complet non démontré. | CDC16 §10; MD §9-10; Horizon `DESIGN_SYSTEM.md`, `CHECKLIST_VALIDATION.md`; Repo. |

## 3. Orientation

| ID | Utilisateurs, objectif et comportement attendu | Données / règles / dépendances | Priorité et version proposées | Critères d'acceptation et tests requis | État actuel observé | Sources |
|---|---|---|---|---|---|---|
| ORI-01 | Jeune : répondre à un questionnaire une question à la fois, voir la progression, reprendre/corriger une réponse et terminer. | Banque, série, réponses, version du calcul; CDC = 7/14, JSON actuel = 18, taille non arbitrée. | P0 — cœur du pilier; banque à confirmer. | 7 questions effectivement choisies selon règle approuvée; progression, retour, erreurs de chargement, cas d'égalité et réponses manquantes testés. | **PARTIELLEMENT_OPERATIONNEL** : quiz local fonctionnel; taille de banque différente et méthode non validée. | CDC16 §5; MD §5.1; Repo (`quiz.html`, `js/quiz.js`, `data/questions.json`). |
| ORI-02 | Jeune : consulter ses pistes, ex æquo, explications, points forts et compétences à développer. | Résultat/version quiz, filières admissibles et sources; pas de décision d'affectation. | P0 — résultat explicable; enrichissements à valider. | Tous les ex æquo visibles; raisons liées à données; aucune garantie d'admission; test résultat absent/illisible et filières inconnues. | **PARTIELLEMENT_OPERATIONNEL** : classement local et ex æquo; explication/compétences limitées, calcul heuristique. | CDC16 §5; MD §5.1; Repo (`js/resultat.js`, tests orientation). |
| ORI-03 | Jeune : retrouver plusieurs parcours réalisés et leur date. | Résultats versionnés, accès propriétaire et conservation à définir. | P1 — proposition, historique complet absent du CDC détaillé initial. | Deux parcours restent distincts et datés; suppression et limites d'accès testées. | **ABSENT** comme historique central; seul le dernier résultat local est conservé. | CDC16 §5-7; MD §5.1; Repo (`js/quiz.js`). |
| ORI-04 | Jeune : comparer 2 à 3 filières selon des critères cohérents. | Durée, coûts, admission, débouchés, rémunérations sourcées; données inconnues affichées comme telles. | P0 — comparateur de base; critères à valider. | Limite de sélection appliquée; absence de valeur non inventée; données et sources visibles; tests égalités, champs manquants et mobile. | **PARTIELLEMENT_OPERATIONNEL** : comparateur frontend sur données JSON, sans validation complète des valeurs. | CDC16 §4-5; Repo (`comparateur.html`, `js/comparateur.js`, tests). |

## 4. Découverte

| ID | Utilisateurs, objectif et comportement attendu | Données / règles / dépendances | Priorité et version proposées | Critères d'acceptation et tests requis | État actuel observé | Sources |
|---|---|---|---|---|---|---|
| DECO-01 | Jeune, visiteur : explorer filières et formations, consulter les relations et fiches. | Identifiants, description, matières, durée, débouchés, métiers/écoles liés; provenance par assertion. | P0 — catalogue initial; proposition. | Navigation liste/détail et liens associés; relations inexistantes refusées; champs inconnus non inventés. | **PARTIELLEMENT_OPERATIONNEL** : 7 filières en JSON; informations à confirmer. | CDC16 §4, §7; MD §5.2; Repo (`data/filieres.json`, `js/filieres.js`). |
| DECO-02 | Jeune, visiteur : trouver et évaluer des établissements/écoles. | Identité, ville/campus, statut, formation, admission, contact; sources et portée exactes. | P0 — catalogue traçable; proposition. | Toute affirmation est rattachée à source/date/portée; une mention MESRS ne prouve pas une filière; filtres et détails testés. | **PARTIELLEMENT_OPERATIONNEL** : 30 fiches; données et correspondances incomplètes, certaines sourcées. | CDC16 §4, §7; MD §5.2; Repo (`data/ecoles.json`, `README.md`). |
| DECO-03 | Jeune, visiteur : explorer métiers, missions, compétences et formations. | Source, date, relations métier/formation; rémunérations indicatives uniquement si sourcées. | P0 — catalogue de base; proposition. | Fiches accessibles, relations cohérentes, libellés de portée/estimation; tests de recherche et données manquantes. | **PARTIELLEMENT_OPERATIONNEL** : 21 métiers, contenus de départ à valider. | CDC16 §4, §7; MD §5.2; Repo (`data/metiers.json`, `js/metiers.js`). |
| DECO-04 | Jeune, visiteur : rechercher, filtrer et trier plusieurs catégories. | Requête, ville, budget, durée, type, critères réellement renseignés; dépend des catalogues et de la qualité des sources. | P0 — recherche utile; tri avancé P1, propositions. | Filtres combinables; aucune catégorie confondue; état vide explicite; pertinence et accents testés. | **PARTIELLEMENT_OPERATIONNEL** : recherche par catalogue et page de recherche présentes; critères dépendent des données. | CDC16 §5.2; MD §5.2; Repo (`recherche.html`, scripts catalogues). |
| DECO-05 | Jeune : ouvrir des détails réutilisables et naviguer vers contenus associés. | Route/id stable; accès public seulement au contenu publié; favoriser un contenu ne le publie pas. | P0 — navigation; proposition. | Hash/URL direct et retour fonctionnent; identifiant invalide affiche un état sûr; liens locaux testés. | **PARTIELLEMENT_OPERATIONNEL** : détails pilotés par ancres dans les pages existantes; routes dédiées de CDC absentes comme fichiers individuels. | CDC16 §4; MD §5.2; Repo (pages catalogues et `MAPPING_ECRANS.md`). |

## 5. Mentorat

| ID | Utilisateurs, objectif et comportement attendu | Données / règles / dépendances | Priorité et version proposées | Critères d'acceptation et tests requis | État actuel observé | Sources |
|---|---|---|---|---|---|---|
| MEN-01 | Jeune : rechercher un mentor vérifié et consulter un profil disponible. | Identité, expertise, disponibilité, consentement, preuve et dates de vérification. | P0 — représentation fiable du pilier; publication dépend de profils validés. | Aucun profil fictif; profil public uniquement après vérification; filtres et état vide; test révocation. | **PARTIELLEMENT_OPERATIONNEL** : annuaire frontend; JSON vide `aucune_publication`. | CDC16 §5.3; MD §4-5.3; Repo (`data/mentors.json`, `js/mentors.js`). |
| MEN-02 | Jeune : soumettre une demande; mentor destinataire : accepter/refuser et consulter ses demandes. | Demande, demandeur, destinataire, consentement, statut, historique; permissions serveur; protection des mineurs. | P0 pour un flux réel minimal; proposition. | Seuls auteur et mentor assigné accèdent; transitions valides; aucune demande « reçue » sans persistance; tests accès horizontal et refus. | **SIMULATION_LOCALE** : demandes et statuts locaux, non transmis. | CDC16 §5.3; MD §5.3, §6; Repo (`js/mentors.js`, `js/dashboard.js`). |
| MEN-03 | Jeune/mentor : consulter historique et recevoir notification d'événements réels. | Événement, destinataire, canal, consentement/préférences, état de livraison. | P1 — notifications et historique étendus; dépend du flux MEN-02. | Notification seulement après transition persistée; erreurs d'envoi visibles; tests double envoi, préférence et destinataire erroné. | **ABSENT** pour notifications réelles; indicateurs locaux seulement. | CDC16 §5.3; MD §5.3, §6; Repo. |

## 6. Insertion professionnelle

| ID | Utilisateurs, objectif et comportement attendu | Données / règles / dépendances | Priorité et version proposées | Critères d'acceptation et tests requis | État actuel observé | Sources |
|---|---|---|---|---|---|---|
| INS-01 | Jeune : découvrir des offres réelles, filtrer et lire une fiche. | Organisation vérifiée, type, localisation, domaine, dates, conditions, statut et source de publication. | P0 — catalogue fiable; disponibilité dépend d'offres vérifiées. | Offre fictive/draft jamais publique; expiration et état vérifiés; filtre, lien candidature et état vide testés. | **PARTIELLEMENT_OPERATIONNEL** : page fonctionnelle, JSON `aucune_publication`. | CDC16 §5.4; MD §5.4; Repo (`data/offres.json`, `js/offres.js`). |
| INS-02 | Jeune : postuler et suivre le statut/historique; organisation : traiter les candidatures autorisées. | Offre, candidat, dossier, consentement de partage, état et journal; accès par propriétaire/destinataire. | P0 pour dépôt et consultation sûrs; workflow complet proposé. | Offre non publiée refuse la candidature; dépôt/erreur distingués; candidat voit ses dossiers; organisation ne voit que les autorisés; tests IDOR. | **SIMULATION_LOCALE** : candidatures locales, aucune transmission entreprise. | CDC16 §5.4; MD §5.4, §6; Repo (`js/offres.js`, `js/candidatures.js`). |
| INS-03 | Organisation : créer un profil, prouver son identité et gérer des représentants autorisés. | Entité, preuve, représentant, statut, délégations; procédure et documents à confirmer. | P0 comme dépendance à la publication; proposition. | Organisation non vérifiée ne publie pas; rôles de représentant limités; changement et révocation testés. | **ABSENT** comme vérification serveur; profils entreprise locaux seulement. | CDC16 §3, §7; MD §4, §5.4; Repo (`js/auth.js`). |
| INS-04 | Recruteur : créer, modifier, retirer et publier une offre; gérer les annonces. | Contenu, provenance, approbation, date, statut éditorial et statut de recrutement séparés. | P0 pour publication réelle; proposition. | Brouillon/non vérifié jamais public; seul représentant autorisé modifie; audit des changements; tests expiration et organisation tierce. | **SIMULATION_LOCALE** : brouillons/« à vérifier » stockés en local; aucune publication réelle. | CDC16 §4-5.4; MD §5.4; Repo (`js/publication-offre.js`, `data/offres.json`). |

## 7. Administration, données et sécurité

| ID | Utilisateurs, objectif et comportement attendu | Données / règles / dépendances | Priorité et version proposées | Critères d'acceptation et tests requis | État actuel observé | Sources |
|---|---|---|---|---|---|---|
| GOV-01 | Équipe éditoriale : saisir, vérifier, publier, réviser, refuser et archiver une fiche. | Provenance, date, portée, responsable, statut, historique; workflow du document 04. | P0 avant contenu public réel; proposition. | Pas de publication sans preuve requise et responsable; test de transitions/retours et audit; contenus non vérifiés exclus des routes publiques. | **ABSENT** comme workflow central; données JSON publiques et corrections manuelles. | M10; MD §3.2, §6; Repo (`data/*.json`). |
| GOV-02 | Utilisateur : signaler une donnée/contenu; modérateur : traiter et documenter. | Signalement, objet, motif, traitement, accès restreint et recours à définir. | P1 — proposition, surtout avant ouverture sociale. | Signalement reçu seulement après persistance; statut et responsable visibles à l'équipe; tests abus, confidentialité et clôture. | **ABSENT**. | MD §4, §5.9; M10; Repo. |
| SEC-01 | Tous : les accès aux données sont contrôlés au serveur par rôle, propriétaire, organisation et état métier. | Authentification, permissions, politiques RLS si Supabase, validation et journal; dépend de l'architecture. | P0 — prérequis sécurité; proposition. | Tests horizontaux/verticaux négatifs sur chaque ressource; aucune confiance dans un rôle envoyé par le client; revue XSS/injections/IDOR. | **ABSENT** côté serveur; garde-fous UX locaux seulement. | CDC16 §3; MD §6-8; M10; Repo (`js/auth.js`, `js/publication-offre.js`). |
| SEC-02 | Administrateurs habilités : auditer les actions sensibles et répondre aux incidents. | Événement minimal, acteur, objet, date, résultat; données personnelles minimisées. | P0 — prérequis proposé pour comptes/publication réelle. | Modifications de rôle, publication, accès exceptionnel et suppression sont journalisées; journal protégé et testé. | **ABSENT** comme journal d'audit central. | MD §6, §8; M10; Repo. |
| SEC-03 | Équipe produit/exploitation : répondre aux obligations de confidentialité, accès, correction et suppression. | Finalités, consentement, rétention, export, suppression, mineurs, tiers; revue compétente requise. | P0 avant collecte réelle; proposition. | Revue documentée; droits et délais testés; aucune affirmation juridique non vérifiée. | **PARTIELLEMENT_OPERATIONNEL** : politique décrivant le local, aucun workflow complet de droits. | M10; MD §8; Repo (`confidentialite.html`). |
| OPS-01 | Équipe : exécuter déploiement, sauvegarde, restauration et supervision mesurée. | Environnements, secrets, logs, sauvegardes, dépendances, capacité et procédures. | P0 avant pilote public; proposition. | Restauration testée; alertes et rollback exercés; test de charge selon cible approuvée; procédure sans secrets client. | **NON_VÉRIFIÉ** : pas de config serveur/CI/hébergement décrite dans la copie examinée. | MD §7, §10; CDC16 §8-9; Repo. |
| QA-01 | Équipe : vérifier chaque fonctionnalité à niveaux adaptés. | Jeux synthétiques, scénarios, versions, rapport reproductible et non-régression. | P0 pour flux critiques; proposition. | Tests unitaires/intégration/E2E/accessibilité/permissions; environnement et limites publiés; résultats reproductibles. | **PARTIELLEMENT_OPERATIONNEL** : 47 tests Node consignés au journal; peu de couverture navigateur systématique. | MD §10; M10; Repo (`tests/`, `journal.md`). |

## 8. Extensions des huit univers

Ces exigences préservent la vision sans les déclarer disponibles ni décidées pour le lancement.

| ID | Utilisateurs, objectif et comportement attendu | Données / règles / dépendances | Priorité et version proposées | Critères d'acceptation et tests requis | État actuel observé | Sources |
|---|---|---|---|---|---|---|
| EXT-01 | Jeune : organiser le parcours académique, relier résultats, études et progression. | Objectifs, étapes, périodes et liens avec formations; finalité et modèle à définir. | P1 — extension à arbitrer; après socle. | Parcours modifiable et supprimable; aucune progression inventée; tests cohérence et accès propriétaire. | **ABSENT** comme module complet. | MD §2, §5.6. |
| EXT-02 | Jeune : définir des objectifs et suivre des apprentissages/compétences, sans réduire la fonction à des cours. | Compétences, objectifs, réalisations, contenu/licences et évaluation; sources à définir. | P1 — FUTUR / proposition. | Chaque compétence reliée à une source ou réalisation; évaluation compréhensible; modération/qualité testées. | **ABSENT** comme module. | MD §5.6. |
| EXT-03 | Utilisateurs : publier des portfolios adaptés à un domaine et contrôler leur visibilité. | Projets, compétences, médias, droits d'auteur, partage, audience et suppressions. | P1 — FUTUR / proposition. | Visibilité privée/public définie; partage révocable; upload sécurisé et droits testés avant activation. | **ABSENT**; profil actuel ne constitue pas un portfolio complet. | MD §5.7; CDC16 §7 (`cv_url`). |
| EXT-04 | Utilisateur : obtenir une aide intégrée et contextualisée à partir des contenus vérifiés. | Contexte minimal, provenance des réponses, fournisseur, secret serveur, quotas, consentement et protection contre abus. | Assistant local : existant limité; assistant génératif : P1/FUTUR, fournisseur non approuvé. | Réponses testées contre sources; absence de source signalée; clé non livrée au navigateur; données transmises minimisées; tests de sécurité et coût. | **PARTIELLEMENT_OPERATIONNEL** pour l'assistant local à règles; Gemini absent. | MD §5.8; CDC16 §8; Repo (`js/assistant.js`, `README.md`, pack assistant). |
| EXT-05 | Utilisateurs : découvrir des communautés, événements et opportunités avec interactions sûres. | Messages, profils, signalements, règles de modération, visibilité et âge minimal. | P1 — FUTUR / proposition; activation conditionnée à l'analyse mineurs. | Signalement et modération testés; contrôle d'accès et abus; parcours mineurs validé par avis compétent. | **ABSENT**. | MD §5.9. |
| EXT-06 | Établissements/formateurs/partenaires éventuels : proposer des informations ou ressources. | Identité, rôle, mandat, sources et droits de contribution à définir. | P1 — extension à confirmer. | Aucun accès privilégié sans vérification; contributions soumises au cycle éditorial; tests délégation. | **ABSENT** comme rôle d'accès autonome. | MD §4; M10. |
| EXT-07 | Jeune : accéder à des expériences/activités de développement et les relier aux études. | Événements, compétences, partenaires, consentement mineurs et conditions; cas d'usage à spécifier. | P1 — FUTUR / proposition. | Activité et résultat issus d'une source réelle; droits et protection testés; pas de promesse d'emploi/admission. | **ABSENT**. | MD §2, §5.6, §5.9. |
| EXT-08 | Équipe : afficher carte et recherche avancée si qualité, géolocalisation et actualité des données le permettent. | Coordonnées, précision, origine, permission de localisation et fournisseur cartographique. | P1 — FUTUR / proposition; dépendance de données et coût. | Consentement localisation; précision/portée visibles; test d'accessibilité, coût, réseau et repli liste. | **ABSENT** dans le produit; carte mentionnée comme piste V3 dans Horizon. | Horizon `MISSION_CODEX.md`, MD §2. |

## 9. Couverture des exigences documentaires CDC

Les exigences de pages et d'expérience restent suivies par groupes : accueil; inscription/connexion/récupération; quiz/résultats/comparateur; listes et gabarits de détail filières/écoles/métiers/mentors/offres; publication; dashboard/profil/favoris; FAQ/À propos/Contact/Confidentialité. Les routes de détail du CDC sont actuellement rendues principalement à partir de pages catalogues et d'identifiants/hash; elles ne correspondent pas toutes à des fichiers HTML distincts.

Les pages 404 et Avis sont des ajouts de projet; Contact/Avis ne doivent pas simuler de transmission. La liste d'écran ne prouve pas la complétude fonctionnelle.

## 10. Critères globaux de recette

Avant de marquer une exigence comme opérationnelle :

1. Le comportement attendu et les états d'erreur sont disponibles dans l'environnement visé.
2. Les données ont une provenance et un statut conformes au document 04.
3. Les autorisations sont testées côté serveur selon le document 03.
4. Les transitions métier respectent le document 02.
5. Les tests requis passent avec un rapport reproductible; les tests impossibles sont signalés.
6. Les contenus et formulaires sont utilisables au clavier, responsive et lisibles; `prefers-reduced-motion` est respecté.
7. La documentation distingue ce qui est opérationnel, simulé, partiel, absent et non vérifié.
8. Les critères P0/P1 et versions restent marqués comme propositions tant que le propriétaire ne les valide pas dans le document 06.
