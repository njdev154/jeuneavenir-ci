// mot-de-passe-oublie.js
// V1 : aucune vraie réinitialisation possible (pas de vrai système
// d'e-mail). On affiche honnêtement un message expliquant que ça
// arrivera en V2, plutôt que de faire semblant que ça fonctionne.

document.addEventListener("DOMContentLoaded", () => {
  const formulaire = document.getElementById("formulaire-mdp-oublie");
  if (!formulaire) return;

  formulaire.addEventListener("submit", (e) => {
    e.preventDefault();
    formulaire.style.display = "none";
    document.getElementById("confirmation-mdp-oublie").style.display = "block";
  });
});
