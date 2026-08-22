// favoris.js
// Petit module réutilisable pour ajouter/retirer des favoris
// (filières, écoles, mentors, offres). Stocké en localStorage (V1).
// Utilisé par filieres.js, ecoles.js, mentors.js, offres.js et favoris.html.

const FAVORIS_CLE = "jac_favoris";

function chargerFavoris() {
  return JSON.parse(localStorage.getItem(FAVORIS_CLE) || '{"filieres":[],"ecoles":[],"mentors":[],"offres":[]}');
}

function sauvegarderFavoris(favoris) {
  localStorage.setItem(FAVORIS_CLE, JSON.stringify(favoris));
}

function estFavori(categorie, id) {
  return chargerFavoris()[categorie]?.includes(id) || false;
}

function basculerFavori(categorie, id) {
  const favoris = chargerFavoris();
  if (!favoris[categorie]) favoris[categorie] = [];
  const index = favoris[categorie].indexOf(id);
  if (index === -1) {
    favoris[categorie].push(id);
  } else {
    favoris[categorie].splice(index, 1);
  }
  sauvegarderFavoris(favoris);
  return favoris[categorie].includes(id);
}

// Génère le HTML d'un bouton favori (à insérer dans une fiche)
function boutonFavoriHTML(categorie, id) {
  const actif = estFavori(categorie, id);
  return `<button type="button" class="bouton-favori ${actif ? 'bouton-favori-actif' : ''}" data-categorie="${categorie}" data-id="${id}">
    ${actif ? "★ Retirer des favoris" : "☆ Ajouter aux favoris"}
  </button>`;
}

// À appeler après avoir inséré le bouton dans le DOM
function activerBoutonFavori(conteneur) {
  const bouton = conteneur.querySelector(".bouton-favori");
  if (!bouton) return;
  bouton.addEventListener("click", () => {
    const actif = basculerFavori(bouton.dataset.categorie, bouton.dataset.id);
    bouton.textContent = actif ? "★ Retirer des favoris" : "☆ Ajouter aux favoris";
    bouton.classList.toggle("bouton-favori-actif", actif);
  });
}
