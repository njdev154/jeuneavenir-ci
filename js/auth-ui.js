document.addEventListener("DOMContentLoaded", () => {
  const libellesProfils = {
    jeune: {
      kicker: "ESPACE JEUNE",
      titre: "Ton parcours continue.",
      intro: "Retrouve tes repères d'orientation et de formation.",
      inscriptionKicker: "INSCRIPTION · JEUNE / ÉTUDIANT",
      inscriptionTitre: "Crée ton espace jeune.",
      inscriptionIntro: "Indique ta situation et ton niveau pour préparer ton parcours.",
      aide: "Choisis ce profil si tu es lycéen, étudiant ou jeune diplômé."
    },
    professeur: {
      kicker: "ESPACE PROFESSEUR",
      titre: "Retrouve ton espace enseignant.",
      intro: "Reprends tes repères pour accompagner les parcours des jeunes.",
      inscriptionKicker: "INSCRIPTION · PROFESSEUR",
      inscriptionTitre: "Crée ton espace enseignant.",
      inscriptionIntro: "Précise ta discipline pour décrire ton profil d'enseignant.",
      aide: "Le profil professeur utilise l'espace Mentor prévu par le projet."
    },
    mentor: {
      kicker: "ESPACE MENTOR",
      titre: "Retrouve ton espace mentor.",
      intro: "Reprends ton parcours d'accompagnement professionnel.",
      inscriptionKicker: "INSCRIPTION · MENTOR",
      inscriptionTitre: "Crée ton espace mentor.",
      inscriptionIntro: "Présente ton métier et le domaine dans lequel tu peux accompagner.",
      aide: "Choisis ce profil si tu souhaites accompagner des jeunes."
    },
    entreprise: {
      kicker: "ESPACE ENTREPRISE",
      titre: "Retrouve ton espace entreprise.",
      intro: "Accède à ton espace de démonstration recruteur.",
      inscriptionKicker: "INSCRIPTION · ENTREPRISE",
      inscriptionTitre: "Crée ton espace entreprise.",
      inscriptionIntro: "Indique ton organisation et ta fonction de contact.",
      aide: "Les offres et candidatures réelles ne sont pas activées en V1."
    }
  };
  const choixProfil = Array.from(document.querySelectorAll('input[name="type_compte"]'));
  const groupesProfil = Array.from(document.querySelectorAll("[data-profile-fields]"));
  const liensProfil = Array.from(document.querySelectorAll("[data-profile-link]"));

  const actualiserProfil = (profil) => {
    const libelle = libellesProfils[profil];
    if (!libelle) return;

    choixProfil.forEach((radio) => {
      radio.checked = radio.value === profil;
    });

    groupesProfil.forEach((groupe) => {
      const actif = groupe.dataset.profileFields === profil;
      groupe.hidden = !actif;
      groupe.disabled = !actif;
      groupe.querySelectorAll("input, select, textarea").forEach((champ) => {
        champ.disabled = !actif;
      });
    });

    const connexion = document.body.classList.contains("page-auth-connexion");
    const kicker = document.getElementById(connexion ? "auth-login-kicker" : "auth-signup-kicker");
    const titre = document.getElementById("auth-page-title");
    const intro = document.getElementById(connexion ? "auth-login-intro" : "auth-signup-intro");
    const aide = document.getElementById("auth-login-profile-hint");
    if (kicker) kicker.textContent = connexion ? libelle.kicker : libelle.inscriptionKicker;
    if (titre) titre.textContent = connexion ? libelle.titre : libelle.inscriptionTitre;
    if (intro) intro.textContent = connexion ? libelle.intro : libelle.inscriptionIntro;
    if (aide) aide.textContent = libelle.aide;
    document.body.dataset.authProfile = profil;

    liensProfil.forEach((lien) => {
      const destination = new URL(lien.href, window.location.href);
      destination.searchParams.set("profil", profil);
      lien.href = destination.href;
    });
  };

  choixProfil.forEach((radio) => {
    radio.addEventListener("change", () => actualiserProfil(radio.value));
  });

  const profilInitial = new URLSearchParams(window.location.search).get("profil");
  actualiserProfil(libellesProfils[profilInitial] ? profilInitial : (choixProfil.find((radio) => radio.checked)?.value || "jeune"));

  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    const input = document.getElementById(button.getAttribute("aria-controls"));
    if (!input) return;

    const label = button.getAttribute("aria-label").replace(/^Afficher/, "");
    button.addEventListener("click", () => {
      const showPassword = input.type === "password";
      input.type = showPassword ? "text" : "password";
      button.textContent = showPassword ? "Masquer" : "Afficher";
      button.setAttribute("aria-label", `${showPassword ? "Masquer" : "Afficher"}${label}`);
      button.setAttribute("aria-pressed", String(showPassword));
    });
  });
});
