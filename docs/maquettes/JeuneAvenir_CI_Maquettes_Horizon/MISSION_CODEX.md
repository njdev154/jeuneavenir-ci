# Mission Codex — Refonte visuelle JeuneAvenir CI « Horizon »

## 1. Objectif

À partir du dépôt JeuneAvenir CI existant, appliquer une refonte visuelle professionnelle, cohérente et responsive en prenant comme références principales :

1. `assets/references/REFERENCE_ACCUEIL_FOURNIE.png` : source visuelle prioritaire pour l'accueil et l'identité ;
2. `01_maquettes_desktop/` : captures de référence des écrans desktop ;
3. `02_maquettes_mobile/` : captures de référence des vues mobiles ;
4. `DESIGN_SYSTEM.md` et `MAPPING_ECRANS.md` : règles de marque et correspondances.

Le pack remplace le précédent pack de maquettes. Ne pas réutiliser les anciennes propositions terracotta ou les maquettes visuelles précédentes qui ne correspondent pas à la capture du projet.

## 2. Direction de marque obligatoire

Respecter strictement le projet existant et la capture de référence :

- bleu nuit `#0B2545` ;
- bleu intermédiaire `#163F6F` ;
- bleu accent `#4C9FE8` ;
- bleu clair `#EAF3FC` ;
- texte principal `#16233B` et secondaire `#5B6B82` ;
- Instrument Serif pour les titres ;
- Manrope pour les textes, contrôles et navigation ;
- logo boussole original du dossier `assets/icons/`.

Ne pas adopter la charte terracotta/Fraunces/Inter du paragraphe design du CDC : la dernière consigne explicite de l'utilisateur confirme que la charte du dépôt et la capture bleue doivent être conservées. Ne pas mélanger les deux identités.

Ne pas redessiner le logo. Ne pas ajouter une troisième police, des couleurs vives non prévues, des illustrations générées, des photos de stock ou des effets décoratifs gratuits.

## 3. Accueil — écran de référence prioritaire

Reproduire l'esprit et les proportions de la capture utilisateur, tout en corrigeant l'alignement, les espacements et la finition :

- header bleu nuit avec la boussole à gauche ;
- navigation de premier niveau au centre ; Connexion et Inscription à droite ;
- accroche « TON PARCOURS, DU LYCÉE À L'EMPLOI » ;
- titre sur deux lignes, exactement : « Ton avenir a un horizon. » puis « Avance vers lui. » ;
- le mot « horizon. » reste sur la première ligne, en bleu accent et italique ;
- paragraphe centré, largeur confortable et lisible ;
- CTA principal sombre « Explorer mes pistes d'orientation » ;
- CTA secondaire « Consulter les établissements » avec contour clair ;
- dégradé vertical bleu nuit vers bleu accent, sans remplacer l'identité ;
- formes abstraites périphériques très discrètes.

Le rendu ne doit pas contenir le message du navigateur « Cliquez pour revenir en arrière, maintenez pour voir l'historique » : il s'agit d'une infobulle du navigateur présente dans la capture source, pas du site.

Ne pas remplacer le slogan ni ajouter une photo au hero : la force de la composition de référence est son titre typographique.

## 4. Inscription — préserver le principe apprécié

L'écran d'inscription du premier pack a été apprécié par l'utilisateur. Conserver son principe de mise en page en deux zones : panneau de marque bleu nuit et formulaire clair. Le rendre cohérent avec la capture d'accueil et les polices/couleurs originales.

Le formulaire doit présenter les trois types de compte du CDC : Jeune, Mentor et Entreprise. Les champs restent vides ou avec des exemples explicitement identifiés comme exemples ; aucune identité, adresse e-mail ou mot de passe prérempli ne doit donner l'impression d'être un vrai compte.

Google et Apple restent visuellement identifiés mais leur disponibilité doit correspondre à l'état réel de la V1. Ne jamais afficher un succès de connexion simulé comme une authentification réellement sécurisée.

## 5. Périmètre des pages

Intégrer toutes les pages du CDC en utilisant des composants et gabarits communs : accueil ; inscription ; connexion ; mot de passe oublié ; quiz ; résultat ; comparateur ; liste et fiche filière ; liste et fiche école ; liste et fiche métier ; annuaire et fiche mentor ; liste et fiche offre ; publication d'offre ; dashboard ; profil ; favoris ; FAQ ; à propos ; contact ; confidentialité.

La page `avis.html`, déjà présente dans le ZIP du projet, doit aussi conserver une présentation cohérente. La page 404 est également incluse.

Réutiliser les gabarits de fiche : ne pas coder à la main une nouvelle page pour chaque filière, école, métier, mentor ou offre.

Les trois dashboards doivent être réellement distincts selon le type de compte :
- Jeune : orientation, favoris, candidatures et progression ;
- Mentor : demandes, accompagnement et disponibilités ;
- Entreprise : offres publiées, candidatures et suivi de recrutement.

La publication d'offre est réservée au compte Entreprise.

## 6. Écrans complémentaires et statut

Les écrans suivants sont des vues de conception pour des versions ultérieures :

- V2 : administration des contenus ; suivi des candidatures ; demandes de mentorat ;
- V3 : assistant de parcours ; carte des établissements.

Ils doivent être séparés et marqués comme futurs dans la documentation. Ne pas les faire apparaître dans les menus V1 ou les présenter comme des fonctions disponibles.

## 7. Source de vérité du projet

Avant toute modification, relire le dépôt existant : `css/style.css`, les fichiers HTML, `js/`, `data/`, `assets/icons/` et `README.md`.

Conserver autant que possible :
- les structures de données JSON ;
- les sélecteurs/identifiants DOM utilisés par les scripts existants ;
- le comportement du quiz ;
- la simulation d'authentification V1 ;
- les favoris et les données locales ;
- les contrats déjà utilisés par les scripts JavaScript.

Ne pas renommer ou supprimer une classe, un `id`, un attribut `data-*` ou un chemin de fichier tant que les dépendances JS n'ont pas été vérifiées.

### Données présentes dans le ZIP

- 7 filières ;
- 30 établissements ;
- 21 métiers ;
- 7 mentors d'exemple ;
- 7 offres d'exemple ;
- 18 questions dans `data/questions.json`.

Les mentors et les offres sont des contenus d'exemple : afficher une mention honnête de démonstration tant qu'il n'existe pas de données réelles validées. Les établissements ont des sources et une date de vérification dans les données/documentation ; ne pas garantir leur actualité sans nouvelle vérification.

## 8. Points métier à ne pas modifier dans cette mission

1. **Quiz** : le CDC prévoit 7 questions tirées d'une banque de 14. Le dépôt contient 18 questions JSON, et certains textes README/écrans parlent d'un nombre différent. Ne pas changer le nombre de questions, la banque ou l'algorithme dans cette mission de design. Conserver le comportement actuel et faire remonter le conflit comme décision métier.
2. **Authentification** : CDC V1 = écran et simulation clairement présentés comme tels ; V2 = Supabase Auth. Ne pas coder une authentification maison, ne pas enregistrer ou afficher des mots de passe en clair et ne pas prétendre que Google/Apple fonctionnent sans intégration réelle.
3. **Mentorat, offres, métiers, comparateur** : le README de l'archive indique que plusieurs modules sont encore en cours ou en placeholder. Le fait de créer une présentation visuelle ne signifie pas que les demandes, annonces ou comparaisons sont opérationnelles.
4. **Avis** : le stockage local du formulaire ne transmet pas automatiquement le retour à l'équipe. Ne pas présenter ce flux comme une transmission effective.
5. **Données d'exemple** : les cartes et métriques inventées pour la démonstration ne doivent pas être affichées comme des statistiques réelles.

## 9. Méthode attendue

1. Faire l'inventaire des fichiers et des comportements existants.
2. Construire une table `fichier actuel → page cible → composants/JS dépendants`.
3. Refondre d'abord le système partagé : header, navigation, footer, boutons, champs, cards, filtres, tables, sidebar, alertes/états, responsive.
4. Intégrer ensuite les pages publiques et leurs gabarits, puis les trois dashboards, puis les pages institutionnelles.
5. Réutiliser les JSON et scripts existants. Ne pas remplacer les données par des exemples arbitraires.
6. S'assurer que les contrôles actifs conduisent vers un écran ou une action réelle. Pour les fonctions non prêtes, afficher « Bientôt disponible » ou un état clairement inactif.
7. Préserver le fonctionnement du projet, ses chemins et son lancement local.
8. Documenter les écarts entre maquettes et implémentation plutôt que masquer les fonctionnalités non réalisées.

## 10. Tests et critères d'acceptation

Vérifier au minimum les largeurs 1899, 1440, 1024, 768 et 390 px. L'accueil doit être comparé à `REFERENCE_ACCUEIL_FOURNIE.png` et à `00_accueil-reference-1899x876.png`.

Critères :
- le titre d'accueil reste sur deux lignes, et « horizon. » est sur la première ligne aux largeurs desktop ;
- le header, les couleurs, le logo et les polices correspondent à la charte ;
- l'inscription garde le principe en deux panneaux ;
- les pages se ressemblent visuellement mais restent adaptées à leurs objectifs ;
- les trois dashboards ne sont pas de simples recolorations ;
- le menu mobile fonctionne et aucune page ne déborde horizontalement ;
- focus clavier, labels, erreurs, états vides, longues chaînes et contraste sont vérifiés ;
- aucun bouton ne confirme une action qui ne s'est pas réellement produite ;
- pas de régression du quiz, des favoris, de l'auth simulée ou des vues existantes.

## 11. Limites explicites de la mission

Cette mission porte sur la refonte visuelle et l'intégration des écrans dans le code existant. Sans autorisation séparée :
- ne pas installer de dépendance ;
- ne pas changer HTML/CSS/JS vanilla pour un framework ;
- ne pas créer de backend ou de base de données ;
- ne pas brancher Supabase ;
- ne pas modifier l'algorithme du quiz ou le modèle de données ;
- ne pas réécrire les données de catalogue ;
- ne pas déployer en production.

## 12. Rapport final exigé

Fournir un retour structuré avec :
1. fichiers modifiés et justification ;
2. pages intégrées et gabarits créés ;
3. composants partagés ;
4. comportements réellement testés ;
5. tests responsive et accessibilité effectués ;
6. écarts restant avec les captures ;
7. fonctions toujours simulées ou non disponibles ;
8. incohérences nécessitant une décision métier.

Ne pas déclarer une page terminée parce qu'elle est uniquement stylée : son parcours et ses actions doivent aussi avoir été vérifiés.
