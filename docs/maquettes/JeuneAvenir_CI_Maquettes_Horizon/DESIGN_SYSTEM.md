# Design system — JeuneAvenir CI « Horizon »

## 1. Principe directeur

Une interface éditoriale, chaleureuse, claire et sérieuse, adaptée à l'orientation, aux études et à l'insertion professionnelle des jeunes en Côte d'Ivoire. La marque existante doit rester immédiatement reconnaissable. La qualité doit venir de la composition, de la typographie, de la grille, du rythme et de la cohérence — pas d'effets décoratifs ajoutés.

## 2. Couleurs de marque

| Token | Hex | Usage principal |
|---|---|---|
| `blue-900` | `#0B2545` | Navigation sombre, texte de titre, CTA principal, sidebar |
| `blue-700` | `#163F6F` | Bleu intermédiaire, liens et états actifs |
| `blue-500` | `#4C9FE8` | Accent, mot « horizon. », indicateurs et détails sélectionnés |
| `blue-100` | `#EAF3FC` | Fond léger, surfaces d'information et états doux |
| `text` | `#16233B` | Texte principal sur fond clair |
| `muted` | `#5B6B82` | Texte secondaire et descriptions |
| `canvas` | `#F7FAFD` | Fond général des pages intérieures |
| `line` | `#E3EAF2` | Bordures discrètes et séparateurs |
| `white` | `#FFFFFF` | Cartes et formulaires |

Ne pas créer une seconde palette colorée. Les couleurs de statut (erreur, réussite, avertissement) peuvent exister pour leur sens fonctionnel, en tonalités modérées et accessibles, sans devenir des couleurs identitaires.

## 3. Typographie

- `Instrument Serif` : titres éditoriaux, accroches, grands titres et titres de fiches.
- `Manrope` : navigation, corps de texte, champs, boutons, métadonnées, tableaux et labels.
- Maximum deux familles. Italique autorisé ponctuellement pour les mots mis en valeur, en particulier « horizon. » sur l'accueil.
- Garder une hiérarchie lisible : grand titre de page, introduction courte, titres de section, contenu, métadonnées.
- Éviter les paragraphes trop larges et les textes secondaires trop petits.

Les PNG ont été rendus hors réseau : les captures peuvent utiliser une fonte système de remplacement. Les sources HTML conservent `Instrument Serif` et `Manrope`. L'intégration finale doit utiliser les vraies fontes du projet.

## 4. Logo et identité

- Utiliser les fichiers originaux du projet dans `assets/icons/` : logo, version claire, version horizontale, favicon et icônes des fournisseurs d'authentification.
- Ne pas recréer la boussole par CSS et ne pas substituer un autre symbole.
- Le logo complet est utilisé sur les grandes navigations ; la version compacte peut être utilisée sur les espaces contraints.

## 5. Accueil

- Header bleu nuit en bandeau horizontal.
- Logo à gauche, liens de navigation au centre, Connexion/Inscription à droite.
- Hero centré sur un dégradé vertical du bleu nuit au bleu lumineux.
- Accroche courte en capitales et bleu accent.
- Titre en Instrument Serif, blanc, 2 lignes ; « horizon. » en bleu accent et italique sur la première ligne.
- Description centrée, pas de bloc de texte long.
- Un seul CTA principal bien visible ; un CTA secondaire en contour.
- Décor abstrait discret sur les bords, sans photographie ni illustration générée.

## 6. Pages intérieures

- Header public clair ou sombre selon le gabarit, mais identique d'une page à l'autre.
- Fond général très légèrement bleuté (`#F7FAFD`) ; cartes blanches.
- Titre de page en Instrument Serif, introduction courte en Manrope.
- Outils de recherche et de filtres regroupés au-dessus des listes.
- Cartes de catalogue homogènes, bordure fine, rayon de 12 px et ombre légère.
- Fiches détaillées avec colonne principale + panneau d'information/action sur desktop ; empilement logique sur mobile.
- Pages institutionnelles aérées et sobres.

## 7. Espaces connectés

- Navigation latérale persistante sur desktop, barre compacte en bas sur mobile si la maquette le prévoit.
- Bandeau d'accueil utilisateur et petites cartes de synthèse ; la donnée prioritaire doit être mise en évidence.
- Tables lisibles, états de candidature explicites et actions contextuelles.
- Les trois rôles ont des priorités, contenus et actions différents. Ne pas réutiliser un même dashboard en changeant uniquement son titre.
- Les métriques non issues d'une source réelle doivent porter un libellé « Données de démonstration ».

## 8. Composants

- Bouton principal : fond `#0B2545`, texte blanc, forme rectangulaire à coins légèrement arrondis.
- Bouton secondaire : fond transparent ou bleu clair, contour bleu, texte bleu nuit.
- Champ : label visible, hauteur suffisante, fond clair/blanc, bordure fine, focus très visible.
- Carte : blanc, bordure `#E3EAF2`, rayon 12 px, ombre diffuse très légère.
- Badge : seulement pour les statuts nécessaires ; éviter de badge-ifier chaque morceau de texte.
- Liens : bleu intermédiaire ; hover plus sombre et soulignement accessible si pertinent.
- Alertes : contraste suffisant, message clair, pas d'alerte de couleur sans explication.

## 9. Espacement, grille et responsive

- Utiliser une grille cohérente, largeur de contenu maximale autour de 1200–1240 px.
- Espacements récurrents basés sur une échelle de 4/8 px ; sections avec marges verticales généreuses.
- Rayon de référence : 12 px ; ne pas mélanger des rayons fantaisistes.
- Breakpoints à tester : 1024, 768 et 390 px, avec vérification supplémentaire à 1440 et 1899 px.
- À 390 px : navigation hamburger, champs en une colonne, cartes empilées, boutons confortables au toucher, pas de débordement horizontal.

## 10. Mouvement et accessibilité

- Transitions courtes et discrètes ; pas de parallaxe ou d'animation gadget.
- Respecter `prefers-reduced-motion`.
- Toujours un focus clavier visible, labels associés, états d'erreur compréhensibles et contrastes suffisants.
- Ne jamais dépendre uniquement de la couleur pour communiquer un état.
