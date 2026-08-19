// ecoles.js
// Charge data/ecoles.json + data/filieres.json, affiche la liste des
// établissements avec filtres (recherche, ville, statut public/privé,
// domaine/filière). Affiche clairement le statut de vérification.

let TOUTES_ECOLES = [];
let TOUTES_FILIERES = [];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [repEcoles, repFilieres] = await Promise.all([
      fetch("data/ecoles.json"),
      fetch("data/filieres.json")
    ]);
    TOUTES_ECOLES = (await repEcoles.json()).ecoles;
    TOUTES_FILIERES = (await repFilieres.json()).filieres;

    remplirFiltres();
    appliquerFiltres();

    document.getElementById("recherche-ecole").addEventListener("input", appliquerFiltres);
    document.getElementById("filtre-ville").addEventListener("change", appliquerFiltres);
    document.getElementById("filtre-statut").addEventListener("change", appliquerFiltres);
    document.getElementById("filtre-domaine").addEventListener("change", appliquerFiltres);

  } catch (erreur) {
    console.error(erreur);
    document.getElementById("liste-ecoles").innerHTML = "<p>Impossible de charger les écoles. Vérifie que tu utilises un serveur local (Live Server).</p>";
  }
});

function remplirFiltres() {
  const villes = [...new Set(TOUTES_ECOLES.map(e => e.ville))].sort();
  const selectVille = document.getElementById("filtre-ville");
  villes.forEach(v => {
    const option = document.createElement("option");
    option.value = v;
    option.textContent = v;
    selectVille.appendChild(option);
  });

  const selectDomaine = document.getElementById("filtre-domaine");
  TOUTES_FILIERES.forEach(f => {
    const option = document.createElement("option");
    option.value = f.id;
    option.textContent = f.nom;
    selectDomaine.appendChild(option);
  });
}

function appliquerFiltres() {
  const terme = document.getElementById("recherche-ecole").value.toLowerCase().trim();
  const ville = document.getElementById("filtre-ville").value;
  const statut = document.getElementById("filtre-statut").value;
  const domaine = document.getElementById("filtre-domaine").value;

  const resultats = TOUTES_ECOLES.filter(e => {
    if (terme && !e.nom.toLowerCase().includes(terme)) return false;
    if (ville && e.ville !== ville) return false;
    if (statut && e.statut !== statut) return false;
    if (domaine && !e.domaines.includes(domaine)) return false;
    return true;
  });

  afficherResultats(resultats);
}

function afficherResultats(ecoles) {
  document.getElementById("compteur-resultats").textContent =
    `${ecoles.length} établissement${ecoles.length > 1 ? "s" : ""} trouvé${ecoles.length > 1 ? "s" : ""}`;

  const conteneur = document.getElementById("liste-ecoles");

  if (ecoles.length === 0) {
    conteneur.innerHTML = "<p class='message-vide'>Aucune école ne correspond à ces critères.</p>";
    return;
  }

  conteneur.innerHTML = ecoles.map(e => {
    const nomsDomaines = e.domaines
      .map(id => TOUTES_FILIERES.find(f => f.id === id)?.nom)
      .filter(Boolean)
      .join(", ");

    return `
      <article class="carte carte-ecole">
        <div class="carte-ecole-entete">
          <h3>${e.nom}</h3>
          ${e.verification.domaine_confirme
            ? '<span class="badge-verifie">✔ Domaine vérifié</span>'
            : '<span class="badge-a-confirmer">Domaine à confirmer</span>'}
        </div>
        <p class="carte-ecole-lieu">${e.ville}${e.commune ? " · " + e.commune : ""} — ${e.statut === "public" ? "Public" : "Privé"} · ${e.type.replace("_", " ")}</p>
        <p class="carte-ecole-domaines">${nomsDomaines}</p>
        ${e.campus_de ? `<p class="carte-ecole-campus">Antenne de : ${TOUTES_ECOLES.find(x => x.id === e.campus_de)?.nom || ""}</p>` : ""}
        ${e.evaluation_mesrs ? `<p class="carte-ecole-eval">Évaluation MESRS ${e.evaluation_mesrs.annee} : ${e.evaluation_mesrs.score} (${e.evaluation_mesrs.mention})</p>` : ""}
        ${e.contact.site ? `<a href="${e.contact.site}" target="_blank" rel="noopener" class="lien-explorer">Site officiel →</a>` : ""}
      </article>
    `;
  }).join("");
}
