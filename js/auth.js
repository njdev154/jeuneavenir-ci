// auth.js
// V1 : authentification SIMULÉE via localStorage. Ce n'est PAS sécurisé,
// et ce n'est pas fait pour l'être — ça sert juste à faire fonctionner
// les parcours (inscription -> tableau de bord) en attendant la V2,
// où tout sera remplacé par Supabase Auth (email + Google + Apple réels).

document.addEventListener("DOMContentLoaded", () => {

  // --- Boutons Google / Apple : pas encore fonctionnels en V1 ---
  const boutonGoogle = document.getElementById("bouton-google");
  const boutonApple = document.getElementById("bouton-apple");

  const afficherMessageBientot = (bouton) => {
    if (bouton.nextElementSibling?.classList?.contains("message-info-connexion")) return;
    const message = document.createElement("p");
    message.className = "message-info-connexion";
    message.textContent = "Bientôt disponible — utilise l'email et le mot de passe pour l'instant.";
    bouton.insertAdjacentElement("afterend", message);
  };

  if (boutonGoogle) boutonGoogle.addEventListener("click", () => afficherMessageBientot(boutonGoogle));
  if (boutonApple) boutonApple.addEventListener("click", () => afficherMessageBientot(boutonApple));

  // --- Formulaire d'inscription ---
  const formInscription = document.getElementById("formulaire-inscription");
  if (formInscription) {
    formInscription.addEventListener("submit", (e) => {
      e.preventDefault();
      const messageErreur = document.getElementById("message-erreur");
      messageErreur.textContent = "";

      const nom = document.getElementById("nom").value.trim();
      const email = document.getElementById("email").value.trim().toLowerCase();
      const motDePasse = document.getElementById("mot_de_passe").value;
      const confirmation = document.getElementById("confirmation").value;
      const profilChoisi = formInscription.querySelector('input[name="type_compte"]:checked')?.value;
      const groupeProfil = profilChoisi && formInscription.querySelector(`[data-profile-fields="${profilChoisi}"]`);

      if (!groupeProfil || groupeProfil.disabled) {
        messageErreur.textContent = "Choisis un profil et renseigne les informations demandées.";
        return;
      }
      if (motDePasse !== confirmation) {
        messageErreur.textContent = "Les mots de passe ne correspondent pas.";
        return;
      }
      if (motDePasse.length < 8) {
        messageErreur.textContent = "Le mot de passe doit contenir au moins 8 caractères.";
        return;
      }

      // Vérifie si un compte existe déjà avec cet email (simulation simple)
      const utilisateurs = JSON.parse(localStorage.getItem("jac_utilisateurs") || "[]");
      if (utilisateurs.some(u => u.email.trim().toLowerCase() === email)) {
        messageErreur.textContent = "Un compte existe déjà avec cet e-mail.";
        return;
      }

      const profilDetails = Object.fromEntries(
        Array.from(groupeProfil.querySelectorAll("input, select, textarea"))
          .filter(champ => champ.name && !champ.disabled && champ.value.trim())
          .map(champ => [champ.name, champ.value.trim()])
      );
      const typeCompte = profilChoisi === "professeur" ? "mentor" : profilChoisi;
      const nouvelUtilisateur = {
        nom,
        email,
        typeCompte,
        profilDetails,
        dateCreation: new Date().toISOString()
      };
      const ville = document.getElementById("ville").value.trim();
      if (ville) nouvelUtilisateur.ville = ville;
      if (profilChoisi === "professeur") nouvelUtilisateur.sousTypeCompte = "professeur";
      if (profilChoisi === "jeune") {
        nouvelUtilisateur.statut = profilDetails.statut;
        nouvelUtilisateur.formation = profilDetails.formation;
      }

      utilisateurs.push(nouvelUtilisateur);
      localStorage.setItem("jac_utilisateurs", JSON.stringify(utilisateurs));
      localStorage.setItem("jac_utilisateur_connecte", JSON.stringify(nouvelUtilisateur));

      window.location.href = "dashboard.html";
    });
  }

  // --- Formulaire de connexion ---
  const formConnexion = document.getElementById("formulaire-connexion");
  if (formConnexion) {
    formConnexion.addEventListener("submit", (e) => {
      e.preventDefault();
      const messageErreur = document.getElementById("message-erreur");
      messageErreur.textContent = "";

      const email = document.getElementById("email").value.trim().toLowerCase();
      const profilChoisi = formConnexion.querySelector('input[name="type_compte"]:checked')?.value;
      if (!profilChoisi) {
        messageErreur.textContent = "Choisis le profil associé à ton compte.";
        return;
      }

      const utilisateurs = JSON.parse(localStorage.getItem("jac_utilisateurs") || "[]");
      const utilisateur = utilisateurs.find(u => u.email.trim().toLowerCase() === email);

      if (!utilisateur) {
        messageErreur.textContent = "Aucun compte trouvé avec cet e-mail. (Rappel : V1 = données stockées uniquement dans ce navigateur)";
        return;
      }

      const profilCorrespond = profilChoisi === "professeur"
        ? utilisateur.typeCompte === "mentor" && utilisateur.sousTypeCompte === "professeur"
        : utilisateur.typeCompte === profilChoisi
          && !(profilChoisi === "mentor" && utilisateur.sousTypeCompte === "professeur");
      if (!profilCorrespond) {
        messageErreur.textContent = "Ce compte ne correspond pas au profil choisi. Vérifie ton choix puis réessaie.";
        return;
      }

      // V1 : on ne vérifie pas le mot de passe (pas de vraie sécurité avant la V2)
      localStorage.setItem("jac_utilisateur_connecte", JSON.stringify(utilisateur));
      window.location.href = "dashboard.html";
    });
  }

});
