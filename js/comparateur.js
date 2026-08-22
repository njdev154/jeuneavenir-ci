// comparateur.js
// Permet de choisir 2 ou 3 filières et de les comparer côte à côte
// (durée, matières, débouchés, salaire indicatif, nombre d'écoles).

let TOUTES_FILIERES = [];
let TOUTES_ECOLES = [];
const selectionsActuelles = [null, null, null];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [repFilieres, repEcoles] = await Promise.all([
      fetch("data/filieres.json"),
      fetch("data/ecoles.json")
    ]);
    TOUTES_FILIERES = (await repFilieres.json()).filieres;
    TOUTES_ECOLES = (await repEcoles.json()).ecoles;

    document.querySelectorAll(".comparateur-select").forEach(select => {
      TOUTES_FILIERES.forEach(f => {
        const option = document.createElement("option");
        option.value = f.id;
        option.textContent = f.nom;
        select.appendChild(option);
      });

      select.addEventListener("change", () => {
        const slot = parseInt(select.dataset.slot, 10);
        selectionsActuelles[slot] = select.value || null;
        afficherTableau();
      });
    });

  } catch (erreur) {
    console.error(erreur);
    document.getElementById("tableau-comparateur").innerHTML = "<p class='message-vide'>Impossible de charger les filières. Vérifie que tu utilises un serveur local (Live Server).</p>";
  }
});

function nombreEcoles(filiere) {
  return (filiere.ecoles_liees || []).length;
}

function afficherTableau() {
  const conteneur = document.getElementById("tableau-comparateur");
  const filieresChoisies = selectionsActuelles
    .filter(Boolean)
    .map(id => TOUTES_FILIERES.find(f => f.id === id))
    .filter(Boolean);

  if (filieresChoisies.length < 2) {
    conteneur.innerHTML = "<p class='message-vide'>Choisis au moins 2 filières ci-dessus pour voir la comparaison.</p>";
    return;
  }

  const lignes = [
    { label: "Durée des études", valeur: f => f.duree_etudes || "Non renseignée" },
    { label: "Matières principales", valeur: f => (f.matieres_principales || []).join(", ") || "Non renseignées" },
    { label: "Débouchés", valeur: f => (f.debouches || []).join(", ") || "Non renseignés" },
    { label: "Salaire indicatif", valeur: f => f.salaire_indicatif || "Non renseigné" },
    { label: "Écoles proposant cette filière", valeur: f => `${nombreEcoles(f)} école${nombreEcoles(f) > 1 ? "s" : ""}` },
  ];

  conteneur.innerHTML = `
    <div class="tableau-comparateur-scroll">
      <table class="tableau-comparateur">
        <thead>
          <tr>
            <th></th>
            ${filieresChoisies.map(f => `<th>${f.nom}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${lignes.map(ligne => `
            <tr>
              <th>${ligne.label}</th>
              ${filieresChoisies.map(f => `<td>${ligne.valeur(f)}</td>`).join("")}
            </tr>
          `).join("")}
          <tr>
            <th></th>
            ${filieresChoisies.map(f => `<td><a href="filieres.html#${f.id}" class="lien-explorer">Voir la fiche complète →</a></td>`).join("")}
          </tr>
        </tbody>
      </table>
    </div>
  `;
}
