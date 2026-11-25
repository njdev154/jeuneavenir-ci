let TOUTES_OFFRES = [];
let TOUTES_FILIERES = [];
let OFFRES_PUBLIEES = false;

document.addEventListener("DOMContentLoaded", initialiserCatalogueOffres);

async function initialiserCatalogueOffres() {
  const recherche = document.getElementById("recherche-offre");
  if (!recherche) return;

  recherche.addEventListener("input", appliquerFiltres);
  ["filtre-domaine-offre", "filtre-ville-offre", "filtre-type-offre", "filtre-contrat-offre"]
    .forEach(id => document.getElementById(id).addEventListener("change", appliquerFiltres));
  window.addEventListener("hashchange", afficherRouteOffre);
  afficherChargementOffres();

  try {
    const [repOffres, repFilieres] = await Promise.all([
      fetch("data/offres.json"),
      fetch("data/filieres.json")
    ]);
    if (!repOffres.ok) throw new Error(`Le catalogue des offres est indisponible (${repOffres.status}).`);
    if (!repFilieres.ok) throw new Error(`Les domaines professionnels sont indisponibles (${repFilieres.status}).`);

    const [donneesOffres, donneesFilieres] = await Promise.all([repOffres.json(), repFilieres.json()]);
    if (!Array.isArray(donneesOffres.offres) || !Array.isArray(donneesFilieres.filieres)) {
      throw new Error("Le format des données du catalogue est invalide.");
    }

    OFFRES_PUBLIEES = donneesOffres._statut_publication === "verifie";
    TOUTES_OFFRES = OFFRES_PUBLIEES
      ? donneesOffres.offres.map(normaliserOffre).filter(Boolean)
      : [];
    TOUTES_FILIERES = donneesFilieres.filieres;
    remplirFiltresOffres();
    appliquerFiltres();
    afficherRouteOffre();
  } catch (erreur) {
    console.error("Chargement du catalogue des offres :", erreur);
    afficherErreurOffres(erreur);
  }
}

function normaliserOffre(offre) {
  if (!offre || (typeof offre.id !== "string" && typeof offre.id !== "number")) return null;
  const id = String(offre.id).trim();
  const titre = texteOffre(offre.titre);
  if (!id || !titre || !["stage", "emploi"].includes(texteOffre(offre.type).toLowerCase())) return null;
  return { ...offre, id, titre, type: texteOffre(offre.type).toLowerCase() };
}

function texteOffre(valeur) {
  if (typeof valeur === "string" || typeof valeur === "number") return String(valeur).trim();
  if (Array.isArray(valeur)) return valeur.map(texteOffre).filter(Boolean).join(" · ");
  return "";
}

function echapperOffre(valeur) {
  return String(valeur)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normaliserRechercheOffre(valeur) {
  return texteOffre(valeur).toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function nomDomaineOffre(id) {
  const domaine = TOUTES_FILIERES.find(filiere => filiere.id === id);
  return domaine ? texteOffre(domaine.nom) : texteOffre(id);
}

function champsOffre(offre, champs) {
  for (const champ of champs) {
    const valeur = texteOffre(offre[champ]);
    if (valeur) return valeur;
  }
  return "";
}

function remplirFiltresOffres() {
  const domaines = new Map();
  const villes = new Set();
  const contrats = new Set();

  TOUTES_OFFRES.forEach(offre => {
    const domaine = texteOffre(offre.domaine);
    const ville = texteOffre(offre.ville);
    const contrat = champsOffre(offre, ["typeContrat", "contrat"]);
    if (domaine) domaines.set(domaine, nomDomaineOffre(domaine));
    if (ville) villes.add(ville);
    if (contrat) contrats.add(contrat);
  });

  remplirSelectOffres("filtre-domaine-offre", "Tous les domaines", Array.from(domaines.entries()).map(([id, label]) => [id, label]));
  remplirSelectOffres("filtre-ville-offre", "Toutes les villes", Array.from(villes).sort((a, b) => a.localeCompare(b, "fr")).map(ville => [ville, ville]));
  remplirSelectOffres("filtre-contrat-offre", "Tous les contrats", Array.from(contrats).sort((a, b) => a.localeCompare(b, "fr")).map(contrat => [contrat, contrat]));
}

function remplirSelectOffres(id, libelleInitial, options) {
  const select = document.getElementById(id);
  select.replaceChildren(new Option(libelleInitial, ""));
  options.forEach(([valeur, libelle]) => select.add(new Option(libelle, valeur)));
}

function appliquerFiltres() {
  const terme = normaliserRechercheOffre(document.getElementById("recherche-offre").value);
  const domaine = document.getElementById("filtre-domaine-offre").value;
  const ville = document.getElementById("filtre-ville-offre").value;
  const type = document.getElementById("filtre-type-offre").value;
  const contrat = document.getElementById("filtre-contrat-offre").value;

  const resultats = TOUTES_OFFRES.filter(offre => {
    const texte = [
      offre.titre,
      offre.entreprise,
      offre.domaine && nomDomaineOffre(offre.domaine),
      offre.ville,
      offre.description,
      offre.missions,
      offre.profilRecherche,
      offre.profil_recherche,
      offre.competences,
      offre.conditions,
      offre.remuneration
    ].map(texteOffre).join(" ");

    return (!terme || normaliserRechercheOffre(texte).includes(terme))
      && (!domaine || offre.domaine === domaine)
      && (!ville || offre.ville === ville)
      && (!type || offre.type === type)
      && (!contrat || champsOffre(offre, ["typeContrat", "contrat"]) === contrat);
  });
  afficherListeOffres(resultats);
}

function afficherChargementOffres() {
  document.getElementById("compteur-offres").textContent = "Chargement du catalogue…";
  document.getElementById("liste-offres").setAttribute("aria-busy", "true");
  document.getElementById("liste-offres").innerHTML = '<p class="offres-etat" role="status">Lecture des annonces vérifiées…</p>';
}

function afficherErreurOffres(erreur) {
  const message = erreur instanceof Error ? erreur.message : "Une erreur inconnue est survenue.";
  document.getElementById("compteur-offres").textContent = "Le catalogue n’a pas pu être chargé.";
  document.getElementById("liste-offres").removeAttribute("aria-busy");
  document.getElementById("liste-offres").innerHTML = `
    <div class="offres-etat offres-etat-erreur" role="alert">
      <h2>Impossible de charger les offres</h2>
      <p>${echapperOffre(message)} Vérifie que le site est servi par un serveur local, puis réessaie.</p>
      <button type="button" class="bouton-secondaire" onclick="initialiserCatalogueOffres()">Réessayer</button>
    </div>
  `;
}

function afficherListeOffres(offres) {
  const compteur = document.getElementById("compteur-offres");
  const liste = document.getElementById("liste-offres");
  liste.removeAttribute("aria-busy");
  compteur.textContent = `${offres.length} offre${offres.length === 1 ? "" : "s"} vérifiée${offres.length === 1 ? "" : "s"}`;

  if (!TOUTES_OFFRES.length) {
    compteur.textContent = OFFRES_PUBLIEES
      ? "Aucune offre vérifiée n’est disponible pour le moment."
      : "Aucune offre vérifiée publiée pour le moment.";
    liste.innerHTML = `
      <section class="offres-etat offres-etat-vide" data-motion="rise">
        <p class="offres-surtitre">Le catalogue est tenu à jour</p>
        <h2>Les annonces vérifiées apparaîtront ici.</h2>
        <p>Les offres créées localement par une entreprise ne sont pas affichées aux jeunes. Elles ne deviennent publiques qu’après une vérification réelle.</p>
        <a class="bouton-principal" href="publier-offre.html">Espace entreprise</a>
      </section>
    `;
    actualiserAnimationsOffres();
    return;
  }

  if (!offres.length) {
    compteur.textContent = "Aucune offre ne correspond à ces critères.";
    liste.innerHTML = `
      <section class="offres-etat" data-motion="fade">
        <h2>Aucun résultat</h2>
        <p>Modifie la recherche ou les filtres pour voir d’autres annonces vérifiées.</p>
        <button type="button" class="bouton-secondaire" id="reinitialiser-filtres-offres">Réinitialiser les filtres</button>
      </section>
    `;
    document.getElementById("reinitialiser-filtres-offres").addEventListener("click", reinitialiserFiltresOffres);
    actualiserAnimationsOffres();
    return;
  }

  liste.innerHTML = offres.map(carteOffreHTML).join("");
  actualiserAnimationsOffres();
}

function carteOffreHTML(offre) {
  const description = champsOffre(offre, ["description", "missions"]);
  const extrait = description.length > 150 ? `${description.slice(0, 147)}…` : description;
  const domaine = nomDomaineOffre(texteOffre(offre.domaine));
  const contrat = champsOffre(offre, ["typeContrat", "contrat"]);

  return `
    <article class="offres-carte" data-motion="rise">
      <div class="offres-carte-ligne">
        <span class="badge-type-offre badge-type-${offre.type}">${offre.type === "stage" ? "Stage" : "Emploi"}</span>
        ${offre.ville ? `<span class="offres-ville">${echapperOffre(offre.ville)}</span>` : ""}
      </div>
      <h2><a href="#${encodeURIComponent(offre.id)}">${echapperOffre(offre.titre)}</a></h2>
      ${offre.entreprise ? `<p class="offres-entreprise">${echapperOffre(offre.entreprise)}</p>` : ""}
      ${extrait ? `<p class="offres-extrait">${echapperOffre(extrait)}</p>` : ""}
      <div class="offres-meta">
        ${domaine ? `<span>${echapperOffre(domaine)}</span>` : ""}
        ${contrat ? `<span>${echapperOffre(contrat)}</span>` : ""}
      </div>
      <a class="offres-lien" href="#${encodeURIComponent(offre.id)}">Consulter l’offre <span aria-hidden="true">→</span></a>
    </article>
  `;
}

function afficherRouteOffre() {
  const fiche = document.getElementById("fiche-offre");
  if (!fiche) return;
  const identifiant = decoderIdentifiantOffre(window.location.hash.slice(1));
  if (!identifiant) {
    fiche.hidden = true;
    fiche.replaceChildren();
    return;
  }

  const offre = TOUTES_OFFRES.find(item => item.id === identifiant);
  if (!offre) {
    fiche.innerHTML = `
      <div class="offres-etat offres-etat-erreur" role="status">
        <h2>Cette offre n’est pas accessible</h2>
        <p>Le lien ne correspond à aucune annonce actuellement publiée et vérifiée.</p>
        <a class="offres-lien" href="#">Retourner au catalogue</a>
      </div>
    `;
    fiche.hidden = false;
    fiche.focus();
    return;
  }
  afficherFicheOffre(offre);
}

function decoderIdentifiantOffre(valeur) {
  try {
    return decodeURIComponent(valeur);
  } catch (erreur) {
    console.error("Identifiant d’offre invalide dans l’URL :", erreur);
    return "";
  }
}

function afficherFicheOffre(offre) {
  const fiche = document.getElementById("fiche-offre");
  const sections = [
    ["presentationEntreprise", "Présentation de l’entreprise"],
    ["presentation_entreprise", "Présentation de l’entreprise"],
    ["description", "Description"],
    ["missions", "Missions"],
    ["profilRecherche", "Profil recherché"],
    ["profil_recherche", "Profil recherché"],
    ["competences", "Compétences"],
    ["conditions", "Conditions"],
    ["remuneration", "Rémunération"],
    ["dateLimite", "Date limite de candidature"],
    ["date_limite", "Date limite de candidature"],
    ["piecesDemandees", "Pièces demandées"],
    ["pieces_demandees", "Pièces demandées"]
  ];
  const details = [];
  const dejaRendus = new Set();
  sections.forEach(([cle, titre]) => {
    const valeur = texteOffre(offre[cle]);
    if (valeur && !dejaRendus.has(titre)) {
      details.push(`<section class="offres-detail-section"><h3>${titre}</h3><p>${echapperOffre(valeur)}</p></section>`);
      dejaRendus.add(titre);
    }
  });

  const utilisateur = lireUtilisateurOffres();
  fiche.innerHTML = `
    <div class="offres-fiche-entete">
      <div>
        <a class="offres-retour" href="#">← Retour aux offres</a>
        <p><span class="badge-type-offre badge-type-${offre.type}">${offre.type === "stage" ? "Stage" : "Emploi"}</span></p>
        <h2 id="titre-fiche-offre">${echapperOffre(offre.titre)}</h2>
        <p class="offres-fiche-meta">
          ${offre.entreprise ? `<span>${echapperOffre(offre.entreprise)}</span>` : ""}
          ${offre.ville ? `<span>${echapperOffre(offre.ville)}</span>` : ""}
          ${offre.domaine ? `<span>${echapperOffre(nomDomaineOffre(offre.domaine))}</span>` : ""}
          ${champsOffre(offre, ["typeContrat", "contrat"]) ? `<span>${echapperOffre(champsOffre(offre, ["typeContrat", "contrat"]))}</span>` : ""}
        </p>
      </div>
      <button type="button" class="offres-fermer" id="fermer-fiche-offre">Fermer</button>
    </div>
    <div class="offres-detail-contenu">
      <div>${details.join("") || "<p>Les informations détaillées ne sont pas disponibles pour cette annonce.</p>"}</div>
      <aside class="offres-postuler" aria-label="Actions pour cette offre">
        ${typeof boutonFavoriHTML === "function"
          ? boutonFavoriHTML("offres", echapperOffre(offre.id))
          : ""}
        <div id="zone-candidature"></div>
        <p class="offres-note-v1">Les candidatures ne sont pas ouvertes pendant ce pilote. Aucune coordonnée ni aucun texte de candidature ne sera recueilli.</p>
        <a href="candidatures.html" class="offres-lien">Voir l’état du suivi des candidatures</a>
      </aside>
    </div>
  `;
  fiche.hidden = false;
  fiche.setAttribute("data-motion", "rise");
  if (typeof activerBoutonFavori === "function") {
    activerBoutonFavori(fiche);
    const boutonFavori = fiche.querySelector(".bouton-favori");
    if (boutonFavori && typeof estFavori === "function") {
      boutonFavori.setAttribute("aria-pressed", String(estFavori("offres", offre.id)));
      boutonFavori.addEventListener("click", () => {
        boutonFavori.setAttribute("aria-pressed", String(estFavori("offres", offre.id)));
      });
    }
  }
  afficherFormulaireCandidature(offre, utilisateur);
  document.getElementById("fermer-fiche-offre").addEventListener("click", () => {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    afficherRouteOffre();
    document.getElementById("recherche-offre").focus();
  });
  actualiserAnimationsOffres();
  fiche.focus();
}

function lireUtilisateurOffres() {
  if (!window.JeuneAvenirPilot?.accountsEnabled) return null;

  try {
    const utilisateur = JSON.parse(localStorage.getItem("jac_utilisateur_connecte") || "null");
    return utilisateur && typeof utilisateur.email === "string" ? utilisateur : null;
  } catch (erreur) {
    console.error("Lecture du compte local impossible :", erreur);
    return null;
  }
}

function lireCandidaturesOffres() {
  try {
    const valeur = localStorage.getItem("jac_candidatures");
    const candidatures = valeur ? JSON.parse(valeur) : [];
    if (!Array.isArray(candidatures)) throw new Error("L’historique local des candidatures n’est pas une liste.");
    return candidatures;
  } catch (erreur) {
    console.error("Lecture des candidatures locales impossible :", erreur);
    return null;
  }
}

function afficherFormulaireCandidature(offre, utilisateur) {
  const zone = document.getElementById("zone-candidature");
  if (!window.JeuneAvenirPilot?.submissionsEnabled) {
    zone.innerHTML = '<p role="status">Les candidatures ne sont pas disponibles pendant ce pilote. Aucune donnée n’a été recueillie ou transmise.</p>';
    return;
  }
  if (!utilisateur) {
    zone.innerHTML = `
      <p>Connecte-toi avec un compte Jeune pour préparer une candidature de démonstration.</p>
      <a class="bouton-principal" href="connexion.html">Se connecter</a>
    `;
    return;
  }
  if (utilisateur.typeCompte !== "jeune") {
    zone.innerHTML = `
      <p>La préparation d’une candidature est réservée aux comptes Jeune.</p>
      <a class="offres-lien" href="inscription.html">Créer un compte Jeune</a>
    `;
    return;
  }

  const candidatures = lireCandidaturesOffres();
  if (!candidatures) {
    zone.innerHTML = '<p class="offres-message-erreur" role="alert">L’historique local est illisible. Aucune candidature n’a été créée.</p>';
    return;
  }
  const email = utilisateur.email.trim().toLocaleLowerCase("fr");
  const precedente = candidatures.find(candidature =>
    candidature.offreId === offre.id
    && typeof candidature.candidatEmail === "string"
    && candidature.candidatEmail.trim().toLocaleLowerCase("fr") === email
  );
  if (precedente) {
    zone.innerHTML = `
      <p class="offres-statut">Déjà enregistrée localement</p>
      <p>Statut : <strong>${echapperOffre(libelleStatutCandidature(precedente.statut))}</strong></p>
      <p>Cette candidature n’a pas été envoyée à l’entreprise.</p>
      <a class="offres-lien" href="candidatures.html">Voir le récapitulatif</a>
    `;
    return;
  }

  zone.innerHTML = `
    <form id="formulaire-candidature" class="offres-formulaire-candidature">
      <h3>Préparer ma candidature</h3>
      <p>Les pièces listées dans l’annonce ne peuvent pas être transmises en V1. N’ajoute pas de document personnel à cette simulation.</p>
      <label for="motivation-candidature">Pourquoi cette opportunité t’intéresse ?</label>
      <textarea id="motivation-candidature" name="motivation" rows="5" minlength="30" maxlength="1600" required aria-describedby="aide-motivation-candidature"></textarea>
      <small id="aide-motivation-candidature">30 caractères minimum. Ton texte restera dans le stockage local de ce navigateur.</small>
      <label class="offres-consentement">
        <input type="checkbox" name="confirmation" required>
        <span>Je comprends que cette candidature ne sera pas transmise à l’entreprise.</span>
      </label>
      <button type="submit" class="bouton-principal">Enregistrer ma simulation</button>
      <p class="offres-message-erreur" id="erreur-candidature" role="alert" hidden></p>
    </form>
  `;

  document.getElementById("formulaire-candidature").addEventListener("submit", evenement => {
    evenement.preventDefault();
    const formulaire = evenement.currentTarget;
    const motivation = formulaire.elements.motivation.value.trim();
    const erreur = document.getElementById("erreur-candidature");
    if (!formulaire.reportValidity()) return;

    const nouvellesCandidatures = lireCandidaturesOffres();
    if (!nouvellesCandidatures) {
      erreur.textContent = "L’historique local ne peut pas être lu; rien n’a été enregistré.";
      erreur.hidden = false;
      return;
    }
    if (nouvellesCandidatures.some(candidature =>
      candidature.offreId === offre.id
      && typeof candidature.candidatEmail === "string"
      && candidature.candidatEmail.trim().toLocaleLowerCase("fr") === email
    )) {
      afficherFormulaireCandidature(offre, utilisateur);
      return;
    }

    nouvellesCandidatures.push({
      id: creerIdentifiantLocal("candidature"),
      offreId: offre.id,
      offreTitre: offre.titre,
      entreprise: texteOffre(offre.entreprise),
      candidatNom: texteOffre(utilisateur.nom),
      candidatEmail: utilisateur.email,
      motivation,
      statut: "en_attente",
      mode: "demonstration_locale",
      date: new Date().toISOString()
    });

    try {
      localStorage.setItem("jac_candidatures", JSON.stringify(nouvellesCandidatures));
    } catch (erreurStockage) {
      console.error("Enregistrement de la candidature locale impossible :", erreurStockage);
      erreur.textContent = "Le navigateur n’a pas pu enregistrer la simulation. Vérifie son espace de stockage.";
      erreur.hidden = false;
      return;
    }

    zone.innerHTML = `
      <div class="offres-confirmation" role="status" data-motion="scale">
        <h3>Simulation enregistrée dans ce navigateur</h3>
        <p>Aucune entreprise n’a reçu cette candidature. Tu peux consulter son récapitulatif dans ton espace.</p>
        <a class="bouton-secondaire" href="candidatures.html">Voir mes candidatures locales</a>
      </div>
    `;
    actualiserAnimationsOffres();
  });
}

function creerIdentifiantLocal(prefixe) {
  if (window.crypto && typeof window.crypto.randomUUID === "function") return `${prefixe}-${window.crypto.randomUUID()}`;
  return `${prefixe}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function libelleStatutCandidature(statut) {
  const statuts = {
    en_attente: "En attente (démonstration locale)",
    acceptee: "Acceptée (démonstration locale)",
    refusee: "Refusée (démonstration locale)"
  };
  return statuts[statut] || "Ancien statut local, non vérifiable";
}

function reinitialiserFiltresOffres() {
  document.getElementById("recherche-offre").value = "";
  ["filtre-domaine-offre", "filtre-ville-offre", "filtre-type-offre", "filtre-contrat-offre"]
    .forEach(id => { document.getElementById(id).value = ""; });
  appliquerFiltres();
}

function actualiserAnimationsOffres() {
  if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.initialiser();
}
