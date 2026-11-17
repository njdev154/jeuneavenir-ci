// dashboard.js
// Affiche un tableau de bord différent selon le type de compte connecté
// (jeune / mentor / entreprise). V1 : données factices pour illustrer
// la mise en page, en attendant la vraie base de données (V2).

document.addEventListener("DOMContentLoaded", () => {

  const utilisateur = JSON.parse(localStorage.getItem("jac_utilisateur_connecte") || "null");

  const blocNonConnecte = document.getElementById("bloc-non-connecte");
  const blocDashboard = document.getElementById("bloc-dashboard");

  // --- Cas 1 : personne n'est connecté ---
  if (!utilisateur) {
    blocNonConnecte.style.display = "flex";
    return;
  }

  blocDashboard.style.display = "grid";

  // --- En-tête sidebar : nom, initiale, type de compte ---
  document.getElementById("avatar-initiale").textContent = utilisateur.nom.charAt(0).toUpperCase();
  document.getElementById("sidebar-nom").textContent = utilisateur.nom;

  const libellesType = { jeune: "Jeune", mentor: "Mentor", entreprise: "Entreprise" };
  const libelleType = utilisateur.typeCompte === "mentor" && utilisateur.sousTypeCompte === "professeur"
    ? "Professeur / enseignant"
    : libellesType[utilisateur.typeCompte] || "";
  document.getElementById("sidebar-type").textContent = libelleType;
  document.getElementById("dashboard-salutation").textContent = `Bonjour ${utilisateur.nom.split(" ")[0]} !`;

  // --- Contenu spécifique par type de compte ---
  const config = {
    jeune: {
      nav: [
        "Tableau de bord", "Mon profil", "Mes favoris", "Historique", "Mes candidatures", "Paramètres"
      ],
      stats: [
        { valeur: 3, libelle: "Filières favorites" },
        { valeur: 5, libelle: "Écoles favorites" },
        { valeur: 2, libelle: "Candidatures" }
      ],
      activite: [
        "Quiz d'orientation complété",
        "Filière « Informatique » ajoutée aux favoris",
        "Candidature envoyée pour « Développeur web junior »"
      ]
    },
    mentor: {
      nav: [
        "Tableau de bord", "Mon profil", "Mes favoris", "Historique", "Mes demandes", "Paramètres"
      ],
      stats: [
        { valeur: 8, libelle: "Demandes reçues" },
        { valeur: 5, libelle: "Mentorés actifs" },
        { valeur: 12, libelle: "Jeunes accompagnés" }
      ],
      activite: [
        "Nouvelle demande de mise en relation reçue",
        "Demande acceptée : mise en relation confirmée",
        "Profil mentor mis à jour"
      ]
    },
    entreprise: {
      nav: [
        "Tableau de bord", "Mon profil", "Mes offres", "Historique", "Mes candidatures", "Paramètres"
      ],
      stats: [
        { valeur: 4, libelle: "Offres publiées" },
        { valeur: 23, libelle: "Candidatures reçues" },
        { valeur: 7, libelle: "Entretiens planifiés" }
      ],
      activite: [
        "Nouvelle candidature reçue pour « Développeur web »",
        "Offre « Assistant Marketing » publiée",
        "Candidature consultée : Kouassi Abou"
      ]
    }
  };

  const donnees = config[utilisateur.typeCompte] || config.jeune;
  const candidaturesLocales = utilisateur.typeCompte === "jeune"
    ? lireTableauLocalDashboard("jac_candidatures")
    : [];
  const offresLocales = utilisateur.typeCompte === "entreprise"
    ? lireTableauLocalDashboard("jac_offres_entreprise")
    : [];

  if (utilisateur.typeCompte === "jeune") {
    const favoris = lireFavorisDashboard();
    const email = String(utilisateur.email || "").trim().toLocaleLowerCase("fr");
    const candidatures = candidaturesLocales
      ? candidaturesLocales.filter(item => String(item.candidatEmail || "").trim().toLocaleLowerCase("fr") === email)
      : [];
    donnees.stats[0] = { valeur: favoris ? favoris.filieres.length : "—", libelle: "Filières favorites" };
    donnees.stats[1] = { valeur: favoris ? favoris.ecoles.length : "—", libelle: "Écoles favorites" };
    donnees.stats[2] = {
      valeur: candidaturesLocales ? candidatures.length : "—",
      libelle: "Candidatures locales (démo)"
    };
    donnees.activite = candidaturesLocales
      ? [
          candidatures.length
            ? `${candidatures.length} candidature${candidatures.length === 1 ? "" : "s"} enregistrée${candidatures.length === 1 ? "" : "s"} localement; aucune n’a été transmise.`
            : "Aucune candidature locale enregistrée pour le moment.",
          "Les statuts et textes préparés sont consultables dans Mes candidatures."
        ]
      : ["L’historique local des candidatures n’a pas pu être lu."];
  }

  if (utilisateur.typeCompte === "entreprise") {
    const email = String(utilisateur.email || "").trim().toLocaleLowerCase("fr");
    const offresEntreprise = offresLocales
      ? offresLocales.filter(item => String(item.entrepriseEmail || "").trim().toLocaleLowerCase("fr") === email)
      : [];
    donnees.stats = [
      { valeur: offresLocales ? offresEntreprise.length : "—", libelle: "Offres locales (non publiques)" },
      { valeur: "—", libelle: "Candidatures reçues (V2)" },
      { valeur: "—", libelle: "Entretiens (V2)" }
    ];
    donnees.activite = offresLocales
      ? offresEntreprise.slice().sort((a, b) => String(b.dateMiseAJour || "").localeCompare(String(a.dateMiseAJour || ""))).slice(0, 3)
          .map(item => `${item.titre || "Offre sans titre"} — ${item.statut === "brouillon" ? "brouillon local" : item.statut === "a_verifier" ? "à vérifier, non transmis" : "statut local non reconnu"}`)
          .concat(offresEntreprise.length ? [] : ["Aucune offre locale enregistrée. Les candidatures reçues ne sont pas accessibles en V1."])
      : ["Les offres locales n’ont pas pu être lues."];
  }

  // --- Navigation latérale ---
  const nav = document.getElementById("dashboard-nav");
  nav.innerHTML = donnees.nav
    .map((item, i) => {
      const href = item === "Mes favoris" ? "favoris.html"
        : item === "Mes candidatures" ? "candidatures.html"
          : item === "Mes offres" ? "publier-offre.html#mes-offres" : "#";
      return `<a href="${href}" class="${i === 0 ? "nav-active" : ""}">${echapperHTMLDashboard(item)}</a>`;
    })
    .join("");

  // --- Cartes de statistiques ---
  const stats = document.getElementById("dashboard-stats");
  stats.innerHTML = donnees.stats
    .map(s => `<div class="carte carte-stat"><strong>${echapperHTMLDashboard(s.valeur)}</strong><span>${echapperHTMLDashboard(s.libelle)}</span></div>`)
    .join("");

  // --- Activité récente ---
  const activite = document.getElementById("dashboard-activite");
  activite.innerHTML = donnees.activite
    .map(texte => `<p class="ligne-activite">${echapperHTMLDashboard(texte)}</p>`)
    .join("");

  // --- Déconnexion ---
  document.getElementById("bouton-deconnexion").addEventListener("click", () => {
    localStorage.removeItem("jac_utilisateur_connecte");
    window.location.href = "index.html";
  });

  function lireTableauLocalDashboard(cle) {
    try {
      const valeur = localStorage.getItem(cle);
      if (!valeur) return [];
      const donnees = JSON.parse(valeur);
      if (!Array.isArray(donnees)) throw new Error(`Le stockage ${cle} n’est pas une liste.`);
      return donnees;
    } catch (erreur) {
      console.error(`Lecture du stockage local ${cle} impossible :`, erreur);
      return null;
    }
  }

  function lireFavorisDashboard() {
    try {
      const valeur = localStorage.getItem("jac_favoris");
      const favoris = valeur ? JSON.parse(valeur) : {};
      if (!favoris || typeof favoris !== "object" || Array.isArray(favoris)) {
        throw new Error("Les favoris locaux ne sont pas un objet.");
      }
      return {
        filieres: Array.isArray(favoris.filieres) ? favoris.filieres : [],
        ecoles: Array.isArray(favoris.ecoles) ? favoris.ecoles : []
      };
    } catch (erreur) {
      console.error("Lecture des favoris locaux impossible :", erreur);
      return null;
    }
  }

  function echapperHTMLDashboard(valeur) {
    return String(valeur)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

});
