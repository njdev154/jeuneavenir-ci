// quiz.js
// Moteur du quiz d'orientation. IMPORTANT : toute la mécanique interne
// (méthode de calcul, dimensions, mots-clés) reste ici, dans le code —
// elle n'est JAMAIS affichée à l'utilisateur. Ce qu'il voit doit rester
// simple : des questions, puis une filière recommandée.

document.addEventListener("DOMContentLoaded", () => {

  const ecranIntro = document.getElementById("ecran-intro");
  const ecranQuestion = document.getElementById("ecran-question");
  const ecranOuverte = document.getElementById("ecran-ouverte");
  const boutonDemarrer = document.getElementById("bouton-demarrer");
  const boutonPrecedent = document.getElementById("bouton-precedent");
  const boutonSuivant = document.getElementById("bouton-suivant");
  const boutonPrecedentOuverte = document.getElementById("bouton-precedent-ouverte");
  const texteQuestion = document.getElementById("quiz-question-texte");
  const conteneurReponses = document.getElementById("quiz-reponses");
  const selectSerie = document.getElementById("quiz-serie");
  const etatQuiz = document.getElementById("quiz-etat");

  let questionsTirees = [];
  let indexActuel = 0;
  let reponseChoisie = null;
  const reponsesChoisies = [];
  let SERIES_FILIERES = [];
  let serieChoisie = "";

  const scoresRiasec = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const historiqueReponses = [];

  function afficherStatut(message, erreur = false) {
    etatQuiz.textContent = message;
    etatQuiz.classList.toggle("quiz-etat-erreur", erreur);
  }

  // --- Chargement du mapping série -> filières (filtre) ---
  fetch("data/series_filieres.json")
    .then(reponse => {
      if (!reponse.ok) throw new Error("Réponse serveur invalide");
      return reponse.json();
    })
    .then(donnees => {
      SERIES_FILIERES = donnees.series;
      SERIES_FILIERES.forEach(s => {
        const option = document.createElement("option");
        option.value = s.id;
        option.textContent = s.verification === "a_confirmer"
          ? `${s.nom} — correspondances à confirmer`
          : s.nom;
        selectSerie.appendChild(option);
      });
      afficherStatut("Choisis ta série pour commencer.");
    })
    .catch(erreur => {
      console.error("Impossible de charger les séries :", erreur);
      afficherStatut("Impossible de charger les séries. Vérifie ta connexion puis actualise la page.", true);
    });

  selectSerie.addEventListener("change", () => {
    serieChoisie = selectSerie.value;
    boutonDemarrer.disabled = !SERIES_FILIERES.some(serie => serie.id === serieChoisie);
  });

  function melanger(tableau) {
    const copie = [...tableau];
    for (let i = copie.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  }

  function afficherErreurChargement() {
    afficherStatut("Le quiz n'a pas pu se charger. Vérifie ta connexion puis réessaie.", true);
    boutonDemarrer.disabled = !SERIES_FILIERES.some(serie => serie.id === serieChoisie);
  }

  boutonDemarrer.addEventListener("click", async () => {
    boutonDemarrer.disabled = true;
    afficherStatut("Préparation du quiz...");
    try {
      const reponseFetch = await fetch("data/questions.json");
      if (!reponseFetch.ok) throw new Error("Réponse serveur invalide");
      const donnees = await reponseFetch.json();
      questionsTirees = melanger(donnees.questions).slice(0, 7);

      ecranIntro.style.display = "none";
      ecranQuestion.style.display = "block";
      afficherStatut("");
      afficherQuestion();
    } catch (erreur) {
      console.error(erreur);
      afficherErreurChargement();
    }
  });

  function afficherQuestion() {
    reponseChoisie = Number.isInteger(reponsesChoisies[indexActuel])
      ? reponsesChoisies[indexActuel]
      : null;
    boutonSuivant.disabled = reponseChoisie === null;
    boutonPrecedent.disabled = indexActuel === 0;

    const question = questionsTirees[indexActuel];
    texteQuestion.textContent = question.texte;

    const conteneurEtapes = document.getElementById("quiz-etapes");
    const texteEtapes = document.getElementById("quiz-etapes-texte");
    const numeroQuestion = indexActuel + 1;
    texteEtapes.textContent = `Question ${numeroQuestion} sur ${questionsTirees.length}`;
    conteneurEtapes.setAttribute("aria-valuemax", String(questionsTirees.length));
    conteneurEtapes.setAttribute("aria-valuenow", String(numeroQuestion));
    conteneurEtapes.setAttribute("aria-valuetext", `Question ${numeroQuestion} sur ${questionsTirees.length}`);
    conteneurEtapes.innerHTML = questionsTirees.map((_, i) => {
      const etat = i < indexActuel ? "etape-faite" : (i === indexActuel ? "etape-active" : "");
      return `<span class="quiz-etape-point ${etat}" aria-hidden="true"></span>`;
    }).join("");

    conteneurReponses.innerHTML = "";
    question.reponses.forEach((reponse, i) => {
      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.className = "bouton-reponse";
      bouton.setAttribute("aria-pressed", String(i === reponseChoisie));
      bouton.textContent = reponse.texte;
      if (i === reponseChoisie) bouton.classList.add("bouton-reponse-selectionnee");
      bouton.addEventListener("click", () => choisirReponse(i, bouton));
      conteneurReponses.appendChild(bouton);
    });

    boutonSuivant.textContent = (indexActuel === questionsTirees.length - 1) ? "Continuer" : "Suivant";
    if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.animer(ecranQuestion);
  }

  function choisirReponse(index, boutonClique) {
    reponseChoisie = index;
    reponsesChoisies[indexActuel] = index;
    boutonSuivant.disabled = false;
    document.querySelectorAll(".bouton-reponse").forEach(b => {
      b.classList.remove("bouton-reponse-selectionnee");
      b.setAttribute("aria-pressed", "false");
    });
    boutonClique.classList.add("bouton-reponse-selectionnee");
    boutonClique.setAttribute("aria-pressed", "true");
  }

  function revenirQuestionPrecedente() {
    if (indexActuel <= 0) return;

    const indexPrecedent = indexActuel - 1;
    const questionPrecedente = questionsTirees[indexPrecedent];
    const reponsePrecedente = questionPrecedente.reponses[reponsesChoisies[indexPrecedent]];

    Object.entries(reponsePrecedente.riasec).forEach(([lettre, points]) => {
      scoresRiasec[lettre] -= points;
    });

    historiqueReponses.pop();
    indexActuel = indexPrecedent;
    ecranOuverte.style.display = "none";
    ecranQuestion.style.display = "block";
    afficherQuestion();
  }

  boutonPrecedent.addEventListener("click", revenirQuestionPrecedente);
  boutonPrecedentOuverte.addEventListener("click", revenirQuestionPrecedente);

  boutonSuivant.addEventListener("click", () => {
    if (reponseChoisie === null) return;

    const question = questionsTirees[indexActuel];
    const reponse = question.reponses[reponseChoisie];

    Object.entries(reponse.riasec).forEach(([lettre, points]) => {
      scoresRiasec[lettre] += points;
    });

    historiqueReponses.push({ question: question.texte, reponse: reponse.texte });
    indexActuel++;

    if (indexActuel < questionsTirees.length) {
      afficherQuestion();
    } else {
      ecranQuestion.style.display = "none";
      ecranOuverte.style.display = "block";
      document.getElementById("quiz-etapes-texte").textContent = "Dernière étape facultative";
      const conteneurEtapes = document.getElementById("quiz-etapes");
      conteneurEtapes.setAttribute("aria-valuetext", "Dernière étape facultative");
      if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.animer(ecranOuverte);
    }
  });

  // --- Détection de mots-clés simples (interne, jamais montrée telle quelle) ---
  const MOTS_CLES_RIASEC = {
    R: ["réparer", "construire", "fabriquer", "bricoler", "manuel", "terrain", "technique", "machine", "chantier"],
    I: ["comprendre", "analyser", "chercher", "résoudre", "logique", "science", "recherche", "calcul", "expérimenter"],
    A: ["créer", "dessiner", "inventer", "imaginer", "art", "design", "musique", "écrire", "original"],
    S: ["aider", "accompagner", "enseigner", "soigner", "écouter", "conseiller", "soutenir", "transmettre"],
    E: ["diriger", "vendre", "entreprendre", "négocier", "convaincre", "manager", "business", "gérer une équipe", "leader"],
    C: ["organiser", "planifier", "gérer", "classer", "rigueur", "administratif", "structurer", "méthode"]
  };

  function analyserTexteLibre(texte) {
    const texteMinuscule = texte.toLowerCase();
    const pointsDetectes = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    Object.entries(MOTS_CLES_RIASEC).forEach(([lettre, mots]) => {
      mots.forEach(mot => {
        if (texteMinuscule.includes(mot)) pointsDetectes[lettre] += 2;
      });
    });
    return pointsDetectes;
  }

  document.getElementById("bouton-voir-resultat").addEventListener("click", () => {
    const texteLibre = document.getElementById("quiz-texte-libre").value.trim();
    if (texteLibre) {
      const pointsDetectes = analyserTexteLibre(texteLibre);
      Object.entries(pointsDetectes).forEach(([lettre, points]) => {
        scoresRiasec[lettre] += points;
      });
    }
    terminerQuiz();
  });

  function terminerQuiz() {
    const lettresTriees = Object.entries(scoresRiasec)
      .sort((a, b) => b[1] - a[1])
      .map(([lettre]) => lettre);

    const codeInterne = lettresTriees.slice(0, 3).join("");
    const filieresAccessibles = SERIES_FILIERES.find(s => s.id === serieChoisie)?.filieres_possibles || [];

    const resultat = {
      codeInterne,          // usage interne uniquement (calcul), jamais affiché
      scoresRiasec,         // usage interne uniquement (calcul), jamais affiché
      serieChoisie,
      filieresAccessibles,
      date: new Date().toISOString()
    };

    localStorage.setItem("jac_dernier_resultat_quiz", JSON.stringify(resultat));
    window.location.href = "resultat.html";
  }

});
