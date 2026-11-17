# Règles métier — JeuneAvenir CI

**Statut :** règles consolidées de travail; les règles marquées « à confirmer » ne sont pas des décisions acquises.
**Portée :** logique des parcours du socle, événements, transitions et cas limites.
**Documents liés :** [Référentiel et périmètre](01-reference-et-perimetre.md), [Rôles et permissions](03-roles-et-permissions.md), [Gouvernance des données](04-gouvernance-des-donnees.md), [Registre des exigences](05-registre-des-exigences.md), [Décisions ouvertes](06-decisions-et-points-a-valider.md).

## 1. Convention de lecture

- **EXISTANT** décrit un comportement trouvé dans le frontend, pas une règle de production.
- **VALIDÉ** décrit une décision du propriétaire ou une règle de référence acceptée.
- **PROPOSITION À VALIDER** indique une règle nécessaire à la conception, non encore approuvée.
- **INCONNU** signifie que les sources disponibles ne permettent pas de définir la règle.

Les règles d'accès sont détaillées dans le document 03; celles de publication, de provenance, de révision et de conservation dans le document 04. Les identifiants `BR-*` sont référencés dans le registre 05.

## 2. Inscription, authentification et compte

### BR-AUTH-01 — Création d'un compte

- **EXISTANT :** le formulaire local valide certains champs, crée un profil dans `localStorage` et ne stocke pas le mot de passe. Les profils jeunes, mentor, professeur et entreprise apparaissent dans le frontend; professeur est représenté comme sous-profil technique de Mentor.
- **Cible :** une création de compte doit produire une identité vérifiable, un profil minimal, un état de compte et les consentements applicables. Un doublon d'identité doit être traité sans révéler des informations sur un autre compte.
- **PROPOSITION À VALIDER :** états de compte possibles : `inscription_en_cours`, `actif`, `suspendu`, `suppression_en_cours`, `supprimé`. L'email de confirmation, le traitement des doublons et les conditions d'âge restent à arbitrer.
- Le compte ne reçoit pas de rôle privilégié par auto-déclaration; les contrôles d'accès sont serveur et définis dans le document 03.

### BR-AUTH-02 — Connexion, déconnexion et sessions

- **EXISTANT :** la connexion locale retrouve un compte par email et profil; le mot de passe n'est pas vérifié. La session est un objet `localStorage`, donc modifiable par l'utilisateur.
- **Règle cible :** une session valide provient uniquement d'un mécanisme d'authentification retenu après validation d'architecture. La déconnexion invalide la session côté service; changer de rôle dans le navigateur ne confère pas d'accès.
- **À CONFIRMER :** fournisseur, durée/renouvellement, révocation, appareils multiples et politique de sessions.
- Les erreurs ne doivent ni divulguer l'existence d'un compte, ni afficher un succès avant l'achèvement de l'opération.

### BR-AUTH-03 — Méthodes sociales et récupération

- Le CDC provisoire demande email/mot de passe, Google, Apple et mot de passe oublié. Le frontend présente les boutons mais les fournisseurs et la réinitialisation ne sont pas actifs.
- Une récupération exige une preuve contrôlée par le titulaire et un jeton à durée et usage limités; aucun lien de récupération n'est à considérer opérationnel tant qu'un fournisseur n'est pas validé et testé.
- **À CONFIRMER :** fournisseurs retenus, parcours de récupération, délais, limitation des tentatives et traitement des comptes compromis.

### BR-AUTH-04 — Changement de rôle, fermeture et suppression

- Aucun utilisateur ne peut s'attribuer un rôle d'administration, de mentor ou d'organisation par simple modification frontend.
- **PROPOSITION À VALIDER :** les demandes de changement de rôle et de propriété d'organisation sont vérifiées et journalisées; un changement ne réattribue pas automatiquement les données ni les droits antérieurs.
- Un effacement doit distinguer suppression du compte, anonymisation de données requises pour une trace, retrait de publications et obligations de conservation. Aucune durée légale ou règle d'effacement sélectif n'est fixée dans les sources examinées.
- La procédure de suppression, l'export, les sauvegardes et leurs délais sont à définir avant collecte de données réelles.

## 3. Orientation et résultats

### BR-ORI-01 — Questionnaire

- **CDC provisoire :** sept questions tirées d'une banque de quatorze, réponses une par une, progression visible et gestion des réponses.
- **EXISTANT :** le code tire sept questions au hasard d'une banque de dix-huit; une question ouverte facultative ajoute un score par mots-clés. Les réponses et le texte libre ne sont pas conservés par le moteur; le dernier résultat l'est localement.
- Le questionnaire est un outil d'exploration, pas un test psychométrique validé, une affectation ou une garantie d'admission.
- **À CONFIRMER :** taille de banque (14 ou 18), règles d'échantillonnage, modèle de score, versionnement et conservation d'un historique. Ne pas modifier le nombre ou l'algorithme avant arbitrage.

### BR-ORI-02 — Calcul et présentation des résultats

- Le résultat doit inclure toutes les filières ex æquo au meilleur résultat; cette règle a été explicitement implémentée et testée.
- Les pistes doivent expliquer leur relation avec les réponses, indiquer les limites et orienter vers des informations vérifiables. Aucune formule interne ne doit être présentée comme une validation scientifique.
- Le résultat doit être filtré par les correspondances de série disponibles; une relation de catalogue n'établit pas l'admissibilité officielle.
- **À CONFIRMER :** contenu d'explication, points forts, compétences à développer, conservation de plusieurs résultats, partage/export et règles de recalcul après évolution de la banque.

### BR-ORI-03 — Historique et favoris

- **EXISTANT :** seul le dernier résultat de quiz est persisté en local; des favoris locaux existent pour plusieurs catalogues.
- L'accès futur à l'historique et aux favoris est limité au propriétaire du compte. Les utilisateurs peuvent retirer leurs favoris; le retrait ne supprime pas l'objet source.
- **À CONFIRMER :** durée de conservation, synchronisation entre appareils, suppression sélective et éventuelle utilisation des résultats pour personnaliser l'assistant.

### BR-ORI-04 — Comparaison

- Le CDC prévoit la comparaison de deux à trois filières, notamment durée, coûts, débouchés et salaires lorsque des données fiables existent.
- Une valeur inconnue reste « non renseignée »; aucune valeur de frais, d'admission ou de salaire n'est déduite d'une fiche non sourcée.
- **À CONFIRMER :** limites exactes, critères obligatoires, format mobile, source et période des valeurs financières.

## 4. Découverte et contenus de référence

### BR-DEC-01 — Catalogue, recherche et fiches

- Les recherches et filtres ne doivent retourner que des contenus conformes au statut et au périmètre de publication.
- Les liens entre filières, formations, établissements et métiers doivent pointer vers des identifiants existants; une relation non vérifiée doit être signalée comme telle.
- Les critères annoncés dans le CDC comprennent ville, budget, durée et type d'établissement; ils ne s'affichent que lorsqu'une donnée fiable les renseigne.
- **EXISTANT :** catalogues JSON partiels et pages de détail souvent ouvertes par ancre; les informations varient par fiche.
- Toute publication suit le cycle du document 04 et doit afficher une date/portée de vérification appropriée.

### BR-DEC-02 — Valeurs inconnues et corrections

- Une donnée absente n'est ni remplacée par une estimation implicite ni affichée comme zéro.
- Les sources soutiennent seulement les faits qu'elles documentent. La présence d'un nom sur une liste ne prouve pas l'agrément d'une filière, l'ouverture d'une formation ou les conditions d'admission.
- Une correction de contenu doit conserver la provenance, l'auteur, la justification et l'historique des versions. Procédure et habilitations sont définies au document 04.

## 5. Mentorat

### BR-MEN-01 — Profil et vérification

- Un profil de mentor n'est publiable qu'après consentement, contrôle d'identité, vérification des informations professionnelles nécessaires et validation éditoriale.
- Le niveau de preuve, le renouvellement des vérifications et la révocation d'un profil restent à définir.
- **EXISTANT :** le catalogue `data/mentors.json` est vide et marqué `aucune_publication`; aucune fiche réelle n'est disponible.

### BR-MEN-02 — Demande de mise en relation

- Une demande doit identifier le jeune demandeur, le mentor visé, le motif minimal, l'état et les dates utiles.
- Seul le mentor destinataire peut consulter la demande; le jeune ne consulte que ses propres demandes.
- **EXISTANT :** la demande et certains statuts sont une démonstration locale, sans transmission ni notification.
- **PROPOSITION À VALIDER — transitions :** `brouillon -> en_attente -> acceptée | refusée`; une demande peut éventuellement être `annulée` par son auteur avant réponse. Le traitement après acceptation, clôture, blocage ou absence de réponse reste à définir.
- Les notifications ne sont émises qu'après un changement réellement validé et livré par le service de notification.

## 6. Insertion professionnelle

### BR-INS-01 — Organisation et offres

- Une organisation doit être vérifiée avant publication; identité, représentant autorisé, contacts et preuve attendue sont à préciser.
- Une offre publiée comporte un responsable, une organisation, un type, un contenu, une localisation, une date et des conditions sourcées ou fournies par l'organisation. La date de fin et les critères de renouvellement sont à confirmer.
- Le statut éditorial de l'offre (document 04) est distinct de son état de recrutement (ouverte, clôturée, expirée, suspendue).
- **EXISTANT :** `data/offres.json` ne contient aucune offre vérifiée; les annonces préparées sont locales et invisibles au catalogue public.
- **PROPOSITION À VALIDER — transitions éditoriales :** brouillon, en attente, vérifiée, publiée, à réviser, refusée, archivée. Une publication n'est pas automatique après saisie.

### BR-INS-02 — Candidatures

- Une candidature ne peut être enregistrée que pour une offre publiée, non expirée et acceptant les candidatures, sous réserve de règles à définir.
- Le candidat consulte uniquement ses propres candidatures. L'organisation destinataire consulte uniquement celles qu'elle est autorisée à traiter.
- Une candidature locale ou un clic sur « postuler » ne vaut jamais transmission. Le système doit distinguer enregistrement, transmission confirmée, échec et retrait.
- **EXISTANT :** les candidatures et statuts de démonstration sont en local; aucune entreprise ne reçoit de dossier.
- **À CONFIRMER :** pièces jointes/CV, consentement de partage, statuts de recrutement, délais, retrait, fermeture d'offre et conservation post-recrutement.

## 7. Compte, confidentialité et opérations sensibles

- Toute donnée personnelle collectée doit être justifiée par une fonctionnalité et minimisée.
- Les consentements, information de confidentialité, rectification, export et suppression doivent être documentés avant la mise en production. La forme exacte du consentement et les obligations applicables doivent être validées par une personne compétente.
- Le texte libre du quiz, les candidatures, demandes de mentorat, CV et informations de mineurs exigent une analyse spécifique avant transfert ou stockage serveur.
- Les opérations sensibles (modification de rôle, publication, décision éditoriale, accès exceptionnel à des dossiers, export/suppression) sont journalisées sans inclure inutilement le contenu sensible.
- Les notifications correspondent à des événements réels; elles ne doivent pas être simulées comme envoyées.
- **À CONFIRMER :** durées de conservation, traitement des mineurs, canal de support, délais et personnes responsables des demandes d'accès/rectification/suppression.

## 8. Erreurs, cas limites et transitions interdites

- Rejeter côté service toute référence d'objet inexistante, tout rôle non autorisé, état incohérent ou valeur de transition invalide.
- Ne pas accepter un prix, résultat, état de candidature ou statut de publication fourni uniquement par le frontend comme preuve fiable.
- Une erreur d'enregistrement doit être visible et ne doit pas produire un succès apparent.
- Une corruption de données ne doit pas déclencher d'écrasement silencieux ni une valeur par défaut qui supprime le contenu existant.
- Une offre « brouillon » ou « à vérifier » ne peut pas être présentée au public comme publiée.
- Un refus ou une suspension doivent être traçables et, lorsque cela est approprié, expliquer le recours; les modalités restent à spécifier.
- Les règles de restauration après incident, d'idempotence et de concurrence de mise à jour restent à définir dans la conception technique.

## 9. Mineurs et interactions

Le public comprend potentiellement des lycéens mineurs. Avant d'ouvrir des échanges avec mentor, organisation ou communauté, il faut établir l'âge minimal, l'information et le consentement requis, les limites de visibilité, les règles de contact, le traitement des signalements et la procédure d'incident. Ces règles ne sont pas définies par les sources disponibles; aucune interaction sociale réelle ne doit être activée sur la seule base de ce document.
