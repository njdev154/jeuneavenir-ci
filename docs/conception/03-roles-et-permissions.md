# Rôles et permissions — JeuneAvenir CI

**Statut :** matrice cible de conception; les mappings de rôles signalés à confirmer ne sont pas des rôles actuellement sécurisés.
**Documents liés :** [Référentiel](01-reference-et-perimetre.md), [Règles métier](02-regles-metier.md), [Gouvernance](04-gouvernance-des-donnees.md), [Exigences](05-registre-des-exigences.md), [Décisions ouvertes](06-decisions-et-points-a-valider.md).

## 1. Principes d'autorisation

1. L'interface peut masquer des actions, mais **ne constitue jamais la frontière de sécurité**. Chaque opération sensible est autorisée côté serveur.
2. Le refus est la valeur par défaut; l'accès est attribué au minimum nécessaire et limité à l'organisation, au dossier ou à l'objet concerné.
3. L'identifiant connu ou deviné d'un objet ne donne pas accès à cet objet. Toute lecture/modification est vérifiée contre le propriétaire, le destinataire, l'organisation et l'état métier.
4. Aucun utilisateur ne peut s'attribuer un rôle, créer un rôle privilégié ou modifier les permissions d'autrui par une requête frontend.
5. Les rôles d'administration éditoriale et technique sont séparés; aucun privilège technique n'est accordé automatiquement à l'équipe éditoriale.
6. Les accès exceptionnels aux données personnelles sont justifiés, limités, journalisés et audités.
7. Avec Supabase, si ce choix est validé, chaque table exposée doit disposer de politiques RLS et de tests positifs et négatifs par rôle. RLS n'est pas encore présente dans le dépôt.

## 2. Taxonomie des rôles

| Rôle cible | Objet | État / mapping |
|---|---|---|
| Visiteur | Parcourir les contenus publics publiés et les informations institutionnelles. | Existant comme état non connecté; le comportement complet est à vérifier par page. |
| Jeune / candidat | Gérer son propre profil, ses résultats, favoris, demandes et candidatures. | Le CDC utilise Jeune; « candidat » décrit une fonction. Leur identité comme rôle unique est à confirmer. |
| Mentor | Gérer un profil professionnel et traiter les demandes qui lui sont destinées. | Type de compte mentionné dans le CDC; le catalogue est actuellement vide. |
| Recruteur / organisation | Gérer une organisation vérifiée, ses offres et les candidatures qu'elle est autorisée à consulter. | Le CDC utilise Entreprise; rattachement entre utilisateur, organisation et représentants à définir. |
| Administrateur éditorial | Créer, corriger, vérifier, publier, réviser ou archiver des contenus selon les habilitations. | Absent du frontend courant; rôle cible demandé par Mission 10. |
| Administrateur technique | Gérer configuration, disponibilité, sécurité et opérations techniques minimales. | Absent du frontend courant; rôle cible demandé par Mission 10. |
| Professeur / encadreur | Sous-type ou acteur distinct, selon les besoins d'accompagnement. | Le frontend le représente comme sous-profil de Mentor; sa place dans le modèle cible reste à confirmer. |

La présence d'un libellé de rôle dans un formulaire local n'est pas une preuve de vérification d'identité, d'organisation ou de permission.

## 3. Matrice d'accès cible

Légende : **P** = public/lecture publiée; **S** = données propres ou objets explicitement attribués; **O** = périmètre de son organisation; **E** = droit éditorial attribué; **T** = droit technique attribué; **—** = refus par défaut. Toute valeur est à implémenter et tester côté serveur.

| Ressource / action | Visiteur | Jeune / candidat | Mentor | Recruteur / organisation | Admin éditorial | Admin technique |
|---|---:|---:|---:|---:|---:|---:|
| Lire catalogues publiés | P | P | P | P | P | P |
| Lire brouillons, preuves internes et notes de validation | — | — | — | — | E | — par défaut |
| Créer/modifier son profil privé | — | S | S | S | — | — par défaut |
| Lire profil privé d'un autre utilisateur | — | — | — | — | — par défaut | — par défaut |
| Gérer ses favoris | — | S | S | S | — | — |
| Lire/modifier ses résultats et historiques | — | S | — | — | — | — par défaut |
| Créer une demande de mentorat | — | S | — | — | — | — |
| Lire une demande de mentorat | — | S (auteur) | S (destinataire autorisé) | — | — par défaut | — par défaut |
| Accepter/refuser une demande | — | — | S (destinataire) | — | — | — |
| Créer une organisation ou demande de vérification | — | — | — | S (représentant) | E (validation éditoriale) | — |
| Créer/modifier une offre en brouillon | — | — | — | O (représentant autorisé) | E selon workflow | — |
| Vérifier/publier/modérer une offre | — | — | — | — | E | T uniquement si procédure de sécurité |
| Lire candidatures | — | S (candidat) | — | O (offres et candidatures autorisées) | — par défaut | — par défaut |
| Créer/retirer une candidature | — | S | — | — | — | — |
| Modifier état de recrutement | — | — | — | O (offre autorisée; motif tracé) | — par défaut | — |
| Publier/retirer contenu de référence | — | — | — | — | E | — par défaut |
| Gérer les rôles et permissions | — | — | — | — | — | T, par procédure séparée |
| Voir journaux d'audit | — | — | — | — | E, périmètre éditorial limité | T, périmètre technique limité |
| Modérer signalements/contenus | — | — | — | — | E selon mandat | T pour incidents techniques uniquement |

Cette matrice est une proposition de conception dérivée des exigences Mission 10. Les périmètres exacts, accès administratifs et exceptions doivent être approuvés avant implémentation.

## 4. Limites d'accès aux données personnelles

- **Jeune/candidat :** accès aux données de son compte et à ses propres résultats, demandes et candidatures; aucune lecture des dossiers d'autres jeunes.
- **Mentor :** accès uniquement aux demandes qui lui sont destinées et dans l'état qui autorise leur traitement. Le profil public ne doit pas exposer les coordonnées privées sans accord.
- **Organisation/recruteur :** accès aux offres de son organisation et aux candidatures auxquelles elle est autorisée. Un rôle de recrutement ne donne pas accès à tout le profil d'un jeune; tout partage de CV ou de coordonnées doit suivre le consentement et la règle validée.
- **Administration éditoriale :** accès aux contenus nécessaires à la vérification; pas d'accès par défaut aux candidatures, demandes privées, résultats individuels ou documents.
- **Administration technique :** pas d'accès de routine au contenu personnel. Une intervention exceptionnelle doit être motivée, limitée dans le temps, tracée et revue.
- **Visiteur :** aucune donnée de compte ou donnée privée.

Les niveaux de confidentialité et durées sont détaillés dans le document 04 et restent à arbitrer selon les obligations applicables.

## 5. Attribution, changement et révocation

- Le rôle initial attribué lors de l'inscription ne suffit pas à autoriser une publication ou une fonction sensible.
- Les privilèges mentor et organisation nécessitent une procédure de vérification qui reste à définir.
- Les rôles éditorial et technique sont accordés nominativement par une autorité autorisée; le mécanisme de nomination et de révocation est à définir.
- Un changement d'organisation, de rôle ou de statut suspend les accès devenus incompatibles; les actions antérieures restent auditées.
- Une organisation peut comporter plusieurs utilisateurs avec des habilitations différentes; le modèle de délégation et de sortie d'un membre est à définir.
- Les actions de rôle privilégié ne doivent pas être modifiées par le détenteur lui-même sans seconde validation.

## 6. Modèle de politique serveur

La conception détaillée devra choisir les contrôles correspondants à la plateforme retenue. Minimum attendu :

1. Authentifier l'acteur et vérifier l'état de sa session.
2. Charger son rôle et ses habilitations depuis une source de confiance.
3. Vérifier la relation à l'objet : propriétaire, destinataire, organisation, publication et état.
4. Valider le contenu et la transition métier demandée.
5. Refuser toute propriété privilégiée envoyée par le client si elle n'est pas autorisée.
6. Enregistrer un événement d'audit pour les opérations sensibles.
7. Tester également les refus, y compris les accès horizontaux (autre utilisateur/organisation) et verticaux (rôle supérieur).

Si Supabase est retenu, RLS doit être activée et testée pour toutes les tables et opérations exposées. Une clé de service ou un rôle de contournement ne doit jamais être livré au navigateur.

## 7. Tests d'autorisation requis

- Accès à sa propre candidature, puis refus de celle d'un autre candidat.
- Accès d'un mentor à sa demande attribuée, puis refus d'une demande adressée à un autre mentor.
- Accès d'une organisation à ses offres/candidatures autorisées, puis refus des objets d'une autre organisation.
- Tentative de modifier `role`, `organization_id`, statut de publication ou décision d'embauche via une requête directe.
- Tentatives de publication par un visiteur, un jeune ou un mentor.
- Séparation des droits éditoriaux et techniques; test du refus d'accès aux données personnelles non nécessaires.
- Révocation d'un rôle, d'une session ou d'un représentant; accès refusé après révocation.
- RLS par table si Supabase est choisi; tests négatifs sur lectures, insertions, mises à jour et suppressions.

Les tests ne sont pas encore exécutables sur un backend inexistant; leur réalisation dépend de l'architecture et du modèle de données validés.
