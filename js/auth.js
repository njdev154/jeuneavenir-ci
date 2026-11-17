// auth.js
// V1 : authentification SIMULÉE via localStorage. Ce n'est PAS sécurisé,
// et ce n'est pas fait pour l'être — ça sert juste à faire fonctionner
// les parcours (inscription -> tableau de bord) en attendant la V2,
// où tout sera remplacé par Supabase Auth (email + Google + Apple réels).

function lireUtilisateursLocaux() {
  try {
    const valeur = localStorage.getItem("jac_utilisateurs");
    const utilisateurs = valeur === null ? [] : JSON.parse(valeur);
    if (!Array.isArray(utilisateurs)) {
      throw new Error("La liste des comptes locaux n’a pas le format attendu.");
    }
    return utilisateurs;
  } catch (erreur) {
    console.error("Lecture des comptes locaux impossible :", erreur);
    throw new Error("Les comptes locaux sont illisibles. Aucune donnée n’a été remplacée.");
  }
}

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
      let utilisateurs;
      try {
        utilisateurs = lireUtilisateursLocaux();
      } catch (erreur) {
        messageErreur.textContent = erreur.message;
        return;
      }
      if (utilisateurs.some(u => u && typeof u.email === "string" && u.email.trim().toLowerCase() === email)) {
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
      try {
        localStorage.setItem("jac_utilisateurs", JSON.stringify(utilisateurs));
        localStorage.setItem("jac_utilisateur_connecte", JSON.stringify(nouvelUtilisateur));
      } catch (erreur) {
        console.error("Création du compte local impossible :", erreur);
        messageErreur.textContent = "Le compte n’a pas pu être enregistré dans ce navigateur.";
        return;
      }

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

      let utilisateurs;
      try {
        utilisateurs = lireUtilisateursLocaux();
      } catch (erreur) {
        messageErreur.textContent = erreur.message;
        return;
      }
      const utilisateur = utilisateurs.find(u => u && typeof u.email === "string" && u.email.trim().toLowerCase() === email);

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
      try {
        localStorage.setItem("jac_utilisateur_connecte", JSON.stringify(utilisateur));
      } catch (erreur) {
        console.error("Ouverture de session locale impossible :", erreur);
        messageErreur.textContent = "La session n’a pas pu être enregistrée dans ce navigateur.";
        return;
      }
      window.location.href = "dashboard.html";
    });

  }

});
