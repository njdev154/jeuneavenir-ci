let TOUTES_ECOLES = [];
let TOUTES_FILIERES = [];

document.addEventListener("DOMContentLoaded", async () => {
  const liste = document.getElementById("liste-ecoles");
  const fiche = document.getElementById("fiche-ecole");
  const etat = document.getElementById("etat-catalogue-ecoles");

  try {
    const reponses = await Promise.all([fetch("data/ecoles.json"), fetch("data/filieres.json")]);
    if (reponses.some(reponse => !reponse.ok)) throw new Error("Un catalogue n'a pas pu être chargé");

    const [donneesEcoles, donneesFilieres] = await Promise.all(reponses.map(reponse => reponse.json()));
    if (!Array.isArray(donneesEcoles.ecoles) || !Array.isArray(donneesFilieres.filieres)) {
      throw new Error("Le format d'un catalogue est invalide");
    }
    TOUTES_ECOLES = donneesEcoles.ecoles;
    TOUTES_FILIERES = donneesFilieres.filieres;

    remplirFiltres();
    appliquerFiltres();
    ["recherche-ecole", "filtre-ville", "filtre-statut", "filtre-type", "filtre-domaine", "filtre-verification"]
      .forEach(id => document.getElementById(id).addEventListener(id === "recherche-ecole" ? "input" : "change", appliquerFiltres));
    document.getElementById("reinitialiser-filtres-ecoles").addEventListener("click", reinitialiserFiltres);

    window.JeuneAvenirDiscovery.lierFicheHash({
      donnees: TOUTES_ECOLES,
      fiche,
      liste: document.querySelector(".discovery-workspace"),
      etat,
      rendre: afficherFiche
    });
  } catch (erreur) {
    console.error(erreur);
    window.JeuneAvenirDiscovery.afficherEtat(
      liste,
      "Annuaire indisponible",
      "Les données d’établissements ou de filières n’ont pas pu être chargées. Réessaie ou consulte les fichiers de données.",
      "alert"
    );
    etat.innerHTML = '<a href="data/ecoles.json">Données des établissements</a> · <a href="data/filieres.json">Données des filières</a>';
  }
});

function remplirFiltres() {
  const selecteurs = [
    { id: "filtre-ville", cle: "ville", vide: "Toutes les villes" },
    { id: "filtre-statut", cle: "statut", vide: "Public et privé" },
    { id: "filtre-type", cle: "type", vide: "Tous les types" }
  ];

  selecteurs.forEach(config => {
    const select = document.getElementById(config.id);
    [...new Set(TOUTES_ECOLES.map(ecole => ecole[config.cle]).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "fr"))
      .forEach(valeur => {
        const option = document.createElement("option");
        option.value = valeur;
        option.textContent = config.cle === "statut"
          ? (valeur === "public" ? "Type indiqué : public" : "Type indiqué : privé")
          : config.cle === "type" ? libelleTypeEcole(valeur) : valeur;
        select.appendChild(option);
      });
  });

  const selectDomaine = document.getElementById("filtre-domaine");
  TOUTES_FILIERES.forEach(filiere => {
    const option = document.createElement("option");
    option.value = filiere.id;
    option.textContent = filiere.nom;
    selectDomaine.appendChild(option);
  });
}

function libelleTypeEcole(type) {
  const libelles = {
    universite: "Université",
    grande_ecole: "Grande école",
    institut: "Institut"
  };
  return libelles[type] || String(type || "Type non renseigné").replace(/_/g, " ");
}

function appliquerFiltres() {
  const outils = window.JeuneAvenirDiscovery;
  const mots = outils.normaliserRecherche(document.getElementById("recherche-ecole").value).split(/\s+/).filter(Boolean);
  const ville = document.getElementById("filtre-ville").value;
  const statut = document.getElementById("filtre-statut").value;
  const type = document.getElementById("filtre-type").value;
  const domaine = document.getElementById("filtre-domaine").value;
  const verification = document.getElementById("filtre-verification").value;

  const resultats = TOUTES_ECOLES.filter(ecole => {
    const filieres = TOUTES_FILIERES.filter(filiere => (ecole.domaines || []).includes(filiere.id));
    const texte = outils.normaliserRecherche([
      ecole.nom,
      ecole.sigle,
      ecole.ville,
      ecole.commune,
      ecole.statut,
      libelleTypeEcole(ecole.type),
      ecole.tutelle,
      ...(ecole.niveaux || []),
      ...filieres.map(filiere => filiere.nom)
    ].join(" "));
    const domaineDocumente = Boolean(ecole.verification && ecole.verification.domaine_confirme);
    return (!mots.length || mots.every(mot => texte.includes(mot)))
      && (!ville || ecole.ville === ville)
      && (!statut || ecole.statut === statut)
      && (!type || ecole.type === type)
      && (!domaine || (ecole.domaines || []).includes(domaine))
      && (!verification || (verification === "documente" ? domaineDocumente : !domaineDocumente));
  });

  document.getElementById("compteur-resultats").textContent =
    `${resultats.length} établissement${resultats.length > 1 ? "s" : ""} affiché${resultats.length > 1 ? "s" : ""} sur ${TOUTES_ECOLES.length} dans ce relevé, qui n’est pas exhaustif.`;
  afficherResultats(resultats);
}

function afficherResultats(ecoles) {
  const outils = window.JeuneAvenirDiscovery;
  const conteneur = document.getElementById("liste-ecoles");
  if (!ecoles.length) {
    outils.afficherEtat(conteneur, "Aucun établissement ne correspond", "Essaie un autre terme ou retire un filtre. L’absence de résultat ne signifie pas qu’aucun établissement n’existe.");
    return;
  }

  conteneur.innerHTML = ecoles.map(ecole => {
    const domaines = (ecole.domaines || [])
      .map(id => TOUTES_FILIERES.find(filiere => filiere.id === id))
      .filter(Boolean);
    const domaineDocumente = Boolean(ecole.verification && ecole.verification.domaine_confirme);
    const commune = ecole.commune && ecole.commune !== ecole.ville ? ` · ${ecole.commune}` : "";
    return `
      <article class="discovery-card discovery-school-card" data-motion="rise">
        <div class="discovery-card-top">
          <div class="discovery-card-icon discovery-school-icon" aria-hidden="true">${outils.echapperHtml(ecole.sigle || "É")}</div>
          <span class="discovery-tag">${domaineDocumente ? "Rattachement documenté" : "Rattachement à confirmer"}</span>
        </div>
        <p class="discovery-school-type">${outils.echapperHtml(ecole.statut === "public" ? "Type indiqué : public" : "Type indiqué : privé")} · ${outils.echapperHtml(libelleTypeEcole(ecole.type))}</p>
        <h2>${outils.echapperHtml(ecole.nom)}</h2>
        <p class="discovery-school-location">${outils.echapperHtml(ecole.ville || "Ville non renseignée")}${outils.echapperHtml(commune)}</p>
        <p>${domaines.length
          ? `Filières associées au catalogue : ${domaines.map(filiere => outils.echapperHtml(filiere.nom)).join(", ")}. Ce lien ne confirme pas l’ouverture d’un programme.`
          : "Aucune filière associée dans les données du catalogue."}</p>
        <div class="discovery-card-meta">
          ${(ecole.niveaux || []).slice(0, 3).map(niveau => `<span>${outils.echapperHtml(niveau)}</span>`).join("")}
        </div>
        <a href="#${encodeURIComponent(String(ecole.id))}">Consulter la fiche <span aria-hidden="true">→</span></a>
      </article>
    `;
  }).join("");
  outils.animerElements(conteneur);
}

function reinitialiserFiltres() {
  ["recherche-ecole", "filtre-ville", "filtre-statut", "filtre-type", "filtre-domaine", "filtre-verification"]
    .forEach(id => { document.getElementById(id).value = ""; });
  appliquerFiltres();
}

function afficherFiche(ecole) {
  const outils = window.JeuneAvenirDiscovery;
  const filieres = (ecole.domaines || [])
    .map(id => TOUTES_FILIERES.find(filiere => filiere.id === id))
    .filter(Boolean);
  const domaineDocumente = Boolean(ecole.verification && ecole.verification.domaine_confirme);
  const campus = ecole.campus_de ? TOUTES_ECOLES.find(item => item.id === ecole.campus_de) : null;
  const sources = (ecole.sources || []).map(source => ({
    label: source.libelle || source.url,
    description: [source.consultee_le ? `Consultée le ${source.consultee_le}` : "", source.portee || ""].filter(Boolean).join(" · "),
    href: source.url,
    externe: true,
    badge: "Source référencée"
  }));
  const niveaux = (ecole.niveaux || []).map(niveau => ({ label: niveau }));
  const site = ecole.contact && ecole.contact.site ? outils.lienSecurise(ecole.contact.site) : "";

  outils.rendreFiche(document.getElementById("fiche-ecole"), {
    kind: "ÉTABLISSEMENT",
    title: ecole.nom,
    description: "Cette fiche rassemble les informations présentes dans le catalogue du projet. Elle ne constitue pas une confirmation de l’offre actuelle ni des conditions d’admission.",
    tags: [
      ecole.statut === "public" ? "Type indiqué : public" : "Type indiqué : privé",
      libelleTypeEcole(ecole.type),
      ecole.ville,
      domaineDocumente ? "Rattachement documenté" : "Rattachement à confirmer"
    ],
    facts: [
      { label: "Statut indiqué", value: ecole.statut === "public" ? "Public" : "Privé" },
      { label: "Ville", value: ecole.ville },
      { label: "Type indiqué", value: libelleTypeEcole(ecole.type) },
      { label: "Tutelle renseignée", value: ecole.tutelle },
      { label: "Évaluation MESRS", value: ecole.evaluation_mesrs ? `${ecole.evaluation_mesrs.annee} · ${ecole.evaluation_mesrs.score} · ${ecole.evaluation_mesrs.mention}` : "" }
    ],
    sections: [
      {
        title: "Formations et filières associées",
        description: "Ces associations du catalogue sont des pistes à vérifier auprès de l’établissement. Elles ne confirment pas qu’un cursus est ouvert.",
        items: filieres.map(filiere => ({ label: filiere.nom,         href: outils.lienFiche("filieres.html", filiere.id) })),
        empty: "Aucune filière associée n'est renseignée."
      },
      { title: "Niveaux présents dans le catalogue", items: niveaux, empty: "Aucun niveau n'est renseigné dans le catalogue." },
      {
        title: "Admission",
        items: [],
        empty: "Aucune condition ni date d’admission n’est documentée ici. Vérifie le calendrier et les modalités directement auprès de l’établissement."
      },
      {
        title: "Coordonnées",
        items: [
          site ? { label: "Site indiqué", href: site, externe: true } : null,
          ecole.contact && ecole.contact.telephone ? { label: ecole.contact.telephone } : null,
          ecole.contact && ecole.contact.email ? { label: ecole.contact.email } : null,
          campus ? { label: `Antenne rattachée à ${campus.nom}` } : null
        ].filter(Boolean),
        empty: "Aucun site, téléphone ou e-mail n’est renseigné dans les données pour cet établissement."
      },
      { title: "Sources et périmètre de vérification", items: sources, empty: "Aucune source n'est rattachée à cette fiche. Les informations sont à confirmer auprès de l’établissement." }
    ],
    note: "Le relevé du projet n’est pas exhaustif. Le statut et les domaines indiqués ne remplacent pas une vérification officielle. Le filtre « rattachement documenté » signifie uniquement qu’une source de filière est associée dans le catalogue, pas que toutes les données de l’établissement sont validées.",
    asideTitle: "Vérifie avant toute démarche",
    asideText: "Confirme les formations ouvertes, les conditions, les calendriers et les frais directement auprès de l’établissement.",
    actions: [
      ...filieres.slice(0, 2).map(filiere => ({ label: `Explorer ${filiere.nom}`, href: outils.lienFiche("filieres.html", filiere.id) })),
      ...(site ? [{ label: "Visiter le site indiqué", href: site, externe: true }] : [])
    ],
    backHref: "ecoles.html",
    backLabel: "Retour à l’annuaire"
  });
}
