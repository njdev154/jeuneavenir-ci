# Guide pour Junior — Pack Assistant JeuneAvenir CI (Phase A, v2 — avec verrou compte)

NOUVEAU dans cette v2 : l'assistant est réservé aux membres connectés
(ta demande du 15 novembre). Utilise CE pack, pas le v1.

## Ce que contient ce pack

- `js/assistant.js` : le cerveau de l'assistant + sa fenêtre de discussion.
- `css/assistant.css` : les couleurs et la forme de la fenêtre (bleus du site).
- `PROMPT_POUR_IA_VSCODE.md` : le texte prêt à coller pour l'IA de VS Code.
- `GUIDE_JUNIOR.md` : ce fichier.

Ce que le pack ne contient pas : aucune clé, aucun mot de passe, aucun secret.
C'est volontaire. La Phase A n'a besoin de rien de tout ça.

## Ce que fait l'assistant (Phase A)

Il consulte les données réellement présentes dans le site : 7 filières,
30 établissements recensés, 21 métiers, les séries du bac. Le relevé
d'écoles est partiel; les rattachements non confirmés sont signalés.
À ce jour, aucune offre ni aucun mentor réel et vérifié n'est publié.
Il sait par exemple :

- dire les filières ouvertes après un bac A2, D, C, etc. ;
- chercher les établissements d'un domaine dans une ville lorsque le
  rattachement est confirmé ;
- donner le salaire indicatif ou la durée d'une filière (en disant que
  c'est une estimation du site) ;
- signaler honnêtement qu'aucun mentor ni aucune offre vérifiés ne sont
  actuellement publiés ;
- conseiller un jeune à partir de son résultat au quiz, s'il l'a déjà fait.

## Le verrou compte (nouveau)

Sans compte et sans connexion, l'assistant ne répond pas : il affiche
un message et deux boutons, « Créer un compte » et « Se connecter ».
Une fois connecté, il salue le membre par son nom et répond normalement.

Limite honnête : en V1, les comptes du site sont simulés (c'est écrit
dans ton cahier des charges, une authentification réelle est à concevoir).
Le verrou crée le parcours voulu — inscription d'abord, assistant ensuite —
mais ce n'est pas une serrure de sécurité. La vraie serrure
viendra avec les comptes réels, et pour la Phase B le serveur
vérifiera la connexion avant chaque appel à Gemini : c'est ce qui
protégera ton quota et, plus tard, le paiement.

## Limites de la Phase A

Limite honnête : ce n'est pas encore une conversation libre comme ChatGPT.
Il comprend les questions d'orientation prévues. Hors sujet, il le dit
clairement au lieu d'inventer. La conversation libre, ce sera la Phase B
(Gemini, avec la clé cachée côté serveur).

## Sécurité

- Aucune question de visiteur n'est envoyée à l'extérieur ni enregistrée.
- Tout se passe dans le navigateur du visiteur, avec les fichiers du site.
- L'affichage est protégé : impossible d'injecter du code par les questions.
- Le site doit être servi en HTTP pour charger ses fichiers JSON.
- La Phase A n'a ni quota ni clé API; l'authentification locale ne protège
  pas les données et ne doit pas servir à contrôler un accès payant.

## Tes étapes, dans l'ordre

1. Laisse l'IA de VS Code **finir** le travail qu'elle fait en ce moment
   sur le projet. Ne mélange pas les deux chantiers.
2. Utilise le code v2 corrigé et documenté dans ce dépôt; ne remplace pas
   les protections de publication ni les libellés de vérification.
3. Lance les tests documentés dans le README et teste le site en HTTP.
   Sans compte, l'assistant doit afficher uniquement les actions de
   connexion/inscription. Avec un compte V1 simulé, il doit répondre
   avec les limites des données explicites.
4. Pour une recherche de stage ou de mentor, l'assistant doit indiquer
   qu'aucune donnée vérifiée n'est publiée et ne doit afficher aucun
   profil ou annonce de démonstration.
5. Teste aussi sur téléphone et vérifie le quiz, les sources et les liens.

## Et après ?

Phase B, si elle est validée : elle nécessitera un backend et une
authentification réelle. Ne mets jamais une clé API dans le navigateur,
dans ce dépôt ou dans un message.
