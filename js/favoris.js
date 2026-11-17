// Source unique des favoris enregistrés dans le navigateur (V1).
const FAVORIS_CLE = "jac_favoris";
const FAVORIS_CATEGORIES = ["filieres", "ecoles", "metiers", "mentors", "offres"];

function favorisVides() {
  return Object.fromEntries(FAVORIS_CATEGORIES.map(categorie => [categorie, []]));
}

function lireEtatFavoris() {
  try {
    const valeur = localStorage.getItem(FAVORIS_CLE);
    if (!valeur) return { favoris: favorisVides(), erreur: null };

    const stockes = JSON.parse(valeur);
    if (!stockes || typeof stockes !== "object" || Array.isArray(stockes)) {
      throw new Error("Les favoris enregistrés ne sont pas un objet.");
    }

    Object.entries(stockes).forEach(([categorie, ids]) => {
      if (!Array.isArray(ids)) {
        throw new Error(`La catégorie de favoris « ${categorie} » n’est pas une liste.`);
      }
    });

    return { favoris: { ...favorisVides(), ...stockes }, erreur: null };
  } catch (erreur) {
    console.error("Lecture des favoris locaux impossible :", erreur);
    return {
      favoris: favorisVides(),
      erreur: new Error("Les favoris enregistrés sont illisibles. Ils n’ont pas été remplacés.")
    };
  }
}

function chargerFavoris() {
  return lireEtatFavoris().favoris;
}

function sauvegarderFavoris(favoris) {
  try {
    localStorage.setItem(FAVORIS_CLE, JSON.stringify(favoris));
  } catch (erreur) {
    console.error("Enregistrement des favoris locaux impossible :", erreur);
    throw new Error("Les favoris n’ont pas pu être enregistrés dans ce navigateur.");
  }
}

function estFavori(categorie, id) {
  const etat = lireEtatFavoris();
  if (etat.erreur) return false;
  return Array.isArray(etat.favoris[categorie]) && etat.favoris[categorie].includes(String(id));
}

function basculerFavori(categorie, id) {
  if (!FAVORIS_CATEGORIES.includes(categorie) || !String(id || "").trim()) {
    throw new Error("Cette référence ne peut pas être enregistrée dans les favoris.");
  }

  const etat = lireEtatFavoris();
  if (etat.erreur) throw etat.erreur;

  const favoris = etat.favoris;
  const identifiant = String(id);
  const estActif = favoris[categorie].includes(identifiant);
  favoris[categorie] = estActif
    ? favoris[categorie].filter(element => element !== identifiant)
    : [...favoris[categorie], identifiant];

  sauvegarderFavoris(favoris);
  return !estActif;
}

function echapperFavori(valeur) {
  return String(valeur).replace(/[&<>"']/g, caractere => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[caractere]);
}

function boutonFavoriHTML(categorie, id) {
  if (!FAVORIS_CATEGORIES.includes(categorie)) return "";
  const identifiant = String(id);
  const actif = estFavori(categorie, identifiant);
  return `<button type="button" class="bouton-favori ${actif ? "bouton-favori-actif" : ""}" data-categorie="${echapperFavori(categorie)}" data-id="${echapperFavori(identifiant)}" aria-pressed="${actif}" aria-label="${actif ? "Retirer des favoris" : "Ajouter aux favoris"}">
    ${actif ? "★ Retirer des favoris" : "☆ Ajouter aux favoris"}
  </button>`;
}

function activerBoutonFavori(conteneur) {
  const boutons = conteneur.querySelectorAll(".bouton-favori");
  boutons.forEach(bouton => {
    bouton.addEventListener("click", () => {
      const erreurExistante = bouton.parentElement.querySelector(".favori-erreur");
      if (erreurExistante) erreurExistante.remove();

      try {
        const actif = basculerFavori(bouton.dataset.categorie, bouton.dataset.id);
        bouton.textContent = actif ? "★ Retirer des favoris" : "☆ Ajouter aux favoris";
        bouton.setAttribute("aria-label", actif ? "Retirer des favoris" : "Ajouter aux favoris");
        bouton.setAttribute("aria-pressed", String(actif));
        bouton.classList.toggle("bouton-favori-actif", actif);
        if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.animer(bouton);
        if (typeof CustomEvent !== "undefined") {
          window.dispatchEvent(new CustomEvent("jac:favoris-modifies", {
            detail: { categorie: bouton.dataset.categorie, id: bouton.dataset.id, actif }
          }));
        }
      } catch (erreur) {
        console.error("Modification du favori impossible :", erreur);
        const message = document.createElement("span");
        message.className = "favori-erreur";
        message.setAttribute("role", "alert");
        message.textContent = erreur.message;
        bouton.insertAdjacentElement("afterend", message);
      }
    });
  });
}

window.JeuneAvenirFavoris = { categories: FAVORIS_CATEGORIES, lire: lireEtatFavoris };
