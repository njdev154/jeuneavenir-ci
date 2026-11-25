# Mapping — écrans de référence et dépôt source

Ce tableau sert à guider Codex dans la navigation entre les fichiers existants et les maquettes. Les fichiers HTML de la colonne « Maquette » sont les références autonomes du présent pack, pas les routes finales obligatoires du projet.

| Parcours / écran | Source principale dans le ZIP | Maquette desktop | Notes d'intégration |
|---|---|---|---|
| Accueil | `index.html` | `00_accueil.png` | Comparer aussi `00_accueil-reference-1899x876.png` et la capture source |
| Inscription | `inscription.html`, `js/auth.js` | `01_inscription.png` | Préserver le split-screen apprécié |
| Connexion | `connexion.html`, `js/auth.js` | `02_connexion.png` | Simulation V1 clairement indiquée |
| Mot de passe oublié | `mot-de-passe-oublie.html`, `js/mot-de-passe-oublie.js` | `03_mot-de-passe-oublie.png` | Pas de vrai email sans backend V2 |
| Quiz | `quiz.html`, `js/quiz.js`, `data/questions.json` | `04_quiz-orientation.png` | Ne pas modifier l'algorithme ni la banque |
| Résultat | `resultat.html`, `js/resultat.js` | `05_resultat-quiz.png` | Préserver les données et ex æquo éventuels |
| Comparateur | `comparateur.html`, `js/comparateur.js` | `06_comparateur-filieres.png` | Le README marque ce module comme à terminer |
| Liste filières | `filieres.html`, `js/filieres.js`, `data/filieres.json` | `07_liste-filieres.png` | Connecter les données existantes |
| Fiche filière | `data/filieres.json`, gabarit à créer | `08_fiche-filiere.png` | Gabarit dynamique réutilisable |
| Liste écoles | `ecoles.html`, `js/ecoles.js`, `data/ecoles.json` | `09_liste-ecoles.png` | Préserver filtres et données |
| Fiche école | `data/ecoles.json`, gabarit à créer | `10_fiche-ecole.png` | Gabarit dynamique réutilisable |
| Liste métiers | `metiers.html`, `js/metiers.js`, `data/metiers.json` | `11_liste-metiers.png` | Module annoncé comme à terminer |
| Fiche métier | `data/metiers.json`, gabarit à créer | `12_fiche-metier.png` | Gabarit dynamique réutilisable |
| Annuaire mentors | `mentorat.html`, `js/mentors.js`, `data/mentors.json` | `13_annuaire-mentors.png` | Données d'exemple, à identifier comme telles |
| Fiche mentor | `data/mentors.json`, gabarit à créer | `14_fiche-mentor.png` | Demande de mise en relation prévue V2 |
| Liste offres | `offres.html`, `js/offres.js`, `data/offres.json` | `15_liste-offres.png` | Offres d'exemple, pas des annonces réelles |
| Fiche offre | `data/offres.json`, gabarit à créer | `16_fiche-offre.png` | Candidature réelle prévue V2 |
| Publication offre | `offres/publier`, gabarit à créer | `17_publier-offre.png` | Réservé au rôle Entreprise, fonction V2 |
| Dashboard Jeune | `dashboard.html`, `js/dashboard.js` | `18_dashboard-jeune.png` | Parcours et favoris |
| Dashboard Mentor | `dashboard.html`, `js/dashboard.js` | `19_dashboard-mentor.png` | Demandes et accompagnement |
| Dashboard Entreprise | `dashboard.html`, `js/dashboard.js` | `20_dashboard-entreprise.png` | Offres et candidatures |
| Profil | `profil.html`, `js/profil.js` | `21_profil.png` | CV et informations personnelles selon capacités réelles |
| Favoris | `favoris.html`, `js/favoris.js`, `js/favoris-page.js` | `22_favoris.png` | Préserver stockage local V1 |
| FAQ | `faq.html` | `23_faq.png` | Contenus éditoriaux |
| À propos | `a-propos.html` | `24_a-propos.png` | Présentation du projet |
| Contact | `contact.html`, `js/contact.js` | `25_contact.png` | Ne pas prétendre envoyer si pas de service derrière |
| Confidentialité | `confidentialite.html` | `26_confidentialite.png` | Document à compléter juridiquement avant production |
| Avis utilisateur | `avis.html`, `js/avis.js` | `27_avis-utilisateur.png` | Stockage local actuel, pas une réception serveur |
| 404 | `404.html` | `28_404.png` | Préserver le retour à l'accueil |

## Écrans de versions futures

| Version | Maquette | Portée |
|---|---|---|
| V2 | `28_v2_admin-contenus.png` | Administration des catalogues |
| V2 | `29_v2_mes-candidatures.png` | Suivi des candidatures |
| V2 | `30_v2_demandes-mentorat.png` | Acceptation/refus des demandes |
| V3 | `31_v3_assistant-parcours.png` | Assistant fondé sur données vérifiées |
| V3 | `32_v3_carte-etablissements.png` | Carte interactive d'établissements |

## Vues mobiles fournies

`00_accueil-mobile-390x844.png`, `01_inscription-mobile-390x844.png`, `04_quiz-orientation-mobile-390x844.png`, `07_liste-filieres-mobile-390x844.png`, `15_liste-offres-mobile-390x844.png`, `18_dashboard-jeune-mobile-390x844.png`, `20_dashboard-entreprise-mobile-390x844.png`.
