// avis.js
// V1 : les avis sont stockés en localStorage, SUR L'APPAREIL de la
// personne qui les envoie. Ce n'est PAS partagé avec toi (le porteur du
// projet) tant qu'il n'y a pas de vraie base de données (V2). C'est
// important de le savoir avant de compter dessus pour de vrais retours
// utilisateurs.

document.addEventListener("DOMContentLoaded", () => {
  const formulaire = document.getElementById("formulaire-avis");
  if (!formulaire) return;

  formulaire.addEventListener("submit", (e) => {
    e.preventDefault();

    const avis = {
      type: document.getElementById("type-avis").value,
      message: document.getElementById("message-avis").value.trim(),
      email: document.getElementById("email-avis").value.trim(),
      date: new Date().toISOString()
    };

    const tousLesAvis = JSON.parse(localStorage.getItem("jac_avis") || "[]");
    tousLesAvis.push(avis);
    localStorage.setItem("jac_avis", JSON.stringify(tousLesAvis));

    formulaire.style.display = "none";
    document.getElementById("confirmation-avis").style.display = "block";
  });
});
