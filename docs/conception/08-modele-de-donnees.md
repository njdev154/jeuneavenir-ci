# Modèle logique de données — JeuneAvenir CI

**Statut :** modèle conceptuel de travail, à valider avant tout schéma SQL ou migration.
**Cible :** Laravel modulaire; PostgreSQL est une préférence dont le choix définitif reste conditionnel.
**Registres de référence :** [gouvernance des données](04-gouvernance-des-donnees.md), [rôles et permissions](03-roles-et-permissions.md), [décisions](06-decisions-et-points-a-valider.md).

## 1. Objet et limites

Ce document traduit les catégories fonctionnelles et les règles de gouvernance en domaines, entités conceptuelles et relations à examiner. Il ne prescrit ni tables, ni colonnes SQL définitives, ni types spécifiques à PostgreSQL/MySQL. Un prototype Laravel local d'orientation existe désormais, mais il n'utilise pas de persistance métier; cela ne sélectionne pas le moteur SQL et n'autorise pas les migrations applicatives.

Les éléments marqués **à confirmer** dépendent des arbitrages du document 06. Un modèle de données ne doit pas trancher une règle produit, une durée de conservation ou un accès qui n'a pas été validé.

## 2. Principes de modélisation

1. **Séparer identité, profil et rôle.** Un choix de profil dans un formulaire n'attribue jamais à lui seul un privilège.
2. **Séparer les contenus publiés de leurs preuves.** Une fiche et chaque assertion vérifiable doivent pouvoir être reliées aux sources et validations pertinentes.
3. **Séparer états éditoriaux et états métier.** « Publié » ne signifie pas « offre ouverte », et une demande reçue n'est pas nécessairement acceptée.
4. **Rattacher les données personnelles à leur propriétaire et à une finalité.** Tout accès doit pouvoir être contrôlé côté serveur.
5. **Conserver l'historique nécessaire sans réécriture silencieuse.** Les corrections et transitions sensibles produisent des événements, sous réserve des règles de conservation à déterminer.
6. **Ne pas publier de données non vérifiées.** Un contenu incomplet ou dont la source est absente demeure en préparation ou hors catalogue public.
7. **Éviter l'effacement en cascade non maîtrisé.** Les conséquences d'une suppression sur candidatures, demandes, preuves et audit doivent être décidées avant la migration.

## 3. Domaines et entités candidates

Les noms ci-dessous désignent des concepts, pas des noms de tables approuvés.

| Domaine | Entité conceptuelle | Données/responsabilité principales | Relations et contraintes à concevoir |
|---|---|---|---|
| Identité | `UserAccount` | Identifiant stable, adresse de connexion, empreinte du mot de passe gérée par Laravel, état du compte et horodatages. | L'adresse doit être normalisée et unique selon une règle validée. Les secrets ne sont jamais exposés par l'API ni journalisés. |
| Identité | `Profile` | Données de profil autorisées pour le titulaire, séparées des paramètres de sécurité. | Le nombre de profils par compte et les sous-types (dont Professeur/Mentor) sont à arbitrer dans OPEN-004. |
| Identité et accès | `RoleAssignment` | Rôle attribué, périmètre, auteur de l'attribution, date et révocation. | Affectation privilégiée contrôlée, jamais éditable par le titulaire lui-même; rôles canoniques encore à valider. |
| Identité et accès | `ConsentRecord` | Finalité, version de la notice, choix, date et moyen de preuve. | Le texte, les finalités et les conditions propres aux mineurs nécessitent validation; ne pas assimiler un compte créé à tous les consentements. |
| Organisations | `Organization` | Identité, statut de vérification et données publiables minimales. | Une organisation peut avoir plusieurs membres; seules les organisations et offres vérifiées peuvent être publiques. |
| Organisations | `OrganizationMembership` | Lien entre un compte, une organisation et les habilitations d'entreprise. | Le modèle de représentation, de délégation et de révocation est à valider; une appartenance ne donne pas tous les droits de l'organisation. |
| Référentiels | `Institution` | Établissement, identité de fiche, localité et faits validés. | Une institution peut proposer plusieurs formations; l'existence de l'établissement ne prouve pas l'ouverture d'un programme. |
| Référentiels | `Program` / `Field` | Formations, filières, catégories, niveaux et attributs de recherche approuvés. | Les relations formation/filière/série et les règles d'admission doivent être sourcées; les versions historiques ne doivent pas être confondues. |
| Référentiels | `Occupation` | Métier, activités, compétences et informations de carrière publiables. | Les salaires, débouchés et exigences requièrent source, date et portée; aucun chiffre non confirmé ne doit être calculé ou affiché comme officiel. |
| Provenance | `SourceReference` | Source, URL/référence, auteur ou organisme, version/date et date de consultation. | Une source peut étayer plusieurs assertions; une assertion peut exiger plusieurs sources. La portée de la preuve doit être enregistrée. |
| Provenance | `ContentRevision` | Version d'un contenu, auteur, faits modifiés, statut éditorial et date d'effet. | Brouillon, vérification, publication, révision, refus et archivage doivent garder leur historique conformément au document 04. |
| Provenance | `VerificationEvent` | Objet révisé, vérificateur, date, sources utilisées, portée confirmée et réserves. | Le responsable doit être identifiable; la périodicité et l'éventuelle validation à deux personnes restent à décider. |
| Orientation | `QuizVersion` | Version publiée du questionnaire et de sa méthode de calcul. | Une version publiée est immuable; une modification importante crée une nouvelle version. Le conflit 14/18 questions reste ouvert (OPEN-002). |
| Orientation | `QuizQuestion` / `QuizOption` | Énoncé, options et association à une version. | Les questions visibles et les règles de score nécessitent validation éditoriale; aucune validité psychométrique n'est présumée. |
| Orientation | `QuizAttempt` / `QuizAnswer` | Parcours, réponses strictement nécessaires, version utilisée et résultat calculé. | L'association à un compte, le mode invité, la conservation et la suppression du détail des réponses restent à décider. |
| Orientation | `QuizResult` | Résultat explicable, pistes proposées, méthode/version et date. | Un résultat est un outil d'auto-réflexion, pas une affectation officielle. L'accès est réservé au titulaire ou à un partage explicitement autorisé. |
| Mentorat | `MentorProfile` | Profil public limité aux données consenties et informations de vérification privées. | Le compte lié et l'état de vérification doivent être contrôlés; le mentorat reste indisponible publiquement sans validation réelle. |
| Mentorat | `MentoringRequest` | Demandeur, destinataire, motif minimal, état et dates de transition. | Lecture limitée au demandeur et au mentor assigné; règles mineurs, durée, annulation et transitions sont ouvertes (OPEN-010/013). |
| Insertion | `Offer` | Organisation, auteur autorisé, contenu, dates, statut éditorial et état métier distinct. | Seule une offre vérifiée et publiée est visible publiquement; expiration et effet sur les candidatures restent ouverts (OPEN-014). |
| Insertion | `Application` | Candidat, offre, date, données transmises et état métier. | Le recruteur n'accède qu'aux candidatures autorisées de son organisation; partage de CV, retrait et rétention restent ouverts. |
| Espace personnel | `Favorite` | Propriétaire, cible enregistrée, date et catégorie. | Les seules cibles sont des contenus publiés; le mode de relation technique et la suppression liée au compte restent à valider. |
| Sécurité et exploitation | `AuditEvent` | Acteur, action, cible, date, résultat et métadonnées minimisées. | Accès restreint; journal append-only recommandé. Ne pas y copier mots de passe, jetons, CV ou corps complets de demandes. |
| Services optionnels | `Notification` / `StoredDocument` | Événement de notification ou métadonnées d'un fichier si ces services sont approuvés. | Ni canal, ni fournisseur, ni stockage de fichiers n'est sélectionné; ne pas ajouter au socle avant décision (OPEN-015/016). |

## 4. Relations conceptuelles à valider

| Relation | Cardinalité de travail | Règle de sécurité ou de cohérence |
|---|---|---|
| Compte — profils | Un compte possède le ou les profils permis par les rôles confirmés. | Le nombre de profils et le mapping des rôles restent à valider; le profil n'est pas la source d'autorité d'une permission. |
| Compte — rôles attribués | Un compte peut avoir des attributions limitées et datées. | L'attribution/retrait est une action privilégiée auditée; aucun auto-octroi. |
| Organisation — membres | Une organisation peut avoir plusieurs comptes membres et un compte peut appartenir à plusieurs organisations selon règle métier. | Chaque opération vérifie le lien actif, le rôle et la portée organisationnelle. |
| Institution — formations | Une institution peut être reliée à plusieurs formations; une formation peut avoir plusieurs lieux ou institutions. | Une relation précise doit avoir une provenance et une période d'actualité; elle ne vaut pas décision d'admission. |
| Contenu — sources | Un contenu/version peut citer plusieurs sources et une source peut étayer plusieurs contenus. | Les preuves internes ne deviennent pas toutes publiques; l'assertion soutenue et la portée sont distinguées. |
| Quiz — versions/questions/options | Une version contient les questions et options actives pour un parcours. | Les réponses et résultats indiquent la version utilisée afin qu'un calcul demeure interprétable. |
| Compte — résultats/favoris | Un compte possède ses résultats conservés et ses favoris. | Toute lecture est propriétaire; accès public ou analytique non prévu par défaut. |
| Demande mentorat — acteurs | Une demande possède un demandeur et un mentor destinataire clairement identifiés. | Seuls ces acteurs et les droits exceptionnels validés peuvent consulter les données privées. |
| Offre — organisation/candidatures | Une offre appartient à une organisation et peut recevoir plusieurs candidatures. | L'accès recruteur est borné à l'organisation et à l'offre; la suppression de l'offre ne doit pas effacer l'historique sans règle. |
| Objet — événements d'audit | Un objet sensible peut recevoir plusieurs événements immuables. | L'audit établit qui a fait quoi, quand et avec quel résultat sans recopier de données sensibles inutiles. |

Ces cardinalités sont une base de conception. Les relations définitives, les cas où un objet doit être conservé après suppression de son propriétaire et les liens historiques doivent être validés avec les règles métier et la durée de conservation.

## 5. Cycle de vie et invariants transversaux

- **Donnée publique :** chaque version publiée référence une provenance vérifiable, une date et un responsable de validation.
- **Brouillon et preuve :** ces éléments restent non publics et accessibles seulement aux rôles éditoriaux habilités.
- **Compte :** suspension/révocation coupe les sessions et droits selon une procédure à spécifier; une suppression ne doit pas effacer silencieusement les traces nécessaires.
- **Rôle :** séparation entre type de profil, preuve de statut professionnel et autorisation. Un rôle élevé doit provenir d'une attribution contrôlée.
- **Offre :** statut éditorial (vérification/publication) indépendant du statut métier (ouverte, close, expirée); transitions exactes dans OPEN-014.
- **Demande/candidature :** états et changements d'état sont explicites, attribués à un acteur autorisé et historisés; transitions finales dans OPEN-013.
- **Quiz :** résultat relié à la version et à la méthode; ne pas le modifier silencieusement après évolution du questionnaire.
- **Suppression/archivage :** les durées, demandes de rectification/export, anonymisation, effacement et exceptions légales restent à arbitrer (OPEN-009).

## 6. Principes techniques proposés, non figés en SQL

- Employer des identifiants non directement prédictibles pour les ressources accessibles par API; cela ne remplace jamais l'autorisation.
- Garantir les relations par clés étrangères et contraintes lorsque le choix du moteur et la règle de suppression sont validés.
- Stocker les instants serveur de façon cohérente (UTC recommandé), puis afficher en heure locale; la règle métier applicable aux dates d'offre reste à confirmer.
- Représenter les montants avec précision décimale et devise explicite; ne pas assimiler inscription, frais de dossier et coût total.
- Ne pas encoder les rôles, états éditoriaux et états métiers en textes libres saisis depuis le navigateur.
- Éviter les champs JSON pour masquer des relations ou une gouvernance non définie; les données semi-structurées doivent avoir un besoin, une validation et une stratégie de recherche.
- Prévoir index et règles d'unicité après étude des requêtes, de la volumétrie et du moteur retenu; aucun chiffre de performance n'est supposé.

Ces propositions devront être confrontées aux contraintes d'hébergement et comparées sur PostgreSQL et MySQL avant le schéma physique.

## 7. Correspondance avec la gouvernance

Le [document 04](04-gouvernance-des-donnees.md) reste l'autorité pour la provenance, la confidentialité, les responsables, la publication, la correction et l'archivage. Ce modèle ajoute la traduction technique, sans remplacer ses décisions :

- toute catégorie de données du document 04 doit correspondre à un domaine identifié ici ou recevoir une justification d'exclusion;
- toute donnée personnelle doit avoir une finalité, une politique d'accès, une règle de conservation et une procédure de suppression/rectification avant collecte;
- les sources et validations doivent pouvoir être reliées à chaque contenu publié;
- les journaux d'audit ne sont pas un substitut à la gouvernance ni une autorisation d'accéder au contenu personnel;
- les imports depuis JSON/CSV arrivent en zone de préparation non publiée, après rapprochement et validation des sources.

## 8. Critères d'acceptation du modèle logique

Avant le schéma SQL, l'équipe doit pouvoir démontrer que :

1. les catégories du document 04 sont représentées ou explicitement exclues du lancement;
2. les cinq piliers et les permissions du document 03 ont des propriétaires, liens et règles d'accès identifiables;
3. les états éditoriaux ne sont pas mélangés aux états de demandes, candidatures ou comptes;
4. toute publication peut retrouver son auteur, ses sources, sa dernière vérification et son responsable;
5. les données personnelles ont finalité, confidentialité, conservation, correction et suppression décidées;
6. les contraintes d'unicité et de suppression ne détruisent ni historique métier ni preuves nécessaires;
7. le modèle est validé sur PostgreSQL et comparé à MySQL si l'arbitrage OPEN-006 l'exige.

Les décisions encore nécessaires sont centralisées dans [06](06-decisions-et-points-a-valider.md). La validation de ce modèle et du [contrat API](09-contrats-api.md) est une condition préalable aux migrations.
