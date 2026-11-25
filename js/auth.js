function messageDeReponse(responseBody, fallback) {
  const erreurs = responseBody?.errors;
  if (erreurs && typeof erreurs === "object") {
    const details = Object.values(erreurs)
      .flat()
      .filter(message => typeof message === "string");
    if (details.length) return details.join(" ");
  }
  return typeof responseBody?.message === "string" ? responseBody.message : fallback;
}

function afficherEtatAuthentification(type, message) {
  const cible = document.getElementById(type === "succes" ? "message-succes" : "message-erreur");
  if (cible) cible.textContent = message;
}

async function requeteAuthentification(url, donnees, csrfToken) {
  const response = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": csrfToken
    },
    body: JSON.stringify(donnees)
  });

  let responseBody;
  try {
    responseBody = await response.json();
  } catch (erreur) {
    console.error("Réponse du serveur d’authentification illisible :", erreur);
    throw new Error("Le serveur a renvoyé une réponse illisible. Réessaie plus tard.");
  }

  if (!response.ok) {
    throw new Error(messageDeReponse(responseBody, "La demande n’a pas abouti."));
  }

  return responseBody;
}

async function activerAuthentificationLocale() {
  const formulaireInscription = document.getElementById("formulaire-inscription");
  const formulaireConnexion = document.getElementById("formulaire-connexion");
  if (!formulaireInscription && !formulaireConnexion) return;

  try {
    const response = await fetch("/auth/status", {
      credentials: "same-origin",
      headers: { "Accept": "application/json" }
    });
    if (response.status === 404) return;
    if (!response.ok) throw new Error(`Le serveur a répondu avec le statut ${response.status}.`);

    const etat = await response.json();
    const csrfToken = etat?.data?.csrf_token;
    if (etat?.data?.enabled !== true) return;
    if (typeof csrfToken !== "string" || csrfToken.length === 0) {
      throw new Error("Le jeton de sécurité du formulaire est absent.");
    }

    const interfaceActivee = window.JeuneAvenirPilot?.activerComptesLocauxPourLeTest?.();
    if (!interfaceActivee) {
      throw new Error("L’interface de développement local ne peut pas être activée.");
    }

    if (formulaireInscription) {
      formulaireInscription.addEventListener("submit", async evenement => {
        evenement.preventDefault();
        afficherEtatAuthentification("erreur", "");
        afficherEtatAuthentification("succes", "");

        const profil = formulaireInscription.querySelector('input[name="type_compte"]:checked')?.value;
        if (profil !== "jeune") {
          afficherEtatAuthentification("erreur", "Seul le compte Jeune peut être créé dans ce test local.");
          return;
        }

        const bouton = formulaireInscription.querySelector('button[type="submit"]');
        if (bouton) bouton.disabled = true;
        try {
          await requeteAuthentification("/auth/register", {
            name: document.getElementById("nom").value.trim(),
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("mot_de_passe").value,
            password_confirmation: document.getElementById("confirmation").value
          }, csrfToken);
          afficherEtatAuthentification("succes", "Compte Jeune de test créé. Ouverture de ton espace local…");
          window.location.href = "/dashboard.html";
        } catch (erreur) {
          console.error("Inscription locale impossible :", erreur);
          afficherEtatAuthentification("erreur", erreur.message);
        } finally {
          if (bouton) bouton.disabled = false;
        }
      });
    }

    if (formulaireConnexion) {
      formulaireConnexion.addEventListener("submit", async evenement => {
        evenement.preventDefault();
        afficherEtatAuthentification("erreur", "");
        afficherEtatAuthentification("succes", "");

        const profil = formulaireConnexion.querySelector('input[name="type_compte"]:checked')?.value;
        if (profil !== "jeune") {
          afficherEtatAuthentification("erreur", "Seul le compte Jeune est disponible dans ce test local.");
          return;
        }

        const bouton = formulaireConnexion.querySelector('button[type="submit"]');
        if (bouton) bouton.disabled = true;
        try {
          await requeteAuthentification("/auth/login", {
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("mot_de_passe").value
          }, csrfToken);
          afficherEtatAuthentification("succes", "Connexion réussie. Ouverture de ton espace local…");
          window.location.href = "/dashboard.html";
        } catch (erreur) {
          console.error("Connexion locale impossible :", erreur);
          afficherEtatAuthentification("erreur", erreur.message);
        } finally {
          if (bouton) bouton.disabled = false;
        }
      });
    }
  } catch (erreur) {
    console.error("Activation du mode compte local impossible :", erreur);
    const note = document.getElementById("auth-demo-note") || document.getElementById("auth-login-note");
    if (note) note.textContent = "Le serveur local n’est pas disponible. Le formulaire reste désactivé.";
  }
}

document.addEventListener("DOMContentLoaded", () => activerAuthentificationLocale());
