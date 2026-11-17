# Journal du projet

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
