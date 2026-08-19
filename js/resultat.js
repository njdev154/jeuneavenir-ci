// resultat.js
// Lit le résultat RIASEC (localStorage), compare le code Holland de
// l'utilisateur au code_holland de chaque filière (data/filieres.json),
// classe les filières par nombre de lettres communes, gère les ex-æquo,
// explique le résultat à partir des réponses données.

const NOMS_DIMENSIONS = {
  R: "Réaliste (technique, terrain)",
  I: "Investigateur (analyse, logique)",
  A: "Artistique (créativité)",
  S: "Social (aide, relationnel)",
  E: "Entreprenant (leadership, business)",
  C: "Conventionnel (organisation, rigueur)"
};

document.addEventListener("DOMContentLoaded", async () => {

  const blocPasDeResultat = document.getElementById("bloc-pas-de-resultat");
  const blocResultat = document.getElementById("bloc-resultat");

  const resultat = JSON.parse(localStorage.getItem("jac_dernier_resultat_quiz") || "null");

  if (!resultat || !resultat.codeHolland) {
    blocPasDeResultat.style.display = "block";
    return;
  }

  try {
    const reponse = await fetch("data/filieres.json");
    const donnees = await reponse.json();
    const toutesFilieres = donnees.filieres;

    const lettresUtilisateur = resultat.codeHolland.split(""); // ex: ["I", "R", "C"]

    // Score de correspondance = nombre de lettres du code utilisateur
    // présentes dans le code Holland de la filière (peu importe l'ordre)
    const filieresAvecScore = toutesFilieres.map(f => {
      const lettresFiliere = (f.code_holland || "").split("");
      const correspondance = lettresUtilisateur.filter(l => lettresFiliere.includes(l)).length;
      return { ...f, correspondance };
    });

    const meilleurScore = Math.max(...filieresAvecScore.map(f => f.correspondance));
    const filieresGagnantes = filieresAvecScore
      .filter(f => f.correspondance === meilleurScore)
      .sort((a, b) => a.nom.localeCompare(b.nom));

    blocResultat.style.display = "block";

    // --- Code Holland affiché ---
    document.getElementById("resultat-code-holland").textContent = resultat.codeHolland;

    // --- Détail des scores par dimension (barres) ---
    const scoresTries = Object.entries(resultat.scoresRiasec).sort((a, b) => b[1] - a[1]);
    const scoreMaxPossible = Math.max(...scoresTries.map(([, v]) => v)) || 1;
    document.getElementById("resultat-dimensions").innerHTML = scoresTries.map(([lettre, valeur]) => `
      <div class="dimension-ligne">
        <span class="dimension-label">${lettre} — ${NOMS_DIMENSIONS[lettre]}</span>
        <div class="dimension-barre-fond">
          <div class="dimension-barre-remplie" style="width:${(valeur / scoreMaxPossible) * 100}%"></div>
        </div>
        <span class="dimension-valeur">${valeur}</span>
      </div>
    `).join("");

    // --- Titre et étiquette ---
    const etiquette = document.getElementById("resultat-etiquette");
    const titre = document.getElementById("resultat-titre");
    if (filieresGagnantes.length > 1) {
      etiquette.textContent = "Tes filières recommandées (ex-æquo)";
      titre.textContent = filieresGagnantes.map(f => f.nom).join(" & ");
    } else {
      etiquette.textContent = "Ta filière recommandée";
      titre.textContent = filieresGagnantes[0]?.nom || "Résultat indisponible";
    }

    // --- Cartes filières avec explication du score ---
    const conteneurListe = document.getElementById("resultat-liste-filieres");
    conteneurListe.innerHTML = filieresGagnantes.map(f => `
      <div class="carte-mini-filiere">
        <div class="carte-mini-filiere-entete">
          <h3>${f.nom}</h3>
          <span class="badge-code-holland">${f.code_holland}</span>
        </div>
        <p>${f.description || "Description à venir."}</p>
        <p class="explication-score">Correspondance : ${f.correspondance}/3 lettres de ton profil (${resultat.codeHolland}) retrouvées dans le profil type de cette filière (${f.code_holland}).</p>
        <a href="filieres.html#${f.id}" class="lien-explorer">Voir la fiche complète →</a>
      </div>
    `).join("");

  } catch (erreur) {
    console.error(erreur);
    blocPasDeResultat.style.display = "block";
  }
});
