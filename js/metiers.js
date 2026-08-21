// metiers.js
// Liste des métiers avec recherche et filtre par domaine (filière liée).
// metiers.json n'a pas de champ "domaine" -- le lien existe dans
// filieres.json (metiers_lies). On construit donc une correspondance
// inverse ici : pour chaque métier, quelles filières y mènent.

let TOUS_METIERS = [];
let TOUTES_FILIERES = [];
let CORRESPONDANCE_METIER_FILIERES = {}; // { idMetier: [idFiliere, ...] }

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [repMetiers, repFilieres] = await Promise.all([
      fetch("data/metiers.json"),
      fetch("data/filieres.json")
    ]);
    TOUS_METIERS = (await repMetiers.json()).metiers;
    TOUTES_FILIERES = (await repFilieres.json()).filieres;

    // Construit la correspondance inverse métier -> filières
    TOUTES_FILIERES.forEach(f => {
      (f.metiers_lies || []).forEach(idMetier => {
        if (!CORRESPONDANCE_METIER_FILIERES[idMetier]) CORRESPONDANCE_METIER_FILIERES[idMetier] = [];
        CORRESPONDANCE_METIER_FILIERES[idMetier].push(f.id);
      });
    });

    remplirFiltreDomaine();
    appliquerFiltres();

    document.getElementById("recherche-metier").addEventListener("input", appliquerFiltres);
    document.getElementById("filtre-domaine-metier").addEventListener("change", appliquerFiltres);

    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const m = TOUS_METIERS.find(x => x.id === id);
      if (m) afficherFiche(m);
    }

  } catch (erreur) {
    console.error(erreur);
    document.getElementById("grille-metiers").innerHTML = "<p class='message-vide'>Impossible de charger les métiers. Vérifie que tu utilises un serveur local (Live Server).</p>";
  }
});

function nomFiliere(id) {
  return TOUTES_FILIERES.find(f => f.id === id)?.nom || id;
}

function filieresDuMetier(idMetier) {
  return CORRESPONDANCE_METIER_FILIERES[idMetier] || [];
}

function remplirFiltreDomaine() {
  const select = document.getElementById("filtre-domaine-metier");
  TOUTES_FILIERES.forEach(f => {
    const option = document.createElement("option");
    option.value = f.id;
    option.textContent = f.nom;
    select.appendChild(option);
  });
}

function appliquerFiltres() {
  const terme = document.getElementById("recherche-metier").value.toLowerCase().trim();
  const domaine = document.getElementById("filtre-domaine-metier").value;

  const resultats = TOUS_METIERS.filter(m => {
    if (terme && !m.nom.toLowerCase().includes(terme) && !(m.description || "").toLowerCase().includes(terme)) return false;
    if (domaine && !filieresDuMetier(m.id).includes(domaine)) return false;
    return true;
  });

  afficherListe(resultats);
}

function afficherListe(metiers) {
  document.getElementById("compteur-metiers").textContent =
    `${metiers.length} métier${metiers.length > 1 ? "s" : ""} trouvé${metiers.length > 1 ? "s" : ""}`;

  const grille = document.getElementById("grille-metiers");

  if (metiers.length === 0) {
    grille.innerHTML = "<p class='message-vide'>Aucun métier ne correspond à ta recherche.</p>";
    return;
  }

  grille.innerHTML = metiers.map(m => `
    <button type="button" class="carte carte-filiere" data-id="${m.id}">
      <h3>${m.nom}</h3>
      <p>${(m.description || "").slice(0, 90)}${(m.description || "").length > 90 ? "…" : ""}</p>
      <span class="lien-explorer">Voir le détail →</span>
    </button>
  `).join("");

  grille.querySelectorAll(".carte-filiere").forEach(carte => {
    carte.addEventListener("click", () => {
      const m = TOUS_METIERS.find(x => x.id === carte.dataset.id);
      afficherFiche(m);
      history.replaceState(null, "", `#${m.id}`);
    });
  });
}

function afficherFiche(metier) {
  const fiche = document.getElementById("fiche-metier");
  if (!metier) { fiche.style.display = "none"; return; }

  const filieresLiees = filieresDuMetier(metier.id);

  fiche.innerHTML = `
    <div class="fiche-filiere-entete">
      <div><h2>${metier.nom}</h2></div>
      <button type="button" class="bouton-fermer-fiche" id="bouton-fermer-fiche-metier" aria-label="Fermer">✕</button>
    </div>

    <p class="fiche-description">${metier.description || ""}</p>

    <h4>Missions principales</h4>
    <div class="chips-metiers">
      ${(metier.missions || []).map(m => `<span class="chip">${m}</span>`).join("") || "<p>Non renseignées.</p>"}
    </div>

    <h4>Compétences requises</h4>
    <div class="chips-metiers">
      ${(metier.competences || []).map(c => `<span class="chip">${c}</span>`).join("") || "<p>Non renseignées.</p>"}
    </div>

    <h4>Comment y accéder</h4>
    <div class="liste-mini-ecoles">
      ${filieresLiees.map(idF => `
        <div class="mini-ecole">
          <strong>${nomFiliere(idF)}</strong>
          <a href="filieres.html#${idF}" class="lien-explorer">Voir la filière →</a>
        </div>
      `).join("") || "<p>Filière non renseignée pour l'instant.</p>"}
    </div>
  `;

  fiche.style.display = "block";
  document.getElementById("bouton-fermer-fiche-metier").addEventListener("click", () => {
    fiche.style.display = "none";
    history.replaceState(null, "", window.location.pathname);
  });

  fiche.scrollIntoView({ behavior: "smooth", block: "start" });
}
