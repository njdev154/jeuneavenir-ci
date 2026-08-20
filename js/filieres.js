// filieres.js
// Charge data/filieres.json + data/ecoles.json, affiche la liste des
// filières (avec recherche), et une fiche détaillée au clic sur une
// filière (matières, débouchés, écoles qui la proposent, métiers liés).

let TOUTES_FILIERES = [];
let TOUTES_ECOLES = [];
let TOUS_METIERS = [];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [repFilieres, repEcoles, repMetiers] = await Promise.all([
      fetch("data/filieres.json"),
      fetch("data/ecoles.json"),
      fetch("data/metiers.json")
    ]);
    TOUTES_FILIERES = (await repFilieres.json()).filieres;
    TOUTES_ECOLES = (await repEcoles.json()).ecoles;
    TOUS_METIERS = (await repMetiers.json()).metiers;

    afficherListe(TOUTES_FILIERES);

    // Recherche en direct
    document.getElementById("recherche-filiere").addEventListener("input", (e) => {
      const terme = e.target.value.toLowerCase().trim();
      const filtrees = TOUTES_FILIERES.filter(f =>
        f.nom.toLowerCase().includes(terme) ||
        (f.description || "").toLowerCase().includes(terme)
      );
      afficherListe(filtrees);
    });

    // Si l'URL contient #informatique (ex: venant du résultat du quiz), ouvre directement la fiche
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const f = TOUTES_FILIERES.find(x => x.id === id);
      if (f) afficherFiche(f);
    }

  } catch (erreur) {
    console.error(erreur);
    document.getElementById("grille-filieres").innerHTML = "<p>Impossible de charger les filières. Vérifie que tu utilises un serveur local (Live Server).</p>";
  }
});

// Icônes simples par filière (même esprit que les icônes des piliers sur l'accueil)
const ICONES_FILIERES = {
  "informatique": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/></svg>',
  "gestion-commerce": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 20V10M9 20V4M15 20v-7M21 20V8"/></svg>',
  "droit": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v18M5 8l-3 6a4 4 0 0 0 6 0zM19 8l-3 6a4 4 0 0 0 6 0zM5 8h14M8 3h8"/></svg>',
  "genie-civil": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/></svg>',
  "sante": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>',
  "communication-marketing": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 5h14v10H8l-5 4V5z"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="10" r="1"/></svg>',
  "agronomie": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21V10M12 10c0-3.5-2.5-6-6-6 0 3.5 2.5 6 6 6zM12 10c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6z"/></svg>',
};

function afficherListe(filieres) {
  const grille = document.getElementById("grille-filieres");

  if (filieres.length === 0) {
    grille.innerHTML = "<p class='message-vide'>Aucune filière ne correspond à ta recherche.</p>";
    return;
  }

  grille.innerHTML = filieres.map(f => `
    <button type="button" class="carte carte-filiere" data-id="${f.id}">
      <div class="pilier-icone">${ICONES_FILIERES[f.id] || ""}</div>
      <h3>${f.nom}</h3>
      <p>${(f.description || "").slice(0, 90)}${(f.description || "").length > 90 ? "…" : ""}</p>
      <span class="lien-explorer">Voir la fiche →</span>
    </button>
  `).join("");

  grille.querySelectorAll(".carte-filiere").forEach(carte => {
    carte.addEventListener("click", () => {
      const f = TOUTES_FILIERES.find(x => x.id === carte.dataset.id);
      afficherFiche(f);
      history.replaceState(null, "", `#${f.id}`);
    });
  });
}

function afficherFiche(filiere) {
  const fiche = document.getElementById("fiche-filiere");
  if (!filiere) { fiche.style.display = "none"; return; }

  const ecolesLiees = TOUTES_ECOLES.filter(e => filiere.ecoles_liees.includes(e.id));
  const metiersLies = TOUS_METIERS.filter(m => filiere.metiers_lies.includes(m.id));

  fiche.innerHTML = `
    <div class="fiche-filiere-entete">
      <div>
        <h2>${filiere.nom}</h2>
      </div>
      <button type="button" class="bouton-fermer-fiche" id="bouton-fermer-fiche" aria-label="Fermer">✕</button>
    </div>

    <p class="fiche-description">${filiere.description || "Description à venir."}</p>

    <div class="fiche-grille-infos">
      <div>
        <h4>Durée des études</h4>
        <p>${filiere.duree_etudes || "Non renseignée"}</p>
      </div>
      <div>
        <h4>Matières principales</h4>
        <p>${(filiere.matieres_principales || []).join(", ") || "Non renseignées"}</p>
      </div>
      <div>
        <h4>Débouchés</h4>
        <p>${(filiere.debouches || []).join(", ") || "Non renseignés"}</p>
      </div>
      <div>
        <h4>Salaire indicatif</h4>
        <p>${filiere.salaire_indicatif || "Non renseigné"}</p>
      </div>
    </div>

    <h4>Métiers liés</h4>
    <div class="chips-metiers">
      ${metiersLies.map(m => `<span class="chip">${m.nom}</span>`).join("") || "<p>Aucun métier renseigné.</p>"}
    </div>

    <h4>Écoles qui proposent cette filière (${ecolesLiees.length})</h4>
    <div class="liste-mini-ecoles">
      ${ecolesLiees.map(e => `
        <div class="mini-ecole">
          <div>
            <strong>${e.nom}</strong>
            <span class="mini-ecole-lieu">${e.ville}${e.commune ? " · " + e.commune : ""} · ${e.statut === "public" ? "Public" : "Privé"}</span>
          </div>
          ${e.verification.domaine_confirme
            ? '<span class="badge-verifie">✔ Domaine vérifié</span>'
            : '<span class="badge-a-confirmer">À confirmer</span>'}
        </div>
      `).join("") || "<p>Aucune école renseignée pour l'instant.</p>"}
    </div>
  `;

  fiche.style.display = "block";
  document.getElementById("bouton-fermer-fiche").addEventListener("click", () => {
    fiche.style.display = "none";
    history.replaceState(null, "", window.location.pathname);
  });

  fiche.scrollIntoView({ behavior: "smooth", block: "start" });
}
