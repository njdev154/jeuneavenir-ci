const CATEGORIES_FAVORIS_PAGE = [
  { id: "filieres", titre: "Filières", lien: "filieres.html", cle: "filieres" },
  { id: "ecoles", titre: "Écoles", lien: "ecoles.html", cle: "ecoles" },
  { id: "metiers", titre: "Métiers", lien: "metiers.html", cle: "metiers" },
  { id: "mentors", titre: "Mentors", lien: "mentorat.html", cle: "mentors" },
  { id: "offres", titre: "Offres", lien: "offres.html", cle: "offres" }
];

document.addEventListener("DOMContentLoaded", () => {
  const etat = document.getElementById("favoris-etat");
  const filtres = document.getElementById("favoris-filtres");
  let catalogues = {};

  filtres.addEventListener("click", evenement => {
    const bouton = evenement.target.closest("[data-favoris-filtre]");
    if (!bouton) return;
    afficherFiltreActif(bouton.dataset.favorisFiltre);
  });

  window.addEventListener("jac:favoris-modifies", afficherFavoris);
  chargerCatalogues();

  async function chargerCatalogues() {
    etat.textContent = "Chargement des favoris enregistrés dans ce navigateur…";
    try {
      const chemins = [
        ["filieres", "data/filieres.json", "filieres"],
        ["ecoles", "data/ecoles.json", "ecoles"],
        ["metiers", "data/metiers.json", "metiers"],
        ["mentors", "data/mentors.json", "mentors"],
        ["offres", "data/offres.json", "offres"]
      ];
      const reponses = await Promise.all(chemins.map(([, chemin]) => fetch(chemin)));
      const invalides = reponses.filter(reponse => !reponse.ok);
      if (invalides.length) throw new Error("Un ou plusieurs catalogues sont indisponibles.");

      const donnees = await Promise.all(reponses.map(reponse => reponse.json()));
      catalogues = {};
      chemins.forEach(([categorie, , cle], index) => {
        const collection = donnees[index][cle];
        if (!Array.isArray(collection)) {
          throw new Error(`Le catalogue ${categorie} n’a pas le format attendu.`);
        }
        const estPublie = categorie === "mentors" || categorie === "offres"
          ? donnees[index]._statut_publication === "verifie"
          : true;
        catalogues[categorie] = estPublie ? collection : [];
      });

      afficherFavoris();
    } catch (erreur) {
      console.error("Chargement de la page Favoris impossible :", erreur);
      etat.innerHTML = `
        <div class="account-alert" role="alert">
          <p>Les catalogues n’ont pas pu être chargés. Aucun favori n’a été modifié.</p>
          <button type="button" class="account-button account-button-secondary" id="recharger-favoris">Réessayer</button>
        </div>`;
      document.getElementById("recharger-favoris").addEventListener("click", chargerCatalogues);
    }
  }

  function afficherFavoris() {
    const lecture = window.JeuneAvenirFavoris.lire();
    if (lecture.erreur) {
      etat.innerHTML = `<p class="account-alert" role="alert">${echapperFavoriPage(lecture.erreur.message)} Actualise la page après avoir vérifié les données locales.</p>`;
      document.getElementById("favoris-categories").replaceChildren();
      return;
    }

    etat.textContent = "Tes favoris sont enregistrés uniquement dans ce navigateur.";
    const conteneur = document.getElementById("favoris-categories");
    conteneur.innerHTML = CATEGORIES_FAVORIS_PAGE.map(categorie =>
      rendreCategorie(categorie, lecture.favoris[categorie.id] || [])
    ).join("");
    conteneur.querySelectorAll("[data-favoris-section]").forEach(section => activerBoutonFavori(section));

    filtres.querySelectorAll("[data-favoris-filtre]").forEach(bouton => {
      const id = bouton.dataset.favorisFiltre;
      const nombre = id === "tout"
        ? CATEGORIES_FAVORIS_PAGE.reduce((total, item) => total + lecture.favoris[item.id].length, 0)
        : (lecture.favoris[id] || []).length;
      const base = id === "tout"
        ? "Tout"
        : CATEGORIES_FAVORIS_PAGE.find(item => item.id === id).titre;
      bouton.textContent = `${base} (${nombre})`;
    });

    afficherFiltreActif(filtres.querySelector('[aria-pressed="true"]')?.dataset.favorisFiltre || "tout");
    if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.initialiser();
  }

  function rendreCategorie(categorie, ids) {
    const index = new Map((catalogues[categorie.id] || []).map(item => [String(item.id), item]));
    const cartes = ids.map(id => {
      const item = index.get(String(id));
      const carte = item
        ? rendreCarte(categorie.id, categorie.lien, id, item)
        : rendreCarteIndisponible(categorie.id, categorie.lien, id);
      return carte;
    }).join("");

    const contenu = ids.length
      ? `<div class="account-favorites-grid">${cartes}</div>`
      : `<p class="account-empty-inline">Aucun favori dans cette catégorie. <a href="${categorie.lien}">Explorer ${categorie.titre.toLocaleLowerCase("fr")}</a></p>`;

    return `
      <section class="account-favorites-section" data-favoris-section="${categorie.id}" data-motion="rise" aria-labelledby="titre-favoris-${categorie.id}">
        <div class="account-section-heading">
          <h2 id="titre-favoris-${categorie.id}">${categorie.titre}</h2>
          <span>${ids.length} enregistré${ids.length === 1 ? "" : "s"}</span>
        </div>
        ${contenu}
      </section>`;
  }

  function rendreCarte(categorie, lien, id, item) {
    const nom = item.nom || item.titre || "Élément sans titre";
    const description = item.description || item.presentation || item.bio || "";
    const informations = [
      item.ville,
      item.domaine,
      item.entreprise
    ].filter(Boolean).join(" · ");

    return `
      <article class="account-favorite-card" data-motion="rise">
        <span class="account-eyebrow">${nomCategorieFavoris(categorie)}</span>
        <h3><a href="${lien}#${encodeURIComponent(String(id))}">${echapperFavoriPage(nom)}</a></h3>
        ${description ? `<p>${echapperFavoriPage(description)}</p>` : ""}
        ${informations ? `<p class="account-card-meta">${echapperFavoriPage(informations)}</p>` : ""}
        ${boutonFavoriHTML(categorie, id)}
      </article>`;
  }

  function rendreCarteIndisponible(categorie, lien, id) {
    return `
      <article class="account-favorite-card account-favorite-stale">
        <span class="account-eyebrow">${nomCategorieFavoris(categorie)}</span>
        <h3>Élément indisponible</h3>
        <p>Cette référence ne figure plus dans les données chargées. Elle reste dans tes favoris jusqu’à ce que tu la retires.</p>
        <a class="account-text-link" href="${lien}">Retour au catalogue</a>
        ${boutonFavoriHTML(categorie, id)}
      </article>`;
  }

  function nomCategorieFavoris(id) {
    return CATEGORIES_FAVORIS_PAGE.find(categorie => categorie.id === id)?.titre || "Favori";
  }

  function afficherFiltreActif(id) {
    filtres.querySelectorAll("[data-favoris-filtre]").forEach(bouton => {
      bouton.setAttribute("aria-pressed", String(bouton.dataset.favorisFiltre === id));
    });
    document.querySelectorAll("[data-favoris-section]").forEach(section => {
      section.hidden = id !== "tout" && section.dataset.favorisSection !== id;
    });
  }
});

function echapperFavoriPage(valeur) {
  return String(valeur == null ? "" : valeur).replace(/[&<>"']/g, caractere => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[caractere]);
}
