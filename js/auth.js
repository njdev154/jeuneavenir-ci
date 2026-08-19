// auth.js
// V1 : authentification SIMULÉE via localStorage. Ce n'est PAS sécurisé,
// et ce n'est pas fait pour l'être — ça sert juste à faire fonctionner
// les parcours (inscription -> tableau de bord) en attendant la V2,
// où tout sera remplacé par Supabase Auth (email + Google + Apple réels).

document.addEventListener("DOMContentLoaded", () => {

  // --- Boutons Google / Apple : pas encore fonctionnels en V1 ---
  const boutonGoogle = document.getElementById("bouton-google");
  const boutonApple = document.getElementById("bouton-apple");

  const infoNonDisponible = () => {
    alert("La connexion avec Google/Apple arrivera en V2, avec la vraie authentification (Supabase Auth). Pour l'instant, utilise le formulaire email/mot de passe.");
  };

  if (boutonGoogle) boutonGoogle.addEventListener("click", infoNonDisponible);
  if (boutonApple) boutonApple.addEventListener("click", infoNonDisponible);

  // --- Formulaire d'inscription ---
  const formInscription = document.getElementById("formulaire-inscription");
  if (formInscription) {
    formInscription.addEventListener("submit", (e) => {
      e.preventDefault();
      const messageErreur = document.getElementById("message-erreur");
      messageErreur.textContent = "";

      const nom = document.getElementById("nom").value.trim();
      const email = document.getElementById("email").value.trim();
      const motDePasse = document.getElementById("mot_de_passe").value;
      const confirmation = document.getElementById("confirmation").value;
      const typeCompte = formInscription.querySelector('input[name="type_compte"]:checked').value;

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
      if (utilisateurs.some(u => u.email === email)) {
        messageErreur.textContent = "Un compte existe déjà avec cet e-mail.";
        return;
      }

      const nouvelUtilisateur = { nom, email, typeCompte, dateCreation: new Date().toISOString() };
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

      const email = document.getElementById("email").value.trim();

      const utilisateurs = JSON.parse(localStorage.getItem("jac_utilisateurs") || "[]");
      const utilisateur = utilisateurs.find(u => u.email === email);

      if (!utilisateur) {
        messageErreur.textContent = "Aucun compte trouvé avec cet e-mail. (Rappel : V1 = données stockées uniquement dans ce navigateur)";
        return;
      }

      // V1 : on ne vérifie pas le mot de passe (pas de vraie sécurité avant la V2)
      localStorage.setItem("jac_utilisateur_connecte", JSON.stringify(utilisateur));
      window.location.href = "dashboard.html";
    });
  }

});
