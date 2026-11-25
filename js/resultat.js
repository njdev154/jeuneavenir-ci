function echapperHtml(valeur) {
  return String(valeur == null ? "" : valeur).replace(/[&<>"']/g, caractere => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[caractere]);
}

document.addEventListener("DOMContentLoaded", async () => {
  const sansResultat = document.getElementById("bloc-pas-de-resultat");
  const resultatView = document.getElementById("bloc-resultat");
  const erreurView = document.getElementById("bloc-erreur-resultat");
  const erreurMessage = document.getElementById("message-erreur-resultat");

  function afficher(bloc) {
    bloc.hidden = false;
    if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.animer(bloc);
  }

  function afficherErreur(message, erreur) {
    console.error("Chargement du résultat d’orientation impossible :", erreur);
    erreurMessage.textContent = message;
    afficher(erreurView);
  }

  function afficherResultatApi(enveloppe) {
    const resultatApi = enveloppe.data;
    const principales = resultatApi.main_tracks;
    const traductionChamps = {
      institutions: "établissements associés",
      sources: "sources de vérification",
      verification: "statut de vérification",
      description: "description",
      duration: "durée",
      main_subjects: "matières principales",
      outcomes: "débouchés"
    };

    function ficheApi(piste, etiquette) {
      const matieres = piste.main_subjects.length
        ? piste.main_subjects.map(echapperHtml).join(", ")
        : "Non renseignées";
      const debouches = piste.outcomes.length
        ? piste.outcomes.map(echapperHtml).join(", ")
        : "Non renseignés";
      const champsManquants = piste.missing_data
        .map(champ => traductionChamps[champ] || champ)
        .map(echapperHtml);
      const ancre = encodeURIComponent(piste.id);
      return `
        <article class="carte-mini-filiere">
          <p class="resultat-carte-etiquette">${echapperHtml(etiquette)}</p>
          <h3>${echapperHtml(piste.name)}</h3>
          <p>${echapperHtml(piste.description || "Description non renseignée dans le catalogue.")}</p>
          <dl class="resultat-faits">
            <div><dt>Durée indicative</dt><dd>${echapperHtml(piste.duration || "Non renseignée")}</dd></div>
            <div><dt>Matières principales</dt><dd>${matieres}</dd></div>
            <div><dt>Débouchés du catalogue</dt><dd>${debouches}</dd></div>
          </dl>
          <p class="resultat-note">Vérification : ${echapperHtml(piste.verification === "confirmee"
            ? "confirmée"
            : "non renseignée par cette API")}</p>
          ${champsManquants.length
            ? `<p>À vérifier : ${champsManquants.join(", ")}.</p>`
            : ""}
          <p>Cette réponse API ne fournit pas de rattachement d’établissement ni de source vérifiable.</p>
          <div class="resultat-filiere-actions">
            <a href="filieres.html#${ancre}" class="lien-explorer">Consulter la fiche</a>
            <a href="comparateur.html?filieres=${encodeURIComponent(piste.id)}" class="lien-explorer">Comparer</a>
          </div>
        </article>
      `;
    }

    document.getElementById("resultat-etiquette").textContent = "Pistes du calcul exploratoire local";
    document.getElementById("resultat-titre").textContent = principales.length === 1
      ? principales[0].name
      : `${principales.length} pistes ex æquo`;
    document.getElementById("resultat-description").textContent = principales.length === 1
      ? principales[0].description || "Description non renseignée dans le catalogue."
      : "Ces pistes sont à égalité selon le calcul exploratoire actuel. Aucune n’est présentée comme supérieure aux autres.";
    document.getElementById("resultat-synthese").innerHTML = `
      <h2>Ta série</h2>
      <p>${echapperHtml(resultatApi.series.name)}</p>
      <p class="resultat-note">${echapperHtml(resultatApi.notice)}</p>
    `;
    document.getElementById("resultat-liste-filieres").innerHTML = principales
      .map(piste => ficheApi(piste, "Piste principale")).join("");

    const alternatives = document.getElementById("resultat-alternatives");
    if (resultatApi.alternatives.length) {
      alternatives.innerHTML = `
        <h2>Autres filières associées à ta série</h2>
        <p>Cette liste n’est pas classée par pertinence. Explore chaque fiche et vérifie les informations auprès des établissements.</p>
        <ul>${resultatApi.alternatives.map(piste =>
          `<li><a href="filieres.html#${encodeURIComponent(piste.id)}">${echapperHtml(piste.name)}</a></li>`
        ).join("")}</ul>
      `;
    }

    document.getElementById("resultat-reponses").innerHTML = `
      <h2>Tes réponses au questionnaire</h2>
      <ol>${resultatApi.answers.map(item =>
        `<li><strong>${echapperHtml(item.question)}</strong><span>${echapperHtml(item.answer)}</span></li>`
      ).join("")}</ol>
    `;
    const dateResultat = new Date(enveloppe.created_at);
    document.getElementById("resultat-date").textContent = `${
      Number.isNaN(dateResultat.getTime())
        ? "Date du parcours non renseignée."
        : `Calcul effectué le ${dateResultat.toLocaleDateString("fr-FR")}.`
    } Résultat temporaire dans cet onglet; le serveur ne conserve pas les réponses.`;
    document.querySelectorAll(".bouton-comparer-filiere").forEach(bouton => {
      bouton.addEventListener("click", () => {
        const ids = new URLSearchParams(window.location.search).get("filieres") || "";
        const selection = ids.split(",").filter(Boolean);
        if (!selection.includes(bouton.dataset.filiereId)) selection.push(bouton.dataset.filiereId);
        if (selection.length > 3) selection.shift();
        window.location.href = `comparateur.html?filieres=${encodeURIComponent(selection.join(","))}`;
      });
    });
    afficher(resultatView);
  }

  if (new URLSearchParams(window.location.search).get("source") === "api") {
    try {
      const enveloppe = window.JeuneAvenirOrientationApi.lireResultatSession();
      if (!enveloppe) {
        afficher(sansResultat);
        return;
      }
      afficherResultatApi(enveloppe);
    } catch (erreur) {
      afficherErreur("Le résultat du serveur local est absent ou illisible. Recommence le questionnaire pour obtenir de nouvelles pistes.", erreur);
    }
    return;
  }

  let resultat;
  let resultatDepuisProgression = false;
  try {
    resultat = JSON.parse(localStorage.getItem("jac_dernier_resultat_quiz") || "null");
    if (!resultat) {
      const progression = JSON.parse(localStorage.getItem("jac_orientation_parcours_v1") || "null");
      if (progression && progression.schemaVersion === 1 && progression.status === "termine"
        && progression.phase === "terminee" && progression.result && typeof progression.result === "object") {
        resultat = progression.result;
        resultatDepuisProgression = true;
      }
    }
  } catch (erreur) {
    afficherErreur("Le résultat ou sa progression enregistrée est illisible. Recommence le parcours pour obtenir de nouvelles pistes.", erreur);
    return;
  }
  if (!resultat || !window.JeuneAvenirOrientation) {
    afficher(sansResultat);
    return;
  }

  try {
    const [reponseFilieres, reponseSeries, reponseEcoles] = await Promise.all([
      fetch("data/filieres.json"),
      fetch("data/series_filieres.json"),
      fetch("data/ecoles.json")
    ]);
    if (![reponseFilieres, reponseSeries, reponseEcoles].every(reponse => reponse.ok)) {
      throw new Error("Un ou plusieurs référentiels locaux ne sont pas accessibles.");
    }
    const [catalogue, correspondances, catalogueEcoles] = await Promise.all([
      reponseFilieres.json(),
      reponseSeries.json(),
      reponseEcoles.json()
    ]);
    if (!Array.isArray(catalogue.filieres) || !Array.isArray(correspondances.series)
      || !Array.isArray(catalogueEcoles.ecoles)) {
      throw new Error("Le format d’un référentiel local est invalide.");
    }

    const classement = window.JeuneAvenirOrientation.classerFilieres(
      resultat,
      correspondances.series,
      catalogue.filieres
    );
    const serie = correspondances.series.find(item => item.id === resultat.serieChoisie);
    if (!classement.principales.length) {
      throw new Error("Aucune filière correspondante n’est disponible pour cette série.");
    }

    document.getElementById("resultat-etiquette").textContent = "Pistes principales à explorer";
    document.getElementById("resultat-titre").textContent = classement.principales.length === 1
      ? classement.principales[0].nom
      : `${classement.principales.length} pistes ex æquo`;
    document.getElementById("resultat-description").textContent = classement.principales.length === 1
      ? classement.principales[0].description || "Description non renseignée dans le catalogue."
      : "Ces pistes sont à égalité selon le calcul exploratoire actuel. Aucune n’est présentée comme supérieure aux autres.";

    const profil = resultat.profil || {};
    const situations = {
      lyceen: "Lycéen ou bachelier récent",
      etudiant: "Étudiant en formation",
      "jeune-diplome": "Jeune diplômé",
      autre: "Autre situation"
    };
    const objectifs = {
      "premiere-orientation": "Première orientation",
      reorientation: "Réorientation",
      explorer: "Explorer des domaines d’études",
      autre: "Autre besoin"
    };
    document.getElementById("resultat-synthese").innerHTML = `
      <h2>Ta situation renseignée</h2>
      <dl class="resultat-faits">
        <div><dt>Série du bac</dt><dd>${echapperHtml(serie.nom)}</dd></div>
        <div><dt>Niveau ou formation</dt><dd>${echapperHtml(profil.niveau || "Non précisé")}</dd></div>
        <div><dt>Situation</dt><dd>${echapperHtml(situations[profil.situation] || "Non précisée")}</dd></div>
        <div><dt>Besoin indiqué</dt><dd>${echapperHtml(objectifs[profil.objectif] || "Non précisé")}</dd></div>
      </dl>
      <p class="resultat-note">${serie.verification === "a_confirmer"
        ? "Les correspondances de cette série sont à confirmer auprès des sources officielles."
        : "Les correspondances de série sont des repères de catalogue, pas une décision officielle d’affectation."}</p>
    `;

    const ecolesParId = new Map(catalogueEcoles.ecoles.map(ecole => [ecole.id, ecole]));
    function ficheHtml(filiere, etiquette) {
      const matieres = Array.isArray(filiere.matieres_principales) ? filiere.matieres_principales : [];
      const debouches = Array.isArray(filiere.debouches) ? filiere.debouches : [];
      const ecoles = (Array.isArray(filiere.ecoles_liees) ? filiere.ecoles_liees : [])
        .map(id => ecolesParId.get(id))
        .filter(Boolean);
      const verification = ecoles.length
        ? ecoles.map(ecole => {
          const sources = Array.isArray(ecole.sources) ? ecole.sources : [];
          const documente = Boolean(ecole.verification && ecole.verification.domaine_confirme);
          const liens = sources.filter(source => {
            try { return new URL(source.url).protocol === "https:"; } catch (_) { return false; }
          }).map(source =>
            `<a href="${echapperHtml(source.url)}" target="_blank" rel="noopener noreferrer">${echapperHtml(source.libelle || "Source")}</a>`
          );
          return `<li><strong>${echapperHtml(ecole.nom)}</strong> — ${documente ? "domaine documenté" : "rattachement à confirmer"}${liens.length ? ` · ${liens.join(" · ")}` : " · source non renseignée"}</li>`;
        }).join("")
        : "<li>Aucun établissement associé n’est renseigné.</li>";
      return `
        <article class="carte-mini-filiere">
          <p class="resultat-carte-etiquette">${echapperHtml(etiquette)}</p>
          <h3>${echapperHtml(filiere.nom)}</h3>
          <p>${echapperHtml(filiere.description || "Description non renseignée dans le catalogue.")}</p>
          <dl class="resultat-faits">
            <div><dt>Durée indicative</dt><dd>${echapperHtml(filiere.duree_etudes || "Non renseignée")}</dd></div>
            <div><dt>Matières principales</dt><dd>${matieres.length ? matieres.map(echapperHtml).join(", ") : "Non renseignées"}</dd></div>
            <div><dt>Débouchés du catalogue</dt><dd>${debouches.length ? debouches.map(echapperHtml).join(", ") : "Non renseignés"}</dd></div>
          </dl>
          <h4>Établissements associés</h4>
          <ul class="resultat-ecoles">${verification}</ul>
          <div class="resultat-filiere-actions">
            <a href="filieres.html#${encodeURIComponent(String(filiere.id))}" class="lien-explorer">Consulter la fiche</a>
            <button type="button" class="bouton-comparer-filiere" data-filiere-id="${echapperHtml(filiere.id)}">Ajouter à la comparaison</button>
            ${window.boutonFavoriHTML ? window.boutonFavoriHTML("filieres", filiere.id) : ""}
          </div>
        </article>
      `;
    }

    document.getElementById("resultat-liste-filieres").innerHTML = classement.principales
      .map(filiere => ficheHtml(filiere, "Piste principale")).join("");
    const alternatives = document.getElementById("resultat-alternatives");
    if (classement.alternatives.length) {
      alternatives.innerHTML = `
        <h2>Autres filières associées à ta série</h2>
        <p>Cette liste n’est pas classée par pertinence. Explore chaque fiche et vérifie les informations auprès des établissements.</p>
        <ul>${classement.alternatives.map(filiere =>
          `<li><a href="filieres.html#${encodeURIComponent(String(filiere.id))}">${echapperHtml(filiere.nom)}</a></li>`
        ).join("")}</ul>
      `;
    }

    const reponses = document.getElementById("resultat-reponses");
    if (Array.isArray(resultat.reponses) && resultat.reponses.length) {
      reponses.innerHTML = `<h2>Tes réponses au questionnaire</h2><ol>${resultat.reponses.map(item =>
        `<li><strong>${echapperHtml(item.question)}</strong><span>${echapperHtml(item.reponse)}</span></li>`
      ).join("")}</ol>`;
    } else {
      reponses.innerHTML = "<h2>Tes réponses au questionnaire</h2><p>Les réponses ne sont pas disponibles dans ce résultat.</p>";
    }
    if (typeof resultat.texteLibre === "string" && resultat.texteLibre.trim()) {
      const libre = document.createElement("p");
      libre.className = "resultat-texte-libre";
      libre.textContent = `Ton commentaire facultatif : ${resultat.texteLibre}`;
      reponses.appendChild(libre);
    }

    document.querySelectorAll(".bouton-comparer-filiere").forEach(bouton => {
      bouton.addEventListener("click", () => {
        const ids = new URLSearchParams(window.location.search).get("filieres") || "";
        const selection = ids.split(",").filter(Boolean);
        if (!selection.includes(bouton.dataset.filiereId)) selection.push(bouton.dataset.filiereId);
        if (selection.length > 3) selection.shift();
        window.location.href = `comparateur.html?filieres=${encodeURIComponent(selection.join(","))}`;
      });
    });
    if (window.activerBoutonFavori) window.activerBoutonFavori(resultatView);
    const dateResultat = new Date(resultat.date);
    document.getElementById("resultat-date").textContent = `${Number.isNaN(dateResultat.getTime())
      ? "Date du parcours non renseignée."
      : `Parcours réalisé le ${dateResultat.toLocaleDateString("fr-FR")}.`} ${
        resultatDepuisProgression
          ? "Résultat récupéré depuis la progression locale; le résultat partagé avec les autres espaces n’a pas été actualisé."
          : "Sauvegardé uniquement dans ce navigateur."
      }`;
    afficher(resultatView);
  } catch (erreur) {
    afficherErreur("Les pistes n’ont pas pu être reconstituées à partir des référentiels locaux. Recommence le parcours ou réessaie plus tard.", erreur);
  }
});
