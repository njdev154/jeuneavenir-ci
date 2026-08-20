// resultat.js
// Affiche 1 à 2 filières recommandées, choisies UNIQUEMENT parmi celles
// accessibles depuis la série de l'élève (filieresAccessibles), classées
// selon les réponses données au quiz. Rien de la mécanique interne
// (scores, code, dimensions) n'est affiché à l'utilisateur.

document.addEventListener("DOMContentLoaded", async () => {

  const blocPasDeResultat = document.getElementById("bloc-pas-de-resultat");
  const blocResultat = document.getElementById("bloc-resultat");

  const resultat = JSON.parse(localStorage.getItem("jac_dernier_resultat_quiz") || "null");

  if (!resultat || !resultat.filieresAccessibles || resultat.filieresAccessibles.length === 0) {
    blocPasDeResultat.style.display = "block";
    return;
  }

  try {
    const reponse = await fetch("data/filieres.json");
    const donnees = await reponse.json();
    const toutesFilieres = donnees.filieres;

    // On ne garde QUE les filières accessibles depuis la série choisie
    const filieresEligibles = toutesFilieres.filter(f => resultat.filieresAccessibles.includes(f.id));

    // Classement interne par correspondance avec le profil (via code_holland),
    // jamais affiché tel quel -- juste utilisé pour trier
    const lettresProfil = (resultat.codeInterne || "").split("");
    const filieresClassees = filieresEligibles
      .map(f => {
        const lettresFiliere = (f.code_holland || "").split("");
        const correspondance = lettresProfil.filter(l => lettresFiliere.includes(l)).length;
        return { ...f, correspondance };
      })
      .sort((a, b) => b.correspondance - a.correspondance);

    const meilleurScore = filieresClassees[0]?.correspondance ?? 0;
    const filieresGagnantes = filieresClassees.filter(f => f.correspondance === meilleurScore).slice(0, 2);

    blocResultat.style.display = "block";

    const etiquette = document.getElementById("resultat-etiquette");
    const titre = document.getElementById("resultat-titre");
    const description = document.getElementById("resultat-description");

    if (filieresGagnantes.length > 1) {
      etiquette.textContent = "Tes filières recommandées";
      titre.textContent = filieresGagnantes.map(f => f.nom).join(" ou ");
      description.textContent = "Ces deux filières te correspondent bien, à toi de creuser celle qui t'attire le plus.";
    } else {
      etiquette.textContent = "Ta filière recommandée";
      titre.textContent = filieresGagnantes[0]?.nom || "";
      description.textContent = filieresGagnantes[0]?.description || "";
    }

    const conteneurListe = document.getElementById("resultat-liste-filieres");
    conteneurListe.innerHTML = filieresGagnantes.map(f => `
      <div class="carte-mini-filiere">
        <h3>${f.nom}</h3>
        <p>${f.description || ""}</p>
        <a href="filieres.html#${f.id}" class="lien-explorer">Voir la fiche complète →</a>
      </div>
    `).join("");

  } catch (erreur) {
    console.error(erreur);
    blocPasDeResultat.style.display = "block";
  }
});
