// quiz.js
// Quiz RIASEC (Holland) : 7 questions tirées de la banque de 14, chaque
// réponse donne des points sur les 6 dimensions R-I-A-S-E-C. À la fin,
// on calcule le "code Holland" (3 lettres dominantes) de l'utilisateur.
// Le matching avec les filières se fait dans resultat.js.

document.addEventListener("DOMContentLoaded", () => {

  const ecranIntro = document.getElementById("ecran-intro");
  const ecranQuestion = document.getElementById("ecran-question");
  const boutonDemarrer = document.getElementById("bouton-demarrer");
  const boutonSuivant = document.getElementById("bouton-suivant");
  const texteProgression = document.getElementById("quiz-progression-texte");
  const barreRemplie = document.getElementById("barre-progression-remplie");
  const texteQuestion = document.getElementById("quiz-question-texte");
  const conteneurReponses = document.getElementById("quiz-reponses");

  let questionsTirees = [];
  let indexActuel = 0;
  let reponseChoisie = null;

  // Score cumulé sur les 6 dimensions RIASEC
  const scoresRiasec = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  // Historique des réponses choisies, pour pouvoir expliquer le résultat ensuite
  const historiqueReponses = [];

  function melanger(tableau) {
    const copie = [...tableau];
    for (let i = copie.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  }

  boutonDemarrer.addEventListener("click", async () => {
    try {
      const reponseFetch = await fetch("data/questions.json");
      const donnees = await reponseFetch.json();
      questionsTirees = melanger(donnees.questions).slice(0, 7);

      ecranIntro.style.display = "none";
      ecranQuestion.style.display = "block";
      afficherQuestion();
    } catch (erreur) {
      alert("Impossible de charger les questions. Vérifie que tu ouvres le site via un serveur local (Live Server).");
      console.error(erreur);
    }
  });

  function afficherQuestion() {
    reponseChoisie = null;
    boutonSuivant.disabled = true;

    const question = questionsTirees[indexActuel];
    texteProgression.textContent = `Question ${indexActuel + 1}/${questionsTirees.length}`;
    barreRemplie.style.width = `${((indexActuel + 1) / questionsTirees.length) * 100}%`;
    texteQuestion.textContent = question.texte;

    conteneurReponses.innerHTML = "";
    question.reponses.forEach((reponse, i) => {
      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.className = "bouton-reponse";
      bouton.textContent = reponse.texte;
      bouton.addEventListener("click", () => choisirReponse(i, bouton));
      conteneurReponses.appendChild(bouton);
    });

    boutonSuivant.textContent = (indexActuel === questionsTirees.length - 1) ? "Voir mon résultat" : "Suivant";
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

    // Cumule les points RIASEC de la réponse choisie
    Object.entries(reponse.riasec).forEach(([lettre, points]) => {
      scoresRiasec[lettre] += points;
    });

    historiqueReponses.push({ question: question.texte, reponse: reponse.texte, riasec: reponse.riasec });

    indexActuel++;

    if (indexActuel < questionsTirees.length) {
      afficherQuestion();
    } else {
      terminerQuiz();
    }
  });

  function terminerQuiz() {
    // Trie les 6 lettres par score décroissant, garde les 3 meilleures = code Holland
    const lettresTriees = Object.entries(scoresRiasec)
      .sort((a, b) => b[1] - a[1])
      .map(([lettre]) => lettre);

    const codeHolland = lettresTriees.slice(0, 3).join("");

    const resultat = {
      codeHolland,
      scoresRiasec,
      historiqueReponses,
      date: new Date().toISOString()
    };

    localStorage.setItem("jac_dernier_resultat_quiz", JSON.stringify(resultat));
    window.location.href = "resultat.html";
  }

});
