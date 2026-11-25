document.addEventListener("DOMContentLoaded", () => {
  const orientation = window.JeuneAvenirOrientation;
  const elements = {
    intro: document.getElementById("ecran-intro"),
    niveau: document.getElementById("quiz-niveau"),
    situation: document.getElementById("quiz-situation"),
    objectif: document.getElementById("quiz-objectif"),
    serie: document.getElementById("quiz-serie"),
    question: document.getElementById("ecran-question"),
    ouverte: document.getElementById("ecran-ouverte"),
    titreQuestion: document.getElementById("quiz-question-texte"),
    reponses: document.getElementById("quiz-reponses"),
    statut: document.getElementById("quiz-etat"),
    progressionTexte: document.getElementById("quiz-etapes-texte"),
    progression: document.getElementById("quiz-etapes"),
    texteLibre: document.getElementById("quiz-texte-libre"),
    demarrer: document.getElementById("bouton-demarrer"),
    reprendre: document.getElementById("bouton-reprendre"),
    recommencer: document.getElementById("bouton-recommencer"),
    dernierResultat: document.getElementById("quiz-dernier-resultat"),
    precedent: document.getElementById("bouton-precedent"),
    suivant: document.getElementById("bouton-suivant"),
    precedentOuverte: document.getElementById("bouton-precedent-ouverte"),
    voirResultat: document.getElementById("bouton-voir-resultat"),
    profil: document.querySelector(".orientation-profil"),
    noteStockage: document.querySelector(".orientation-stockage-note"),
    introDescription: document.getElementById("quiz-intro-description")
  };

  let banqueQuestions = [];
  let series = [];
  let modeApi = false;
  let questionnaireApi = null;
  let reponsesApi = {};
  let indexQuestionApi = 0;
  let parcoursApiDemarre = false;
  let envoiResultatApi = false;
  let parcours = null;
  let erreurProgression = null;
  let erreurSauvegarde = false;
  let parcoursExiste = false;
  let reponseSauvegardee = false;

  function afficherStatut(message, erreur = false) {
    elements.statut.textContent = message;
    elements.statut.classList.toggle("quiz-etat-erreur", erreur);
  }

  function lireProfilCompteLocal() {
    if (!window.JeuneAvenirPilot?.accountsEnabled) return { profile: {}, note: "" };

    try {
      const session = JSON.parse(window.localStorage.getItem("jac_utilisateur_connecte") || "null");
      if (!session || session.typeCompte !== "jeune") return { profile: {}, note: "" };
      const details = session.profilDetails && typeof session.profilDetails === "object" ? session.profilDetails : {};
      const situation = session.statut || details.statut || "";
      return {
        profile: {
          niveau: typeof session.formation === "string" ? session.formation : (typeof details.formation === "string" ? details.formation : ""),
          situation: ["lyceen", "etudiant", "jeune-diplome"].includes(situation) ? situation : "",
          serie: "",
          objectif: ""
        },
        note: ""
      };
    } catch (erreur) {
      console.error("Lecture des repères du profil local impossible :", erreur);
      return {
        profile: {},
        note: "Les repères du profil local sont illisibles; tu peux les renseigner ici sans modifier ce profil."
      };
    }
  }

  function lireProfilFormulaire() {
    return orientation.normaliserProfil({
      niveau: elements.niveau.value,
      situation: elements.situation.value,
      objectif: elements.objectif.value,
      serie: elements.serie.value
    });
  }

  function remplirProfil(profil = {}) {
    const valeurs = orientation.normaliserProfil(profil);
    elements.niveau.value = valeurs.niveau;
    elements.situation.value = valeurs.situation;
    elements.objectif.value = valeurs.objectif;
    elements.serie.value = valeurs.serie;
  }

  function afficherEcran(ecran) {
    elements.intro.hidden = ecran !== "profil";
    elements.question.hidden = ecran !== "questions";
    elements.ouverte.hidden = ecran !== "ouverte";
    const cible = ecran === "profil"
      ? elements.intro.querySelector("h1")
      : ecran === "questions" ? elements.titreQuestion : elements.ouverte.querySelector("h2");
    if (cible) {
      cible.focus();
      if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.animer(ecran === "profil" ? elements.intro : ecran === "questions" ? elements.question : elements.ouverte);
    }
  }

  function mettreAJourActions() {
    if (modeApi) {
      elements.demarrer.disabled = envoiResultatApi
        || !series.some(serie => serie.id === elements.serie.value);
      elements.demarrer.textContent = Object.keys(reponsesApi).length
        ? "Reprendre le questionnaire"
        : "Commencer le questionnaire";
      elements.reprendre.hidden = true;
      elements.recommencer.hidden = true;
      elements.dernierResultat.hidden = true;
      return;
    }

    const questionsEnCours = parcours && parcours.status === "en_cours" && parcours.questionIds.length === orientation.nombreQuestions;
    const termine = parcours && parcours.status === "termine";
    const peutDemarrer = !erreurProgression && !erreurSauvegarde && !questionsEnCours && !termine
      && series.some(serie => serie.id === elements.serie.value);

    elements.demarrer.disabled = !peutDemarrer;
    elements.reprendre.hidden = !questionsEnCours;
    elements.recommencer.hidden = !erreurProgression && !parcoursExiste;
    elements.dernierResultat.hidden = !termine;
    [elements.niveau, elements.situation, elements.objectif, elements.serie].forEach(champ => {
      champ.disabled = Boolean(termine || erreurProgression);
    });
    if (erreurProgression) {
      elements.demarrer.textContent = "Progression à corriger";
      elements.recommencer.textContent = "Effacer la sauvegarde illisible et recommencer";
    } else if (termine) {
      elements.demarrer.textContent = "Parcours terminé";
      elements.recommencer.textContent = "Effacer le parcours et recommencer";
    } else if (questionsEnCours) {
      elements.demarrer.textContent = "Questionnaire déjà commencé";
      elements.recommencer.textContent = "Recommencer à zéro";
    } else {
      elements.demarrer.textContent = "Commencer le questionnaire";
      elements.recommencer.textContent = "Recommencer à zéro";
    }
  }

  function sauvegarder() {
    if (!parcours || erreurProgression || parcours.status === "termine") return false;
    try {
      parcours.profile = lireProfilFormulaire();
      parcours = orientation.sauvegarderParcours(parcours, banqueQuestions, series);
      parcoursExiste = true;
      erreurSauvegarde = false;
      mettreAJourActions();
      return true;
    } catch (erreur) {
      erreurSauvegarde = true;
      console.error("Sauvegarde du parcours impossible :", erreur);
      afficherStatut(erreur.message, true);
      mettreAJourActions();
      return false;
    }
  }

  function melanger(tableau) {
    const copie = [...tableau];
    for (let i = copie.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  }

  function initialiserQuestionnaireApi(questionnaire) {
    questionnaireApi = questionnaire;
    modeApi = true;
    series = questionnaire.series;
    elements.profil.hidden = true;
    elements.introDescription.textContent =
      "Ce parcours propose des pistes à explorer, pas une décision d’affectation ni une garantie d’admission. Dans ce mode, quitter la page efface la progression non terminée.";
    elements.noteStockage.textContent =
      "Tes réponses sont envoyées au serveur local uniquement pour le calcul et ne sont pas conservées par l’API. Le résultat reste temporairement dans cet onglet; le profil facultatif et la réponse libre ne sont pas envoyés.";
    elements.serie.replaceChildren(elements.serie.options[0]);
    series.forEach(serie => {
      const option = document.createElement("option");
      option.value = serie.id;
      option.textContent = serie.verification === "a_confirmer"
        ? `${serie.name} — correspondances à confirmer`
        : serie.name;
      elements.serie.appendChild(option);
    });
    elements.serie.value = "";
    afficherStatut("Choisis ta série. Les réponses seront calculées par le serveur local, sans être sauvegardées.");
    mettreAJourActions();
  }

  async function chargerDonnees() {
    try {
      if (window.JeuneAvenirOrientationApi) {
        const questionnaire = await window.JeuneAvenirOrientationApi.chargerQuestionnaire();
        if (questionnaire !== null) {
          initialiserQuestionnaireApi(questionnaire);
          return;
        }
      }
      await chargerDonneesLocales();
    } catch (erreur) {
      console.error("Chargement de l’API d’orientation impossible :", erreur);
      erreurProgression = new Error("Le questionnaire du serveur local n’a pas pu être chargé. Actualise la page pour réessayer.");
      afficherStatut(erreur.message, true);
      mettreAJourActions();
    }
  }

  async function chargerDonneesLocales() {
    try {
      const reponses = await Promise.all([
        fetch("data/questions.json"),
        fetch("data/series_filieres.json")
      ]);
      if (reponses.some(reponse => !reponse.ok)) throw new Error("Les fichiers de référence n’ont pas pu être chargés.");
      const [questions, correspondances] = await Promise.all(reponses.map(reponse => reponse.json()));
      if (!Array.isArray(questions.questions) || questions.questions.length < orientation.nombreQuestions
        || !Array.isArray(correspondances.series) || !correspondances.series.length) {
        throw new Error("Le format de la banque de questions ou des séries est invalide.");
      }
      banqueQuestions = questions.questions;
      series = correspondances.series;
      series.forEach(serie => {
        const option = document.createElement("option");
        option.value = serie.id;
        option.textContent = serie.verification === "a_confirmer"
          ? `${serie.nom} — correspondances à confirmer`
          : serie.nom;
        elements.serie.appendChild(option);
      });

      const lecture = orientation.lireParcours(banqueQuestions, series);
      if (lecture.erreur) {
        erreurProgression = lecture.erreur;
        afficherStatut(`${lecture.erreur.message} Utilise le bouton de reprise à zéro pour la supprimer après confirmation.`, true);
        mettreAJourActions();
        return;
      }
      if (lecture.parcours) {
        parcours = lecture.parcours;
        parcoursExiste = true;
        remplirProfil(parcours.profile);
        if (parcours.status === "termine") {
          afficherStatut("Ce parcours est terminé. Tu peux consulter son résultat ou recommencer après confirmation.");
        } else if (parcours.questionIds.length) {
          afficherStatut("Une progression locale a été retrouvée. Reprends-la ou recommence à zéro.");
        } else {
          afficherStatut("Ton profil de parcours est conservé dans ce navigateur.");
        }
      } else {
        const profilLocal = lireProfilCompteLocal();
        parcours = orientation.creerParcours(profilLocal.profile);
        remplirProfil(profilLocal.profile);
        afficherStatut(profilLocal.note || "Choisis ta série. Les autres repères sont facultatifs.");
      }
      mettreAJourActions();
    } catch (erreur) {
      console.error("Chargement du parcours d’orientation impossible :", erreur);
      erreurProgression = new Error("Le parcours n’a pas pu charger ses données de référence. Actualise la page pour réessayer.");
      afficherStatut(erreurProgression.message, true);
      mettreAJourActions();
    }
  }

  function afficherQuestion() {
    if (modeApi) {
      afficherQuestionApi();
      return;
    }

    const id = parcours.questionIds[parcours.currentIndex];
    const question = banqueQuestions.find(item => item.id === id);
    if (!question) {
      erreurProgression = new Error("La question sauvegardée n’existe plus dans la banque locale.");
      afficherStatut(`${erreurProgression.message} Aucune donnée n’a été effacée.`, true);
      afficherEcran("profil");
      mettreAJourActions();
      return;
    }

    const choix = parcours.answers[id];
    reponseSauvegardee = Number.isInteger(choix);
    elements.suivant.disabled = !reponseSauvegardee;
    elements.precedent.disabled = false;
    elements.precedent.textContent = parcours.currentIndex === 0 ? "Modifier mon profil" : "Précédent";
    elements.titreQuestion.textContent = question.texte;
    elements.progressionTexte.textContent = `Question ${parcours.currentIndex + 1} sur ${orientation.nombreQuestions}`;
    elements.progression.setAttribute("aria-valuemax", String(orientation.nombreQuestions));
    elements.progression.setAttribute("aria-valuenow", String(parcours.currentIndex + 1));
    elements.progression.setAttribute("aria-valuetext", `Question ${parcours.currentIndex + 1} sur ${orientation.nombreQuestions}`);
    elements.progression.innerHTML = parcours.questionIds.map((_, index) => {
      const classe = index < parcours.currentIndex ? "etape-faite" : index === parcours.currentIndex ? "etape-active" : "";
      return `<span class="quiz-etape-point ${classe}" aria-hidden="true"></span>`;
    }).join("");
    elements.reponses.replaceChildren();

    question.reponses.forEach((reponse, index) => {
      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.className = `bouton-reponse${index === choix ? " bouton-reponse-selectionnee" : ""}`;
      bouton.setAttribute("aria-pressed", String(index === choix));
      bouton.textContent = reponse.texte;
      bouton.addEventListener("click", () => {
        try {
          orientation.enregistrerReponse(parcours, id, index, banqueQuestions);
          parcours = orientation.sauvegarderParcours(parcours, banqueQuestions, series);
          parcoursExiste = true;
          reponseSauvegardee = true;
          elements.reponses.querySelectorAll(".bouton-reponse").forEach(option => {
            const selectionnee = option === bouton;
            option.classList.toggle("bouton-reponse-selectionnee", selectionnee);
            option.setAttribute("aria-pressed", String(selectionnee));
          });
          elements.suivant.disabled = false;
          afficherStatut("Réponse enregistrée dans ce navigateur.");
          mettreAJourActions();
        } catch (erreur) {
          console.error("Enregistrement de la réponse impossible :", erreur);
          reponseSauvegardee = false;
          elements.suivant.disabled = true;
          afficherStatut(erreur.message, true);
        }
      });
      elements.reponses.appendChild(bouton);
    });

    elements.suivant.textContent = parcours.currentIndex === orientation.nombreQuestions - 1 ? "Continuer" : "Suivant";
    afficherEcran("questions");
    afficherStatut(reponseSauvegardee ? "Réponse retrouvée dans ce navigateur." : "Choisis une réponse pour continuer.");
  }

  function afficherQuestionApi() {
    const question = questionnaireApi.questions[indexQuestionApi];
    if (!question) {
      afficherStatut("La question demandée n’existe plus dans ce questionnaire. Recommence le parcours.", true);
      afficherEcran("profil");
      return;
    }

    const choix = reponsesApi[question.id];
    reponseSauvegardee = Number.isInteger(choix);
    elements.suivant.disabled = !reponseSauvegardee || envoiResultatApi;
    elements.precedent.disabled = envoiResultatApi;
    elements.precedent.textContent = indexQuestionApi === 0 ? "Choisir une autre série" : "Précédent";
    elements.titreQuestion.textContent = question.text;
    elements.progressionTexte.textContent = `Question ${indexQuestionApi + 1} sur ${questionnaireApi.question_count}`;
    elements.progression.setAttribute("aria-valuemax", String(questionnaireApi.question_count));
    elements.progression.setAttribute("aria-valuenow", String(indexQuestionApi + 1));
    elements.progression.setAttribute("aria-valuetext", `Question ${indexQuestionApi + 1} sur ${questionnaireApi.question_count}`);
    elements.progression.innerHTML = questionnaireApi.questions.map((_, index) => {
      const classe = index < indexQuestionApi ? "etape-faite" : index === indexQuestionApi ? "etape-active" : "";
      return `<span class="quiz-etape-point ${classe}" aria-hidden="true"></span>`;
    }).join("");
    elements.reponses.replaceChildren();

    question.options.forEach((option, index) => {
      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.className = `bouton-reponse${index === choix ? " bouton-reponse-selectionnee" : ""}`;
      bouton.setAttribute("aria-pressed", String(index === choix));
      bouton.textContent = option;
      bouton.addEventListener("click", () => {
        reponsesApi[question.id] = index;
        reponseSauvegardee = true;
        elements.reponses.querySelectorAll(".bouton-reponse").forEach(element => {
          const selectionnee = element === bouton;
          element.classList.toggle("bouton-reponse-selectionnee", selectionnee);
          element.setAttribute("aria-pressed", String(selectionnee));
        });
        elements.suivant.disabled = envoiResultatApi;
        afficherStatut("Réponse gardée en mémoire dans ce parcours; elle n’est pas sauvegardée par le serveur.");
      });
      elements.reponses.appendChild(bouton);
    });

    elements.suivant.textContent = indexQuestionApi === questionnaireApi.question_count - 1
      ? "Calculer mes pistes"
      : "Suivant";
    afficherEcran("questions");
    afficherStatut(reponseSauvegardee ? "Réponse retrouvée dans ce parcours." : "Choisis une réponse pour continuer.");
  }

  function commencer() {
    if (modeApi) {
      commencerQuestionnaireApi();
      return;
    }

    if (erreurProgression || !series.some(serie => serie.id === elements.serie.value)) {
      afficherStatut("Choisis une série pour filtrer les correspondances.", true);
      return;
    }
    if (parcours && parcours.questionIds.length) return;

    parcours = orientation.creerParcours(lireProfilFormulaire());
    parcours.phase = "questions";
    parcours.questionIds = melanger(banqueQuestions).slice(0, orientation.nombreQuestions).map(question => question.id);
    try {
      parcours = orientation.sauvegarderParcours(parcours, banqueQuestions, series);
      parcoursExiste = true;
      afficherQuestion();
    } catch (erreur) {
      console.error("Démarrage du parcours impossible :", erreur);
      afficherStatut(erreur.message, true);
      mettreAJourActions();
    }
  }

  function commencerQuestionnaireApi() {
    if (!questionnaireApi || !series.some(serie => serie.id === elements.serie.value)) {
      afficherStatut("Choisis une série pour calculer tes pistes.", true);
      return;
    }
    if (!parcoursApiDemarre) {
      try {
        window.JeuneAvenirOrientationApi.effacerResultatSession();
      } catch (erreur) {
        afficherStatut(erreur.message, true);
        return;
      }
      reponsesApi = {};
      indexQuestionApi = 0;
      parcoursApiDemarre = true;
    }
    afficherQuestionApi();
  }

  function reprendre() {
    if (!parcours || parcours.status !== "en_cours" || !parcours.questionIds.length) return;
    remplirProfil(parcours.profile);
    if (parcours.phase === "profil") {
      parcours.phase = "questions";
      try {
        parcours = orientation.sauvegarderParcours(parcours, banqueQuestions, series);
      } catch (erreur) {
        console.error("Reprise du parcours après modification du profil impossible :", erreur);
        afficherStatut(erreur.message, true);
        return;
      }
    }
    if (parcours.phase === "ouverte") {
      elements.texteLibre.value = parcours.freeText;
      afficherEcran("ouverte");
      afficherStatut("Ta progression a été reprise.");
      return;
    }
    afficherQuestion();
  }

  function recommencer() {
    const message = erreurProgression
      ? "La sauvegarde illisible et le dernier résultat d’orientation seront supprimés de ce navigateur. Continuer ?"
      : "Le parcours en cours et le dernier résultat d’orientation seront supprimés de ce navigateur. Continuer ?";
    if (!window.confirm(message)) return;
    try {
      orientation.effacerParcours(true);
      erreurProgression = null;
      erreurSauvegarde = false;
      parcoursExiste = false;
      parcours = orientation.creerParcours({});
      remplirProfil({});
      elements.texteLibre.value = "";
      afficherEcran("profil");
      afficherStatut("La progression locale a été effacée. Tu peux commencer un nouveau parcours.");
      mettreAJourActions();
    } catch (erreur) {
      console.error("Réinitialisation du parcours impossible :", erreur);
      afficherStatut(erreur.message, true);
    }
  }

  function revenirQuestionPrecedente() {
    if (modeApi) {
      if (envoiResultatApi) return;
      if (indexQuestionApi > 0) {
        indexQuestionApi -= 1;
        afficherQuestionApi();
      } else {
        afficherEcran("profil");
        mettreAJourActions();
        afficherStatut("Tu peux choisir une autre série avant de reprendre le questionnaire.");
      }
      return;
    }

    if (!parcours) return;
    orientation.revenirEtape(parcours);
    try {
      parcours = orientation.sauvegarderParcours(parcours, banqueQuestions, series);
      if (parcours.phase === "profil") {
        remplirProfil(parcours.profile);
        afficherEcran("profil");
        afficherStatut("Tu peux ajuster les repères avant de continuer.");
      } else {
        afficherQuestion();
      }
    } catch (erreur) {
      console.error("Retour à la question précédente impossible :", erreur);
      afficherStatut(erreur.message, true);
    }
  }

  async function continuerQuestion() {
    if (modeApi) {
      if (!reponseSauvegardee || envoiResultatApi) return;
      if (indexQuestionApi < questionnaireApi.question_count - 1) {
        indexQuestionApi += 1;
        afficherQuestionApi();
        return;
      }

      envoiResultatApi = true;
      elements.suivant.disabled = true;
      elements.precedent.disabled = true;
      afficherStatut("Calcul des pistes par le serveur local…");
      try {
        const resultat = await window.JeuneAvenirOrientationApi.calculerResultat(
          questionnaireApi,
          elements.serie.value,
          reponsesApi
        );
        window.JeuneAvenirOrientationApi.sauvegarderResultatSession(resultat);
        window.location.href = "resultat.html?source=api";
      } catch (erreur) {
        console.error("Calcul des pistes via l’API impossible :", erreur);
        afficherStatut(erreur.message || "Le calcul a échoué. Vérifie ta connexion au serveur local et réessaie.", true);
      } finally {
        envoiResultatApi = false;
        elements.suivant.disabled = !reponseSauvegardee;
        elements.precedent.disabled = false;
      }
      return;
    }

    if (!parcours || !reponseSauvegardee) return;
    try {
      orientation.avancerEtape(parcours);
      parcours = orientation.sauvegarderParcours(parcours, banqueQuestions, series);
      if (parcours.phase === "ouverte") {
        elements.texteLibre.value = parcours.freeText;
        afficherEcran("ouverte");
        afficherStatut("Tu peux ajouter une phrase, ou consulter directement tes pistes.");
      } else {
        afficherQuestion();
      }
    } catch (erreur) {
      console.error("Avancement du parcours impossible :", erreur);
      afficherStatut(erreur.message, true);
    }
  }

  function terminer() {
    if (!parcours || parcours.phase !== "ouverte") return;
    parcours.freeText = elements.texteLibre.value;
    try {
      const resultat = orientation.creerResultat(parcours, banqueQuestions, series);
      const parcoursTermine = {
        ...parcours,
        status: "termine",
        phase: "terminee",
        currentIndex: orientation.nombreQuestions,
        result: resultat
      };
      parcours = orientation.sauvegarderParcours(parcoursTermine, banqueQuestions, series);
      parcoursExiste = true;
      try {
        window.localStorage.setItem(orientation.cleResultat, JSON.stringify(resultat));
      } catch (erreur) {
        console.error("Mise à jour du résultat partagé avec les autres espaces impossible :", erreur);
      }
      window.location.href = "resultat.html";
    } catch (erreur) {
      console.error("Création du résultat d’orientation impossible :", erreur);
      afficherStatut(erreur.message || "Le résultat n’a pas pu être enregistré dans ce navigateur.", true);
    }
  }

  elements.niveau.addEventListener("input", sauvegarder);
  [elements.situation, elements.objectif].forEach(champ => champ.addEventListener("change", sauvegarder));
  elements.serie.addEventListener("change", () => {
    if (modeApi) mettreAJourActions();
    else sauvegarder();
  });
  elements.demarrer.addEventListener("click", commencer);
  elements.reprendre.addEventListener("click", reprendre);
  elements.recommencer.addEventListener("click", recommencer);
  elements.precedent.addEventListener("click", revenirQuestionPrecedente);
  elements.precedentOuverte.addEventListener("click", revenirQuestionPrecedente);
  elements.suivant.addEventListener("click", continuerQuestion);
  elements.texteLibre.addEventListener("input", () => {
    if (!parcours || parcours.phase !== "ouverte") return;
    parcours.freeText = elements.texteLibre.value;
    const sauve = sauvegarder();
    elements.voirResultat.disabled = !sauve;
    if (sauve) afficherStatut("Ta réponse facultative est enregistrée dans ce navigateur.");
  });
  elements.voirResultat.addEventListener("click", terminer);

  return chargerDonnees();
});
