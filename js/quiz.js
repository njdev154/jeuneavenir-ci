// quiz.js
// Moteur du quiz d'orientation. IMPORTANT : toute la mécanique interne
// (méthode de calcul, dimensions, mots-clés) reste ici, dans le code —
// elle n'est JAMAIS affichée à l'utilisateur. Ce qu'il voit doit rester
// simple : des questions, puis une filière recommandée.

document.addEventListener("DOMContentLoaded", () => {

  const ecranIntro = document.getElementById("ecran-intro");
  const ecranQuestion = document.getElementById("ecran-question");
  const boutonDemarrer = document.getElementById("bouton-demarrer");
  const boutonSuivant = document.getElementById("bouton-suivant");
  const texteQuestion = document.getElementById("quiz-question-texte");
  const conteneurReponses = document.getElementById("quiz-reponses");
  const selectSerie = document.getElementById("quiz-serie");

  let questionsTirees = [];
  let indexActuel = 0;
  let reponseChoisie = null;
  let SERIES_FILIERES = [];
  let serieChoisie = "";

  const scoresRiasec = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const historiqueReponses = [];

  // --- Chargement du mapping série -> filières (filtre) ---
  fetch("data/series_filieres.json")
    .then(r => r.json())
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
    })
    .catch(erreur => console.error("Impossible de charger les séries :", erreur));

  selectSerie.addEventListener("change", () => {
    serieChoisie = selectSerie.value;
    boutonDemarrer.disabled = !serieChoisie;
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
    ecranIntro.innerHTML = `
      <h1>Un problème est survenu</h1>
      <p class="quiz-intro-texte">
        Le quiz n'a pas pu se charger. Vérifie ta connexion, puis réessaie.
      </p>
      <button type="button" class="bouton-principal bouton-pleine-largeur" onclick="location.reload()">Réessayer</button>
    `;
  }

  boutonDemarrer.addEventListener("click", async () => {
    try {
      const reponseFetch = await fetch("data/questions.json");
      if (!reponseFetch.ok) throw new Error("Réponse serveur invalide");
      const donnees = await reponseFetch.json();
      questionsTirees = melanger(donnees.questions).slice(0, 7);

      ecranIntro.style.display = "none";
      ecranQuestion.style.display = "block";
      afficherQuestion();
    } catch (erreur) {
      console.error(erreur);
      afficherErreurChargement();
    }
  });

  function afficherQuestion() {
    reponseChoisie = null;
    boutonSuivant.disabled = true;

    const question = questionsTirees[indexActuel];
    texteQuestion.textContent = question.texte;

    const conteneurEtapes = document.getElementById("quiz-etapes");
    conteneurEtapes.innerHTML = questionsTirees.map((_, i) => {
      const etat = i < indexActuel ? "etape-faite" : (i === indexActuel ? "etape-active" : "");
      return `<span class="quiz-etape-point ${etat}"></span>`;
    }).join("");

    conteneurReponses.innerHTML = "";
    question.reponses.forEach((reponse, i) => {
      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.className = "bouton-reponse";
      bouton.textContent = reponse.texte;
      bouton.addEventListener("click", () => choisirReponse(i, bouton));
      conteneurReponses.appendChild(bouton);
    });

    boutonSuivant.textContent = (indexActuel === questionsTirees.length - 1) ? "Continuer" : "Suivant";

    const carte = document.getElementById("ecran-question");
    carte.classList.remove("quiz-carte-animee");
    void carte.offsetWidth;
    carte.classList.add("quiz-carte-animee");
  }

  function choisirReponse(index, boutonClique) {
    reponseChoisie = index;
    boutonSuivant.disabled = false;
    document.querySelectorAll(".bouton-reponse").forEach(b => b.classList.remove("bouton-reponse-selectionnee"));
    boutonClique.classList.add("bouton-reponse-selectionnee");
  }

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
      document.getElementById("ecran-question").style.display = "none";
      document.getElementById("ecran-ouverte").style.display = "block";
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
