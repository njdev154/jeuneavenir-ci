# JeuneAvenir CI

Plateforme d'orientation en construction pour les lycéens et nouveaux bacheliers ivoiriens. Le site aide à explorer des pistes; il ne décide pas d'une affectation et ne garantit ni admission, ni place, ni emploi. Le catalogue actuel est partiel. Le backend Laravel local contient des routes de session pour développement, désactivées par défaut; l'interface peut être testée localement après activation explicite, mais aucun compte n'est ouvert au public.

## Structure du projet

```
jeuneavenir-ci/
├── index.html                 → Accueil (hero "Horizon", 5 piliers)
├── inscription.html           → Inscription de démonstration par profil (aucun compte en ligne)
├── connexion.html             → Connexion locale avec choix du profil
├── mot-de-passe-oublie.html   → Information sur la réinitialisation (non active en V1)
├── quiz.html                  → Quiz d'orientation (par série + questions)
├── resultat.html              → Pistes les mieux notées, ex æquo inclus
├── filieres.html               → Liste + recherche + fiche détaillée
├── ecoles.html                  → Liste + filtres (ville/statut/domaine)
├── dashboard.html                → Tableau de bord (jeune/mentor/entreprise; professeur rattaché à Mentor)
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
│   ├── quiz.js                 → Parcours du quiz; bascule API Laravel ou pilote statique
│   ├── orientation-api.js      → Contrat client de l’API orientation locale
│   ├── resultat.js              → Affichage des résultats locaux ou de l’API
│   ├── auth.js                   → Formulaires reliés aux sessions Laravel locales (fermés par défaut)
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
├── backend/                    → API Laravel locale, première tranche orientation
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
Pour consulter le pilote statique sans API, depuis la racine :

```powershell
python -m http.server 5500 --bind 127.0.0.1
```

Ouvre ensuite `http://127.0.0.1:5500/`. Cette prévisualisation ne fournit ni comptes ni API.

Les tests ciblés de l'assistant se lancent avec `node --test tests/assistant.test.js`.

### API Laravel locale

PHP 8.4.1+ et Composer sont nécessaires. Depuis `backend/` :

```powershell
composer install
php artisan serve --host 127.0.0.1 --port 8000
```

Ouvre `http://127.0.0.1:8000/` pour le site servi par Laravel sur la même origine. Dans ce mode, le quiz charge sept questions depuis `GET /api/v1/orientation/questionnaire` et envoie à `POST /api/v1/orientation/results` uniquement la série, le jeton et les indices de réponse. L’API ne conserve pas ces réponses; le résultat, qui les contient, reste temporairement dans `sessionStorage` jusqu’à la fermeture de l’onglet et n’est pas lié au compte. Le profil facultatif et le texte libre ne sont pas transmis. La prévisualisation statique conserve son parcours local si l’API répond 404. L’inscription/connexion Jeune peut être testée localement après activation explicite de `ACCOUNTS_ENABLED`; les comptes restent fermés en production. Voir [backend/README.md](backend/README.md) pour les étapes et limites.

### Tests avant contribution

Depuis la racine du dépôt, exécute les tests frontend puis, dans `backend/`, les tests Laravel et l'audit des dépendances :

```powershell
node --test tests/*.test.js
Set-Location backend
php artisan test
composer audit --no-interaction
```

Le workflow GitHub Actions `.github/workflows/tests.yml` exécute ces vérifications sur les push et pull requests; il ne déploie pas le site.

### Préparer le pilote public sur Netlify

Le pilote public est un export statique : `netlify.toml` configure la commande
`node scripts/build-public-site.mjs` et la publication du dossier `dist/`.
Pour un déploiement manuel, exécute cette commande depuis la racine, puis publie
le contenu de `dist/` dans Netlify. Pour un déploiement lié au dépôt, Netlify
doit utiliser la configuration de la racine.

Cet export ne contient ni backend ni comptes, API ou formulaires actifs. Les
réponses du quiz, le profil facultatif et les favoris peuvent rester dans le
navigateur. Le catalogue est partiel; les rattachements non confirmés sont
signalés et doivent être vérifiés avant de les présenter comme des faits.
Aucun site Netlify ni domaine n'est encore créé ou publié; vérifier les limites
et conditions du forfait avant toute mise en ligne.

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
- **Assistant (Phase A, v2) :** `js/assistant.js` applique des règles locales aux JSON du site; ce n'est pas une IA générative et aucune question n'est envoyée à un service externe. Il lit le résultat du quiz dans le stockage du navigateur; dans le mode Laravel local, il reste séparé du compte et peut ne pas recevoir le résultat temporaire conservé dans `sessionStorage`. Son verrou d'interface dépend encore de l'ancien état local du navigateur et ne constitue pas une autorisation de sécurité; les actions privées doivent être contrôlées côté serveur. Les mentors/offres ne sont chargés que si leur statut de publication est `verifie`; actuellement, aucune donnée n'est publiée. Les recherches d'école par domaine ne retiennent que les rattachements confirmés; le relevé reste partiel et les fiches affichent les sources et leur portée.
- **Frais, admissions et bourses :** conserver l'année, la nature précise du frais et la source officielle. Confirmer les montants, critères et échéances auprès du ministère ou de l'établissement avant publication.

## Principes de conception (à respecter en continuant le projet)

- **Une seule couleur de base** (bleu, en variantes `--bleu-900/700/500/100`
  dans `css/style.css`) — pas de nouvelle couleur sans raison forte.
- **Clarté sur le quiz :** le score est interne, non validé psychométriquement,
  et ne doit pas être présenté comme une décision d'affectation ou une prédiction
  d'admission.
- **Honnêteté sur les limites de la V1** : l'API d'orientation ne fonctionne que quand le site est servi par le backend Laravel local; les comptes, eux, restent désactivés par défaut et doivent être activés explicitement pour les essais. L'inscription et la connexion Jeune utilisent alors une session serveur; le tableau de bord n'y affiche que l'identité et ne synchronise ni quiz, ni profil, ni favoris, ni mentorat, ni candidatures. Les autres démonstrations du pilote statique ne deviennent pas des services réels. Aucune offre ni aucun mentor réel n'est publié.
- **Profils de compte** : les formulaires de démonstration distinguent jeune,
  professeur, mentor et entreprise. Le profil professeur utilise le type
  technique Mentor du CDC; seuls les champs actifs sont enregistrés dans le
  navigateur. Ne pas saisir de mot de passe réutilisé ni de donnée sensible.
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
- [x] Première tranche locale de comptes Jeune et tableau de bord limité à la session serveur (pas prête pour le public)
- [ ] Choisir et mettre en place une base de données avant toute publication dynamique

## Versions du projet

- **V1** (en cours) : site statique pilote, HTML/CSS/JS, données JSON partielles
- **Étapes ultérieures** : finaliser l'authentification et concevoir base de données/outils de gestion après validation des prérequis, avant toute publication
- **Phase A** : assistant local non génératif, fondé sur les données du catalogue
- **À évaluer** : conversation générative seulement avec un besoin validé, des sources fiables et un backend protégeant les clés; elle ne doit pas inventer d'admissions, d'offres ou de mentors
