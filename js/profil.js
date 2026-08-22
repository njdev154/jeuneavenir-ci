// profil.js
// Affiche et permet de modifier le profil de l'utilisateur connecté.
// V1 : tout est stocké en localStorage, sur cet appareil uniquement.

document.addEventListener("DOMContentLoaded", () => {
  const utilisateur = JSON.parse(localStorage.getItem("jac_utilisateur_connecte") || "null");

  if (!utilisateur) {
    document.getElementById("bloc-non-connecte").style.display = "flex";
    return;
  }

  document.getElementById("bloc-profil").style.display = "flex";

  document.getElementById("profil-nom").value = utilisateur.nom || "";
  document.getElementById("profil-email").value = utilisateur.email || "";
  document.getElementById("profil-ville").value = utilisateur.ville || "";

  if (utilisateur.typeCompte === "jeune") {
    document.getElementById("champs-jeune").style.display = "block";
    document.getElementById("profil-formation").value = utilisateur.formation || "";
    document.getElementById("profil-competences").value = (utilisateur.competences || []).join(", ");
  }

  document.getElementById("formulaire-profil").addEventListener("submit", (e) => {
    e.preventDefault();

    utilisateur.nom = document.getElementById("profil-nom").value.trim();
    utilisateur.ville = document.getElementById("profil-ville").value.trim();

    if (utilisateur.typeCompte === "jeune") {
      utilisateur.formation = document.getElementById("profil-formation").value.trim();
      utilisateur.competences = document.getElementById("profil-competences").value
        .split(",").map(c => c.trim()).filter(Boolean);
    }

    // Met à jour l'utilisateur connecté ET la liste complète des comptes
    localStorage.setItem("jac_utilisateur_connecte", JSON.stringify(utilisateur));
    const tousLesUtilisateurs = JSON.parse(localStorage.getItem("jac_utilisateurs") || "[]");
    const index = tousLesUtilisateurs.findIndex(u => u.email === utilisateur.email);
    if (index !== -1) {
      tousLesUtilisateurs[index] = utilisateur;
      localStorage.setItem("jac_utilisateurs", JSON.stringify(tousLesUtilisateurs));
    }

    const message = document.getElementById("message-succes-profil");
    message.textContent = "✔ Profil enregistré.";
    setTimeout(() => { message.textContent = ""; }, 3000);
  });
});
