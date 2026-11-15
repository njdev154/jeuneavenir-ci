# Journal du projet

## 2026-11-15 — Assistant Copilot
- Intégration de l'assistant local dans les 21 pages HTML; les fichiers actifs sont rangés dans `js/assistant.js` et `css/assistant.css`. Le pack reçu est conservé comme référence et son guide/prompt ne demandent plus de présenter des exemples fictifs comme vrais.
- Garde-fous de fiabilité : les mentors/offres ne sont chargés qu'avec le statut `verifie` (les JSON actuels sont `demo_fictif`); les écoles recherchées par domaine doivent avoir un rattachement confirmé et montrent leurs sources; les séries, durées, métiers et salaires sont présentés comme des repères, sans promesse d'admission.
- README actualisé et ajout de tests ciblés dans `tests/assistant.test.js`.
- Vérifications : 4 tests Node réussis; syntaxe de tous les scripts `js/*.js`, parse des JSON, références uniques dans les 21 pages et `git diff --check` réussis. Test navigateur avec données simulées : filières A2, écoles/sources, salaire, exclusion des profils/offres fictifs, question hostile rendue comme texte, ouverture/fermeture et viewport mobile 360 px; aucune erreur JavaScript.
- Le navigateur intégré ne pouvait pas joindre le serveur local lancé par le terminal; le test navigateur a donc utilisé des réponses JSON contrôlées. L'assistant doit être servi en HTTP (Live Server) pour charger les fichiers JSON réels.
- À faire : examiner les sources des métiers et des estimations avant d'élargir les réponses; configurer/confirmer le remote Git puis demander confirmation avant le premier push. Le cahier des charges non suivi reste exclu de la sauvegarde.

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
