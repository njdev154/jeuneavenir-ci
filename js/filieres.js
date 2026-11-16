let TOUTES_FILIERES = [];
let TOUTES_ECOLES = [];
let TOUS_METIERS = [];

const UNIVERS_FILIERES = [
  { id: "informatique", label: "Numérique" },
  { id: "gestion-commerce", label: "Gestion & commerce" },
  { id: "droit", label: "Droit" },
  { id: "genie-civil", label: "Bâtiment & travaux publics" },
  { id: "sante", label: "Santé" },
  { id: "communication-marketing", label: "Communication & marketing" },
  { id: "agronomie", label: "Agronomie & agro-industrie" }
];

const ICONES_FILIERES = {
  informatique: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/></svg>',
  "gestion-commerce": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 20V10M9 20V4M15 20v-7M21 20V8"/></svg>',
  droit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3v18M5 8l-3 6a4 4 0 0 0 6 0zM19 8l-3 6a4 4 0 0 0 6 0zM5 8h14M8 3h8"/></svg>',
  "genie-civil": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/></svg>',
  sante: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>',
  "communication-marketing": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 5h14v10H8l-5 4V5z"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="10" r="1"/></svg>',
  agronomie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21V10M12 10c0-3.5-2.5-6-6-6 0 3.5 2.5 6 6 6zM12 10c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6z"/></svg>'
};

document.addEventListener("DOMContentLoaded", async () => {
  const grille = document.getElementById("grille-filieres");
  const fiche = document.getElementById("fiche-filiere");
  const etat = document.getElementById("etat-catalogue-filieres");
  const recherche = document.getElementById("recherche-filiere");
  const selectDuree = document.getElementById("filtre-duree-filiere");
  const selectMetier = document.getElementById("filtre-metier-filiere");

  try {
    const reponses = await Promise.all([
      fetch("data/filieres.json"),
      fetch("data/ecoles.json"),
      fetch("data/metiers.json")
    ]);
    if (reponses.some(reponse => !reponse.ok)) throw new Error("Un catalogue n'a pas pu être chargé");

    const [donneesFilieres, donneesEcoles, donneesMetiers] = await Promise.all(reponses.map(reponse => reponse.json()));
    if (!Array.isArray(donneesFilieres.filieres)
      || !Array.isArray(donneesEcoles.ecoles)
      || !Array.isArray(donneesMetiers.metiers)) {
      throw new Error("Le format d'un catalogue est invalide");
    }

    TOUTES_FILIERES = donneesFilieres.filieres;
    TOUTES_ECOLES = donneesEcoles.ecoles;
    TOUS_METIERS = donneesMetiers.metiers;
    remplirFiltres();
    appliquerFiltres();

    recherche.addEventListener("input", appliquerFiltres);
    selectDuree.addEventListener("change", appliquerFiltres);
    selectMetier.addEventListener("change", appliquerFiltres);
    document.getElementById("filtres-univers").addEventListener("change", appliquerFiltres);
    document.getElementById("reinitialiser-filtres-filieres").addEventListener("click", reinitialiserFiltres);

    window.JeuneAvenirDiscovery.lierFicheHash({
      donnees: TOUTES_FILIERES,
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
      "Les données des filières, écoles ou métiers n'ont pas pu être chargées. Réessaie ou consulte le fichier de données.",
      "alert"
    );
    etat.innerHTML = '<a href="data/filieres.json">Données des filières</a> · <a href="data/ecoles.json">Données des écoles</a> · <a href="data/metiers.json">Données des métiers</a>';
  }
});

function remplirFiltres() {
  const domaines = document.getElementById("filtres-univers");
  domaines.innerHTML = UNIVERS_FILIERES.map(univers => `
    <label>
      <input type="checkbox" value="${window.JeuneAvenirDiscovery.echapperHtml(univers.id)}">
      <span>${window.JeuneAvenirDiscovery.echapperHtml(univers.label)}</span>
    </label>
  `).join("");

  const durees = [...new Set(TOUTES_FILIERES.map(filiere => filiere.duree_etudes).filter(Boolean))].sort();
  const selectDuree = document.getElementById("filtre-duree-filiere");
  durees.forEach(duree => {
    const option = document.createElement("option");
    option.value = duree;
    option.textContent = duree;
    selectDuree.appendChild(option);
  });

  const selectMetier = document.getElementById("filtre-metier-filiere");
  TOUS_METIERS.forEach(metier => {
    const option = document.createElement("option");
    option.value = metier.id;
    option.textContent = metier.nom;
    selectMetier.appendChild(option);
  });
}

function appliquerFiltres() {
  const utilitaires = window.JeuneAvenirDiscovery;
  const terme = utilitaires.normaliserRecherche(document.getElementById("recherche-filiere").value);
  const mots = terme.split(/\s+/).filter(Boolean);
  const universChoisis = Array.from(document.querySelectorAll("#filtres-univers input:checked"), input => input.value);
  const duree = document.getElementById("filtre-duree-filiere").value;
  const metier = document.getElementById("filtre-metier-filiere").value;

  const resultats = TOUTES_FILIERES.filter(filiere => {
    const metiers = TOUS_METIERS.filter(item => (filiere.metiers_lies || []).includes(item.id));
    const texte = utilitaires.normaliserRecherche([
      filiere.nom,
      filiere.description,
      ...(filiere.matieres_principales || []),
      ...(filiere.debouches || []),
      ...metiers.map(item => item.nom)
    ].join(" "));

    return (!mots.length || mots.every(mot => texte.includes(mot)))
      && (!universChoisis.length || universChoisis.includes(filiere.id))
      && (!duree || filiere.duree_etudes === duree)
      && (!metier || (filiere.metiers_lies || []).includes(metier));
  });

  const compteur = document.getElementById("compteur-filiere");
  compteur.textContent = `${resultats.length} filière${resultats.length > 1 ? "s" : ""} affichée${resultats.length > 1 ? "s" : ""} sur ${TOUTES_FILIERES.length} dans ce premier catalogue.`;
  afficherListe(resultats);
}

function afficherListe(filieres) {
  const grille = document.getElementById("grille-filieres");
  const utilitaires = window.JeuneAvenirDiscovery;

  if (!filieres.length) {
    utilitaires.afficherEtat(grille, "Aucune filière ne correspond", "Essaie un autre terme ou retire un filtre pour voir d'autres parcours.");
    return;
  }

  grille.innerHTML = filieres.map(filiere => {
    const categorie = UNIVERS_FILIERES.find(univers => univers.id === filiere.id);
    const metiers = TOUS_METIERS
      .filter(metier => (filiere.metiers_lies || []).includes(metier.id))
      .slice(0, 2);
    return `
      <article class="discovery-card" data-motion="rise">
        <div class="discovery-card-icon">${ICONES_FILIERES[filiere.id] || ""}</div>
        <span class="discovery-tag">${utilitaires.echapperHtml(categorie ? categorie.label : "Filière")}</span>
        <h2>${utilitaires.echapperHtml(filiere.nom)}</h2>
        <p>${utilitaires.echapperHtml(filiere.description || "Description non renseignée dans le catalogue.")}</p>
        ${filiere.duree_etudes ? `<p class="discovery-card-fact">${utilitaires.echapperHtml(filiere.duree_etudes)}</p>` : ""}
        <div class="discovery-card-meta">
          ${metiers.map(metier => `<span>${utilitaires.echapperHtml(metier.nom)}</span>`).join("")}
        </div>
        <a href="#${encodeURIComponent(String(filiere.id))}">Consulter la fiche <span aria-hidden="true">→</span></a>
      </article>
    `;
  }).join("");
  utilitaires.animerElements(grille);
}

function reinitialiserFiltres() {
  document.getElementById("recherche-filiere").value = "";
  document.getElementById("filtre-duree-filiere").value = "";
  document.getElementById("filtre-metier-filiere").value = "";
  document.querySelectorAll("#filtres-univers input").forEach(input => {
    input.checked = false;
  });
  appliquerFiltres();
}

function afficherFiche(filiere) {
  const utilitaires = window.JeuneAvenirDiscovery;
  const ecoles = (filiere.ecoles_liees || [])
    .map(id => TOUTES_ECOLES.find(ecole => ecole.id === id))
    .filter(Boolean)
    .map(ecole => {
      const sourceRattachement = Boolean(ecole.verification && ecole.verification.domaine_confirme);
      return {
        label: ecole.nom,
        description: [ecole.ville, ecole.commune, `Type indiqué : ${ecole.statut === "public" ? "public" : "privé"}`].filter(Boolean).join(" · "),
        href: utilitaires.lienFiche("ecoles.html", ecole.id),
        badge: sourceRattachement ? "Domaine documenté" : "Rattachement à confirmer"
      };
    });
  const metiers = (filiere.metiers_lies || [])
    .map(id => TOUS_METIERS.find(metier => metier.id === id))
    .filter(Boolean)
    .map(metier => ({
      label: metier.nom,
      description: metier.description,
      href: utilitaires.lienFiche("metiers.html", metier.id)
    }));

  utilitaires.rendreFiche(document.getElementById("fiche-filiere"), {
    kind: "FILIÈRE",
    title: filiere.nom,
    description: filiere.description,
    tags: [(UNIVERS_FILIERES.find(univers => univers.id === filiere.id) || {}).label, "Repère du catalogue"],
    facts: [
      { label: "Durée indiquée", value: filiere.duree_etudes },
      { label: "Établissements liés", value: String(ecoles.length) },
      { label: "Salaire indicatif", value: filiere.salaire_indicatif }
    ],
    favorite: { category: "filieres", id: filiere.id },
    sections: [
      { title: "Matières principales", items: filiere.matieres_principales },
      { title: "Débouchés du catalogue", items: filiere.debouches },
      { title: "Métiers associés", items: metiers, empty: "Aucun métier associé n'est renseigné." },
      {
        title: "Établissements référencés",
        description: "Ces liens proviennent du catalogue du projet. Ils ne garantissent pas l’ouverture actuelle du programme ni l’admission.",
        items: ecoles,
        empty: "Aucun établissement n'est associé à cette filière dans le catalogue."
      }
    ],
    note: filiere.salaire_indicatif
      ? `Salaire indicatif du catalogue : ${filiere.salaire_indicatif}. Cette estimation est à vérifier; aucun frais de scolarité n'est renseigné.`
      : "Aucune donnée financière n'est renseignée dans le catalogue.",
    asideTitle: "Construis ton parcours",
    asideText: "Compare les formations, vérifie les informations d’admission et explore les métiers avant de choisir.",
    actions: [
      { label: "Comparer cette filière", href: "comparateur.html" },
      ...(metiers.length ? [{ label: "Explorer un métier associé", href: metiers[0].href }] : [])
    ],
    backHref: "filieres.html",
    backLabel: "Retour à la liste"
  });
}
