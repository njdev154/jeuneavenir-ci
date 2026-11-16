let TOUTES_FILIERES = [];
const selectionsActuelles = [null, null, null];

function echapperHtml(valeur) {
  const caracteres = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  };
  return String(valeur == null ? "" : valeur).replace(/[&<>"']/g, caractere => caracteres[caractere]);
}

document.addEventListener("DOMContentLoaded", async () => {
  const conteneur = document.getElementById("tableau-comparateur");
  const annonce = document.getElementById("comparateur-annonce");

  try {
    const reponse = await fetch("data/filieres.json");
    if (!reponse.ok) throw new Error("Réponse serveur invalide");

    const donnees = await reponse.json();
    if (!Array.isArray(donnees.filieres)) throw new Error("Le catalogue de filières est invalide");
    TOUTES_FILIERES = donnees.filieres;

    document.querySelectorAll(".comparateur-select").forEach(select => {
      TOUTES_FILIERES.forEach(filiere => {
        const option = document.createElement("option");
        option.value = filiere.id;
        option.textContent = filiere.nom;
        select.appendChild(option);
      });

      select.addEventListener("change", () => {
        const slot = Number(select.dataset.slot);
        const nouvelleSelection = select.value || null;
        const doublon = selectionsActuelles.some((id, index) => index !== slot && id === nouvelleSelection);

        if (doublon) {
          select.value = selectionsActuelles[slot] || "";
          return;
        }

        selectionsActuelles[slot] = nouvelleSelection;
        mettreAJourSelecteurs();
        afficherTableau();
      });
    });

    document.querySelectorAll(".comparateur-retirer").forEach(bouton => {
      bouton.addEventListener("click", () => {
        const slot = Number(bouton.dataset.slot);
        const select = document.querySelector(`.comparateur-select[data-slot="${slot}"]`);
        select.value = "";
        selectionsActuelles[slot] = null;
        mettreAJourSelecteurs();
        afficherTableau();
        select.focus();
      });
    });

    mettreAJourSelecteurs();
    afficherTableau();
  } catch (erreur) {
    console.error(erreur);
    conteneur.innerHTML = "<p class='message-vide comparateur-erreur' role='alert'>Impossible de charger le catalogue de filières. Vérifie ta connexion puis réessaie.</p>";
    annonce.textContent = "Le catalogue de filières n'a pas pu être chargé.";
  }
});

function mettreAJourSelecteurs() {
  document.querySelectorAll(".comparateur-select").forEach(select => {
    const slot = Number(select.dataset.slot);
    Array.from(select.options).forEach(option => {
      option.disabled = Boolean(option.value) && selectionsActuelles.some((id, index) => {
        return index !== slot && id === option.value;
      });
    });

    const boutonRetirer = document.querySelector(`.comparateur-retirer[data-slot="${slot}"]`);
    boutonRetirer.disabled = !selectionsActuelles[slot];
  });
}

function afficherTableau() {
  const conteneur = document.getElementById("tableau-comparateur");
  const annonce = document.getElementById("comparateur-annonce");
  const filieresChoisies = selectionsActuelles
    .filter(Boolean)
    .map(id => TOUTES_FILIERES.find(filiere => filiere.id === id))
    .filter(Boolean);

  if (filieresChoisies.length < 2) {
    conteneur.innerHTML = `
      <p class="message-vide" data-motion="fade">
        Sélectionne au moins deux filières pour afficher leurs différences.
      </p>
    `;
    annonce.textContent = filieresChoisies.length === 1
      ? "Une filière sélectionnée. Choisis-en une deuxième pour comparer."
      : "Choisis deux filières pour démarrer la comparaison.";
    animerContenu(conteneur);
    return;
  }

  const lignes = [
    { label: "Durée repère", valeur: filiere => filiere.duree_etudes || "Non renseignée" },
    {
      label: "Matières principales",
      valeur: filiere => (filiere.matieres_principales || []).join(", ") || "Non renseignées"
    },
    {
      label: "Débouchés du catalogue",
      valeur: filiere => (filiere.debouches || []).join(", ") || "Non renseignés"
    },
    {
      label: "Salaire indicatif — estimation à vérifier",
      valeur: filiere => filiere.salaire_indicatif || "Non renseigné"
    },
    {
      label: "Établissements référencés dans le catalogue",
      valeur: filiere => {
        const nombre = (filiere.ecoles_liees || []).length;
        return `${nombre} établissement${nombre > 1 ? "s" : ""} référencé${nombre > 1 ? "s" : ""}`;
      }
    }
  ];

  const lignesHtml = lignes.map(ligne => {
    const valeurs = filieresChoisies.map(filiere => ligne.valeur(filiere));
    const valeursDifferentes = new Set(valeurs).size > 1;
    return `
      <tr>
        <th scope="row">${echapperHtml(ligne.label)}</th>
        ${valeurs.map(valeur => `
          <td class="${valeursDifferentes ? "comparateur-different" : ""}">
            <span>${echapperHtml(valeur)}</span>
            ${valeursDifferentes ? '<small class="comparateur-difference-note">Diffère</small>' : ""}
          </td>
        `).join("")}
      </tr>
    `;
  }).join("");

  const annonceFilieres = filieresChoisies.map(filiere => filiere.nom).join(", ");
  conteneur.innerHTML = `
    <h2 class="comparateur-tableau-titre">Repères côte à côte</h2>
    <div
      class="tableau-comparateur-scroll"
      role="region"
      aria-label="Tableau comparatif des filières"
      tabindex="0"
    >
      <table class="tableau-comparateur">
        <caption class="orientation-visuellement-cache">Comparaison de ${echapperHtml(annonceFilieres)}</caption>
        <thead>
          <tr>
            <th scope="col">Critère</th>
            ${filieresChoisies.map(filiere => `<th scope="col">${echapperHtml(filiere.nom)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${lignesHtml}
          <tr>
            <th scope="row">Explorer</th>
            ${filieresChoisies.map(filiere => `
              <td>
                <a href="filieres.html#${encodeURIComponent(String(filiere.id))}" class="lien-explorer">
                  Voir la fiche complète
                </a>
              </td>
            `).join("")}
          </tr>
        </tbody>
      </table>
    </div>
    <p class="comparateur-avertissement">
      Les frais ne sont pas renseignés dans le catalogue. Le nombre d'établissements correspond aux références associées à la filière; il ne garantit pas la disponibilité actuelle du programme. Vérifie les informations directement auprès de chaque établissement.
    </p>
  `;
  annonce.textContent = `${filieresChoisies.length} filières comparées : ${annonceFilieres}.`;
  animerContenu(conteneur);
}

function animerContenu(conteneur) {
  const cible = conteneur.querySelector("[data-motion]") || conteneur.querySelector(".tableau-comparateur-scroll");
  if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.animer(cible);
}
