# JeuneAvenir CI

Plateforme d'orientation, de mentorat et d'insertion professionnelle pour les jeunes ivoiriens.
Du choix de filière post-bac jusqu'au premier emploi, en un seul site.

## Structure du projet

```
jeuneavenir-ci/
├── index.html              → Page d'accueil (déjà commencée)
├── inscription.html        → Inscription (visuel V1, auth réelle V2)
├── connexion.html          → Connexion (visuel V1, auth réelle V2)
├── mot-de-passe-oublie.html
├── quiz.html                → Quiz d'orientation
├── resultat.html             → Résultat du quiz
├── comparateur.html          → Comparateur de filières
├── filieres.html / ecoles.html / metiers.html → Pilier Découverte
├── mentorat.html              → Annuaire des mentors
├── offres.html                 → Offres de stage/emploi
├── dashboard.html / profil.html / favoris.html → Espace compte
├── faq.html / a-propos.html / contact.html / confidentialite.html
│
├── css/
│   └── style.css            → Toute la charte graphique (couleurs, polices, composants)
│
├── js/
│   ├── main.js               → Menu mobile, comportements communs
│   ├── quiz.js                 → Logique du quiz
│   ├── auth.js                  → Inscription/connexion (simulation V1)
│   ├── filieres.js               → Liste + filtres filières
│   ├── mentors.js                 → Annuaire mentors
│   └── offres.js                   → Liste + filtres offres
│
├── data/
│   ├── questions.json         → Banque de 14 questions du quiz
│   ├── filieres.json           → Contenu des fiches filières
│   ├── ecoles.json              → Contenu des fiches écoles
│   ├── metiers.json              → Contenu des fiches métiers
│   ├── mentors.json               → Annuaire mentors
│   └── offres.json                 → Offres stage/emploi
│
└── assets/
    ├── images/
    └── icons/
```

## Comment lancer le projet en local

Pas besoin de serveur pour l'instant (site 100% statique) :
1. Ouvrir `index.html` directement dans le navigateur, OU
2. Utiliser l'extension "Live Server" de VS Code pour un rechargement automatique.

## Charte graphique (résumé)

- Couleur principale : `#C2592E` (terracotta/ocre)
- Fond sombre : `#1A1917`
- Polices : Fraunces (titres) + Inter (texte), via Google Fonts
- Toutes les variables sont dans `css/style.css` (section `:root`)

## État d'avancement

- [x] Structure de dossiers
- [x] Page d'accueil (`index.html`) — première version
- [ ] Contenu réel dans les fichiers `data/*.json` (à valider avec le client)
- [ ] Reste des pages
- [ ] Quiz fonctionnel
- [ ] Authentification réelle (V2 — Supabase Auth)

## Versions du projet

- **V1** : site statique complet, HTML/CSS/JS, données en JSON, sans backend
- **V2** : authentification réelle + base de données Supabase
- **V3** : évolutions avancées (recherche, admin, assistant IA)

Voir le cahier des charges complet pour le détail de chaque pilier et fonctionnalité.
