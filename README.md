# JeuneAvenir CI

Plateforme d'orientation, de mentorat et d'insertion professionnelle pour les jeunes ivoiriens.
Du choix de filière post-bac jusqu'au premier emploi, en un seul site.

## Structure du projet

```
jeuneavenir-ci/
├── index.html                 → Accueil (hero "Horizon", 5 piliers)
├── inscription.html           → Inscription (auth simulée V1, réelle en V2)
├── connexion.html             → Connexion (idem)
├── mot-de-passe-oublie.html   → Placeholder (V2)
├── quiz.html                  → Quiz d'orientation (par série + questions)
├── resultat.html              → Résultat simplifié (1-2 filières)
├── filieres.html               → Liste + recherche + fiche détaillée
├── ecoles.html                  → Liste + filtres (ville/statut/domaine)
├── dashboard.html                → Tableau de bord (jeune/mentor/entreprise)
├── avis.html                      → Formulaire de retour sur le site
├── 404.html                        → Page d'erreur
├── mentorat.html, offres.html, metiers.html,
│   comparateur.html, profil.html, favoris.html,
│   faq.html, a-propos.html, contact.html,
│   confidentialite.html          → Placeholders "Bientôt disponible"
│
├── css/style.css              → Toute la charte graphique (une seule couleur
│                                 de base : bleu, déclinée en 4 teintes)
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
│   ├── mentors.js, offres.js            → Prévus, pas encore branchés
│
├── data/
│   ├── questions.json          → 18 questions (méthode interne, jamais
│   │                              affichée telle quelle à l'utilisateur)
│   ├── series_filieres.json     → Filière accessibles par série de BAC
│   ├── matieres_completes.json   → Liste des matières (collège/lycée)
│   ├── filieres.json              → 7 filières détaillées
│   ├── ecoles.json                 → 30 établissements réels (source MESRS)
│   ├── metiers.json                 → 21 métiers liés aux filières
│   ├── mentors.json, offres.json     → Exemples de départ
│
├── documentation/               → Recherches sources (CSV MESRS, rapport)
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

## Principes de conception (à respecter en continuant le projet)

- **Une seule couleur de base** (bleu, en variantes `--bleu-900/700/500/100`
  dans `css/style.css`) — pas de nouvelle couleur sans raison forte.
- **Aucun jargon technique visible côté utilisateur.** La méthode du quiz
  (RIASEC/Holland, scores, codes) reste dans les commentaires du code,
  jamais à l'écran. L'utilisateur ne voit que des questions simples et un
  résultat clair.
- **Honnêteté sur les limites de la V1** : pas de vraie base de données,
  authentification simulée en `localStorage`, données d'exemple pour
  mentors/offres. Toujours le dire clairement dans le code (commentaires),
  jamais le cacher.

## État d'avancement

- [x] Structure de dossiers, charte graphique (direction "Horizon")
- [x] Accueil, Inscription, Connexion, Dashboard (3 profils)
- [x] Quiz d'orientation (par série réelle du BAC ivoirien) + Résultat
- [x] Filières et Écoles (30 établissements réels, vérifiés MESRS)
- [x] Favicon, page 404, gestion d'erreurs propre
- [ ] Mentorat, Offres, Métiers, Comparateur (encore en "Bientôt disponible")
- [ ] Authentification réelle (V2 — Supabase Auth)
- [ ] Base de données réelle (V2)

## Versions du projet

- **V1** (en cours) : site statique complet, HTML/CSS/JS, données en JSON
- **V2** : authentification réelle + base de données Supabase
- **V3** : recherche avancée, tableau d'administration, assistant IA
