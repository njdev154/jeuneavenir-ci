document.addEventListener("DOMContentLoaded", () => {
  if (!window.JeuneAvenirPilot?.accountsEnabled) return;

  if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.initialiser();
  const blocProfil = document.getElementById("bloc-profil");
  const blocNonConnecte = document.getElementById("bloc-non-connecte");
  const erreurSession = document.getElementById("profil-erreur-session");
  const session = lireJSONLocal("jac_utilisateur_connecte", null);

  if (session.erreur) {
    afficherErreurSession("La session locale est illisible. Aucune donnée n’a été modifiée.");
    return;
  }
  if (!session.valeur) {
    blocNonConnecte.hidden = false;
    if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.initialiser();
    return;
  }

  const utilisateur = session.valeur;
  if (!utilisateur || typeof utilisateur !== "object" || Array.isArray(utilisateur)) {
    afficherErreurSession("Le profil de session n’a pas le format attendu. Reconnecte-toi pour continuer.");
    return;
  }
  if (!["jeune", "mentor", "entreprise"].includes(utilisateur.typeCompte)) {
    afficherErreurSession("Le rôle associé à ce profil n’est pas reconnu. Aucune information n’a été modifiée.");
    return;
  }

  const details = utilisateur.profilDetails == null ? {} : utilisateur.profilDetails;
  if (typeof details !== "object" || Array.isArray(details)) {
    afficherErreurSession("Les informations complémentaires du profil sont illisibles. Elles n’ont pas été remplacées.");
    return;
  }

  blocProfil.hidden = false;
  const professeur = utilisateur.typeCompte === "mentor" && utilisateur.sousTypeCompte === "professeur";
  const role = professeur ? "professeur" : utilisateur.typeCompte;
  const libelles = { jeune: "Jeune", mentor: "Mentor", professeur: "Professeur / enseignant", entreprise: "Entreprise" };

  document.getElementById("profil-nom").value = texteLocal(utilisateur.nom);
  document.getElementById("profil-email").value = texteLocal(utilisateur.email);
  document.getElementById("profil-ville").value = texteLocal(utilisateur.ville);
  document.getElementById("profil-resume-nom").textContent = texteLocal(utilisateur.nom) || "Nom non renseigné";
  document.getElementById("profil-resume-role").textContent = libelles[role];
  document.getElementById("profil-avatar").textContent = initialesProfil(utilisateur.nom);
  rendreVisible(document.getElementById(`champs-${role}`));

  const valeurs = role === "jeune" ? {
    statut: utilisateur.statut || details.statut,
    formation: details.formation || utilisateur.formation,
    competences: Array.isArray(utilisateur.competences)
      ? utilisateur.competences
      : (Array.isArray(details.competences) ? details.competences : [])
  } : role === "mentor" ? {
    profession: details.profession || utilisateur.profession,
    domaine: details.domaine || utilisateur.domaine,
    organisation: details.organisation || utilisateur.organisation
  } : role === "professeur" ? {
    matiere: details.matiere || utilisateur.matiere,
    etablissement: details.etablissement || utilisateur.etablissement
  } : {
    organisation: details.organisation || utilisateur.organisation,
    fonction: details.fonction || utilisateur.fonction,
    secteur: details.secteur || utilisateur.secteur
  };

  if (role === "jeune") {
    const statut = texteLocal(valeurs.statut);
    const select = document.getElementById("profil-statut");
    if (statut && !Array.from(select.options).some(option => option.value === statut)) {
      const option = document.createElement("option");
      option.value = statut;
      option.textContent = `Valeur déjà enregistrée : ${statut}`;
      select.appendChild(option);
    }
    select.value = statut;
    document.getElementById("profil-formation").value = texteLocal(valeurs.formation);
    document.getElementById("profil-competences").value = valeurs.competences.join(", ");
  } else if (role === "mentor") {
    document.getElementById("profil-profession").value = texteLocal(valeurs.profession);
    document.getElementById("profil-domaine").value = texteLocal(valeurs.domaine);
    document.getElementById("profil-organisation-mentor").value = texteLocal(valeurs.organisation);
  } else if (role === "professeur") {
    document.getElementById("profil-matiere").value = texteLocal(valeurs.matiere);
    document.getElementById("profil-etablissement").value = texteLocal(valeurs.etablissement);
  } else {
    document.getElementById("profil-organisation-entreprise").value = texteLocal(valeurs.organisation);
    document.getElementById("profil-fonction").value = texteLocal(valeurs.fonction);
    document.getElementById("profil-secteur").value = texteLocal(valeurs.secteur);
  }

  const formulaire = document.getElementById("formulaire-profil");
  const messageErreur = document.getElementById("profil-erreur");
  const messageSucces = document.getElementById("message-succes-profil");
  const bouton = document.getElementById("bouton-enregistrer-profil");

  formulaire.addEventListener("submit", evenement => {
    evenement.preventDefault();
    messageErreur.hidden = true;
    messageSucces.textContent = "";

    const nom = document.getElementById("profil-nom").value.trim();
    if (!nom) {
      afficherErreurFormulaire("Renseigne ton nom complet pour enregistrer le profil.");
      document.getElementById("profil-nom").focus();
      return;
    }

    const misAJour = {
      ...utilisateur,
      nom,
      ville: document.getElementById("profil-ville").value.trim(),
      profilDetails: { ...details }
    };

    if (role === "jeune") {
      misAJour.statut = document.getElementById("profil-statut").value;
      misAJour.formation = document.getElementById("profil-formation").value.trim();
      misAJour.competences = document.getElementById("profil-competences").value
        .split(",").map(competence => competence.trim()).filter(Boolean);
      Object.assign(misAJour.profilDetails, {
        statut: misAJour.statut,
        formation: misAJour.formation,
        competences: [...misAJour.competences]
      });
    } else {
      Object.entries(champsRole(role)).forEach(([cle, id]) => {
        const valeur = document.getElementById(id).value.trim();
        misAJour.profilDetails[cle] = valeur;
        if (Object.prototype.hasOwnProperty.call(utilisateur, cle)) misAJour[cle] = valeur;
      });
    }

    const comptes = lireJSONLocal("jac_utilisateurs", []);
    if (comptes.erreur || !Array.isArray(comptes.valeur)) {
      afficherErreurFormulaire("La liste des comptes locaux est illisible. Rien n’a été enregistré.");
      return;
    }
    const listeComptes = [...comptes.valeur];
    const email = normaliserEmail(utilisateur.email);
    if (!email) {
      afficherErreurFormulaire("Aucune adresse e-mail n’est associée à ce profil. La sauvegarde est indisponible.");
      return;
    }
    const index = listeComptes.findIndex(compte =>
      compte && typeof compte.email === "string" && normaliserEmail(compte.email) === email
    );
    if (index === -1) listeComptes.push(misAJour);
    else listeComptes[index] = misAJour;

    bouton.disabled = true;
    bouton.textContent = "Enregistrement local…";
    try {
      localStorage.setItem("jac_utilisateurs", JSON.stringify(listeComptes));
      localStorage.setItem("jac_utilisateur_connecte", JSON.stringify(misAJour));
      utilisateur.nom = misAJour.nom;
      utilisateur.ville = misAJour.ville;
      utilisateur.profilDetails = misAJour.profilDetails;
      Object.keys(misAJour).forEach(cle => {
        if (cle !== "profilDetails") utilisateur[cle] = misAJour[cle];
      });
      document.getElementById("profil-resume-nom").textContent = nom;
      document.getElementById("profil-avatar").textContent = initialesProfil(nom);
      messageSucces.textContent = "Profil enregistré dans ce navigateur.";
      if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.animer(messageSucces);
    } catch (erreur) {
      console.error("Enregistrement du profil local impossible :", erreur);
      afficherErreurFormulaire("Le profil n’a pas pu être enregistré dans ce navigateur.");
    } finally {
      bouton.disabled = false;
      bouton.textContent = "Enregistrer les modifications";
    }
  });

  if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.initialiser();

  function afficherErreurSession(message) {
    erreurSession.hidden = false;
    erreurSession.textContent = message;
    if (blocNonConnecte) blocNonConnecte.hidden = true;
    if (blocProfil) blocProfil.hidden = true;
  }

  function afficherErreurFormulaire(message) {
    messageErreur.hidden = false;
    messageErreur.textContent = message;
  }
});

function lireJSONLocal(cle, valeurParDefaut) {
  try {
    const valeur = localStorage.getItem(cle);
    return { valeur: valeur === null ? valeurParDefaut : JSON.parse(valeur), erreur: null };
  } catch (erreur) {
    console.error(`Lecture du stockage local ${cle} impossible :`, erreur);
    return { valeur: null, erreur };
  }
}

function texteLocal(valeur) {
  return typeof valeur === "string" ? valeur : "";
}

function initialesProfil(nom) {
  return texteLocal(nom).trim().split(/\s+/).filter(Boolean).slice(0, 2).map(partie => partie[0].toLocaleUpperCase("fr")).join("") || "?";
}

function normaliserEmail(email) {
  return typeof email === "string" ? email.trim().toLocaleLowerCase("fr") : "";
}

function rendreVisible(element) {
  if (!element) return;
  element.hidden = false;
  element.disabled = false;
  element.querySelectorAll("input, select, textarea").forEach(champ => { champ.disabled = false; });
}

function champsRole(role) {
  return role === "mentor" ? {
    profession: "profil-profession",
    domaine: "profil-domaine",
    organisation: "profil-organisation-mentor"
  } : role === "professeur" ? {
    matiere: "profil-matiere",
    etablissement: "profil-etablissement"
  } : {
    organisation: "profil-organisation-entreprise",
    fonction: "profil-fonction",
    secteur: "profil-secteur"
  };
}
