document.addEventListener("DOMContentLoaded", async () => {
  const champ = document.getElementById("recherche-globale");
  const formulaire = document.getElementById("recherche-transversale");
  const statut = document.getElementById("statut-recherche-globale");
  const resultat = document.getElementById("resultats-recherche-globale");
  const query = new URLSearchParams(window.location.search).get("q") || "";
  champ.value = query;

  formulaire.addEventListener("submit", evenement => {
    evenement.preventDefault();
    const valeur = champ.value.trim();
    if (!valeur) {
      resultat.innerHTML = "";
      statut.textContent = "Saisis un terme pour lancer la recherche.";
      champ.focus();
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("q", valeur);
    window.history.replaceState(null, "", url);
    actualiserResultats();
  });
  champ.addEventListener("input", actualiserResultats);

  let catalogues;
  try {
    const reponses = await Promise.all([
      fetch("data/filieres.json"),
      fetch("data/ecoles.json"),
      fetch("data/metiers.json")
    ]);
    if (reponses.some(reponse => !reponse.ok)) throw new Error("Un catalogue n'a pas pu être chargé");
    const [filieres, ecoles, metiers] = await Promise.all(reponses.map(reponse => reponse.json()));
    if (!Array.isArray(filieres.filieres) || !Array.isArray(ecoles.ecoles) || !Array.isArray(metiers.metiers)) {
      throw new Error("Le format d'un catalogue est invalide");
    }
    catalogues = { filieres: filieres.filieres, ecoles: ecoles.ecoles, metiers: metiers.metiers };
    statut.textContent = query ? "Recherche dans les catalogues disponibles." : "Saisis un terme pour chercher dans les trois catalogues.";
    actualiserResultats();
  } catch (erreur) {
    console.error(erreur);
    statut.textContent = "La recherche n’a pas pu charger les catalogues. Réessaie ou ouvre directement un catalogue.";
    window.JeuneAvenirDiscovery.afficherEtat(
      resultat,
      "Catalogues indisponibles",
      "Les données locales n’ont pas pu être chargées. Consulte directement les catalogues pour continuer.",
      "alert"
    );
  }

  function actualiserResultats() {
    if (!catalogues) return;
    const terme = window.JeuneAvenirDiscovery.normaliserRecherche(champ.value);
    if (!terme) {
      resultat.innerHTML = "";
      statut.textContent = "Saisis un terme pour chercher dans les trois catalogues.";
      return;
    }

    const mots = terme.split(/\s+/).filter(Boolean);
    const filieresIndexees = catalogues.filieres.map(filiere => ({
      item: filiere,
      texte: [
        filiere.nom,
        filiere.description,
        filiere.duree_etudes,
        filiere.salaire_indicatif,
        ...(filiere.matieres_principales || []),
        ...(filiere.debouches || []),
        ...(filiere.metiers_lies || []).map(id => catalogues.metiers.find(metier => metier.id === id)?.nom || "")
      ].join(" ")
    }));
    const ecolesIndexees = catalogues.ecoles.map(ecole => ({
      item: ecole,
      texte: [
        ecole.nom,
        ecole.sigle,
        ecole.ville,
        ecole.commune,
        ecole.statut,
        ecole.type,
        ...(ecole.niveaux || []),
        ...(ecole.domaines || []).map(id => catalogues.filieres.find(filiere => filiere.id === id)?.nom || ""),
        ...(ecole.sources || []).flatMap(source => [source.libelle, source.portee])
      ].join(" ")
    }));
    const metiersIndexees = catalogues.metiers.map(metier => ({
      item: metier,
      texte: [
        metier.nom,
        metier.description,
        ...(metier.missions || []),
        ...(metier.competences || []),
        ...catalogues.filieres.filter(filiere => (filiere.metiers_lies || []).includes(metier.id)).map(filiere => filiere.nom)
      ].join(" ")
    }));

    const sections = [
      { type: "filières", id: "filieres", entries: filtrer(filieresIndexees, mots), href: item => window.JeuneAvenirDiscovery.lienFiche("filieres.html", item.id) },
      { type: "établissements", id: "ecoles", entries: filtrer(ecolesIndexees, mots), href: item => window.JeuneAvenirDiscovery.lienFiche("ecoles.html", item.id) },
      { type: "métiers", id: "metiers", entries: filtrer(metiersIndexees, mots), href: item => window.JeuneAvenirDiscovery.lienFiche("metiers.html", item.id) }
    ];
    const total = sections.reduce((compte, section) => compte + section.entries.length, 0);

    if (!total) {
      statut.textContent = `Aucun résultat pour « ${champ.value.trim()} ».`;
      window.JeuneAvenirDiscovery.afficherEtat(
        resultat,
        "Aucun résultat",
        "Essaie un autre mot, une ville ou un intitulé différent."
      );
      return;
    }

    statut.textContent = `${total} résultat${total > 1 ? "s" : ""} pour « ${champ.value.trim()} ».`;
    resultat.innerHTML = sections.filter(section => section.entries.length).map(section => `
      <section class="discovery-search-section" data-motion="rise" aria-labelledby="titre-resultats-${section.id}">
        <h2 id="titre-resultats-${section.id}">${window.JeuneAvenirDiscovery.echapperHtml(section.type)} <span>${section.entries.length}</span></h2>
        <div class="discovery-search-grid">
          ${section.entries.map(({ item }) => {
            const description = item.description || [
              item.ville,
              item.statut ? `Type indiqué : ${item.statut === "public" ? "public" : "privé"}` : "",
              ...(item.domaines || []).map(id => catalogues.filieres.find(filiere => filiere.id === id)?.nom || "")
            ].filter(Boolean).join(" · ");
            return `
              <article class="discovery-search-card" data-motion="fade">
                <h3>${window.JeuneAvenirDiscovery.echapperHtml(item.nom)}</h3>
                <p>${window.JeuneAvenirDiscovery.echapperHtml(description)}</p>
                <a href="${window.JeuneAvenirDiscovery.echapperHtml(section.href(item))}">Consulter la fiche →</a>
              </article>
            `;
          }).join("")}
        </div>
      </section>
    `).join("");
    window.JeuneAvenirDiscovery.animerElements(resultat);
  }

  function filtrer(index, mots) {
    return index
      .filter(entree => {
        const texte = window.JeuneAvenirDiscovery.normaliserRecherche(entree.texte);
        return mots.every(mot => texte.includes(mot));
      })
      .map(entree => entree);
  }
});
