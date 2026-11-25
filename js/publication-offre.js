const CLE_OFFRES_ENTREPRISE = "jac_offres_entreprise";
let UTILISATEUR_ENTREPRISE = null;
let DOMAINES_PUBLICATION = [];
let OFFRE_EN_COURS_EDITION = null;

document.addEventListener("DOMContentLoaded", initialiserPublicationOffres);

async function initialiserPublicationOffres() {
  if (!window.JeuneAvenirPilot?.submissionsEnabled) return;

  const zone = document.getElementById("zone-publication");
  if (!zone) return;

  UTILISATEUR_ENTREPRISE = lireUtilisateurEntreprise();
  if (!UTILISATEUR_ENTREPRISE || UTILISATEUR_ENTREPRISE.typeCompte !== "entreprise") {
    afficherAccesPublicationRefuse();
    return;
  }

  zone.hidden = false;
  document.getElementById("acces-publication").hidden = true;
  document.getElementById("formulaire-offre").addEventListener("submit", enregistrerOffreLocale);
  document.getElementById("formulaire-offre").addEventListener("input", actualiserApercuOffre);
  document.getElementById("formulaire-offre").addEventListener("change", actualiserApercuOffre);
  document.querySelectorAll("#formulaire-offre button[type=submit]").forEach(bouton => {
    bouton.addEventListener("click", () => { document.getElementById("formulaire-offre").dataset.etat = bouton.value; });
  });

  const organisation = UTILISATEUR_ENTREPRISE.profilDetails && UTILISATEUR_ENTREPRISE.profilDetails.organisation;
  if (typeof organisation === "string") document.getElementById("entreprise-offre").value = organisation;
  await chargerDomainesPublication();
  afficherOffresLocales();
  actualiserApercuOffre();
  chargerOffreDepuisURL();
  if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.initialiser();
}

function lireUtilisateurEntreprise() {
  try {
    const utilisateur = JSON.parse(localStorage.getItem("jac_utilisateur_connecte") || "null");
    return utilisateur && typeof utilisateur.email === "string" ? utilisateur : null;
  } catch (erreur) {
    console.error("Lecture du compte local impossible :", erreur);
    return null;
  }
}

function afficherAccesPublicationRefuse() {
  const bloc = document.getElementById("acces-publication");
  bloc.hidden = false;
  bloc.innerHTML = `
    <h2>Accès réservé aux comptes Entreprise</h2>
    <p>Connecte-toi avec un compte Entreprise pour préparer une annonce. La vérification de rôle est locale à cette V1 et ne remplace pas une autorisation côté serveur.</p>
    <a class="bouton-principal" href="connexion.html">Se connecter</a>
    <a class="offres-lien" href="inscription.html">Créer un compte</a>
  `;
  if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.initialiser();
}

async function chargerDomainesPublication() {
  const select = document.getElementById("domaine-offre-entreprise");
  try {
    const reponse = await fetch("data/filieres.json");
    if (!reponse.ok) throw new Error(`Chargement des domaines impossible (${reponse.status}).`);
    const donnees = await reponse.json();
    if (!Array.isArray(donnees.filieres)) throw new Error("Le format des domaines est invalide.");
    DOMAINES_PUBLICATION = donnees.filieres
      .filter(filiere => filiere && typeof filiere.id === "string" && filiere.id.trim() && typeof filiere.nom === "string" && filiere.nom.trim())
      .map(filiere => ({ id: filiere.id.trim(), nom: filiere.nom.trim() }));
    select.replaceChildren(new Option("Choisir un domaine", ""));
    DOMAINES_PUBLICATION.forEach(domaine => select.add(new Option(domaine.nom, domaine.id)));
  } catch (erreur) {
    console.error("Chargement des domaines de publication :", erreur);
    select.replaceChildren(new Option("Domaines indisponibles", ""));
    select.disabled = true;
    afficherErreurPublication("Les domaines ne peuvent pas être chargés. Le formulaire ne peut pas être enregistré.");
  }
}

function lireOffresLocales() {
  try {
    const valeur = localStorage.getItem(CLE_OFFRES_ENTREPRISE);
    const offres = valeur ? JSON.parse(valeur) : [];
    if (!Array.isArray(offres)) throw new Error("Les offres locales ne sont pas une liste.");
    return offres;
  } catch (erreur) {
    console.error("Lecture des offres locales impossible :", erreur);
    return null;
  }
}

function offresDeEntrepriseConnectee() {
  const offres = lireOffresLocales();
  if (!offres) return null;
  const email = UTILISATEUR_ENTREPRISE.email.trim().toLocaleLowerCase("fr");
  return offres.filter(offre =>
    typeof offre.entrepriseEmail === "string"
    && offre.entrepriseEmail.trim().toLocaleLowerCase("fr") === email
  );
}

function textePublication(valeur) {
  if (typeof valeur === "string" || typeof valeur === "number") return String(valeur).trim();
  return "";
}

function echapperPublication(valeur) {
  return String(valeur)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function actualiserApercuOffre() {
  const formulaire = document.getElementById("formulaire-offre");
  if (!formulaire) return;
  const donnees = new FormData(formulaire);
  const valeur = nom => textePublication(donnees.get(nom));
  const type = valeur("type");
  document.getElementById("apercu-type").textContent = type === "stage" ? "Stage" : type === "emploi" ? "Emploi" : "Type à renseigner";
  document.getElementById("apercu-type").className = `badge-type-offre${type === "emploi" ? " badge-type-emploi" : ""}`;
  document.getElementById("titre-apercu").textContent = valeur("titre") || "Votre offre apparaîtra ici";
  document.getElementById("apercu-identite").textContent = [valeur("entreprise"), valeur("ville")].filter(Boolean).join(" · ") || "Entreprise et ville";
  const nomDomaine = DOMAINES_PUBLICATION.find(domaine => domaine.id === valeur("domaine"))?.nom;
  document.getElementById("apercu-meta").textContent = [
    nomDomaine,
    valeur("contrat"),
    valeur("dateLimite") ? `Date limite : ${valeur("dateLimite")}` : ""
  ].filter(Boolean).join(" · ") || "Domaine, contrat et date limite";
  document.getElementById("apercu-presentation").textContent = valeur("presentationEntreprise") || "La présentation apparaîtra ici pendant la saisie.";
  document.getElementById("apercu-description").textContent = valeur("description") || "À compléter.";
  document.getElementById("apercu-missions").textContent = valeur("missions") || "À compléter.";
  document.getElementById("apercu-profil").textContent = valeur("profilRecherche") || "À compléter.";
  document.getElementById("apercu-competences").textContent = valeur("competences") || "Non renseignées.";
  document.getElementById("apercu-conditions").textContent = valeur("conditions") || "Non renseignées.";
  const champsRequis = Array.from(formulaire.querySelectorAll("[required]"));
  const complets = champsRequis.filter(champ => champ.validity.valid).length;
  document.getElementById("progression-offre").value = complets;
  document.getElementById("texte-progression-offre").textContent = `${complets} sur ${champsRequis.length}`;
}

function enregistrerOffreLocale(evenement) {
  evenement.preventDefault();
  const formulaire = evenement.currentTarget;
  const erreur = document.getElementById("erreur-publication");
  erreur.hidden = true;
  const etat = evenement.submitter ? evenement.submitter.value : formulaire.dataset.etat;
  if (!["brouillon", "a_verifier"].includes(etat)) {
    afficherErreurPublication("Choisis comment enregistrer cette annonce.");
    return;
  }
  if (!DOMAINES_PUBLICATION.length) {
    afficherErreurPublication("Aucun domaine vérifiable n’est disponible; l’annonce n’a pas été enregistrée.");
    return;
  }
  if (!formulaire.reportValidity()) return;

  const donnees = new FormData(formulaire);
  const domaine = DOMAINES_PUBLICATION.find(item => item.id === donnees.get("domaine"));
  if (!domaine) {
    afficherErreurPublication("Choisis un domaine proposé dans la liste.");
    return;
  }
  const offres = lireOffresLocales();
  if (!offres) {
    afficherErreurPublication("Les annonces locales ne peuvent pas être lues. Rien n’a été modifié.");
    return;
  }
  const dateLimite = textePublication(donnees.get("dateLimite"));
  if (dateLimite && dateLimite < dateCourantePublication()) {
    afficherErreurPublication("La date limite ne peut pas être dans le passé.");
    return;
  }

  const email = UTILISATEUR_ENTREPRISE.email.trim().toLocaleLowerCase("fr");
  const indice = OFFRE_EN_COURS_EDITION
    ? offres.findIndex(offre => offre.id === OFFRE_EN_COURS_EDITION && offre.entrepriseEmail === email)
    : -1;
  const existante = indice >= 0 ? offres[indice] : null;
  const offre = {
    ...(existante || {}),
    id: existante ? existante.id : creerIdentifiantOffreLocale(),
    titre: textePublication(donnees.get("titre")),
    type: textePublication(donnees.get("type")),
    domaine: domaine.id,
    domaineNom: domaine.nom,
    ville: textePublication(donnees.get("ville")),
    entreprise: textePublication(donnees.get("entreprise")),
    presentationEntreprise: textePublication(donnees.get("presentationEntreprise")),
    contrat: textePublication(donnees.get("contrat")),
    dateLimite,
    description: textePublication(donnees.get("description")),
    missions: textePublication(donnees.get("missions")),
    profilRecherche: textePublication(donnees.get("profilRecherche")),
    competences: textePublication(donnees.get("competences")),
    conditions: textePublication(donnees.get("conditions")),
    statut: etat,
    mode: "demonstration_locale",
    entrepriseEmail: UTILISATEUR_ENTREPRISE.email,
    dateMiseAJour: new Date().toISOString()
  };
  if (!existante) offre.dateCreation = offre.dateMiseAJour;

  if (indice >= 0) offres[indice] = offre;
  else offres.push(offre);
  try {
    localStorage.setItem(CLE_OFFRES_ENTREPRISE, JSON.stringify(offres));
  } catch (erreurStockage) {
    console.error("Enregistrement de l’offre locale impossible :", erreurStockage);
    afficherErreurPublication("Le navigateur n’a pas pu enregistrer l’annonce. Vérifie son espace de stockage.");
    return;
  }

  OFFRE_EN_COURS_EDITION = null;
  formulaire.reset();
  if (UTILISATEUR_ENTREPRISE.profilDetails && UTILISATEUR_ENTREPRISE.profilDetails.organisation) {
    document.getElementById("entreprise-offre").value = UTILISATEUR_ENTREPRISE.profilDetails.organisation;
  }
  formulaire.dataset.etat = "";
  document.getElementById("titre-formulaire-offre").textContent = "Nouvelle offre";
  document.querySelectorAll("#formulaire-offre button[type=submit]").forEach(bouton => { bouton.disabled = false; });
  afficherOffresLocales();
  actualiserApercuOffre();
  const message = etat === "brouillon"
    ? "Brouillon enregistré dans ce navigateur."
    : "Enregistrée localement comme « à vérifier »; aucune transmission n’a eu lieu.";
  afficherConfirmationPublication(message);
  erreur.focus();
}

function creerIdentifiantOffreLocale() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") return `local-${window.crypto.randomUUID()}`;
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function dateCourantePublication() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function afficherConfirmationPublication(message) {
  const bloc = document.getElementById("erreur-publication");
  bloc.hidden = false;
  bloc.className = "offres-publication-note champ-large";
  bloc.setAttribute("role", "status");
  bloc.textContent = message;
  if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.animer(bloc);
}

function afficherErreurPublication(message) {
  const bloc = document.getElementById("erreur-publication");
  bloc.hidden = false;
  bloc.className = "offres-message-erreur champ-large";
  bloc.setAttribute("role", "alert");
  bloc.textContent = message;
}

function afficherOffresLocales() {
  const conteneur = document.getElementById("liste-offres-locales");
  const offres = offresDeEntrepriseConnectee();
  if (!offres) {
    conteneur.innerHTML = '<p class="offres-message-erreur" role="alert">Impossible de lire vos annonces locales. Aucune donnée n’a été modifiée.</p>';
    return;
  }
  if (!offres.length) {
    conteneur.innerHTML = '<p class="offres-preview-placeholder">Aucune offre enregistrée dans ce navigateur.</p>';
    return;
  }
  conteneur.innerHTML = offres
    .sort((a, b) => String(b.dateMiseAJour || "").localeCompare(String(a.dateMiseAJour || "")))
    .map(carteOffreLocale)
    .join("");
  conteneur.querySelectorAll("[data-action-offre]").forEach(bouton => {
    bouton.addEventListener("click", () => {
      if (bouton.dataset.actionOffre === "modifier") modifierOffreLocale(bouton.dataset.id);
      if (bouton.dataset.actionOffre === "supprimer") supprimerOffreLocale(bouton.dataset.id);
    });
  });
  if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.initialiser();
}

function libelleStatutOffre(statut) {
  if (statut === "brouillon") return "Brouillon — local";
  if (statut === "a_verifier") return "À vérifier — non transmis";
  return "Statut local non reconnu";
}

function carteOffreLocale(offre) {
  return `
    <article class="offres-locale-carte" data-motion="rise">
      <div>
        <span class="badge-type-offre${offre.type === "emploi" ? " badge-type-emploi" : ""}">${offre.type === "stage" ? "Stage" : "Emploi"}</span>
        <h3>${echapperPublication(textePublication(offre.titre))}</h3>
        <p>${echapperPublication(textePublication(offre.entreprise))} · ${echapperPublication(textePublication(offre.ville))}</p>
        <p>${echapperPublication(libelleStatutOffre(offre.statut))} · jamais visible dans le catalogue public</p>
      </div>
      <div class="offres-locale-actions">
        <button type="button" data-action-offre="modifier" data-id="${echapperPublication(offre.id)}">Modifier</button>
        <button type="button" data-action-offre="supprimer" data-id="${echapperPublication(offre.id)}">Supprimer</button>
      </div>
    </article>
  `;
}

function modifierOffreLocale(id) {
  const offres = offresDeEntrepriseConnectee();
  const offre = offres && offres.find(item => item.id === id);
  if (!offre) {
    afficherErreurPublication("Cette annonce locale n’est plus disponible pour ce compte.");
    return;
  }
  OFFRE_EN_COURS_EDITION = offre.id;
  const formulaire = document.getElementById("formulaire-offre");
  Object.entries({
    titre: offre.titre,
    type: offre.type,
    domaine: offre.domaine,
    ville: offre.ville,
    entreprise: offre.entreprise,
    presentationEntreprise: offre.presentationEntreprise,
    contrat: offre.contrat,
    dateLimite: offre.dateLimite,
    description: offre.description,
    missions: offre.missions,
    profilRecherche: offre.profilRecherche,
    competences: offre.competences,
    conditions: offre.conditions
  }).forEach(([nom, valeur]) => {
    if (formulaire.elements[nom]) formulaire.elements[nom].value = valeur || "";
  });
  document.getElementById("titre-formulaire-offre").textContent = "Modifier l’offre locale";
  formulaire.scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("titre-offre").focus();
  actualiserApercuOffre();
}

function supprimerOffreLocale(id) {
  if (!window.confirm("Supprimer cette annonce enregistrée uniquement dans ce navigateur ?")) return;
  const offres = lireOffresLocales();
  if (!offres) {
    afficherErreurPublication("Impossible de lire les annonces locales; rien n’a été supprimé.");
    return;
  }
  const email = UTILISATEUR_ENTREPRISE.email.trim().toLocaleLowerCase("fr");
  const restantes = offres.filter(offre =>
    !(offre.id === id && typeof offre.entrepriseEmail === "string" && offre.entrepriseEmail.trim().toLocaleLowerCase("fr") === email)
  );
  try {
    localStorage.setItem(CLE_OFFRES_ENTREPRISE, JSON.stringify(restantes));
  } catch (erreur) {
    console.error("Suppression de l’offre locale impossible :", erreur);
    afficherErreurPublication("Le navigateur n’a pas pu mettre à jour le stockage local.");
    return;
  }
  if (OFFRE_EN_COURS_EDITION === id) OFFRE_EN_COURS_EDITION = null;
  afficherOffresLocales();
}

function chargerOffreDepuisURL() {
  const identifiant = new URLSearchParams(window.location.search).get("modifier");
  if (identifiant) modifierOffreLocale(identifiant);
}
