// contact.js
document.addEventListener("DOMContentLoaded", () => {
  if (!window.JeuneAvenirPilot?.submissionsEnabled) return;

  const formulaire = document.getElementById("formulaire-contact");
  if (!formulaire) return;

  const statut = document.getElementById("etat-contact");
  const nom = document.getElementById("contact-nom");
  const message = document.getElementById("contact-message");
  [nom, message].forEach(champ => {
    champ.addEventListener("input", () => champ.setCustomValidity(""));
  });

  formulaire.addEventListener("submit", evenement => {
    evenement.preventDefault();
    statut.hidden = false;
    nom.setCustomValidity(nom.value.trim() ? "" : "Renseigne ton nom.");
    message.setCustomValidity(message.value.trim() ? "" : "Ajoute un message.");
    if (!formulaire.checkValidity()) {
      statut.className = "institutional-notice institutional-notice-error";
      statut.textContent = "Vérifie les champs signalés avant de continuer. Aucun message n’a été envoyé.";
      formulaire.reportValidity();
      return;
    }

    statut.className = "institutional-notice";
    statut.textContent = "Les champs sont remplis, mais le formulaire n’est pas relié à un service d’envoi. Aucun message n’a été envoyé ni enregistré.";
    statut.focus();
  });
});
