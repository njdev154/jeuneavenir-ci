# Gouvernance des données — JeuneAvenir CI

**Statut :** référentiel de gouvernance à valider avant publication ou collecte réelle.
**Règle validée par le propriétaire :** toute donnée publiée doit être traçable, vérifiée et associée à un responsable de validation.
**Documents liés :** [Référentiel](01-reference-et-perimetre.md), [Règles métier](02-regles-metier.md), [Rôles](03-roles-et-permissions.md), [Exigences](05-registre-des-exigences.md), [Décisions](06-decisions-et-points-a-valider.md), [Architecture](07-architecture-cible.md), [Modèle logique](08-modele-de-donnees.md).

## 1. Principes

1. Une donnée publique doit être fondée sur une source identifiable et une vérification documentée.
2. La source et la portée de la source doivent rester attachées à l'assertion qu'elles soutiennent. Une liste d'établissements ne prouve pas automatiquement l'ouverture, l'agrément ou l'admission dans une formation.
3. La personne qui saisit une donnée n'est pas nécessairement celle qui la valide. Le responsable de validation est identifié par rôle ou personne et par date.
4. Aucune donnée fictive ne doit être publiée comme réelle. Les jeux de test utilisent des identifiants et libellés synthétiques explicites et sont isolés de la publication.
5. L'absence de donnée doit rester visible comme absence, et non être convertie en valeur supposée.
6. La collecte de données personnelles est limitée au besoin démontré; l'accès est limité selon le document 03.
7. Les durées de conservation, obligations légales et responsabilités de traitement ne sont pas établies par ce document. Elles requièrent un arbitrage et une vérification compétente avant production.

## 2. Provenance minimale d'un contenu de référence

Chaque contenu publiable doit pouvoir référencer, selon le cas :

- un identifiant stable et son type;
- la source (institution/personne/organisation), URL ou référence documentaire;
- le titre ou la localisation précise de l'information dans la source;
- la date de publication ou version de la source, si connue;
- la date de consultation/vérification;
- les faits effectivement confirmés et la portée de cette confirmation;
- les faits non confirmés ou les réserves;
- le responsable de saisie et le responsable de vérification;
- le statut éditorial et ses changements;
- l'historique de correction, publication, retrait ou archivage.

La date de dernière vérification n'est pas une garantie permanente d'actualité. Des règles de révision périodique et des durées de validité par type de source restent à décider.

## 3. Statuts éditoriaux

Les statuts normalisés proposés reprennent la liste demandée par Mission 10. Les identifiants machine sont indicatifs et devront être fixés lors de l'architecture.

| Libellé | Valeur proposée | Signification et visibilité |
|---|---|---|
| Brouillon | `brouillon` | Contenu saisi mais incomplet ou non soumis; visible uniquement aux acteurs autorisés. |
| En attente de vérification | `en_attente_verification` | Soumis à une validation; ne constitue pas un contenu public. |
| Vérifié | `verifie` | Les éléments définis comme vérifiables ont été contrôlés par un responsable identifié; ne signifie pas encore publié. |
| Publié | `publie` | Contenu autorisé à la consultation publique selon le canal et le périmètre enregistrés. |
| À réviser | `a_reviser` | Vérification périmée, source modifiée, signalement ou doute; suspension de l'affichage public recommandée jusqu'à décision. |
| Refusé | `refuse` | Publication refusée; motif et auteur de décision sont conservés selon les règles à valider. |
| Archivé | `archive` | Retiré de la publication active; conservation ou suppression selon catégorie et durée à définir. |

### Transitions de travail proposées

| Transition | Acteur / condition | Contrôle obligatoire |
|---|---|---|
| Brouillon → En attente | Auteur ou responsable de saisie soumet un dossier complet. | Vérifier les champs requis, la provenance et les preuves attendues. |
| En attente → Vérifié | Responsable de vérification distinct ou autorisé valide le dossier. | Enregistrer identité du validateur, date, sources et portée. |
| En attente → Refusé | Responsable autorisé constate une non-conformité. | Motif compréhensible et historique de décision. |
| Vérifié → Publié | Responsable de publication habilité, selon politique éditoriale. | Vérification non expirée; canal et date de publication enregistrés. |
| Publié → À réviser | Source obsolète, changement, erreur ou signalement crédible. | Réduire ou suspendre la visibilité selon le risque; ouvrir une tâche de revue. |
| À réviser → Vérifié | Nouvelle revue complète et responsable identifié. | Nouvelle date, nouvelle source ou justification de maintien. |
| Publié → Archivé | Fin de validité, retrait autorisé ou remplacement. | Motif, date et éventuel successeur conservés. |
| Refusé → Brouillon | Nouvelle version soumise par l'auteur. | Créer une version révisée; ne pas effacer l'historique du refus. |

Ces transitions sont des propositions opérationnelles; elles doivent être validées, notamment la possibilité d'un retour à publication après révision et le principe de validation à deux personnes.

## 4. Référentiel des catégories de données

Dans le tableau, « responsable » désigne la fonction cible; son nom, son organisation et son suppléant restent à définir. « Conservation » est explicitement non fixée.

| Catégorie | Saisie / responsable métier | Vérification et source attendue | Confidentialité | Statut, modification et publication | Conservation / correction / archivage |
|---|---|---|---|---|---|
| Filières et formations | Équipe éditoriale ou import documenté. | Responsable de validation; source institutionnelle/MESRS, organisme de formation ou document daté; confirmer séparément admission, durée, coûts et programmes. | Public pour les faits validés; notes internes de preuve restreintes. | Cycle éditorial commun; republier seulement les assertions vérifiées et leur portée. | Durée à définir. Corriger par version; archiver les versions périmées, ne pas supprimer la provenance historique sans arbitrage. |
| Établissements et écoles | Équipe éditoriale; import avec provenance conservée. | Référentiel officiel pertinent et, si nécessaire, confirmation directe de l'établissement; distinguer existence, statut, campus et programmes. | Public pour les éléments validés; contacts privés de contributeurs restreints. | Cycle éditorial commun; une correspondance de nom/localité n'autorise pas à publier une filière comme confirmée. | Durée à définir; revoir si source ou statut change; corriger et archiver les fiches retirées. |
| Métiers | Équipe éditoriale. | Source professionnelle/formation/emploi identifiable; date, contexte et portée requis, surtout pour les salaires. | Public pour la fiche validée. | Cycle éditorial commun; les salaires sont indicatifs uniquement si source et date le permettent. | Durée à définir; corriger et archiver lorsque la source n'est plus actuelle. |
| Mentors | Le mentor fournit les données et le consentement; responsable d'annuaire suit le dossier. | Vérifier identité, expérience et disponibilité selon une procédure à définir; validation humaine autorisée. | Profil public limité au contenu consenti; coordonnées et dossier de contrôle privés. | Profil non public avant vérification/consentement; suspension possible si preuve ou disponibilité change. | Durée à définir; correction par le titulaire et validation; procédure de retrait/suppression à définir. |
| Organisations | Représentant fournit les informations; responsable métier suit la vérification. | Vérifier identité légale et mandat du représentant par source/procédure à déterminer. | Identité publique autorisée distincte des pièces et contacts privés. | Pas d'offre publique avant validation de l'organisation; révocation si identité ou mandat douteux. | Durée à définir; rectification contrôlée et archivage selon offres/candidatures liées. |
| Offres | Organisation vérifiée ou représentant autorisé. | Vérifier cohérence, réalité, dates, conditions, localisation, responsable et lien de candidature; critères exacts à confirmer. | Offre publique après approbation; détails non publics restreints. | Séparer statut éditorial du statut de recrutement; publication et expiration à définir; brouillon ou demande de vérification non publics. | Durée à définir; retrait/archivage à expiration ou clôture; corriger par version et conserver la trace. |
| Candidatures | Candidat soumet; système associe à une offre publiée. | Contrôles de complétude, destinataire et autorisation; ne pas valider le fond d'un CV sans processus explicite. | Très confidentiel; candidat et organisation autorisée uniquement, accès interne exceptionnel justifié. | Statut métier séparé du statut éditorial; partage de CV/coordonnées à définir et consentement requis. | Durée à définir selon finalité et obligations; demande d'accès/correction/suppression à traiter selon procédure validée. |
| Demandes de mentorat | Jeune demandeur; mentor destinataire traite la demande. | Validations de destinataire, état, consentement et règles de protection des mineurs. | Très confidentiel; demandeur et mentor destinataire; accès d'administration minimal et tracé. | Statuts distincts des statuts éditoriaux; demandes non transmises ne doivent pas apparaître comme reçues. | Durée à définir; clôture/suppression/anonymisation à définir; conserver les traces nécessaires sans excès. |
| Comptes et profils | Titulaire du compte, dans les limites du formulaire validé. | Vérification d'identité/email et rôle selon risque et mécanisme retenu; preuves d'administration séparées. | Confidentiel; accès selon document 03. | Statut de compte/consentement distinct du statut éditorial; aucune élévation de rôle par l'utilisateur. | Durée et purge à définir; accès, rectification, export et suppression à spécifier avant collecte réelle. |
| Résultats de quiz | Générés à partir des réponses; titulaire peut les consulter. | Vérifier version du questionnaire, calcul et données d'entrée; ce n'est pas une validation d'orientation officielle. | Personnel; ne pas exposer publiquement ni transmettre à un fournisseur IA sans règle/consentement validés. | Versionner questionnaire et méthode; corriger un résultat par recalcul traçable, pas par édition arbitraire du score. | Durée à définir; supprimer ou recalculer selon choix utilisateur et obligations confirmées. |
| Favoris | Utilisateur connecté. | Pas de vérification de contenu distincte; la publication de la cible reste gouvernée par sa catégorie. | Personnel, limité au titulaire. | Un favori n'altère ni l'élément référencé ni son statut de publication. | Durée à définir; suppression par l'utilisateur ou avec le compte selon règle validée. |
| Sources documentaires et preuves | Contributeur ou import avec référence. | Contrôler identité de la source, URL/document, date, accès, portée et lien aux assertions. | Peut contenir du contenu public ou des pièces internes/confidentielles; classification obligatoire. | Source non publiée automatiquement; versions et citations liées aux contenus validés. | Durée à définir; archiver les preuves de validation selon obligations, purger les secrets/données non nécessaires. |
| Journaux d'audit | Générés par le système; aucun utilisateur ne les modifie directement. | Vérifier intégrité, horodatage, événements couverts et accès aux journaux. | Confidentiel; pas de contenu personnel complet si un identifiant d'événement suffit. | Append-only recommandé; correction par nouvel événement, pas par réécriture silencieuse. | Durée à définir; accès restreint, procédure d'export et d'effacement à arbitrer selon obligations. |
| Notifications | Générées à partir d'un événement réel. | Valider le destinataire, l'événement et le canal; échec d'envoi explicite. | Peut révéler qu'une demande/candidature existe; minimiser le contenu affiché. | État de livraison séparé du statut métier; aucune notification de succès avant confirmation du fournisseur. | Durée à définir; contenu, préférences, fournisseur et suppression à préciser. |
| Documents/CV/portfolios | Titulaire ou auteur autorisé; catégories et formats à définir. | Vérifier droits, type, taille, accès, sécurité et éventuelle modération; procédure de téléversement absente. | Potentiellement très sensible; privé par défaut, partage explicite et révocable. | Aucune publication sans consentement, contrôle de visibilité et règles de modération. | Durée, version, export, suppression et sauvegarde à définir avant d'activer des fichiers. |
| Signalements et dossiers de modération | Utilisateur ou modérateur autorisé. | Vérifier pertinence et traitement par responsable identifié; procédure et escalade à définir. | Confidentiel; accès restreint à la personne chargée du traitement. | Statut de traitement distinct du statut du contenu; pas de sanction automatique sans règle approuvée. | Durée à définir; conserver juste ce qui est nécessaire à la décision et au recours. |

## 5. Règles de collecte, confidentialité et conservation

- Chaque champ de formulaire doit être associé à une finalité, un destinataire et une justification.
- Les données de compte, candidatures, demandes de mentorat, résultats, pièces jointes et identifiants techniques doivent avoir des niveaux de confidentialité distincts.
- Les règles d'accès du document 03 s'appliquent même lorsqu'une personne possède un rôle administratif.
- La conservation doit être déterminée par catégorie et événement de départ (fin de compte, clôture d'offre, décision de candidature, fin de relation de mentorat, fin de validité d'une source). Aucune durée n'est inventée ici.
- Avant production, faire vérifier par une personne compétente les obligations applicables en Côte d'Ivoire, les responsabilités, consentements, droits, mentions et éventuelles obligations propres aux mineurs. Aucune conformité juridique n'est déclarée acquise.
- La région d'hébergement, la localisation des sauvegardes et tout transfert vers un fournisseur étranger doivent être inclus dans cette revue. La comparaison technique seule n'approuve aucun hébergeur pour des données personnelles.
- Jusqu'à cette revue et à la définition des accès, consentements et durées, ne pas utiliser de vrais comptes, candidatures, coordonnées, réponses identifiables, CV, demandes de mentorat ou données de mineurs sur un service hébergé. Les tests de démonstration doivent rester synthétiques et séparés de la publication.
- Le stockage local actuel ne constitue pas un registre central de données publiées ni un service de compte; il ne doit pas servir de référence de conservation pour la cible backend.

## 6. Procédure de correction et de retrait

1. Recevoir et identifier la demande ou le signalement sans exposer de données supplémentaires.
2. Enregistrer catégorie, objet, motif, date et responsable de traitement.
3. Évaluer le risque; si nécessaire, suspendre provisoirement la publication plutôt que laisser une donnée trompeuse visible.
4. Vérifier la source et contacter le responsable approprié; documenter la décision et sa portée.
5. Créer une nouvelle version, conserver l'historique requis et répercuter la correction dans les fiches liées.
6. Informer le demandeur ou l'auteur selon un canal réellement opérationnel.
7. Archiver ou supprimer seulement conformément à la durée et à l'obligation confirmées; enregistrer l'action.

La procédure de recours, les délais de traitement et les responsabilités nominatives restent à définir.

## 7. État de la gouvernance dans le frontend actuel

- Les fiches d'écoles incluent pour certaines une source, une date et une portée; cela ne signifie pas que chaque établissement et chaque programme sont vérifiés.
- Les JSON de mentors et d'offres sont vides et portent le statut `aucune_publication`.
- Les comptes, résultats, favoris, demandes et candidatures sont locaux au navigateur; plusieurs contiennent ou peuvent contenir des données personnelles.
- Les états `brouillon` et `à vérifier` des offres locales ne sont pas une approbation éditoriale ni une publication.
- Aucun rôle serveur, workflow central de validation, stockage documentaire, journal d'audit central ou durée de conservation n'a été démontré.

## 8. Points à décider

Les responsables nominatifs, sources acceptables par assertion, périodicité de révision, niveau de contrôle des mentors/organisations, durée de conservation, procédure mineurs, pièces justificatives, voie de correction et conformité applicable sont consignés comme ouverts dans le [registre des décisions](06-decisions-et-points-a-valider.md). La traduction logique de ces catégories en groupes d'entités est décrite dans le [modèle de données](08-modele-de-donnees.md), sans remplacer ces règles de gouvernance.
