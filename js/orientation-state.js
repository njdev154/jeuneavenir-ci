(() => {
  const CLE_PARCOURS = "jac_orientation_parcours_v1";
  const CLE_RESULTAT = "jac_dernier_resultat_quiz";
  const VERSION_PARCOURS = 1;
  const NOMBRE_QUESTIONS = 7;
  const LETTRES_RIASEC = ["R", "I", "A", "S", "E", "C"];
  const SITUATIONS = ["", "lyceen", "etudiant", "jeune-diplome", "autre"];
  const OBJECTIFS = ["", "premiere-orientation", "reorientation", "explorer", "autre"];
  const MOTS_CLES_RIASEC = {
    R: ["réparer", "construire", "fabriquer", "bricoler", "manuel", "terrain", "technique", "machine", "chantier"],
    I: ["comprendre", "analyser", "chercher", "résoudre", "logique", "science", "recherche", "calcul", "expérimenter"],
    A: ["créer", "dessiner", "inventer", "imaginer", "art", "design", "musique", "écrire", "original"],
    S: ["aider", "accompagner", "enseigner", "soigner", "écouter", "conseiller", "soutenir", "transmettre"],
    E: ["diriger", "vendre", "entreprendre", "négocier", "convaincre", "manager", "business", "gérer une équipe", "leader"],
    C: ["organiser", "planifier", "gérer", "classer", "rigueur", "administratif", "structurer", "méthode"]
  };

  function texte(valeur, limite = 240) {
    return typeof valeur === "string" ? valeur.trim().slice(0, limite) : "";
  }

  function normaliserProfil(profil = {}) {
    const source = profil && typeof profil === "object" && !Array.isArray(profil) ? profil : {};
    return {
      niveau: texte(source.niveau, 160),
      situation: texte(source.situation, 64),
      serie: texte(source.serie, 64),
      objectif: texte(source.objectif, 64)
    };
  }

  function creerParcours(profil = {}) {
    return {
      schemaVersion: VERSION_PARCOURS,
      status: "en_cours",
      phase: "profil",
      currentIndex: 0,
      profile: normaliserProfil(profil),
      questionIds: [],
      answers: {},
      freeText: "",
      updatedAt: new Date().toISOString()
    };
  }

  function validerParcours(parcours, questions, series) {
    if (!parcours || typeof parcours !== "object" || Array.isArray(parcours)) {
      throw new Error("La progression locale n’a pas le format attendu.");
    }
    if (parcours.schemaVersion !== VERSION_PARCOURS) {
      throw new Error("La version de cette progression n’est pas prise en charge.");
    }
    if (!["en_cours", "termine"].includes(parcours.status)) {
      throw new Error("Le statut de cette progression est invalide.");
    }
    if (!["profil", "questions", "ouverte", "terminee"].includes(parcours.phase)) {
      throw new Error("L’étape enregistrée de cette progression est invalide.");
    }
    if (!Number.isInteger(parcours.currentIndex) || parcours.currentIndex < 0 || parcours.currentIndex > NOMBRE_QUESTIONS) {
      throw new Error("La position enregistrée dans le questionnaire est invalide.");
    }

    const profil = normaliserProfil(parcours.profile);
    if (!SITUATIONS.includes(profil.situation) || !OBJECTIFS.includes(profil.objectif)) {
      throw new Error("Un repère de situation ou d’objectif n’est pas reconnu.");
    }
    if (profil.serie && !series.some(item => item && item.id === profil.serie)) {
      throw new Error("La série enregistrée n’existe plus dans le référentiel local.");
    }
    if (typeof parcours.freeText !== "string") {
      throw new Error("La réponse libre enregistrée n’est pas lisible.");
    }

    const idsQuestions = Array.isArray(parcours.questionIds) ? parcours.questionIds : null;
    const reponses = parcours.answers;
    if (!idsQuestions || !reponses || typeof reponses !== "object" || Array.isArray(reponses)) {
      throw new Error("Les questions ou réponses enregistrées sont incomplètes.");
    }

    const brouillonProfil = parcours.phase === "profil" && idsQuestions.length === 0;
    if (brouillonProfil) {
      if (Object.keys(reponses).length !== 0 || parcours.status !== "en_cours" || parcours.currentIndex !== 0) {
        throw new Error("Le brouillon du profil contient une progression incohérente.");
      }
    } else {
      if (idsQuestions.length !== NOMBRE_QUESTIONS || new Set(idsQuestions).size !== NOMBRE_QUESTIONS) {
        throw new Error("La liste des questions enregistrées est incomplète ou contient des doublons.");
      }
      const questionsParId = new Map(questions.map(question => [question.id, question]));
      idsQuestions.forEach(id => {
        if (!questionsParId.has(id)) throw new Error("Une question enregistrée n’existe plus dans la banque locale.");
      });

      Object.entries(reponses).forEach(([id, index]) => {
        const question = questionsParId.get(id);
        if (!idsQuestions.includes(id) || !question || !Number.isInteger(index)
          || index < 0 || index >= question.reponses.length) {
          throw new Error("Une réponse enregistrée ne correspond pas à la banque locale.");
        }
      });

      if (["profil", "questions"].includes(parcours.phase)
        && (parcours.status !== "en_cours" || parcours.currentIndex >= NOMBRE_QUESTIONS)) {
        throw new Error("La position des questions enregistrées est incohérente.");
      }
      if (parcours.phase === "ouverte"
        && (parcours.status !== "en_cours" || parcours.currentIndex !== NOMBRE_QUESTIONS
          || idsQuestions.some(id => !Object.prototype.hasOwnProperty.call(reponses, id)))) {
        throw new Error("La dernière étape ne peut pas être reprise avec des réponses manquantes.");
      }
      if (parcours.phase === "terminee"
        && (parcours.status !== "termine" || idsQuestions.some(id => !Object.prototype.hasOwnProperty.call(reponses, id))
          || !parcours.result || typeof parcours.result !== "object")) {
        throw new Error("Le résultat final enregistré est incomplet.");
      }
      if (parcours.status === "termine" && parcours.phase !== "terminee") {
        throw new Error("Le statut final et l’étape enregistrée ne correspondent pas.");
      }
    }

    return {
      ...parcours,
      profile: profil,
      questionIds: [...idsQuestions],
      answers: { ...reponses },
      freeText: parcours.freeText
    };
  }

  function lireParcours(questions, series) {
    let valeur;
    try {
      valeur = window.localStorage.getItem(CLE_PARCOURS);
    } catch (erreur) {
      console.error("Lecture de la progression d’orientation impossible :", erreur);
      return { parcours: null, erreur: new Error("La progression locale ne peut pas être lue dans ce navigateur.") };
    }
    if (valeur === null) return { parcours: null, erreur: null };
    try {
      return { parcours: validerParcours(JSON.parse(valeur), questions, series), erreur: null };
    } catch (erreur) {
      console.error("Progression d’orientation illisible :", erreur);
      return { parcours: null, erreur: new Error(`${erreur.message} La sauvegarde n’a pas été modifiée.`) };
    }
  }

  function sauvegarderParcours(parcours, questions, series) {
    const valide = validerParcours(parcours, questions, series);
    valide.updatedAt = new Date().toISOString();
    try {
      window.localStorage.setItem(CLE_PARCOURS, JSON.stringify(valide));
    } catch (erreur) {
      console.error("Enregistrement de la progression d’orientation impossible :", erreur);
      throw new Error("La progression n’a pas pu être enregistrée dans ce navigateur.");
    }
    return valide;
  }

  function effacerParcours(effacerResultat = false) {
    try {
      window.localStorage.removeItem(CLE_PARCOURS);
      if (effacerResultat) window.localStorage.removeItem(CLE_RESULTAT);
    } catch (erreur) {
      console.error("Suppression de la progression d’orientation impossible :", erreur);
      throw new Error("La sauvegarde n’a pas pu être effacée dans ce navigateur.");
    }
  }

  function enregistrerReponse(parcours, questionId, index, questions) {
    const question = questions.find(item => item.id === questionId);
    if (!question || !Number.isInteger(index) || index < 0 || index >= question.reponses.length) {
      throw new Error("Cette réponse ne correspond pas à la question affichée.");
    }
    parcours.answers[questionId] = index;
    return parcours;
  }

  function revenirEtape(parcours) {
    if (parcours.phase === "ouverte") {
      parcours.phase = "questions";
      parcours.currentIndex = NOMBRE_QUESTIONS - 1;
    } else if (parcours.phase === "questions" && parcours.currentIndex > 0) {
      parcours.currentIndex -= 1;
    } else if (parcours.phase === "questions") {
      parcours.phase = "profil";
      parcours.currentIndex = 0;
    }
    return parcours;
  }

  function avancerEtape(parcours) {
    if (parcours.phase !== "questions") throw new Error("Aucune question à valider à cette étape.");
    const questionId = parcours.questionIds[parcours.currentIndex];
    if (!Object.prototype.hasOwnProperty.call(parcours.answers, questionId)) {
      throw new Error("Choisis une réponse avant de continuer.");
    }
    if (parcours.currentIndex < NOMBRE_QUESTIONS - 1) {
      parcours.currentIndex += 1;
    } else {
      parcours.phase = "ouverte";
      parcours.currentIndex = NOMBRE_QUESTIONS;
    }
    return parcours;
  }

  function calculerTexteLibre(texteLibre) {
    const points = Object.fromEntries(LETTRES_RIASEC.map(lettre => [lettre, 0]));
    const texteNormalise = texteLibre.toLowerCase();
    Object.entries(MOTS_CLES_RIASEC).forEach(([lettre, mots]) => {
      mots.forEach(mot => {
        if (texteNormalise.includes(mot)) points[lettre] += 2;
      });
    });
    return points;
  }

  function creerResultat(parcours, questions, series) {
    const valide = validerParcours(parcours, questions, series);
    if (valide.phase !== "ouverte" || !valide.profile.serie) {
      throw new Error("Le profil ou le questionnaire n’est pas terminé.");
    }
    const donneesSerie = series.find(item => item.id === valide.profile.serie);
    if (!donneesSerie) throw new Error("Aucune correspondance de série n’est disponible.");

    const scores = Object.fromEntries(LETTRES_RIASEC.map(lettre => [lettre, 0]));
    const questionsParId = new Map(questions.map(question => [question.id, question]));
    const reponses = valide.questionIds.map(id => {
      const question = questionsParId.get(id);
      const indexReponse = valide.answers[id];
      const reponse = question.reponses[indexReponse];
      Object.entries(reponse.riasec).forEach(([lettre, points]) => {
        if (Object.prototype.hasOwnProperty.call(scores, lettre) && Number.isFinite(points)) scores[lettre] += points;
      });
      return { questionId: id, question: question.texte, reponse: reponse.texte };
    });

    if (valide.freeText.trim()) {
      const pointsTexte = calculerTexteLibre(valide.freeText);
      LETTRES_RIASEC.forEach(lettre => { scores[lettre] += pointsTexte[lettre]; });
    }

    const lettresTriees = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([lettre]) => lettre);
    return {
      schemaVersion: VERSION_PARCOURS,
      codeInterne: lettresTriees.slice(0, 3).join(""),
      scoresRiasec: scores,
      serieChoisie: valide.profile.serie,
      filieresAccessibles: [...donneesSerie.filieres_possibles],
      verificationSerie: donneesSerie.verification,
      date: new Date().toISOString(),
      profil: { ...valide.profile },
      reponses,
      texteLibre: valide.freeText
    };
  }

  function classerFilieres(resultat, series, filieres) {
    const serie = series.find(item => item && item.id === resultat.serieChoisie);
    if (!serie || !Array.isArray(serie.filieres_possibles)) {
      throw new Error("Les correspondances de cette série ne sont pas disponibles.");
    }
    const codes = typeof resultat.codeInterne === "string" ? resultat.codeInterne.split("") : [];
    if (!codes.length || codes.some(code => !LETTRES_RIASEC.includes(code))) {
      throw new Error("Le résultat ne contient pas de code interne exploitable.");
    }

    const eligible = filieres.filter(filiere => serie.filieres_possibles.includes(filiere.id));
    const classees = eligible.map(filiere => ({
      filiere,
      correspondance: codes.filter(code => String(filiere.code_holland || "").includes(code)).length
    })).sort((a, b) => b.correspondance - a.correspondance);
    const meilleur = classees[0] ? classees[0].correspondance : -1;
    const principales = classees.filter(item => item.correspondance === meilleur).map(item => item.filiere);
    const idsPrincipales = new Set(principales.map(filiere => filiere.id));
    return {
      principales,
      alternatives: eligible.filter(filiere => !idsPrincipales.has(filiere.id)),
      verificationSerie: serie.verification
    };
  }

  window.JeuneAvenirOrientation = {
    cleParcours: CLE_PARCOURS,
    cleResultat: CLE_RESULTAT,
    nombreQuestions: NOMBRE_QUESTIONS,
    normaliserProfil,
    creerParcours,
    validerParcours,
    lireParcours,
    sauvegarderParcours,
    effacerParcours,
    enregistrerReponse,
    revenirEtape,
    avancerEtape,
    creerResultat,
    classerFilieres
  };
})();
