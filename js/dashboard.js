document.addEventListener("DOMContentLoaded", () => {
  if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.initialiser();
  const blocNonConnecte = document.getElementById("bloc-non-connecte");
  const blocDashboard = document.getElementById("bloc-dashboard");
  const lectureSession = lireJSONDashboard("jac_utilisateur_connecte", null);

  if (lectureSession.erreur) {
    afficherErreurConnexion("La session locale est illisible. Reconnecte-toi; aucune donnée n’a été modifiée.");
    return;
  }
  const utilisateur = lectureSession.valeur;
  if (!utilisateur) return;
  if (!utilisateur || typeof utilisateur !== "object" || Array.isArray(utilisateur)) {
    afficherErreurConnexion("Le profil de session n’a pas le format attendu. Reconnecte-toi pour continuer.");
    return;
  }
  if (!["jeune", "mentor", "entreprise"].includes(utilisateur.typeCompte)) {
    afficherErreurConnexion("Le rôle associé à ce profil n’est pas reconnu. Aucune donnée n’a été modifiée.");
    return;
  }

  blocNonConnecte.hidden = true;
  blocDashboard.hidden = false;
  document.getElementById("avatar-initiale").textContent = initialesDashboard(utilisateur.nom);
  document.getElementById("sidebar-nom").textContent = texteDashboard(utilisateur.nom) || "Nom non renseigné";
  document.getElementById("sidebar-type").textContent = libelleRole(utilisateur);
  document.getElementById("dashboard-salutation").textContent = `Bonjour${utilisateur.nom ? ` ${String(utilisateur.nom).trim().split(/\s+/)[0]}` : ""}.`;
  document.getElementById("dashboard-role-kicker").textContent = `ESPACE ${libelleRole(utilisateur).toLocaleUpperCase("fr")}`;
  document.getElementById("dashboard-sous-titre").textContent =
    "Les repères ci-dessous viennent de ce navigateur. Ils ne représentent pas des échanges ou décisions réels.";

  const nav = document.getElementById("dashboard-nav");
  nav.innerHTML = navigationRole(utilisateur.typeCompte)
    .map(item => `<a href="${item.href}"${item.current ? ' aria-current="page"' : ""}>${echapperDashboard(item.label)}</a>`)
    .join("");

  const sections = [];
  const alertes = [];
  const favoris = window.JeuneAvenirFavoris.lire();
  if (favoris.erreur) alertes.push(favoris.erreur.message);

  if (utilisateur.typeCompte === "jeune") {
    const email = normaliserEmailDashboard(utilisateur.email);
    const candidatures = lireListeDashboard("jac_candidatures");
    const demandes = lireListeDashboard("jac_demandes_mentorat");
    const resultat = lireJSONDashboard("jac_dernier_resultat_quiz", null);

    if (candidatures.erreur) alertes.push("L’historique des candidatures locales est illisible.");
    if (demandes.erreur) alertes.push("Les demandes de mentorat locales sont illisibles.");
    if (resultat.erreur) alertes.push("Le résultat d’orientation local est illisible.");

    const mesCandidatures = candidatures.valeur
      ? candidatures.valeur.filter(item => normaliserEmailDashboard(item && item.candidatEmail) === email)
      : null;
    const mesDemandes = demandes.valeur
      ? demandes.valeur.filter(item => normaliserEmailDashboard(item && item.jeuneEmail) === email)
      : null;
    const nombreFavoris = favoris.erreur
      ? null
      : Object.values(favoris.favoris).reduce((total, liste) => total + (Array.isArray(liste) ? liste.length : 0), 0);

    afficherStats([
      { valeur: nombreFavoris === null ? "Indisponible" : String(nombreFavoris), libelle: "Favoris enregistrés" },
      { valeur: resultat.erreur ? "Indisponible" : (resultat.valeur ? "Oui" : "Non"), libelle: "Résultat d’orientation enregistré" },
      { valeur: mesCandidatures === null ? "Indisponible" : String(mesCandidatures.length), libelle: "Candidatures locales" },
      { valeur: mesDemandes === null ? "Indisponible" : String(mesDemandes.length), libelle: "Demandes mentorat locales" }
    ]);

    sections.push(carteProfil(utilisateur, "Mon profil"));
    sections.push(carteOrientation(resultat));
    sections.push(carteDemarchesJeune(mesCandidatures, mesDemandes));
  } else if (utilisateur.typeCompte === "mentor") {
    sections.push(carteProfil(utilisateur, "Mon profil de mentor"));
    const identifiantMentor = texteDashboard(
      utilisateur.mentorId || (utilisateur.profilDetails && utilisateur.profilDetails.mentorId)
    );
    const demandes = lireListeDashboard("jac_demandes_mentorat");
    if (demandes.erreur) alertes.push("Les demandes locales ne peuvent pas être lues.");
    const demandesLiees = identifiantMentor && demandes.valeur
      ? demandes.valeur.filter(item => item && item.mentorId === identifiantMentor)
      : null;

    afficherStats([
      { valeur: demandesLiees === null ? "Non reliées" : String(demandesLiees.length), libelle: "Demandes locales liées à ce profil" }
    ]);
    sections.push(carteDemandesMentor(demandesLiees, Boolean(identifiantMentor)));
  } else {
    sections.push(carteProfil(utilisateur, "Mon profil entreprise"));
    const offres = lireListeDashboard("jac_offres_entreprise");
    if (offres.erreur) alertes.push("Les offres locales ne peuvent pas être lues.");
    const email = normaliserEmailDashboard(utilisateur.email);
    const mesOffres = offres.valeur
      ? offres.valeur.filter(item => normaliserEmailDashboard(item && item.entrepriseEmail) === email)
      : null;

    afficherStats([
      { valeur: mesOffres === null ? "Indisponible" : String(mesOffres.length), libelle: "Offres locales" }
    ]);
    sections.push(carteOffresEntreprise(mesOffres));
  }

  document.getElementById("dashboard-sections").innerHTML = sections.join("");
  const zoneErreur = document.getElementById("dashboard-erreur");
  if (alertes.length) {
    zoneErreur.hidden = false;
    zoneErreur.textContent = alertes.join(" ");
  }
  document.getElementById("dashboard-actions").innerHTML = actionPrincipale(utilisateur.typeCompte);
  document.getElementById("bouton-deconnexion").addEventListener("click", () => {
    try {
      localStorage.removeItem("jac_utilisateur_connecte");
      window.location.href = "index.html";
    } catch (erreur) {
      console.error("Déconnexion locale impossible :", erreur);
      zoneErreur.hidden = false;
      zoneErreur.textContent = "La session n’a pas pu être retirée de ce navigateur.";
    }
  });

  if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.initialiser();
});

function lireJSONDashboard(cle, valeurParDefaut) {
  try {
    const contenu = localStorage.getItem(cle);
    return { valeur: contenu === null ? valeurParDefaut : JSON.parse(contenu), erreur: null };
  } catch (erreur) {
    console.error(`Lecture du stockage local ${cle} impossible :`, erreur);
    return { valeur: null, erreur };
  }
}

function lireListeDashboard(cle) {
  const lecture = lireJSONDashboard(cle, []);
  if (!lecture.erreur && !Array.isArray(lecture.valeur)) {
    const erreur = new Error(`Le stockage ${cle} n’est pas une liste.`);
    console.error(erreur.message);
    return { valeur: null, erreur };
  }
  return lecture;
}

function afficherStats(stats) {
  document.getElementById("dashboard-stats").innerHTML = stats.map(stat => `
    <article class="account-stat" data-motion="rise">
      <strong>${echapperDashboard(stat.valeur)}</strong>
      <span>${echapperDashboard(stat.libelle)}</span>
    </article>
  `).join("");
}

function carteProfil(utilisateur, titre) {
  const details = utilisateur.profilDetails && typeof utilisateur.profilDetails === "object"
    ? utilisateur.profilDetails
    : {};
  const role = utilisateur.typeCompte === "mentor" && utilisateur.sousTypeCompte === "professeur"
    ? "professeur"
    : utilisateur.typeCompte;
  const infos = role === "jeune"
    ? [["Situation", utilisateur.statut], ["Formation", utilisateur.formation], ["Ville", utilisateur.ville]]
    : role === "professeur"
      ? [["Discipline", details.matiere || utilisateur.matiere], ["Établissement", details.etablissement || utilisateur.etablissement], ["Ville", utilisateur.ville]]
      : role === "mentor"
        ? [["Métier ou fonction", details.profession || utilisateur.profession], ["Domaine", details.domaine || utilisateur.domaine], ["Organisation", details.organisation || utilisateur.organisation], ["Ville", utilisateur.ville]]
        : [["Organisation", details.organisation || utilisateur.organisation], ["Fonction", details.fonction || utilisateur.fonction], ["Secteur", details.secteur || utilisateur.secteur], ["Ville", utilisateur.ville]];
  const lignes = infos.filter(([, valeur]) => typeof valeur === "string" && valeur.trim()).map(([label, valeur]) =>
    `<div><dt>${echapperDashboard(label)}</dt><dd>${echapperDashboard(valeur)}</dd></div>`
  ).join("");

  return `
    <section class="account-panel" data-motion="rise">
      <div class="account-section-heading">
        <div><p class="account-eyebrow">INFORMATIONS ENREGISTRÉES</p><h2>${echapperDashboard(titre)}</h2></div>
        <a class="account-text-link" href="profil.html">Modifier le profil</a>
      </div>
      ${lignes ? `<dl class="account-profile-facts">${lignes}</dl>` : `<p class="account-empty-inline">Aucune information complémentaire n’est renseignée.</p>`}
    </section>`;
}

function carteOrientation(resultat) {
  if (resultat.erreur) {
    return `<section class="account-panel" data-motion="rise"><h2>Mon parcours d’orientation</h2><p class="account-alert">Le résultat local est illisible. Il n’a pas été modifié.</p></section>`;
  }
  const valeur = resultat.valeur;
  const date = valeur && typeof valeur.date === "string" ? formaterDateDashboard(valeur.date) : "";
  const filieres = valeur && Array.isArray(valeur.filieresAccessibles) ? valeur.filieresAccessibles.length : null;
  const texte = valeur
    ? `Un résultat de quiz est enregistré${date ? ` le ${date}` : ""}. Il s’agit d’une piste d’orientation, pas d’une décision d’admission.`
    : "Aucun résultat de quiz n’est enregistré dans ce navigateur.";

  return `
    <section class="account-panel" data-motion="rise">
      <div class="account-section-heading"><div><p class="account-eyebrow">ORIENTATION</p><h2>Mon parcours d’orientation</h2></div></div>
      <p>${echapperDashboard(texte)}</p>
      ${valeur && filieres !== null ? `<p class="account-card-meta">${filieres} filière${filieres === 1 ? "" : "s"} accessible${filieres === 1 ? "" : "s"} dans le résultat sauvegardé.</p>` : ""}
      <a class="account-text-link" href="${valeur ? "resultat.html" : "quiz.html"}">${valeur ? "Consulter le résultat" : "Découvrir le quiz"} <span aria-hidden="true">→</span></a>
    </section>`;
}

function carteDemarchesJeune(candidatures, demandes) {
  const contenuCandidatures = candidatures === null
    ? "Historique des candidatures indisponible."
    : candidatures.length
      ? `${candidatures.length} candidature${candidatures.length === 1 ? "" : "s"} enregistrée${candidatures.length === 1 ? "" : "s"} localement. Aucune n’a été transmise à une entreprise.`
      : "Aucune candidature locale enregistrée.";
  const contenuDemandes = demandes === null
    ? "Historique des demandes mentorat indisponible."
    : demandes.length
      ? `${demandes.length} demande${demandes.length === 1 ? "" : "s"} de démonstration enregistrée${demandes.length === 1 ? "" : "s"} dans ce navigateur.`
      : "Aucune demande de mentorat locale enregistrée.";

  return `
    <section class="account-panel" data-motion="rise">
      <p class="account-eyebrow">DÉMARCHES LOCALES</p><h2>Mes démarches</h2>
      <div class="account-action-list">
        <p>${echapperDashboard(contenuCandidatures)} <a href="candidatures.html">Voir l’historique</a></p>
        <p>${echapperDashboard(contenuDemandes)} <a href="mentorat.html">Explorer le mentorat</a></p>
      </div>
    </section>`;
}

function carteDemandesMentor(demandes, identifiantDisponible) {
  if (!identifiantDisponible) {
    return `
      <section class="account-panel" data-motion="rise">
        <p class="account-eyebrow">MENTORAT</p><h2>Demandes reçues</h2>
        <p>Aucune demande ne peut être rattachée de façon fiable à ce compte. Les demandes locales sont liées à un identifiant de profil mentor que le compte V1 ne possède pas encore; elles ne sont pas attribuées par nom seul.</p>
        <a class="account-text-link" href="mentorat.html">Voir l’annuaire mentorat</a>
      </section>`;
  }
  if (demandes === null) {
    return `<section class="account-panel" data-motion="rise"><h2>Demandes reçues</h2><p class="account-alert">Les données locales sont illisibles; aucune demande n’est affichée.</p></section>`;
  }
  const lignes = demandes.map(demande => `
    <li><strong>${echapperDashboard(demande.jeuneNom || "Nom non renseigné")}</strong>
      <span>${echapperDashboard(demande.statut || "Statut indisponible")} · démonstration locale, non transmise</span>
    </li>
  `).join("");
  return `
    <section class="account-panel" data-motion="rise">
      <p class="account-eyebrow">MENTORAT LOCAL</p><h2>Demandes reçues liées à ce profil</h2>
      ${lignes ? `<ul class="account-request-list">${lignes}</ul>` : `<p class="account-empty-inline">Aucune demande locale n’est liée à cet identifiant de mentor.</p>`}
    </section>`;
}

function carteOffresEntreprise(offres) {
  if (offres === null) {
    return `<section class="account-panel" data-motion="rise"><h2>Mes offres locales</h2><p class="account-alert">Les données locales des offres sont illisibles; elles n’ont pas été remplacées.</p></section>`;
  }
  const cartes = offres.map(offre => {
    const statut = offre.statut === "brouillon"
      ? "Brouillon local"
      : offre.statut === "a_verifier"
        ? "À vérifier, non transmis"
        : "Statut local non reconnu";
    return `<li><strong>${echapperDashboard(offre.titre || "Offre sans titre")}</strong><span>${statut}</span></li>`;
  }).join("");
  return `
    <section class="account-panel" data-motion="rise" id="mes-offres">
      <div class="account-section-heading"><div><p class="account-eyebrow">ESPACE ENTREPRISE</p><h2>Mes offres locales</h2></div><a class="account-text-link" href="publier-offre.html#mes-offres">Gérer mes offres</a></div>
      ${cartes ? `<ul class="account-request-list">${cartes}</ul>` : `<p class="account-empty-inline">Aucune offre locale n’est enregistrée pour cette entreprise.</p>`}
      <p class="account-local-note">Les candidatures reçues et les entretiens ne sont pas accessibles en V1.</p>
    </section>`;
}

function navigationRole(role) {
  const commun = [
    { label: "Tableau de bord", href: "dashboard.html", current: true },
    { label: "Mon profil", href: "profil.html" },
    { label: "Mes favoris", href: "favoris.html" }
  ];
  if (role === "jeune") {
    return [...commun,
      { label: "Orientation", href: "quiz.html" },
      { label: "Mes candidatures locales", href: "candidatures.html" },
      { label: "Mentorat", href: "mentorat.html" }
    ];
  }
  if (role === "mentor") return [...commun, { label: "Annuaire mentorat", href: "mentorat.html" }];
  return [...commun, { label: "Gérer mes offres locales", href: "publier-offre.html#mes-offres" }];
}

function actionPrincipale(role) {
  if (role === "jeune") return '<a class="account-button" href="quiz.html">Reprendre mon parcours</a>';
  if (role === "mentor") return '<a class="account-button" href="profil.html">Mettre à jour mon profil</a>';
  return '<a class="account-button" href="publier-offre.html">Préparer une offre locale</a>';
}

function libelleRole(utilisateur) {
  if (utilisateur.typeCompte === "mentor" && utilisateur.sousTypeCompte === "professeur") return "Professeur / enseignant";
  return { jeune: "Jeune", mentor: "Mentor", entreprise: "Entreprise" }[utilisateur.typeCompte];
}

function afficherErreurConnexion(message) {
  const bloc = document.getElementById("bloc-non-connecte");
  const erreur = document.createElement("p");
  erreur.className = "account-alert";
  erreur.setAttribute("role", "alert");
  erreur.textContent = message;
  bloc.appendChild(erreur);
}

function echapperDashboard(valeur) {
  return String(valeur == null ? "" : valeur).replace(/[&<>"']/g, caractere => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[caractere]);
}

function texteDashboard(valeur) {
  return typeof valeur === "string" ? valeur.trim() : "";
}

function initialesDashboard(nom) {
  return texteDashboard(nom).split(/\s+/).filter(Boolean).slice(0, 2).map(partie => partie[0].toLocaleUpperCase("fr")).join("") || "?";
}

function normaliserEmailDashboard(email) {
  return typeof email === "string" ? email.trim().toLocaleLowerCase("fr") : "";
}

function formaterDateDashboard(valeur) {
  const date = new Date(valeur);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("fr-CI", { dateStyle: "long" }).format(date);
}
