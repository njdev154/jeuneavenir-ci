document.addEventListener("DOMContentLoaded", afficherHistoriqueCandidatures);

function afficherHistoriqueCandidatures() {
  if (!window.JeuneAvenirPilot?.accountsEnabled) return;

  const conteneur = document.getElementById("historique-candidatures");
  if (!conteneur) return;
  conteneur.removeAttribute("aria-busy");

  const utilisateur = lireUtilisateurCandidatures();
  if (!utilisateur) {
    afficherEtatHistorique(conteneur, "Connecte-toi pour consulter les candidatures enregistrées dans ce navigateur.", "connexion.html", "Se connecter");
    return;
  }
  if (utilisateur.typeCompte === "entreprise") {
    conteneur.innerHTML = `
      <section class="offres-etat" data-motion="rise">
        <h2>Aucune candidature reçue par la plateforme</h2>
        <p>La V1 ne transmet pas les candidatures aux entreprises. Les candidatures de démonstration restent dans le navigateur du jeune; aucun dossier candidat n’est disponible dans cet espace.</p>
        <a class="bouton-principal" href="publier-offre.html#mes-offres">Gérer mes offres locales</a>
      </section>
    `;
    actualiserAnimationsHistorique();
    return;
  }
  if (utilisateur.typeCompte !== "jeune") {
    afficherEtatHistorique(conteneur, "L’historique des candidatures est réservé aux comptes Jeune. Aucune candidature ne peut être consultée avec ce profil.", "offres.html", "Retourner au catalogue");
    return;
  }

  const candidatures = lireCandidaturesLocales();
  if (!candidatures) {
    conteneur.innerHTML = '<section class="offres-etat offres-etat-erreur" role="alert"><h2>Historique illisible</h2><p>Le navigateur n’a pas pu lire les candidatures locales. Aucune donnée n’a été modifiée.</p></section>';
    return;
  }

  const email = utilisateur.email.trim().toLocaleLowerCase("fr");
  const candidaturesUtilisateur = candidatures.filter(candidature =>
    typeof candidature.candidatEmail === "string"
    && candidature.candidatEmail.trim().toLocaleLowerCase("fr") === email
  );
  if (!candidaturesUtilisateur.length) {
    afficherEtatHistorique(conteneur, "Aucune candidature locale n’est enregistrée pour ce compte.", "offres.html", "Voir le catalogue");
    return;
  }

  conteneur.innerHTML = candidaturesUtilisateur
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .map(carteHistoriqueCandidature)
    .join("");
  actualiserAnimationsHistorique();
}

function lireUtilisateurCandidatures() {
  try {
    const utilisateur = JSON.parse(localStorage.getItem("jac_utilisateur_connecte") || "null");
    return utilisateur && typeof utilisateur.email === "string" ? utilisateur : null;
  } catch (erreur) {
    console.error("Lecture du compte local impossible :", erreur);
    return null;
  }
}

function lireCandidaturesLocales() {
  try {
    const valeur = localStorage.getItem("jac_candidatures");
    const candidatures = valeur ? JSON.parse(valeur) : [];
    if (!Array.isArray(candidatures)) throw new Error("L’historique des candidatures n’est pas une liste.");
    return candidatures;
  } catch (erreur) {
    console.error("Lecture des candidatures locales impossible :", erreur);
    return null;
  }
}

function texteHistorique(valeur) {
  if (typeof valeur === "string" || typeof valeur === "number") return String(valeur).trim();
  if (Array.isArray(valeur)) return valeur.map(texteHistorique).filter(Boolean).join(" · ");
  return "";
}

function echapperHistorique(valeur) {
  return String(valeur)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function statutHistorique(candidature) {
  if (candidature.mode !== "demonstration_locale") {
    return { classe: "indisponible", texte: "Ancien enregistrement local — statut non vérifiable" };
  }
  const statuts = {
    en_attente: { classe: "attente", texte: "En attente (démonstration locale)" },
    acceptee: { classe: "acceptee", texte: "Acceptée (démonstration locale)" },
    refusee: { classe: "refusee", texte: "Refusée (démonstration locale)" }
  };
  return statuts[candidature.statut] || { classe: "indisponible", texte: "Statut non disponible" };
}

function dateHistorique(valeur) {
  const date = new Date(valeur);
  return Number.isNaN(date.getTime()) ? "Date non renseignée" : date.toLocaleDateString("fr-CI", { dateStyle: "long" });
}

function carteHistoriqueCandidature(candidature) {
  const offreId = texteHistorique(candidature.offreId);
  const titre = texteHistorique(candidature.offreTitre) || "Offre sans titre";
  const entreprise = texteHistorique(candidature.entreprise);
  const statut = statutHistorique(candidature);
  const message = texteHistorique(candidature.motivation);
  return `
    <article class="offres-historique-carte" data-motion="rise">
      <p class="offres-surtitre">${echapperHistorique(statut.texte)}</p>
      <h3>${echapperHistorique(titre)}</h3>
      ${entreprise ? `<p>${echapperHistorique(entreprise)}</p>` : ""}
      <p>Enregistrée le ${echapperHistorique(dateHistorique(candidature.date))}. Aucune transmission à l’entreprise n’a eu lieu.</p>
      ${offreId ? `<a class="offres-lien" href="offres.html#${encodeURIComponent(offreId)}">Consulter l’offre si elle est toujours publiée</a>` : ""}
      ${message ? `<details><summary>Voir le texte préparé</summary><p>${echapperHistorique(message)}</p></details>` : ""}
    </article>
  `;
}

function afficherEtatHistorique(conteneur, message, href, libelle) {
  conteneur.innerHTML = `
    <section class="offres-etat" data-motion="rise">
      <h2>Rien à afficher pour le moment</h2>
      <p>${echapperHistorique(message)}</p>
      <a class="bouton-principal" href="${echapperHistorique(href)}">${echapperHistorique(libelle)}</a>
    </section>
  `;
  actualiserAnimationsHistorique();
}

function actualiserAnimationsHistorique() {
  if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.initialiser();
}
