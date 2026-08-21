// offres.js
// Liste des offres de stage/emploi : filtrable (domaine, ville, type),
// fiche détaillée, candidature. V1 : la candidature est stockée en
// localStorage (simulation) -- une vraie base de données arrivera en V2.

let TOUTES_OFFRES = [];
let TOUTES_FILIERES = [];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [repOffres, repFilieres] = await Promise.all([
      fetch("data/offres.json"),
      fetch("data/filieres.json")
    ]);
    TOUTES_OFFRES = (await repOffres.json()).offres;
    TOUTES_FILIERES = (await repFilieres.json()).filieres;

    remplirFiltres();
    appliquerFiltres();

    document.getElementById("recherche-offre").addEventListener("input", appliquerFiltres);
    document.getElementById("filtre-domaine-offre").addEventListener("change", appliquerFiltres);
    document.getElementById("filtre-ville-offre").addEventListener("change", appliquerFiltres);
    document.getElementById("filtre-type-offre").addEventListener("change", appliquerFiltres);

    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const o = TOUTES_OFFRES.find(x => x.id === id);
      if (o) afficherFiche(o);
    }

  } catch (erreur) {
    console.error(erreur);
    document.getElementById("liste-offres").innerHTML = "<p class='message-vide'>Impossible de charger les offres. Vérifie que tu utilises un serveur local (Live Server).</p>";
  }
});

function nomFiliere(id) {
  return TOUTES_FILIERES.find(f => f.id === id)?.nom || id;
}

function remplirFiltres() {
  const selectDomaine = document.getElementById("filtre-domaine-offre");
  TOUTES_FILIERES.forEach(f => {
    const option = document.createElement("option");
    option.value = f.id;
    option.textContent = f.nom;
    selectDomaine.appendChild(option);
  });

  const villes = [...new Set(TOUTES_OFFRES.map(o => o.ville))].sort();
  const selectVille = document.getElementById("filtre-ville-offre");
  villes.forEach(v => {
    const option = document.createElement("option");
    option.value = v;
    option.textContent = v;
    selectVille.appendChild(option);
  });
}

function appliquerFiltres() {
  const terme = document.getElementById("recherche-offre").value.toLowerCase().trim();
  const domaine = document.getElementById("filtre-domaine-offre").value;
  const ville = document.getElementById("filtre-ville-offre").value;
  const type = document.getElementById("filtre-type-offre").value;

  const resultats = TOUTES_OFFRES.filter(o => {
    if (terme && !o.titre.toLowerCase().includes(terme) && !o.entreprise.toLowerCase().includes(terme)) return false;
    if (domaine && o.domaine !== domaine) return false;
    if (ville && o.ville !== ville) return false;
    if (type && o.type !== type) return false;
    return true;
  });

  afficherListe(resultats);
}

function afficherListe(offres) {
  document.getElementById("compteur-offres").textContent =
    `${offres.length} offre${offres.length > 1 ? "s" : ""} trouvée${offres.length > 1 ? "s" : ""}`;

  const conteneur = document.getElementById("liste-offres");

  if (offres.length === 0) {
    conteneur.innerHTML = "<p class='message-vide'>Aucune offre ne correspond à ces critères.</p>";
    return;
  }

  conteneur.innerHTML = offres.map(o => `
    <button type="button" class="carte carte-offre" data-id="${o.id}">
      <span class="badge-type-offre badge-type-${o.type}">${o.type === "stage" ? "Stage" : "Emploi"}</span>
      <h3>${o.titre}</h3>
      <p class="offre-entreprise">${o.entreprise} — ${o.ville}</p>
      <p>${o.description.slice(0, 85)}${o.description.length > 85 ? "…" : ""}</p>
      <span class="lien-explorer">Voir l'offre →</span>
    </button>
  `).join("");

  conteneur.querySelectorAll(".carte-offre").forEach(carte => {
    carte.addEventListener("click", () => {
      const o = TOUTES_OFFRES.find(x => x.id === carte.dataset.id);
      afficherFiche(o);
      history.replaceState(null, "", `#${o.id}`);
    });
  });
}

function afficherFiche(offre) {
  const fiche = document.getElementById("fiche-offre");
  if (!offre) { fiche.style.display = "none"; return; }

  const utilisateur = JSON.parse(localStorage.getItem("jac_utilisateur_connecte") || "null");

  fiche.innerHTML = `
    <div class="fiche-filiere-entete">
      <div>
        <span class="badge-type-offre badge-type-${offre.type}">${offre.type === "stage" ? "Stage" : "Emploi"}</span>
        <h2>${offre.titre}</h2>
        <p class="offre-entreprise">${offre.entreprise} — ${offre.ville} · ${nomFiliere(offre.domaine)}</p>
      </div>
      <button type="button" class="bouton-fermer-fiche" id="bouton-fermer-fiche-offre" aria-label="Fermer">✕</button>
    </div>

    <p class="fiche-description">${offre.description}</p>

    <div id="zone-candidature"></div>
  `;

  const zoneCandidature = document.getElementById("zone-candidature");

  if (!utilisateur) {
    zoneCandidature.innerHTML = `
      <div class="encart-connexion-requise">
        <p>Connecte-toi pour postuler à cette offre.</p>
        <a href="connexion.html" class="bouton-principal">Se connecter</a>
      </div>
    `;
  } else {
    const candidatures = JSON.parse(localStorage.getItem("jac_candidatures") || "[]");
    const dejaPostule = candidatures.some(c => c.offreId === offre.id && c.candidatEmail === utilisateur.email);

    if (dejaPostule) {
      zoneCandidature.innerHTML = `<p class="confirmation-demande">✔ Tu as déjà postulé à cette offre. Statut : envoyée.</p>`;
    } else {
      zoneCandidature.innerHTML = `
        <button type="button" id="bouton-postuler" class="bouton-principal bouton-pleine-largeur">Postuler à cette offre</button>
      `;

      document.getElementById("bouton-postuler").addEventListener("click", () => {
        const candidatures = JSON.parse(localStorage.getItem("jac_candidatures") || "[]");
        candidatures.push({
          offreId: offre.id,
          offreTitre: offre.titre,
          entreprise: offre.entreprise,
          candidatNom: utilisateur.nom,
          candidatEmail: utilisateur.email,
          statut: "envoyée",
          date: new Date().toISOString()
        });
        localStorage.setItem("jac_candidatures", JSON.stringify(candidatures));

        zoneCandidature.innerHTML = `<p class="confirmation-demande">✔ Candidature envoyée pour « ${offre.titre} » chez ${offre.entreprise}.</p>`;
      });
    }
  }

  fiche.style.display = "block";
  document.getElementById("bouton-fermer-fiche-offre").addEventListener("click", () => {
    fiche.style.display = "none";
    history.replaceState(null, "", window.location.pathname);
  });

  fiche.scrollIntoView({ behavior: "smooth", block: "start" });
}
