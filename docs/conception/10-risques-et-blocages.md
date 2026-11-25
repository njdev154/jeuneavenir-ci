# Registre des risques et blocages — JeuneAvenir CI

**Statut :** registre de travail; aucun risque marqué résolu n'est considéré comme résolu sans preuve.
**Dernière mise à jour :** 18 novembre 2026
**Documents liés :** [index](00-INDEX-GENERAL.md), [architecture](07-architecture-cible.md), [rôles](03-roles-et-permissions.md), [gouvernance](04-gouvernance-des-donnees.md), [décisions](06-decisions-et-points-a-valider.md)

## Échelle

- **Gravité :** Critique / Élevée / Moyenne / Faible.
- **Probabilité :** Élevée / Moyenne / Faible / À évaluer.
- **Statut :** Ouvert / Bloquant / À surveiller / Préparation en cours / Résolu avec preuve.

Un statut « Résolu avec preuve » exige une validation, un test ou une documentation vérifiable, pas une déclaration d'intention.

## Registre

| ID | Risque ou blocage | Gravité | Probabilité | Conséquence | Mesure de réduction proposée | Responsable de validation | Statut |
|---|---|---:|---:|---|---|---|---|
| RSK-001 | Hébergement compatible avec Laravel, PHP, PostgreSQL/MySQL, HTTPS, sauvegardes et tâches. | Critique | À évaluer | Projet non déployable, coûts inattendus ou perte de données. | Comparer au moins deux hébergeurs, versions supportées, extensions, restauration, logs et coûts récurrents. | À désigner | Bloquant |
| RSK-002 | Coût d'exploitation et évolutivité inconnus. | Élevée | Moyenne | Arrêt du service ou dette de migration. | Estimer développement, hébergement, domaine, e-mail, stockage, sauvegardes, observabilité et support sur 12 mois. | Propriétaire + responsable technique à désigner | Bloquant |
| RSK-003 | La tranche d'authentification locale est testée, mais l'authentification destinée au public n'est pas complète ni approuvée. | Critique | Élevée | Usurpation de compte, prise de contrôle, non-respect des consentements. | Avant toute ouverture, valider vérification d'e-mail, récupération, sessions, révocation, règles mineurs et limites de tentatives; garder les comptes publics fermés. | Responsable technique à désigner | Bloquant |
| RSK-004 | Rôles et permissions canoniques non tranchés. | Critique | Élevée | Accès horizontal/vertical non autorisé, brouillage des espaces Jeune/Mentor/Organisation/Admin. | Finaliser OPEN-004, la matrice 03, les mappings technique et les tests négatifs. | Propriétaire + responsable sécurité | Bloquant |
| RSK-005 | Isolation insuffisante des données entre organisations. | Critique | À évaluer | Une organisation accède aux offres ou candidatures d'une autre. | Scoper toutes les requêtes par organisation, appliquer policies Laravel et tester des organisations distinctes. | Responsable technique/sécurité | Bloquant |
| RSK-006 | Protection insuffisante des données personnelles. | Critique | Élevée | Accès, divulgation ou utilisation abusive de profils, candidatures, CV ou demandes. | Minimisation, chiffrement HTTPS, stockage privé, contrôles serveur, consentements, durée et journalisation minimale. | Propriétaire + personne compétente pour les obligations locales | Bloquant |
| RSK-007 | Utilisateurs mineurs activés sur des interactions sociales ou professionnelles. | Critique | À évaluer | Risque physique ou psychologique, contact non autorisé, exposition de données. | Ne pas activer mentorat/communauté/organisation avant âge, consentement, visibilité, modération et incident validés. | Propriétaire + responsable juridique/sécurité à désigner | Bloquant |
| RSK-008 | Durées de conservation, export, rectification et suppression non définies. | Critique | Élevée | Non-conformité possible, stockage excessif ou impossibilité d'effacer. | Réviser chaque catégorie avec une personne compétente puis enregistrer les durées et procédures. | Responsable de gouvernance à désigner | Bloquant |
| RSK-009 | CV, portfolios ou pièces jointes non protégés. | Critique | Moyenne | Fuite de documents sensibles ou exécution de fichiers malveillants. | Stockage privé, formats/taille, contrôle d'accès, analyse antivirus si disponible, liens temporaires et suppression. | Responsable technique/sécurité | Bloquant |
| RSK-010 | Communauté ou modération lancée avant règles suffisantes. | Élevée | À évaluer | Harcèlement, abus ou contenu nuisible non maîtrisé. | Définir signalement, modération, escalade, recours, mineurs et limites avant activation. | Propriétaire + responsable modération à désigner | À surveiller |
| RSK-011 | Informations publiques non vérifiées ou non traçables. | Critique | Élevée | Induire les jeunes en erreur sur écoles, admissions, frais, mentors ou offres. | Workflow provenance-vérification-publication, responsable nominatif et affichage de la portée. | Administrateur éditorial à désigner | Bloquant |
| RSK-012 | Sauvegardes jamais testées ou restauration impossible. | Critique | Moyenne | Perte durable des comptes, candidatures ou contenus vérifiés. | Sauvegardes chiffrées automatisées, restauration périodique et exercice documenté de rollback. | Exploitant à désigner | Bloquant |
| RSK-013 | Gestion des incidents et des secrets insuffisante. | Critique | Moyenne | Compromission prolongée, divulgation de clés ou indisponibilité. | Gestionnaire de secrets, rotations, alertes, procédure incident, journalisation et revue des accès. | Responsable technique/sécurité | Bloquant |
| RSK-014 | Disponibilité et performance sans objectif ni test. | Élevée | À évaluer | Site lent ou indisponible; saturation des parcours critiques. | Définir cibles, protocole de charge, jeux synthétiques et seuils; 50 simultanés et 10 000 utilisateurs sont des notions distinctes. | Responsable exploitation/produit | Bloquant |
| RSK-015 | Le routage même origine est éprouvé localement sur une tranche limitée; la compatibilité complète et le déploiement restent à démontrer. | Moyenne | Moyenne | Migration lente, doublons ou régressions d'accessibilité. | Garder le frontend et ses CSS; élargir progressivement avec tests d'accessibilité et de parcours avant tout pilote hébergé. | Responsable frontend | À surveiller |
| RSK-016 | La stratégie d'origine de production n'est pas arbitrée; seul le prototype local est même origine. | Élevée | Moyenne | CORS, CSRF, cookies ou complexité d'exploitation mal maîtrisés. | Confirmer le besoin réel d'une SPA/API tierce; privilégier même origine sauf justification et valider les cookies/CSRF sur l'hébergement retenu. | Responsable architecture | Bloquant |
| RSK-017 | PostgreSQL préféré mais choix définitif non confirmé. | Élevée | Élevée | Migration ou coûts supplémentaires si le moteur est changé tardivement. | Comparer hébergeurs, coûts, compétences, contraintes SQL, sauvegardes et restauration. | Propriétaire + responsable technique | Bloquant |
| RSK-018 | MySQL choisi sans vérifier version, moteur ou contraintes. | Élevée | Moyenne | Perte de garanties de transaction, index ou contraintes; écart entre environnements. | Si MySQL est retenu, verrouiller les versions, moteur, contraintes et migrations testées. | Responsable technique | Ouvert |
| RSK-019 | Docker ou Redis ajoutés sans besoin démontré. | Moyenne | Moyenne | Complexité opérationnelle, coût et dette sans bénéfice utilisateur. | Utiliser Redis/cache/files seulement après seuil de charge ou besoin transactionnel identifié. | Responsable technique | À surveiller |
| RSK-020 | Assistant IA génératif activé trop tôt ou avec des clés côté navigateur. | Critique | Moyenne | Réponses inventées, fuite de données, coût et violation de confidentialité. | Garder l'assistant local jusqu'à sources, consentement, architecture serveur, budget et tests validés. | Propriétaire + responsable sécurité | Bloquant |
| RSK-021 | Le prototype tire 7 questions d'une banque locale de 18 et calcule une piste heuristique; le choix de banque et la méthode de score ne sont pas validés. | Élevée | Élevée | Résultat incohérent ou présenté comme fiable malgré une méthodologie non validée. | Valider banque, tirage, version, ex æquo, explications et état psychométrique avec un responsable pédagogique; maintenir le résultat comme exploratoire et ne pas le présenter comme affectation. | Propriétaire produit + responsable pédagogique à désigner | Bloquant |
| RSK-022 | Données de catalogues JSON importées avant vérification. | Critique | Élevée | Faux établissements, formations, admissions ou frais publiés comme réels. | Import en préparation non publié, rapprochement des sources, validation humaine et rapport d'écarts. | Responsable éditorial | Bloquant |
| RSK-023 | Abus sur formulaires publics, récupération et candidatures. | Élevée | Moyenne | Spam, comptes compromis, coûts e-mail ou déni de service. | Limitation de débit, verification progressive, anti-abus cohérent avec l'accessibilité et journalisation. | Responsable sécurité | Bloquant |
| RSK-024 | XSS, injection ou injections indirectes dans les contenus. | Critique | Moyenne | Exécution de script ou exposition de données dans les pages publiques ou privées. | Validation serveur, encodage de sortie selon contexte, requêtes paramétrées, nettoyage des documents et tests. | Responsable technique/sécurité | Bloquant |
| RSK-025 | Conflit documentaire entre CDC Auguste, PDF présumé consolidé, Mission Directrice et état réel. | Élevée | Élevée | Implémentation sur des règles dépassées ou contradictoires. | Conserver les contradictions, identifier les sources par date et utiliser DEC/OPEN comme autorité. | Propriétaire du projet | Ouvert |
| RSK-026 | Responsables nominaux de saisie et validation absents. | Critique | Élevée | Impossible d'appliquer le principe de traçabilité des données publiées. | Nommer titulaire, suppléant, périmètre, source acceptée et calendrier de révision par catégorie. | Propriétaire | Bloquant |
| RSK-027 | Workflow de mentorat ou candidatures incomplet. | Élevée | Élevée | Demandes ou candidatures sans état fiable, conséquences ou recours. | Valider les états, transitions, délais, annulation, clôture, historique et notifications avant implémentation. | Propriétaire produit | Bloquant |
| RSK-028 | React ou Tailwind réintroduits sans besoin. | Moyenne | Moyenne | Réécriture complète, régression visuelle, coût et retard. | Ne pas réécrire; mesurer une tranche pilote TypeScript et obtenir une nouvelle décision si React devient nécessaire. | Propriétaire + responsable frontend | À surveiller |

## Blocages obligatoires avant collecte réelle, ouverture publique ou production

Le prototype local autorisé par DEC-015 ne lève aucun de ces blocages. Les éléments suivants doivent être résolus ou suspendus explicitement avant une mise en production ou l'ouverture d'un parcours qui collecte des données :

1. Hébergement compatible Laravel et base SQL.
2. Choix PostgreSQL/MySQL.
3. Rôles canoniques et modèle d'autorisation.
4. Règles compte, authentification, récupération et sessions.
5. Gouvernance des données, responsables et conservation.
6. Règles mineurs et interactions sociales.
7. États mentorat, candidatures et offres.
8. Modèle conceptuel et contrats API acceptés.
9. Stratégie même origine ou séparation frontend/API.
10. Sauvegarde, restauration, supervision et incident.
