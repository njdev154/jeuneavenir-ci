(() => {
  const RESULT_KEY = "jac_orientation_api_resultat_session";
  const QUESTION_COUNT = 7;

  function estObjet(valeur) {
    return valeur !== null && typeof valeur === "object" && !Array.isArray(valeur);
  }

  function validerQuestionnaire(questionnaire) {
    if (
      !estObjet(questionnaire)
      || questionnaire.version !== 1
      || questionnaire.question_count !== QUESTION_COUNT
      || typeof questionnaire.questionnaire_token !== "string"
      || questionnaire.questionnaire_token.length === 0
      || questionnaire.questionnaire_token.length > 8192
      || !Array.isArray(questionnaire.series)
      || questionnaire.series.length === 0
      || !Array.isArray(questionnaire.questions)
      || questionnaire.questions.length !== QUESTION_COUNT
    ) {
      throw new Error("Le format du questionnaire envoyé par l’API n’est pas reconnu.");
    }

    const seriesValides = questionnaire.series.every(serie =>
      estObjet(serie)
      && typeof serie.id === "string"
      && serie.id.length > 0
      && typeof serie.name === "string"
      && serie.name.length > 0
      && typeof serie.verification === "string"
    );
    const questionsValides = questionnaire.questions.every(question =>
      estObjet(question)
      && typeof question.id === "string"
      && question.id.length > 0
      && typeof question.text === "string"
      && Array.isArray(question.options)
      && question.options.length >= 2
      && question.options.every(option => typeof option === "string" && option.length > 0)
    );
    const idsQuestions = questionnaire.questions.map(question => question.id);
    const idsSeries = questionnaire.series.map(serie => serie.id);

    if (
      !seriesValides
      || !questionsValides
      || new Set(idsQuestions).size !== QUESTION_COUNT
      || new Set(idsSeries).size !== idsSeries.length
    ) {
      throw new Error("Le questionnaire reçu contient des séries ou des questions invalides.");
    }

    return questionnaire;
  }

  function validerPiste(piste) {
    return estObjet(piste)
      && typeof piste.id === "string"
      && typeof piste.name === "string"
      && (piste.description === null || typeof piste.description === "string")
      && (piste.duration === null || typeof piste.duration === "string")
      && Array.isArray(piste.main_subjects)
      && piste.main_subjects.every(item => typeof item === "string")
      && Array.isArray(piste.outcomes)
      && piste.outcomes.every(item => typeof item === "string")
      && typeof piste.verification === "string"
      && Array.isArray(piste.missing_data)
      && piste.missing_data.every(item => typeof item === "string");
  }

  function validerResultat(resultat) {
    if (
      !estObjet(resultat)
      || resultat.version !== 1
      || resultat.type !== "piste_exploratoire"
      || resultat.stored !== false
      || !estObjet(resultat.series)
      || typeof resultat.series.id !== "string"
      || typeof resultat.series.name !== "string"
      || typeof resultat.series.verification !== "string"
      || !Array.isArray(resultat.main_tracks)
      || resultat.main_tracks.length === 0
      || !resultat.main_tracks.every(validerPiste)
      || !Array.isArray(resultat.alternatives)
      || !resultat.alternatives.every(validerPiste)
      || !Array.isArray(resultat.answers)
      || resultat.answers.length !== QUESTION_COUNT
      || !resultat.answers.every(reponse =>
        estObjet(reponse)
        && typeof reponse.question_id === "string"
        && typeof reponse.question === "string"
        && typeof reponse.answer === "string"
      )
      || typeof resultat.notice !== "string"
    ) {
      throw new Error("Le résultat renvoyé par l’API n’a pas le format attendu.");
    }

    return resultat;
  }

  function premiereErreur(payload) {
    if (estObjet(payload) && estObjet(payload.errors)) {
      const messages = Object.values(payload.errors).flat();
      if (typeof messages[0] === "string" && messages[0]) return messages[0];
    }
    if (estObjet(payload) && typeof payload.message === "string" && payload.message) {
      return payload.message;
    }
    return "";
  }

  async function lireJson(response, message) {
    try {
      return await response.json();
    } catch (erreur) {
      console.error("Réponse JSON de l’API orientation invalide :", erreur);
      throw new Error(message);
    }
  }

  async function chargerQuestionnaire() {
    const response = await fetch("/api/v1/orientation/questionnaire", {
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Accept": "application/json" }
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Le questionnaire n’a pas pu être chargé (HTTP ${response.status}).`);
    }

    const payload = await lireJson(response, "Le serveur local a renvoyé un questionnaire illisible.");
    return validerQuestionnaire(payload?.data);
  }

  async function calculerResultat(questionnaire, serieId, reponses) {
    const answers = questionnaire.questions.map(question => ({
      question_id: question.id,
      option_index: reponses[question.id]
    }));

    if (
      answers.some(answer => !Number.isInteger(answer.option_index) || answer.option_index < 0)
      || !questionnaire.series.some(serie => serie.id === serieId)
    ) {
      throw new Error("Choisis une réponse pour chaque question et une série valide.");
    }

    const response = await fetch("/api/v1/orientation/results", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serie_id: serieId,
        questionnaire_token: questionnaire.questionnaire_token,
        answers
      })
    });
    const payload = await lireJson(response, `La réponse du serveur local est illisible (HTTP ${response.status}).`);
    if (!response.ok) {
      throw new Error(premiereErreur(payload) || `Le calcul des pistes a échoué (HTTP ${response.status}).`);
    }

    return validerResultat(payload?.data);
  }

  function sauvegarderResultatSession(resultat) {
    const enveloppe = {
      version: 1,
      created_at: new Date().toISOString(),
      data: validerResultat(resultat)
    };

    try {
      window.sessionStorage.setItem(RESULT_KEY, JSON.stringify(enveloppe));
    } catch (erreur) {
      console.error("Enregistrement temporaire du résultat impossible :", erreur);
      throw new Error("Le résultat n’a pas pu être gardé dans cet onglet.");
    }

    return enveloppe;
  }

  function lireResultatSession() {
    let valeur;
    try {
      valeur = window.sessionStorage.getItem(RESULT_KEY);
    } catch (erreur) {
      console.error("Lecture du résultat temporaire impossible :", erreur);
      throw new Error("Le résultat temporaire de cet onglet ne peut pas être lu.");
    }
    if (valeur === null) return null;

    let enveloppe;
    try {
      enveloppe = JSON.parse(valeur);
    } catch (erreur) {
      console.error("Résultat temporaire illisible :", erreur);
      throw new Error("Le résultat temporaire de cet onglet est illisible.");
    }
    if (
      !estObjet(enveloppe)
      || enveloppe.version !== 1
      || typeof enveloppe.created_at !== "string"
    ) {
      throw new Error("La sauvegarde temporaire du résultat n’est pas reconnue.");
    }

    return { ...enveloppe, data: validerResultat(enveloppe.data) };
  }

  function effacerResultatSession() {
    try {
      window.sessionStorage.removeItem(RESULT_KEY);
    } catch (erreur) {
      console.error("Suppression du résultat temporaire impossible :", erreur);
      throw new Error("L’ancien résultat de cet onglet n’a pas pu être supprimé.");
    }
  }

  window.JeuneAvenirOrientationApi = {
    cleResultatSession: RESULT_KEY,
    chargerQuestionnaire,
    calculerResultat,
    sauvegarderResultatSession,
    lireResultatSession,
    effacerResultatSession
  };
})();
