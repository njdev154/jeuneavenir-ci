# JeuneAvenir CI — Maquettes Horizon (référence Codex)

## Ce pack remplace le précédent

Ce dossier est la nouvelle référence visuelle à utiliser pour la refonte de JeuneAvenir CI. Il remplace le premier pack `JeuneAvenir_CI_Maquettes_Codex`, dont plusieurs écrans s'éloignaient de l'identité visuelle du dépôt et de la capture fournie.

La direction est désormais calée sur :
- la capture d'accueil fournie par l'utilisateur (`assets/references/REFERENCE_ACCUEIL_FOURNIE.png`) ;
- le code et les fichiers de marque du ZIP d'origine ;
- les parcours réellement prévus par le cahier des charges définitif.

## Ouvrir les maquettes

1. Ouvrir `index.html` dans un navigateur pour parcourir la galerie.
2. Utiliser `01_maquettes_desktop/` pour les vues desktop : 34 écrans de référence, plus une variante de l'accueil au format exact de la capture fournie (1899 × 876).
3. Utiliser `02_maquettes_mobile/` pour les 7 vues mobiles prioritaires (390 × 844).
4. `03_planches_aperçu/` contient les planches de synthèse.
5. `04_sources_html/` contient les sources HTML autonomes ayant servi au rendu des écrans.
6. `assets/` contient les logos et icônes originaux copiés du dépôt, ainsi que la capture de référence de l'utilisateur.

## Identité visuelle verrouillée

Le pack suit la charte effectivement utilisée dans le projet livré et visible sur la capture :

| Élément | Valeur |
|---|---|
| Bleu nuit | `#0B2545` |
| Bleu intermédiaire | `#163F6F` |
| Bleu accent | `#4C9FE8` |
| Bleu clair | `#EAF3FC` |
| Texte principal | `#16233B` |
| Texte secondaire | `#5B6B82` |
| Police des titres | `Instrument Serif` |
| Police des textes et interfaces | `Manrope` |
| Logo | Boussole JeuneAvenir CI fournie dans le dépôt |

Ne pas remplacer le bleu par le terracotta, ne pas remplacer Instrument Serif/Manrope par Fraunces/Inter, ne pas redessiner le logo et ne pas introduire une nouvelle identité.

## Direction de l'accueil

L'accueil doit reprendre la composition de la capture fournie :
- barre de navigation bleu nuit et logo boussole à gauche ;
- liens de navigation centrés et accès Connexion/Inscription à droite ;
- accroche centrée « TON PARCOURS, DU LYCÉE À L'EMPLOI » ;
- grand titre blanc « Ton avenir a un horizon. / Avance vers lui. » ;
- « horizon. » en bleu lumineux et italique ;
- paragraphe court, deux actions clairement hiérarchisées ;
- dégradé vertical bleu nuit vers bleu lumineux ;
- détails abstraits discrets, sans photographie de stock ou illustration artificielle.

Le message de navigateur « Cliquez pour revenir en arrière… » visible dans la capture source n'est pas un élément du site et ne doit pas être reproduit.

La variante `00_accueil-reference-1899x876.png` permet de comparer la composition au format de la capture de départ. La maquette standard `00_accueil.png` garde le format général des autres vues desktop.

## Ce que représentent les écrans

Les PNG et HTML sont des références statiques de conception. Ils ne forment pas une application complète et ne prouvent pas que chaque interaction est déjà branchée. Codex doit intégrer les maquettes dans le projet existant, relier les contrôles aux fonctionnalités disponibles et signaler explicitement les fonctions non encore développées.

Les écrans administrateur, suivi des candidatures et demandes de mentorat sont des pistes V2. L'assistant et la carte sont des pistes V3. Ils ne doivent pas être exposés comme des fonctions V1 actives.

## Polices dans les captures

Le navigateur de rendu des PNG n'avait pas accès au réseau. Les captures ont donc utilisé les polices locales de substitution définies après Instrument Serif/Manrope. Les sources HTML conservent les noms de famille `Instrument Serif` et `Manrope`. Dans le vrai projet, Codex doit conserver les chargements et les fichiers/polices déjà déclarés par le dépôt pour afficher les vraies polices de marque. Ne pas considérer la substitution du moteur de capture comme une demande de changer de police.

## Documents à lire avant intégration

- `MISSION_CODEX.md` : mission détaillée, limites et critères d'acceptation.
- `DESIGN_SYSTEM.md` : règles visuelles et composants.
- `AUDIT_PROJET.md` : constats sur le ZIP et divergences avec le CDC.
- `MAPPING_ECRANS.md` : correspondance entre pages sources et maquettes.
- `REFERENCES_DESIGN.md` : principes de référence issus d'Apple, Google Material, Mobbin, Dribbble et Awwwards.
- `CHECKLIST_VALIDATION.md` : contrôles attendus après intégration.

Commencer par `MISSION_CODEX.md`. Ne pas fusionner la refonte visuelle avec une modification du quiz, la mise en place de Supabase, la modification du modèle de données ou un changement de stack sans autorisation séparée.
