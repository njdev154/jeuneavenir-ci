# CAHIER DES CHARGES DÉFINITIF
## JEUNEAVENIR CI
### Le copilote du jeune ivoirien, du lycée à l'emploi

**Client :** M. Yao Kouassi
**Prestataire :** NJ Dev
**Date :** 16 août 2026
**Version :** DÉFINITIVE — document de référence unique du projet

---

## 1. LE PROBLÈME ET LA SOLUTION

Un jeune ivoirien fait face à 3 galères successives dans sa vie : il ne sait pas quelle filière choisir après le bac, il n'a personne pour le conseiller pendant ses études, et une fois diplômé il ne trouve ni stage ni emploi faute de réseau et de visibilité.

**JeuneAvenir CI** est LA plateforme unique qui l'accompagne sur ces 3 moments, avec un compte personnel qui le suit du lycée jusqu'à l'emploi.

---

## 2. ARCHITECTURE EN 5 PILIERS

```
JEUNEAVENIR CI
├── 🧭 ORIENTATION      → Quiz, résultats détaillés, comparateur de filières
├── 🏫 DÉCOUVERTE       → Fiches filières / écoles / métiers, recherche
├── 🤝 MENTORAT         → Annuaire de mentors, mise en relation
├── 💼 INSERTION PRO    → Offres stage/emploi, candidatures
└── 👤 COMPTE           → Connexion, favoris, historique, tableau de bord
```

---

## 3. AUTHENTIFICATION ET COMPTE UTILISATEUR

### 3.1 Ce que je veux
- Un vrai système de compte : **inscription et connexion**
- Plusieurs façons de se connecter, au choix de l'utilisateur :
  - **Email + mot de passe** (méthode de base, obligatoire dès la V1... voir note technique ci-dessous)
  - **Connexion avec Google** (très utilisée en Côte d'Ivoire, à prioriser)
  - **Connexion avec Apple** (moins prioritaire, plutôt pour les utilisateurs iPhone)
- 3 types de comptes distincts : **Jeune / Mentor / Entreprise** — l'utilisateur choisit son type à l'inscription, et le tableau de bord change en fonction
- Un mot de passe oublié / réinitialisation par email

### 3.2 Note technique importante (à valider ensemble)
Une vraie authentification (surtout "Se connecter avec Google/Apple") **nécessite un backend** — ce n'est pas quelque chose qu'on peut faire en JS pur côté navigateur, pour des raisons de sécurité. Ce n'est pas un problème, mais ça veut dire que la connexion ne peut pas être 100% terminée en V1 pure HTML/CSS/JS sans base de données.

**✅ DÉCISION VALIDÉE (16 août 2026) :**
- **V1** : les pages Inscription/Connexion sont entièrement designées et visibles (formulaires, boutons Google/Apple), mais l'authentification n'est **pas encore réelle**. Comportement attendu en V1 : soit une simulation via `localStorage` pour que la démo/navigation reste cohérente, soit les boutons affichés avec une mention claire type "Bientôt disponible" — à votre choix technique, tant que rien n'induit l'utilisateur en erreur sur ce qui fonctionne vraiment.
- **V2** : authentification réelle et sécurisée branchée via **Supabase Auth** (email/mot de passe + Google + Apple), connectée à la vraie base de données utilisateurs.
- On ne code pas de système de sécurité "maison" à aucun moment — Supabase Auth gère ça de bout en bout.

---

## 4. LISTE COMPLÈTE DES PAGES

| # | Page | Contenu |
|---|---|---|
| 1 | **Accueil** (`/`) | Message d'accroche, présentation des 5 piliers, CTA principal |
| 2 | **Inscription** (`/inscription`) | Choix du type de compte (jeune/mentor/entreprise), formulaire + boutons Google/Apple |
| 3 | **Connexion** (`/connexion`) | Email/mot de passe + boutons Google/Apple + "mot de passe oublié" |
| 4 | **Mot de passe oublié** (`/mot-de-passe-oublie`) | Formulaire de réinitialisation |
| 5 | **Quiz d'orientation** (`/quiz`) | Questions une par une, barre de progression |
| 6 | **Résultat du quiz** (`/resultat`) | Filière(s) recommandée(s), profil détaillé |
| 7 | **Comparateur** (`/comparateur`) | Sélection et comparaison de 2-3 filières |
| 8 | **Filières** (`/filieres`) | Liste/annuaire des filières, recherche et filtres |
| 9 | **Fiche filière** (`/filieres/[nom]`) | Détail complet d'une filière |
| 10 | **Écoles** (`/ecoles`) | Liste des écoles, filtres par ville |
| 11 | **Fiche école** (`/ecoles/[nom]`) | Détail complet d'une école |
| 12 | **Métiers** (`/metiers`) | Liste des métiers liés aux filières |
| 13 | **Fiche métier** (`/metiers/[nom]`) | Détail d'un métier |
| 14 | **Mentorat** (`/mentorat`) | Annuaire des mentors, filtres par domaine |
| 15 | **Fiche mentor** (`/mentorat/[nom]`) | Profil + bouton "Demander une mise en relation" |
| 16 | **Offres** (`/offres`) | Liste des offres stage/emploi, filtres |
| 17 | **Fiche offre** (`/offres/[id]`) | Détail de l'offre + bouton "Postuler" |
| 18 | **Publier une offre** (`/offres/publier`) | Formulaire, réservé aux comptes entreprise |
| 19 | **Mon tableau de bord** (`/dashboard`) | Différent selon jeune / mentor / entreprise |
| 20 | **Mon profil** (`/profil`) | Infos personnelles, CV, modification du compte |
| 21 | **Mes favoris** (`/favoris`) | Filières/écoles/mentors/offres sauvegardés |
| 22 | **FAQ** (`/faq`) | Questions fréquentes sur l'orientation |
| 23 | **À propos** (`/a-propos`) | Mission du projet, équipe |
| 24 | **Contact** (`/contact`) | Formulaire de contact |
| 25 | **Politique de confidentialité** (`/confidentialite`) | Mentions légales, dès qu'il y a des comptes |

*(Les pages 9, 11, 13, 15, 17 sont des "gabarits" — un seul modèle de page réutilisé pour chaque filière/école/métier/mentor/offre, pas une page à recréer à la main à chaque fois.)*

---

## 5. FONCTIONNALITÉS PAR PILIER (RAPPEL DÉTAILLÉ)

### Orientation
- Quiz : 7 questions tirées d'une banque de 14, calcul de score par filière, **ex-æquo affichés sans choix forcé**
- Résultat détaillé : filière(s), pourquoi elle correspond, points forts, compétences à développer
- Comparateur côte à côte (durée, coût, débouchés, salaires)

### Découverte
- Fiches filières/écoles/métiers complètes (voir détail des champs en section 7)
- Recherche instantanée multi-contenu (une requête trouve filières + écoles + métiers)
- Filtres : ville, budget, durée, type d'établissement

### Mentorat
- Annuaire filtrable par domaine
- Demande de mise en relation → acceptée/refusée par le mentor

### Insertion pro
- Offres filtrables (ville, domaine, type de contrat)
- Candidature en un clic, suivi de statut
- Espace entreprise pour publier et gérer les candidatures

### Compte
- Authentification (voir section 3)
- Favoris, historique, tableau de bord adapté au type de compte

---

## 6. DESIGN ET IDENTITÉ VISUELLE

| Élément | Choix |
|---|---|
| Couleur principale | Terracotta/Ocre `#C2592E` |
| Couleur de fond | Sombre `#1A1917` |
| Couleur neutre | Sable clair |
| Police des titres | Fraunces (élégante, sérieuse) |
| Police du texte | Inter (lisible, moderne) |
| Logo | Symbole boussole, vectorisé en SVG, décliné en favicon et image de partage |
| Style des cartes | Coins arrondis identiques, ombres légères identiques, espacement identique partout |
| Boutons | Un seul CTA principal visible par écran |
| Navigation mobile | Menu hamburger obligatoire |
| Animations | Sobres : apparition au scroll, transitions douces — jamais gadget |

**Règle d'or** : jamais plus de 2 polices, jamais plus de 2 couleurs vives visibles en même temps sur un écran.

---

## 7. MODÈLE DE DONNÉES

- **users** : id, nom, email, type_compte (jeune/mentor/entreprise), méthode_connexion (email/google/apple), ville, date_creation
- **profils_jeunes** : user_id, formation, compétences, cv_url, filiere_quiz
- **filieres** : id, nom, description, matières, durée, débouchés, métiers_liés, salaire_indicatif, écoles_liées
- **ecoles** : id, nom, ville, statut, formations, admission, contact
- **metiers** : id, nom, description, missions, compétences, formation
- **questions_quiz** : banque de 14 questions
- **resultats_quiz** : user_id, filières_résultat (liste, gère ex-æquo), date
- **mentors** : user_id, domaine, bio, disponibilité
- **demandes_mentorat** : jeune_id, mentor_id, statut, date
- **offres** : id, entreprise_id, titre, description, ville, domaine, type, date
- **candidatures** : offre_id, jeune_id, statut, date
- **favoris** : user_id, type_element, element_id

---

## 8. LES VERSIONS DU PROJET

### V1 — Plateforme statique complète (objectif : premiers utilisateurs)
- Toutes les pages listées en section 4, en HTML/CSS/JS
- Tout le contenu (filières, écoles, métiers, mentors, offres) en fichiers JSON
- Quiz fonctionnel avec sauvegarde en `localStorage`
- Pages Inscription/Connexion visibles et designées, avec authentification **simulée** (localStorage) ou boutons "Bientôt disponible" — la vraie authentification arrive en V2
- Hébergement gratuit (Netlify/Vercel/GitHub Pages)

### V2 — Plateforme dynamique (objectif : ~10 000 utilisateurs)
- **Authentification réelle activée** : Supabase Auth (email/mot de passe + Google + Apple)
- Base de données complète sur **Supabase** (toutes les tables de la section 7)
- Comptes réels, favoris et historique persistants
- Espace entreprise et mentor pleinement fonctionnels
- Candidatures et mises en relation en base de données

### V3 — Plateforme intelligente (vision long terme)
- Migration éventuelle vers un framework moderne (Next.js) si le projet grandit
- Recherche avancée (Algolia/Meilisearch)
- Tableau d'administration pour gérer le contenu sans toucher au code
- Assistant IA basé sur les données vérifiées du site
- Carte interactive des établissements

---

## 9. LIVRABLES V1

1. Les 25 pages listées (avec gabarits réutilisables pour les fiches)
2. Fichiers JSON de contenu, validés avec moi avant intégration
3. Quiz fonctionnel + comparateur
4. Pages Inscription/Connexion designées, avec authentification Supabase si possible dès cette étape
5. Design conforme à la charte (section 6)
6. Dépôt Git propre, commits réguliers, README clair
7. Site déployé et accessible en ligne

---

## 10. CE QUE JE NE VEUX PAS

- Une authentification bricolée non sécurisée qui resterait telle quelle en production
- Des pages qui manquent à l'appel (le site doit être complet, pas une démo à moitié faite)
- Un design qui change de style d'une page à l'autre

---

## 11. PROCHAINE ÉTAPE

1. ✅ Authentification confirmée : simulation/visuel en V1, réelle via Supabase Auth en V2
2. On valide l'arborescence en section 4
3. On démarre par l'Accueil + Inscription/Connexion (version visuelle), puis le Quiz

Je vous écoute.
