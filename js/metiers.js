let TOUS_METIERS = [];
let TOUTES_FILIERES = [];
let CORRESPONDANCE_METIER_FILIERES = {};

document.addEventListener("DOMContentLoaded", async () => {
  const grille = document.getElementById("grille-metiers");
  const fiche = document.getElementById("fiche-metier");
  const etat = document.getElementById("etat-catalogue-metiers");

  try {
    const reponses = await Promise.all([fetch("data/metiers.json"), fetch("data/filieres.json")]);
    if (reponses.some(reponse => !reponse.ok)) throw new Error("Un catalogue n'a pas pu être chargé");

    const [donneesMetiers, donneesFilieres] = await Promise.all(reponses.map(reponse => reponse.json()));
    if (!Array.isArray(donneesMetiers.metiers) || !Array.isArray(donneesFilieres.filieres)) {
      throw new Error("Le format d'un catalogue est invalide");
    }

    TOUS_METIERS = donneesMetiers.metiers;
    TOUTES_FILIERES = donneesFilieres.filieres;
    construireCorrespondances();
    remplirFiltreDomaine();
    appliquerFiltres();

    document.getElementById("recherche-metier").addEventListener("input", appliquerFiltres);
    document.getElementById("filtre-domaine-metier").addEventListener("change", appliquerFiltres);
    document.getElementById("reinitialiser-filtres-metiers").addEventListener("click", reinitialiserFiltres);

    window.JeuneAvenirDiscovery.lierFicheHash({
      donnees: TOUS_METIERS,
      fiche,
      liste: document.querySelector(".discovery-workspace"),
      etat,
      rendre: afficherFiche
    });
  } catch (erreur) {
    console.error(erreur);
    window.JeuneAvenirDiscovery.afficherEtat(
      grille,
      "Catalogue indisponible",
      "Les données des métiers ou des filières n’ont pas pu être chargées. Réessaie ou consulte les fichiers de données.",
      "alert"
    );
    etat.innerHTML = '<a href="data/metiers.json">Données des métiers</a> · <a href="data/filieres.json">Données des filières</a>';
  }
});

function construireCorrespondances() {
  CORRESPONDANCE_METIER_FILIERES = {};
  TOUTES_FILIERES.forEach(filiere => {
    (filiere.metiers_lies || []).forEach(idMetier => {
      if (!CORRESPONDANCE_METIER_FILIERES[idMetier]) CORRESPONDANCE_METIER_FILIERES[idMetier] = [];
      CORRESPONDANCE_METIER_FILIERES[idMetier].push(filiere.id);
    });
  });
}

function remplirFiltreDomaine() {
  const select = document.getElementById("filtre-domaine-metier");
  TOUTES_FILIERES.forEach(filiere => {
    const option = document.createElement("option");
    option.value = filiere.id;
    option.textContent = filiere.nom;
    select.appendChild(option);
  });
}

function filieresDuMetier(idMetier) {
  return CORRESPONDANCE_METIER_FILIERES[idMetier] || [];
}

function appliquerFiltres() {
  const utilitaires = window.JeuneAvenirDiscovery;
  const mots = utilitaires.normaliserRecherche(document.getElementById("recherche-metier").value).split(/\s+/).filter(Boolean);
  const domaine = document.getElementById("filtre-domaine-metier").value;

  const resultats = TOUS_METIERS.filter(metier => {
    const filieres = filieresDuMetier(metier.id)
      .map(id => TOUTES_FILIERES.find(filiere => filiere.id === id))
      .filter(Boolean);
    const texte = utilitaires.normaliserRecherche([
      metier.nom,
      metier.description,
      ...(metier.missions || []),
      ...(metier.competences || []),
      ...filieres.map(filiere => filiere.nom)
    ].join(" "));
    return (!mots.length || mots.every(mot => texte.includes(mot)))
      && (!domaine || filieresDuMetier(metier.id).includes(domaine));
  });

  document.getElementById("compteur-metiers").textContent =
    `${resultats.length} métier${resultats.length > 1 ? "s" : ""} affiché${resultats.length > 1 ? "s" : ""} sur ${TOUS_METIERS.length} dans ce catalogue de repères.`;
  afficherListe(resultats);
}

function afficherListe(metiers) {
  const utilitaires = window.JeuneAvenirDiscovery;
  const grille = document.getElementById("grille-metiers");
  if (!metiers.length) {
    utilitaires.afficherEtat(grille, "Aucun métier ne correspond", "Essaie un autre terme ou retire le filtre de filière pour explorer d'autres pistes.");
    return;
  }

  grille.innerHTML = metiers.map(metier => {
    const competences = (metier.competences || []).slice(0, 2);
    const filieres = filieresDuMetier(metier.id)
      .map(id => TOUTES_FILIERES.find(filiere => filiere.id === id))
      .filter(Boolean);
    return `
      <article class="discovery-card" data-motion="rise">
        <div class="discovery-card-icon discovery-career-icon" aria-hidden="true">↗</div>
        <span class="discovery-tag">Fiche métier</span>
        <h2>${utilitaires.echapperHtml(metier.nom)}</h2>
        <p>${utilitaires.echapperHtml(metier.description || "Description non renseignée dans le catalogue.")}</p>
        <p class="discovery-card-fact">${competences.length
          ? `Repères : ${competences.map(utilitaires.echapperHtml).join(" · ")}`
          : "Compétences non renseignées dans le catalogue."}</p>
        <div class="discovery-card-meta">
          ${filieres.slice(0, 2).map(filiere => `<span>${utilitaires.echapperHtml(filiere.nom)}</span>`).join("")}
        </div>
        <a href="#${encodeURIComponent(String(metier.id))}">Découvrir ce métier <span aria-hidden="true">→</span></a>
      </article>
    `;
  }).join("");
  utilitaires.animerElements(grille);
}

function reinitialiserFiltres() {
  document.getElementById("recherche-metier").value = "";
  document.getElementById("filtre-domaine-metier").value = "";
  appliquerFiltres();
}

function afficherFiche(metier) {
  const utilitaires = window.JeuneAvenirDiscovery;
  const filieres = filieresDuMetier(metier.id)
    .map(id => TOUTES_FILIERES.find(filiere => filiere.id === id))
    .filter(Boolean);
  const competences = (metier.competences || []).map(competence => ({ label: competence }));
  const missions = (metier.missions || []).map(mission => ({ label: mission }));

  utilitaires.rendreFiche(document.getElementById("fiche-metier"), {
    kind: "MÉTIER",
    title: metier.nom,
    description: metier.description,
    tags: ["Repère général", ...(filieres.length ? filieres.map(filiere => filiere.nom) : [])],
    facts: [
      { label: "Filières associées", value: filieres.length ? String(filieres.length) : "" },
      { label: "Missions renseignées", value: missions.length ? String(missions.length) : "" },
      { label: "Compétences citées", value: competences.length ? String(competences.length) : "" }
    ],
    sections: [
      { title: "Missions principales", items: missions, empty: "Aucune mission n’est renseignée dans les données." },
      { title: "Compétences citées", items: competences, empty: "Aucune compétence n’est renseignée dans les données." },
      {
        title: "Filières associées dans le catalogue",
        description: "Ces associations sont des pistes d’exploration, pas une condition d’accès ni un parcours obligatoire.",
        items: filieres.map(filiere => ({
          label: filiere.nom,
          description: filiere.description,
          href: utilitaires.lienFiche("filieres.html", filiere.id)
        })),
        empty: "Aucune filière liée n’est renseignée dans le catalogue."
      }
    ],
    note: "Ces descriptions générales ne remplacent pas une fiche métier validée par des professionnels. Les missions, compétences attendues et parcours varient selon le poste, l’employeur et les formations.",
    asideTitle: "Prépare ton parcours",
    asideText: "Explore les filières associées et vérifie les programmes et leurs conditions auprès des établissements.",
    actions: filieres.slice(0, 3).map(filiere => ({
      label: `Voir ${filiere.nom}`,
      href: utilitaires.lienFiche("filieres.html", filiere.id)
    })),
    backHref: "metiers.html",
    backLabel: "Retour au catalogue des métiers"
  });
}
