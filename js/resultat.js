// resultat.js
// Affiche les filières recommandées, choisies UNIQUEMENT parmi celles
// accessibles depuis la série de l'élève (filieresAccessibles), classées
// selon les réponses données au quiz. Rien de la mécanique interne
// (scores, code, dimensions) n'est affiché à l'utilisateur.

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

  const blocPasDeResultat = document.getElementById("bloc-pas-de-resultat");
  const blocResultat = document.getElementById("bloc-resultat");
  const blocErreur = document.getElementById("bloc-erreur-resultat");
  const titrePasDeResultat = blocPasDeResultat.querySelector("h1");
  const messagePasDeResultat = blocPasDeResultat.querySelector("p");
  const messageErreur = document.getElementById("message-erreur-resultat");

  function afficherBloc(bloc) {
    bloc.style.display = "block";
    if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.animer(bloc);
  }

  function afficherAucunePiste(titre, message) {
    titrePasDeResultat.textContent = titre;
    messagePasDeResultat.textContent = message;
    afficherBloc(blocPasDeResultat);
  }

  function afficherErreur(message, erreur) {
    console.error(erreur);
    messageErreur.textContent = message;
    afficherBloc(blocErreur);
  }

  let resultat;
  try {
    resultat = JSON.parse(localStorage.getItem("jac_dernier_resultat_quiz") || "null");
  } catch (erreur) {
    afficherErreur("Le résultat enregistré est illisible. Recommence le quiz pour obtenir de nouvelles pistes.", erreur);
    return;
  }

  if (!resultat) {
    afficherBloc(blocPasDeResultat);
    return;
  }

  if (!Array.isArray(resultat.filieresAccessibles) || resultat.filieresAccessibles.length === 0) {
    afficherAucunePiste(
      "Aucune piste disponible",
      "Aucune filière n'est associée à la série enregistrée. Vérifie les informations du guide officiel du MESRS."
    );
    return;
  }

  try {
    const reponse = await fetch("data/filieres.json");
    if (!reponse.ok) throw new Error("Réponse serveur invalide");
    const donnees = await reponse.json();
    if (!Array.isArray(donnees.filieres)) throw new Error("Le catalogue de filières est invalide");
    const toutesFilieres = donnees.filieres;

    // On ne garde QUE les filières accessibles depuis la série choisie
    const filieresEligibles = toutesFilieres.filter(f => resultat.filieresAccessibles.includes(f.id));
    if (filieresEligibles.length === 0) {
      afficherAucunePiste(
        "Aucune piste trouvée",
        "Les filières disponibles ne correspondent pas aux données de ce résultat. Vérifie les informations auprès du MESRS."
      );
      return;
    }

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
    const filieresGagnantes = filieresClassees.filter(f => f.correspondance === meilleurScore);

    if (filieresGagnantes.length === 0) {
      afficherAucunePiste(
        "Aucune piste trouvée",
        "Les données disponibles ne permettent pas d'afficher une filière pour ce résultat."
      );
      return;
    }

    const etiquette = document.getElementById("resultat-etiquette");
    const titre = document.getElementById("resultat-titre");
    const description = document.getElementById("resultat-description");

    if (filieresGagnantes.length > 1) {
      etiquette.textContent = "Tes filières recommandées";
      titre.textContent = filieresGagnantes.length > 2
        ? `${filieresGagnantes.length} pistes à explorer`
        : filieresGagnantes.map(f => f.nom).join(" ou ");
      description.textContent = "Ces filières obtiennent le même meilleur résultat. Compare-les pour choisir celle qui t'attire le plus.";
    } else {
      etiquette.textContent = "Ta filière recommandée";
      titre.textContent = filieresGagnantes[0]?.nom || "";
      description.textContent = filieresGagnantes[0]?.description || "";
    }

    const conteneurListe = document.getElementById("resultat-liste-filieres");
    conteneurListe.innerHTML = filieresGagnantes.map(f => {
      const matieres = Array.isArray(f.matieres_principales) ? f.matieres_principales : [];
      const debouches = Array.isArray(f.debouches) ? f.debouches : [];
      const lienFiche = encodeURIComponent(String(f.id || ""));
      return `
        <article class="carte-mini-filiere" data-motion="rise">
          <p class="resultat-carte-etiquette">Piste d'exploration</p>
          <h2>${echapperHtml(f.nom)}</h2>
          <p>${echapperHtml(f.description || "")}</p>
          <dl class="resultat-faits">
            <div>
              <dt>Durée repère</dt>
              <dd>${echapperHtml(f.duree_etudes || "Non renseignée")}</dd>
            </div>
            <div>
              <dt>Matières principales</dt>
              <dd>${matieres.length ? matieres.map(echapperHtml).join(", ") : "Non renseignées"}</dd>
            </div>
            <div>
              <dt>Débouchés du catalogue</dt>
              <dd>${debouches.length ? debouches.map(echapperHtml).join(", ") : "Non renseignés"}</dd>
            </div>
          </dl>
          <a href="filieres.html#${lienFiche}" class="lien-explorer">Voir la fiche complète →</a>
        </article>
      `;
    }).join("");

    afficherBloc(blocResultat);
    conteneurListe.querySelectorAll("[data-motion]").forEach(carte => {
      if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.animer(carte);
    });

  } catch (erreur) {
    afficherErreur(
      "Le catalogue de filières n'a pas pu être chargé. Réessaie plus tard ou retourne au quiz.",
      erreur
    );
  }
});
