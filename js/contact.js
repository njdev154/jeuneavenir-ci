// contact.js
// V1 : le message est stocké en localStorage, sur l'appareil de la
// personne qui l'envoie. Pas encore transmis à une vraie boîte mail --
// ça viendra avec le backend en V2.

document.addEventListener("DOMContentLoaded", () => {
  const formulaire = document.getElementById("formulaire-contact");
  if (!formulaire) return;

  formulaire.addEventListener("submit", (e) => {
    e.preventDefault();

    const message = {
      nom: document.getElementById("contact-nom").value.trim(),
      email: document.getElementById("contact-email").value.trim(),
      sujet: document.getElementById("contact-sujet").value,
      message: document.getElementById("contact-message").value.trim(),
      date: new Date().toISOString()
    };

    const tousLesMessages = JSON.parse(localStorage.getItem("jac_messages_contact") || "[]");
    tousLesMessages.push(message);
    localStorage.setItem("jac_messages_contact", JSON.stringify(tousLesMessages));

    formulaire.style.display = "none";
    document.getElementById("confirmation-contact").style.display = "block";
  });
});
