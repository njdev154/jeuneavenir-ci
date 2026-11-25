// main.js
// Script commun à TOUTES les pages : menu mobile, navigation active et animations.

function activerComptesLocauxPourLeTest() {
  const formulaires = [
    document.getElementById("formulaire-inscription"),
    document.getElementById("formulaire-connexion")
  ].filter(Boolean);

  if (!formulaires.length) return false;

  const notice = document.querySelector(".pilot-notice");
  const noticeTexte = notice?.querySelector("p");
  if (noticeTexte) {
    notice.setAttribute("aria-label", "Mode de développement local");
    noticeTexte.textContent = "Mode de développement local : utilise uniquement des données fictives pour tester le compte Jeune. Les comptes de mineurs, les rôles Mentor/Professeur/Entreprise et les autres formulaires restent indisponibles.";
  }

  formulaires.forEach((formulaire) => {
    const groupeDesactive = formulaire.querySelector(".pilot-disabled-controls");
    if (groupeDesactive) groupeDesactive.disabled = false;
    formulaire.removeAttribute("aria-disabled");
    formulaire.querySelectorAll("input, select, textarea, button").forEach((champ) => {
      champ.disabled = false;
    });

    formulaire.querySelectorAll('input[name="type_compte"]').forEach((radio) => {
      const disponible = radio.value === "jeune";
      radio.checked = disponible;
      radio.disabled = !disponible;
      const carte = radio.closest("label");
      if (carte) carte.hidden = !disponible;
    });

    formulaire.querySelectorAll("[data-profile-fields]").forEach((groupe) => {
      groupe.hidden = true;
      groupe.disabled = true;
      groupe.querySelectorAll("input, select, textarea").forEach((champ) => {
        champ.disabled = true;
      });
    });

    const legend = formulaire.querySelector(".pilot-disabled-controls legend");
    if (legend) legend.textContent = "Compte Jeune de développement local";
    const note = formulaire.previousElementSibling;
    if (note?.classList.contains("pilot-form-message")) {
      note.textContent = "Utilise uniquement des données fictives. Les comptes de mineurs ne sont pas inclus dans ce test.";
    }
  });

  const inscription = document.getElementById("auth-demo-note");
  if (inscription) inscription.textContent = "Compte Jeune de développement local. N’utilise pas d’adresse personnelle ni de mot de passe réutilisé.";
  const connexion = document.getElementById("auth-login-note");
  if (connexion) connexion.textContent = "Connexion de développement local uniquement. Aucune session publique n’est disponible.";
  const profilAide = document.getElementById("auth-login-profile-hint");
  if (profilAide) profilAide.textContent = "Seul le compte Jeune est disponible dans cette tranche locale.";
  const titre = document.getElementById("auth-page-title");
  if (titre) {
    titre.textContent = document.body.classList.contains("page-auth-connexion")
      ? "Connexion au compte Jeune local."
      : "Créer un compte Jeune de test.";
  }
  const intro = document.getElementById(
    document.body.classList.contains("page-auth-connexion")
      ? "auth-login-intro"
      : "auth-signup-intro"
  );
  if (intro) {
    intro.textContent = document.body.classList.contains("page-auth-connexion")
      ? "Connecte-toi au compte local créé pour les essais."
      : "Cette tranche locale enregistre uniquement le nom, l’e-mail et le mot de passe.";
  }
  const ville = document.getElementById("ville");
  if (ville) {
    ville.disabled = true;
    const champVille = ville.closest(".auth-champ");
    if (champVille) champVille.hidden = true;
  }

  return true;
}

window.JeuneAvenirPilot = Object.freeze({
  accountsEnabled: false,
  submissionsEnabled: false,
  activerComptesLocauxPourLeTest() {
    return activerComptesLocauxPourLeTest();
  },
  effacerDonneesLocales() {
    const stockages = [window.localStorage, window.sessionStorage].filter(Boolean);
    let nombre = 0;
    stockages.forEach(stockage => {
      const cles = [];
      for (let index = 0; index < stockage.length; index += 1) {
        const cle = stockage.key(index);
        if (cle && cle.startsWith("jac_")) cles.push(cle);
      }
      cles.forEach(cle => stockage.removeItem(cle));
      nombre += cles.length;
    });
    return nombre;
  }
});

function initialiserModePilote() {
  const principal = document.querySelector("main");
  if (!principal) return;

  const avis = document.createElement("aside");
  avis.className = "pilot-notice";
  avis.setAttribute("role", "note");
  avis.setAttribute("aria-label", "Limites du pilote public");

  const texte = document.createElement("p");
  texte.textContent = "Pilote public : aucun compte n’est actif et aucun formulaire de contact, avis, candidature, mentorat ou publication d’offre n’est envoyé. Le profil, les réponses du quiz, son texte facultatif et les favoris peuvent rester dans ce navigateur. N’y saisis pas de coordonnées ni d’informations sensibles. L’hébergeur reçoit les requêtes techniques nécessaires au chargement.";

  const lien = document.createElement("a");
  lien.href = "confidentialite.html";
  lien.textContent = "Données et confidentialité";

  const effacer = document.createElement("button");
  effacer.type = "button";
  effacer.className = "pilot-clear-button";
  effacer.textContent = "Effacer les données de cet appareil";

  const statut = document.createElement("span");
  statut.className = "pilot-clear-status";
  statut.setAttribute("role", "status");
  statut.setAttribute("aria-live", "polite");

  effacer.addEventListener("click", () => {
    if (!window.confirm("Effacer de cet appareil la progression et le résultat du quiz, les favoris ainsi que les anciennes données locales de compte, candidatures, mentorat, offres et avis ?")) return;
    try {
      const nombre = window.JeuneAvenirPilot.effacerDonneesLocales();
      statut.textContent = nombre
        ? "Les données JeuneAvenir locales ont été effacées de cet appareil."
        : "Aucune donnée JeuneAvenir locale n’a été trouvée.";
    } catch (erreur) {
      console.error("Suppression des données locales impossible :", erreur);
      statut.textContent = "La suppression n’a pas abouti complètement. Efface les données du site depuis les paramètres du navigateur.";
    }
  });

  avis.append(texte, lien, effacer, statut);
  principal.insertBefore(avis, principal.firstChild);

  document.querySelectorAll(".entete-actions").forEach(actions => {
    const statutCompte = document.createElement("span");
    statutCompte.className = "pilot-account-status";
    statutCompte.textContent = "Comptes indisponibles";
    actions.replaceChildren(statutCompte);
  });

  document.querySelectorAll('.nav-principale a[href="dashboard.html"]').forEach(lienCompte => {
    const statutCompte = document.createElement("span");
    statutCompte.className = "pilot-disabled-link";
    statutCompte.setAttribute("aria-disabled", "true");
    statutCompte.textContent = "Compte indisponible";
    lienCompte.replaceWith(statutCompte);
  });

  const formulairesIndisponibles = {
    "formulaire-inscription": "Les comptes ne sont pas activés pendant ce pilote. N’entre pas de nom, d’adresse e-mail ni de mot de passe.",
    "formulaire-connexion": "La connexion n’est pas activée. Aucun compte n’existe sur le site.",
    "formulaire-mdp-oublie": "La réinitialisation de mot de passe n’est pas disponible. Aucun e-mail ne sera envoyé.",
    "formulaire-profil": "Les profils ne sont pas activés et aucune information personnelle ne peut être enregistrée.",
    "formulaire-contact": "Le contact n’est pas relié. Aucun message ne sera envoyé; ne saisis pas de coordonnées.",
    "formulaire-avis": "Les avis ne sont pas transmis à l’équipe. Ce formulaire est désactivé.",
    "formulaire-offre": "La publication d’offres n’est pas activée. Aucun brouillon ne sera enregistré ni publié."
  };
  Object.entries(formulairesIndisponibles).forEach(([id, message]) => {
    const formulaire = document.getElementById(id);
    if (!formulaire) return;
    formulaire.querySelectorAll("input, select, textarea, button").forEach(champ => {
      champ.disabled = true;
    });
    formulaire.setAttribute("aria-disabled", "true");
    if (formulaire.previousElementSibling?.classList.contains("pilot-form-message")) return;
    const note = document.createElement("p");
    note.className = "pilot-form-message";
    note.setAttribute("role", "status");
    note.textContent = message;
    formulaire.parentNode.insertBefore(note, formulaire);
  });

  const page = window.location.pathname.split("/").pop();
  const messagesPage = {
    "dashboard.html": "Le tableau de bord est indisponible : ce pilote ne crée pas de comptes et ne lit pas les anciens profils locaux.",
    "candidatures.html": "Le suivi de candidature est désactivé : aucune candidature ne peut être envoyée ou consultée comme une démarche réelle.",
    "publier-offre.html": "La publication d’offres est indisponible pendant ce pilote. Les annonces du catalogue restent soumises à vérification."
  };
  if (messagesPage[page]) {
    const note = document.createElement("p");
    note.className = "pilot-page-message";
    note.setAttribute("role", "status");
    note.textContent = messagesPage[page];
    principal.insertBefore(note, avis.nextSibling);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initialiserModePilote();

  // --- Menu mobile (hamburger) ---
  const burger = document.querySelector(".menu-burger");
  const nav = document.querySelector(".nav-principale");
  if (burger && nav) {
    if (!nav.id) nav.id = "nav-principale";
    burger.setAttribute("aria-controls", nav.id);
    burger.setAttribute("aria-expanded", String(nav.classList.contains("nav-ouverte")));
    burger.setAttribute("aria-label", nav.classList.contains("nav-ouverte") ? "Fermer le menu" : "Ouvrir le menu");

    const fermerMenu = () => {
      nav.classList.remove("nav-ouverte");
      burger.classList.remove("burger-actif");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Ouvrir le menu");
      const entete = burger.closest(".entete");
      if (entete) entete.classList.remove("menu-ouvert");
    };

    burger.addEventListener("click", () => {
      nav.classList.toggle("nav-ouverte");
      burger.classList.toggle("burger-actif");
      const menuOuvert = nav.classList.contains("nav-ouverte");
      const entete = burger.closest(".entete");
      burger.setAttribute("aria-expanded", String(menuOuvert));
      burger.setAttribute("aria-label", menuOuvert ? "Fermer le menu" : "Ouvrir le menu");
      if (entete) entete.classList.toggle("menu-ouvert", menuOuvert);
    });

    nav.addEventListener("click", evenement => {
      if (evenement.target.closest("a")) fermerMenu();
    });

    document.addEventListener("keydown", evenement => {
      if (evenement.key === "Escape" && nav.classList.contains("nav-ouverte")) {
        fermerMenu();
        burger.focus();
      }
    });
  }

  // --- Surligne le lien de la page actuelle dans le menu ---
  const pageActuelle = window.location.pathname.split("/").pop() || "index.html";
  const pagePilier = {
    "resultat.html": "quiz.html",
    "comparateur.html": "quiz.html",
    "ecoles.html": "filieres.html",
    "metiers.html": "filieres.html",
    "recherche.html": "filieres.html",
    "candidatures.html": "offres.html",
    "publier-offre.html": "offres.html",
    "profil.html": "dashboard.html",
    "favoris.html": "dashboard.html"
  }[pageActuelle] || pageActuelle;
  document.querySelectorAll(".nav-principale a").forEach(lien => {
    const cheminLien = new URL(lien.href, window.location.href).pathname.split("/").pop();
    if (cheminLien === pagePilier) {
      lien.classList.add("nav-lien-actif");
      lien.setAttribute("aria-current", "page");
    } else {
      lien.classList.remove("nav-lien-actif");
      lien.removeAttribute("aria-current");
    }
  });

  if (window.JeuneAvenirMotion) {
    window.JeuneAvenirMotion.initialiser();
    return;
  }

  const elementsAAnimer = document.querySelectorAll(".carte, .hero-texte, h1, h2");
  elementsAAnimer.forEach(el => el.classList.add("reveal"));

  if (!("IntersectionObserver" in window)) {
    elementsAAnimer.forEach(el => el.classList.add("reveal-visible"));
    return;
  }

  const observateur = new IntersectionObserver(entrees => {
    entrees.forEach(entree => {
      if (entree.isIntersecting) {
        entree.target.classList.add("reveal-visible");
        observateur.unobserve(entree.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  elementsAAnimer.forEach(el => observateur.observe(el));

});
