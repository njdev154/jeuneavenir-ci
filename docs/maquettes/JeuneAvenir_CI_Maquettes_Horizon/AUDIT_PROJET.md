# Audit du dépôt source — JeuneAvenir CI

Audit réalisé à partir du ZIP `jeuneavenir-ci.zip` et du cahier des charges définitif transmis dans la conversation. Il s'agit d'un état du dépôt au moment de l'analyse, pas d'une vérification des informations en ligne.

## 1. Structure trouvée

- 21 fichiers HTML à la racine.
- Une feuille CSS principale : `css/style.css`.
- Scripts dans `js/`.
- Données JSON dans `data/`.
- Logos et icônes dans `assets/icons/`.
- Dossier `assets/images/` présent mais sans photographie de contenu dans le ZIP.
- Documentation présente, dont des documents et un CSV de sources relatives aux établissements.

Fichiers HTML trouvés : `index.html`, `inscription.html`, `connexion.html`, `mot-de-passe-oublie.html`, `quiz.html`, `resultat.html`, `filieres.html`, `ecoles.html`, `metiers.html`, `mentorat.html`, `offres.html`, `comparateur.html`, `dashboard.html`, `profil.html`, `favoris.html`, `faq.html`, `a-propos.html`, `contact.html`, `confidentialite.html`, `avis.html`, `404.html`.

## 2. Identité réellement présente dans le CSS

`css/style.css` déclare les polices `Instrument Serif` et `Manrope`, et les couleurs suivantes :

- `--blue-900: #0B2545`
- `--blue-700: #163f6f`
- `--blue-500: #4C9FE8`
- `--blue-100: #EAF3FC`

La capture utilisateur confirme visuellement cette identité : header bleu nuit, grand titre sérif avec accent italique bleu, CTA sombre, et dégradé vers le bleu lumineux.

## 3. Contenu JSON du ZIP

| Fichier | Éléments contenus |
|---|---:|
| `data/filieres.json` | 7 filières |
| `data/ecoles.json` | 30 établissements |
| `data/metiers.json` | 21 métiers |
| `data/mentors.json` | 7 profils d'exemple |
| `data/offres.json` | 7 offres d'exemple |
| `data/questions.json` | 18 questions |

Les quantités décrivent les enregistrements transmis dans cette archive. Elles ne signifient pas que les fiches sont exhaustives ou encore à jour au jour du déploiement. Le dépôt identifie les profils mentors et les offres comme des exemples de départ.

## 4. Pages présentes et manquantes

Présentes à la racine : les 21 pages listées ci-dessus, dont `avis.html` et `404.html` en plus de la liste des 25 pages cibles du CDC.

Les routes de détail (fiche d'une filière, d'une école, d'un métier, d'un mentor ou d'une offre) ne sont pas des fichiers autonomes dans l'archive. Elles doivent être générées à partir de gabarits réutilisables et des données JSON. Le formulaire dédié `offres/publier` n'est pas matérialisé comme page HTML autonome.

Le fichier `dashboard.html` est un écran commun dont le contenu dépend du rôle. La refonte doit rendre les trois espaces réellement distincts.

## 5. État annoncé par le README du projet

Le README considère comme présents l'accueil, l'inscription, la connexion, le quiz, les résultats, le dashboard, les filières et les écoles. Il indique que Mentorat, Offres, Métiers et Comparateur sont encore à terminer ou à brancher. Il décrit l'authentification actuelle comme simulée en V1 et l'authentification réelle/base de données comme V2.

L'existence d'un fichier HTML ne doit pas être interprétée comme preuve qu'un parcours métier est complet.

## 6. Points à arbitrer entre CDC et dépôt

### Charte visuelle

- CDC, section 6 : terracotta `#C2592E`, fond sombre `#1A1917`, Fraunces et Inter.
- Dépôt et capture utilisateur : palette bleue, Instrument Serif et Manrope.

La consigne la plus récente de l'utilisateur demande expressément de conserver les couleurs, les polices et le logo du projet réel. Ce pack suit donc la charte du dépôt ; ne pas mélanger les deux.

### Quiz

- CDC : 7 questions tirées d'une banque de 14.
- Dépôt : `data/questions.json` contient 18 questions ; le README et certains contenus existants ne sont pas cohérents sur le nombre annoncé.

Ne pas changer la logique du quiz lors de la refonte graphique. Demander une décision produit à part avant d'harmoniser le nombre annoncé, la banque et la logique.

### Authentification

Le CDC valide une présentation/simulation visuelle en V1, puis Supabase Auth en V2. Ne pas créer de mécanisme d'authentification maison.

### Actualité des informations

Le dépôt contient 30 établissements et de la documentation de référence. Les modalités, contacts, admissions et dates de vérification doivent être contrôlés avant toute publication comme informations actuelles.

## 7. Précautions de réalisation

- Protéger les contrats entre HTML et JS : classes, `id`, `data-*`, formulaires et sélecteurs.
- Garder les données JSON de référence ; ne pas inventer des contenus définitifs.
- Identifier clairement les données de démonstration (mentors, offres, métriques de dashboards).
- `avis.js` utilisant du stockage local ne transmet pas automatiquement un avis au propriétaire du site.
- Un formulaire de réinitialisation ne peut pas envoyer un vrai courriel sans backend/auth provider.
- Préserver le fonctionnement local du projet et ses consignes de lancement.
