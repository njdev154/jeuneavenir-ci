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

  // --- Navigation latérale ---
  const nav = document.getElementById("dashboard-nav");
  nav.innerHTML = donnees.nav
    .map((item, i) => `<a href="#" class="${i === 0 ? 'nav-active' : ''}">${item}</a>`)
    .join("");

  // --- Cartes de statistiques ---
  const stats = document.getElementById("dashboard-stats");
  stats.innerHTML = donnees.stats
    .map(s => `<div class="carte carte-stat"><strong>${s.valeur}</strong><span>${s.libelle}</span></div>`)
    .join("");

  // --- Activité récente ---
  const activite = document.getElementById("dashboard-activite");
  activite.innerHTML = donnees.activite
    .map(texte => `<p class="ligne-activite">• ${texte}</p>`)
    .join("");

  // --- Déconnexion ---
  document.getElementById("bouton-deconnexion").addEventListener("click", () => {
    localStorage.removeItem("jac_utilisateur_connecte");
    window.location.href = "index.html";
  });

});
