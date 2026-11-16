(() => {
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

  function normaliserRecherche(valeur) {
    return String(valeur == null ? "" : valeur)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("fr")
      .trim();
  }

  function lienSecurise(valeur) {
    if (!valeur) return "";
    const lien = String(valeur);
    try {
      const url = new URL(lien, window.location.href);
      if (url.protocol === "http:" || url.protocol === "https:") return url.href;
      if (url.origin === window.location.origin && url.protocol === window.location.protocol) {
        return lien;
      }
    } catch (erreur) {
      return "";
    }
    return "";
  }

  function animerElements(conteneur) {
    const elements = conteneur.querySelectorAll("[data-motion]");
    elements.forEach((element, index) => {
      element.style.setProperty("--motion-index", String(Math.min(index, 6)));
      if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.animer(element);
    });
  }

  function afficherEtat(conteneur, titre, description, role = "status") {
    conteneur.innerHTML = `
      <div class="discovery-empty" role="${echapperHtml(role)}">
        <p class="discovery-empty-kicker">CATALOGUE</p>
        <h2>${echapperHtml(titre)}</h2>
        <p>${echapperHtml(description)}</p>
      </div>
    `;
    animerElements(conteneur);
  }

  function itemMarkup(item) {
    const donnee = typeof item === "string" ? { label: item } : item;
    const href = lienSecurise(donnee.href);
    const contenu = href
      ? `<a href="${echapperHtml(href)}"${donnee.externe ? ' target="_blank" rel="noopener noreferrer"' : ""}>${echapperHtml(donnee.label)}</a>`
      : `<span>${echapperHtml(donnee.label)}</span>`;
    const description = donnee.description
      ? `<p>${echapperHtml(donnee.description)}</p>`
      : "";
    const metadata = donnee.metadata
      ? `<small>${echapperHtml(donnee.metadata)}</small>`
      : "";
    const badge = donnee.badge
      ? `<span class="discovery-badge">${echapperHtml(donnee.badge)}</span>`
      : "";
    return `<li>${contenu}${badge}${description}${metadata}</li>`;
  }

  function rendreFiche(conteneur, options) {
    const facts = (options.facts || []).filter(fait => fait && fait.value);
    const sections = (options.sections || []).map(section => {
      const items = (section.items || []).filter(Boolean);
      return `
        <section class="discovery-detail-section" data-motion="rise">
          <h2>${echapperHtml(section.title)}</h2>
          ${section.description ? `<p>${echapperHtml(section.description)}</p>` : ""}
          ${items.length
            ? `<ul class="discovery-detail-list">${items.map(itemMarkup).join("")}</ul>`
            : `<p class="discovery-missing">${echapperHtml(section.empty || "Information non renseignée dans le catalogue.")}</p>`}
        </section>
      `;
    }).join("");
    const actions = (options.actions || []).map(action => {
      const href = lienSecurise(action.href);
      return href
        ? `<a class="discovery-action" href="${echapperHtml(href)}"${action.externe ? ' target="_blank" rel="noopener noreferrer"' : ""}>${echapperHtml(action.label)}</a>`
        : "";
    }).join("");

    conteneur.innerHTML = `
      <article class="discovery-detail">
        <a class="discovery-back" href="${echapperHtml(options.backHref)}">← ${echapperHtml(options.backLabel || "Retour au catalogue")}</a>
        <div class="discovery-detail-layout">
          <div class="discovery-detail-main">
            <p class="discovery-kicker">FICHE ${echapperHtml(options.kind)}</p>
            <h1>${echapperHtml(options.title)}</h1>
            <div class="discovery-tags">
              ${(options.tags || []).filter(Boolean).map(tag => `<span>${echapperHtml(tag)}</span>`).join("")}
            </div>
            ${options.description ? `<p class="discovery-detail-description">${echapperHtml(options.description)}</p>` : ""}
            ${facts.length
              ? `<dl class="discovery-facts">${facts.map(fait => `
                  <div>
                    <dt>${echapperHtml(fait.label)}</dt>
                    <dd>${echapperHtml(fait.value)}</dd>
                  </div>
                `).join("")}</dl>`
              : ""}
            ${options.favorite ? '<div class="discovery-favorite-slot"></div>' : ""}
            ${sections}
            ${options.note ? `<p class="discovery-note">${echapperHtml(options.note)}</p>` : ""}
          </div>
          <aside class="discovery-detail-aside">
            <p class="discovery-kicker">${echapperHtml(options.asideKicker || "À RETENIR")}</p>
            <h2>${echapperHtml(options.asideTitle || "Vérifie les informations")}</h2>
            <p>${echapperHtml(options.asideText || "Les informations du catalogue sont des repères; confirme les détails auprès des organismes concernés.")}</p>
            <div class="discovery-actions">${actions}</div>
          </aside>
        </div>
      </article>
    `;

    if (options.favorite && typeof window.boutonFavoriHTML === "function") {
      const emplacement = conteneur.querySelector(".discovery-favorite-slot");
      emplacement.innerHTML = window.boutonFavoriHTML(options.favorite.category, options.favorite.id);
      if (typeof window.activerBoutonFavori === "function") window.activerBoutonFavori(conteneur);
    }

    animerElements(conteneur);
  }

  function lierFicheHash(options) {
    function afficherFicheDepuisHash() {
      let id = "";
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch (erreur) {
        id = "";
      }

      if (!id) {
        options.fiche.hidden = true;
        options.liste.hidden = false;
        if (typeof options.fermer === "function") options.fermer();
        return;
      }

      const element = options.donnees.find(item => item.id === id);
      if (!element) {
        options.fiche.hidden = true;
        options.liste.hidden = false;
        afficherEtat(options.etat, "Fiche introuvable", "Cette référence n'existe pas dans le catalogue chargé.", "alert");
        return;
      }

      options.etat.textContent = "";
      options.etat.classList.remove("discovery-status-error");
      options.liste.hidden = true;
      options.fiche.hidden = false;
      options.rendre(element);

      window.requestAnimationFrame(() => {
        options.fiche.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start"
        });
      });
    }

    window.addEventListener("hashchange", afficherFicheDepuisHash);
    afficherFicheDepuisHash();
  }

  function lienFiche(page, id) {
    return `${page}#${encodeURIComponent(String(id))}`;
  }

  window.JeuneAvenirDiscovery = {
    echapperHtml,
    normaliserRecherche,
    lienSecurise,
    animerElements,
    afficherEtat,
    rendreFiche,
    lierFicheHash,
    lienFiche
  };
})();
