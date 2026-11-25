# PROMPT À COLLER À L'IA DE VS CODE — Intégration de l'assistant JeuneAvenir CI (Phase A, pack v2 avec verrou compte)

Copie tout le texte entre les deux lignes « DÉBUT » et « FIN » et colle-le à l'IA de VS Code, après avoir copié les fichiers `js/assistant.js` et `css/assistant.css` du pack dans le projet (voir GUIDE_JUNIOR.md).

---

DÉBUT DU PROMPT

Tu travailles sur le projet **JeuneAvenir CI** (site statique HTML/CSS/JS, données en JSON dans `data/`, aucune dépendance, aucun build). Ta mission : intégrer un assistant d'orientation déjà développé, **sans le réécrire et sans rien casser**. Suis les étapes dans l'ordre.

## Étape 0 — Sauvegarde avant tout (obligatoire)

1. Vérifie que tout le travail en cours sur le projet est terminé et enregistré.
2. Fais un commit Git de l'état actuel (par exemple : `État du projet avant intégration de l'assistant`). C'est notre point de retour.
3. Crée et bascule sur une branche nommée `assistant-ia`.

## Étape 1 — Vérifie les fichiers fournis

Deux fichiers ont été ajoutés au projet par Junior (s'ils n'y sont pas, arrête-toi et signale-le, ne les invente pas) :

- `js/assistant.js` — le cerveau + l'interface de l'assistant (autonome, aucun appel extérieur, aucune clé API).
- `css/assistant.css` — ses styles, préfixe unique `jac-assistant-`, palette bleue du site.

Garde ces deux fichiers autonomes, sans dépendance ni appel externe. Si une formulation ou un garde-fou risque de présenter une donnée non vérifiée comme un fait, corrige-le de façon minimale et documente l'écart.

## Étape 2 — Branche l'assistant sur chaque page HTML de la racine

Pour **chaque** fichier `.html` à la racine du projet (liste connue : `404.html`, `a-propos.html`, `avis.html`, `comparateur.html`, `confidentialite.html`, `connexion.html`, `contact.html`, `dashboard.html`, `ecoles.html`, `faq.html`, `favoris.html`, `filieres.html`, `index.html`, `inscription.html`, `mentorat.html`, `metiers.html`, `mot-de-passe-oublie.html`, `offres.html`, `profil.html`, `quiz.html`, `resultat.html`) :

1. **Relis d'abord le fichier actuel** avant de le modifier : le projet a pu évoluer depuis la liste ci-dessus. Si une page a été renommée ou supprimée, ne la recrée pas : signale-la dans ton rapport.
2. Dans le `<head>`, juste avant `</head>`, ajoute exactement :
   `<link rel="stylesheet" href="css/assistant.css">`
3. Juste avant `</body>`, ajoute exactement :
   `<script src="js/assistant.js" defer></script>`
4. Ne touche à rien d'autre dans la page : ni le contenu, ni les autres scripts, ni l'ordre des balises existantes.
5. Si la page contient déjà l'une de ces deux lignes, ne la duplique pas.

## Garde-fous

- Ne modifie pas `css/style.css`, les données JSON, ni les autres fichiers de `js/`.
- N'ajoute aucune dépendance, aucun CDN, aucun script extérieur.
- N'ajoute aucune clé API ni aucun secret, nulle part. L'assistant Phase A n'en a pas besoin : c'est voulu, pour la sécurité.
- Ne renomme aucun fichier ni aucune page.
- Ne réécris pas l'assistant en entier; garde les changements limités aux garde-fous nécessaires et documente tout écart.
- Les données de mentors et d'offres sont vides avec le statut `aucune_publication`; ne crée pas de profils ou d'annonces pour satisfaire des tests hérités.
- Pour une recherche d'école par domaine, ne présente que les rattachements marqués confirmés. Pour les autres recherches, indique les limites du catalogue.
- L'authentification V1 repose sur `localStorage` : le verrou améliore le parcours, mais ne constitue pas un contrôle d'accès sécurisé.

## Étape 3 — Teste (obligatoire, avec un serveur local)

Lance le site avec un serveur local (Live Server ou `python3 -m http.server 8000`), puis vérifie :

1. Sur `index.html` : un bouton « Assistant » apparaît en bas à droite ; le panneau s'ouvre ; le message d'accueil indique que l'assistant consulte le catalogue et signale les informations à confirmer.
2. **Test du verrou compte (nouveau, pack v2)** : en étant DÉCONNECTÉ (ou en navigation privée), pose une question à l'assistant, par exemple « Quelles écoles font l'informatique à Abidjan ? ». Il ne doit donner **aucune réponse de données** (aucune carte), seulement le message demandant de créer un compte ou de se connecter, avec les boutons « Créer un compte » et « Se connecter ». C'est le comportement voulu : l'assistant est réservé aux membres connectés (vérification via la clé `jac_utilisateur_connecte` déjà utilisée par `js/auth.js`). Ne « corrige » pas ce verrou.
3. Crée un compte via la page Inscription (authentification simulée V1), rouvre l'assistant : le message d'accueil doit te saluer par ton nom, et les questions suivantes doivent recevoir des réponses.
4. Pose ces questions et contrôle les réponses :
   - « Quelles filières après un bac A2 ? » → doit proposer **Droit, Communication & Marketing, Gestion & Commerce**.
   - « Quelles écoles font l'informatique à Abidjan ? » → ne montrer que les rattachements confirmés; les fiches doivent signaler la portée des sources et proposer le lien vers la page Écoles.
   - « Quel est le salaire en informatique ? » → doit répondre avec l'estimation du site (**150 000 - 400 000 FCFA/mois**, présentée comme une estimation).
   - « Je cherche un stage en droit » → aucune offre vérifiée n'est actuellement publiée; aucune carte d'offre ne doit apparaître.
   - « Je veux un mentor en informatique » → aucun mentor vérifié n'est actuellement publié; aucune carte de profil ne doit apparaître.
   - « Quelle est la météo demain ? » → l'assistant doit dire honnêtement qu'il n'a pas la réponse dans les données du site (c'est le comportement voulu, pas un bug).
5. Clique sur une carte « Voir la fiche filière » : la fiche correspondante doit s'ouvrir (les liens utilisent les ancres `#id` déjà gérées par le site).
6. Vérifie au format mobile (largeur 360 px) : le panneau ne doit pas dépasser de l'écran.
7. Ouvre la console du navigateur sur 3 pages différentes (dont `quiz.html` et `filieres.html`) : **aucune erreur JavaScript** ne doit apparaître, et les fonctions existantes (quiz, recherche, favoris) doivent toujours marcher.
8. Fais le quiz jusqu'au bout, puis demande à l'assistant « Que me conseilles-tu selon mon résultat de quiz ? » : il doit tenir compte du résultat enregistré.

## Étape 4 — Commit et rapport

1. Fais un commit séparé sur la branche `assistant-ia` : `Ajout de l'assistant d'orientation (Phase A locale)`.
2. Rends à Junior un rapport court avec :
   - la liste exacte des fichiers modifiés ;
   - le résultat de chaque test de l'étape 3 (réussi / échoué, avec le détail si échec) ;
   - toute page de la liste introuvable ou déjà modifiée ;
   - tout écart par rapport à ce prompt, sans exception.

FIN DU PROMPT
