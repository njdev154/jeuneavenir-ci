# JeuneAvenir CI

Version pilote d'une plateforme d'orientation pour les lycéens et nouveaux bacheliers ivoiriens. Le site aide à explorer des pistes; il ne décide pas d'une affectation et ne garantit ni admission, ni place, ni emploi. Le catalogue actuel est partiel et plusieurs services ne sont pas encore réels.

## Structure du projet

```
jeuneavenir-ci/
├── index.html                 → Accueil (hero "Horizon", 5 piliers)
├── inscription.html           → Inscription de démonstration (aucun compte en ligne)
├── connexion.html             → Connexion (idem)
├── mot-de-passe-oublie.html   → Information sur la réinitialisation (non active en V1)
├── quiz.html                  → Quiz d'orientation (par série + questions)
├── resultat.html              → Pistes les mieux notées, ex æquo inclus
├── filieres.html               → Liste + recherche + fiche détaillée
├── ecoles.html                  → Liste + filtres (ville/statut/domaine)
├── dashboard.html                → Tableau de bord (jeune/mentor/entreprise)
├── avis.html                      → Formulaire de retour sur le site
├── 404.html                        → Page d'erreur
├── mentorat.html, offres.html  → Pages d'attente; les données fictives sont masquées
├── metiers.html                 → Fiches de métiers (contenu de départ à valider)
├── comparateur.html, profil.html, favoris.html,
│   faq.html, a-propos.html, contact.html,
│   confidentialite.html         → Pages fonctionnelles à des degrés différents
│
├── css/style.css              → Charte graphique principale du site
├── css/assistant.css          → Styles du widget d'orientation
│
├── js/
│   ├── main.js                → Menu mobile, animations, lien actif
│   ├── quiz.js                 → Moteur du quiz (logique interne cachée
│   │                             à l'utilisateur -- voir commentaires)
│   ├── resultat.js              → Calcul et affichage du résultat
│   ├── auth.js                   → Inscription/connexion (simulation V1)
│   ├── dashboard.js                → Tableau de bord dynamique
│   ├── filieres.js                  → Liste + fiche filière
│   ├── ecoles.js                     → Liste + filtres écoles
│   ├── avis.js                        → Formulaire de retour
│   ├── mentors.js, offres.js            → Interfaces branchées; aucune donnée vérifiée publiée
│   ├── assistant.js                    → Assistant local à règles, sans IA générative
│
├── data/
│   ├── questions.json          → 18 questions pour l'auto-réflexion
│   ├── series_filieres.json     → Correspondances internes série/filière, à confirmer
│   ├── matieres_completes.json   → Liste des matières (collège/lycée)
│   ├── filieres.json              → 7 filières détaillées
│   ├── ecoles.json                 → 30 fiches dans 6 villes; associations de filières à réexaminer
│   ├── metiers.json                 → 21 fiches de départ, à valider
│   ├── mentors.json, offres.json     → Listes vides tant qu'aucune donnée réelle n'est validée
│
├── documentation/               → Recherches sources (CSV MESRS, rapport)
├── tests/assistant.test.js       → Tests Node ciblés de l'assistant
│
└── assets/
    ├── icons/logo.svg, favicon.svg
    └── images/
```

## Comment lancer le projet en local

Le quiz et les pages Filières/Écoles chargent des fichiers JSON via `fetch()`,
ce qui **ne fonctionne pas** en ouvrant juste le fichier HTML directement.
Utilise un serveur local :
1. Extension **Live Server** de VS Code (clic droit sur `index.html` → "Open with Live Server"), OU
2. `python3 -m http.server 8000` à la racine, puis ouvrir `http://localhost:8000`

Les tests ciblés de l'assistant se lancent avec `node --test tests/assistant.test.js`.

## Sources et limites des données

- **Orientation post-bac :** [guide du MESRS](https://bac.mesrs-ci.net/guide/orientation), avec recherches par localité, filière et série du bac; il propose aussi un simulateur d'orientation. Ces pages ne prouvent pas à elles seules que notre catalogue est exhaustif ou à jour.
- **Établissements privés :** [liste MESRS des établissements privés autorisés](https://bac.mesrs-ci.net/offres/ets-prives). Les filières et frais ne sont pas toujours renseignés; les frais d'inscription ne sont pas nécessairement les frais complets de scolarité.
- **Baccalauréat :** [portail officiel DECO](https://www.men-deco.org/). Les règles, séries et documents dépendent de la session; vérifier les documents de l'année concernée.
- **Formation technique et professionnelle :** [répertoire METFPA](https://formation-professionnelle.gouv.ci/?page_id=9227) et [écoles privées et filières](https://formation-professionnelle.gouv.ci/?page_id=9479). La date de mise à jour n'est pas toujours affichée.
- **Couverture intégrée :** `data/ecoles.json` contient 30 fiches dans 6 villes. Au 15 novembre 2026, 10 fiches privées ont été rapprochées d'une entrée des listes MESRS des établissements privés ou grandes écoles privées; leur fiche affiche le lien, la date et la portée de la source. Cela atteste seulement que le nom ou sigle et la localité apparaissent sur la liste; sa colonne filières est vide. Onze correspondances école-domaine citent une source directe et sont signalées dans l'interface; pour ISA Santé, la source provient de l'école et l'agrément n'est pas confirmé indépendamment. Les autres correspondances restent à confirmer; les 30 fiches restent à réexaminer pour les programmes et autres données.
- **Traçabilité des fiches :** les éléments `sources` indiquent le nom tel qu'il apparaît dans la source, la localité, la date de consultation et la portée limitée de la vérification. Ne pas en déduire qu'une formation est ouverte, qu'une admission est garantie ou que les frais d'inscription représentent le coût total.
- **Quiz :** le score est une règle interne d'auto-réflexion, pas un test psychométrique validé. Les correspondances série/filière ne confirment pas les conditions officielles d'admission ou d'affectation; vérifier auprès du MESRS et de l'établissement.
- **Recherche non encore intégrée :** le CSV local `documentation/universites_privees_mesrs_2026.csv` contient 145 entrées réparties dans 18 villes. Lors de la consultation du 15 novembre 2026, la liste MESRS en ligne était numérotée jusqu'à 146; le CSV et la page ne sont donc pas synchronisés. Des variantes et erreurs de saisie sont également à rapprocher avant toute intégration. Le CSV ne constitue pas une preuve d'exhaustivité nationale.
- **Mentors et offres :** aucun profil ni annonce réelle n'est publié; les listes des JSON sont vides. Une publication devra être consentie et vérifiée avant d'être ajoutée.
- **Assistant (Phase A) :** `js/assistant.js` applique des règles locales aux JSON du site; ce n'est pas une IA générative et aucune question n'est envoyée à un service externe. Il lit le résultat du quiz dans le stockage local du navigateur. Les mentors/offres ne sont chargés que si leur statut de publication est `verifie`; actuellement, aucune donnée n'est publiée. Pour les écoles, les réponses par domaine ne retiennent que les rattachements marqués confirmés; le relevé reste partiel et les fiches affichent les sources et leur portée.
- **Frais, admissions et bourses :** conserver l'année, la nature précise du frais et la source officielle. Confirmer les montants, critères et échéances auprès du ministère ou de l'établissement avant publication.

## Principes de conception (à respecter en continuant le projet)

- **Une seule couleur de base** (bleu, en variantes `--bleu-900/700/500/100`
  dans `css/style.css`) — pas de nouvelle couleur sans raison forte.
- **Clarté sur le quiz :** le score est interne, non validé psychométriquement,
  et ne doit pas être présenté comme une décision d'affectation ou une prédiction
  d'admission.
- **Honnêteté sur les limites de la V1** : pas de backend; l'authentification
  est simulée en `localStorage`, le mot de passe n'est pas vérifié, et aucune
  offre ni aucun mentor réel n'est publié. Toujours l'indiquer à l'utilisateur.
- **Assistant local** : présenter les résultats comme des pistes, exposer les limites des sources et ne jamais confondre une correspondance dans le catalogue avec une admission, une offre réelle ou un mentor réel.

## État d'avancement

- [x] Structure de dossiers, charte graphique (direction "Horizon")
- [x] Accueil, Inscription, Connexion et Dashboard de démonstration
- [x] Quiz d'auto-réflexion (correspondances série/filière à confirmer) + Résultat
- [x] Filières et premier relevé de 30 établissements (couverture partielle;
      sources par fiche et rattachements à revalider)
- [x] Favicon, page 404, gestion d'erreurs propre
- [x] Comparateur, catalogues métiers, mentors et offres (interfaces présentes;
      métiers à vérifier; aucune publication mentor/offre)
- [x] Assistant local de règles intégré aux pages; les données non publiées sont exclues et les limites du catalogue sont indiquées
- [ ] Concevoir une authentification réelle avant toute collecte de comptes
- [ ] Choisir et mettre en place une base de données avant toute publication dynamique

## Versions du projet

- **V1** (en cours) : site statique pilote, HTML/CSS/JS, données JSON partielles
- **Étapes ultérieures** : authentification, base de données et outils de gestion à concevoir et valider avant publication
- **Phase A** : assistant local non génératif, fondé sur les données du catalogue
- **À évaluer** : conversation générative seulement avec un besoin validé, des sources fiables et un backend protégeant les clés; elle ne doit pas inventer d'admissions, d'offres ou de mentors
