const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(
  path.join(__dirname, "..", "js", "orientation-api.js"),
  "utf8"
);

function creerQuestionnaire() {
  return {
    version: 1,
    question_count: 7,
    bank_size: 18,
    questionnaire_token: "token-test",
    series: [{ id: "a1", name: "A1 — Lettres-Langues", verification: "confirmee" }],
    questions: Array.from({ length: 7 }, (_, index) => ({
      id: `q${index + 1}`,
      text: `Question ${index + 1}`,
      options: ["Option A", "Option B"]
    }))
  };
}

function creerResultat() {
  const piste = {
    id: "gestion-commerce",
    name: "Gestion & Commerce",
    description: "Description",
    duration: "2 ans",
    main_subjects: ["Gestion"],
    outcomes: ["Comptabilité"],
    verification: "non_renseignee",
    missing_data: ["institutions", "sources", "verification"]
  };
  return {
    version: 1,
    type: "piste_exploratoire",
    stored: false,
    series: { id: "a1", name: "A1 — Lettres-Langues", verification: "confirmee" },
    main_tracks: [piste],
    alternatives: [],
    answers: Array.from({ length: 7 }, (_, index) => ({
      question_id: `q${index + 1}`,
      question: `Question ${index + 1}`,
      answer: "Option A"
    })),
    notice: "Piste exploratoire; aucune réponse n’est conservée par l’API."
  };
}

function chargerApi(fetchFn) {
  const stockageSession = {};
  const window = {
    localStorage: {
      getItem() { throw new Error("localStorage ne doit pas être lu"); },
      setItem() { throw new Error("localStorage ne doit pas être écrit"); }
    },
    sessionStorage: {
      getItem(key) { return Object.prototype.hasOwnProperty.call(stockageSession, key) ? stockageSession[key] : null; },
      setItem(key, value) { stockageSession[key] = value; },
      removeItem(key) { delete stockageSession[key]; }
    }
  };
  const context = vm.createContext({ window, fetch: fetchFn, console: { error() {} }, Date, Set, Object });
  vm.runInContext(source, context, { filename: "js/orientation-api.js" });
  return { api: window.JeuneAvenirOrientationApi, stockageSession };
}

test("un 404 du questionnaire signifie que le pilote statique doit garder son parcours local", async () => {
  const calls = [];
  const { api } = chargerApi(async (url, options) => {
    calls.push({ url, options });
    return { status: 404, ok: false };
  });

  assert.equal(await api.chargerQuestionnaire(), null);
  assert.equal(calls[0].url, "/api/v1/orientation/questionnaire");
  assert.equal(calls[0].options.credentials, "same-origin");
  assert.equal(calls[0].options.cache, "no-store");
});

test("le questionnaire serveur est validé sans exposer de pondérations", async () => {
  const questionnaire = creerQuestionnaire();
  const { api } = chargerApi(async () => ({
    status: 200,
    ok: true,
    json: async () => ({ data: questionnaire })
  }));

  const resultat = await api.chargerQuestionnaire();

  assert.equal(resultat.questions.length, 7);
  assert.equal(resultat.questionnaire_token, "token-test");
  assert.equal("score" in resultat.questions[0], false);
  assert.equal("riasec" in resultat.questions[0], false);
});

test("une erreur serveur du questionnaire n'est pas masquée par un repli local", async () => {
  const { api } = chargerApi(async () => ({ status: 503, ok: false }));

  await assert.rejects(api.chargerQuestionnaire(), /HTTP 503/);
});

test("un JSON mal formé de l'API est présenté comme une erreur explicite", async () => {
  const { api } = chargerApi(async () => ({
    status: 200,
    ok: true,
    json: async () => { throw new Error("invalid json"); }
  }));

  await assert.rejects(api.chargerQuestionnaire(), /questionnaire illisible/);
});

test("le résultat envoie à l'API uniquement la série, le jeton et les sept choix", async () => {
  const questionnaire = creerQuestionnaire();
  let request;
  const { api } = chargerApi(async (url, options) => {
    request = { url, options };
    return {
      status: 200,
      ok: true,
      json: async () => ({ data: creerResultat() })
    };
  });
  const reponses = Object.fromEntries(questionnaire.questions.map((question, index) => [
    question.id,
    index % 2
  ]));

  const resultat = await api.calculerResultat(questionnaire, "a1", reponses);
  const body = JSON.parse(request.options.body);

  assert.equal(request.url, "/api/v1/orientation/results");
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.cache, "no-store");
  assert.deepEqual(Object.keys(body).sort(), ["answers", "questionnaire_token", "serie_id"]);
  assert.deepEqual(body.answers, questionnaire.questions.map((question, index) => ({
    question_id: question.id,
    option_index: index % 2
  })));
  assert.equal(resultat.stored, false);
  assert.equal(resultat.answers.length, 7);
});

test("les erreurs de validation du calcul sont affichées au lieu d'être cachées", async () => {
  const questionnaire = creerQuestionnaire();
  const { api } = chargerApi(async () => ({
    status: 422,
    ok: false,
    json: async () => ({ errors: { answers: ["Choisis une réponse valide."] } })
  }));

  await assert.rejects(
    api.calculerResultat(questionnaire, "a1", Object.fromEntries(
      questionnaire.questions.map(question => [question.id, 0])
    )),
    /Choisis une réponse valide/
  );
});

test("le résultat est conservé uniquement dans sessionStorage et peut être relu dans cet onglet", () => {
  const { api, stockageSession } = chargerApi(async () => {});

  const sauvegarde = api.sauvegarderResultatSession(creerResultat());
  const relu = api.lireResultatSession();

  assert.equal(stockageSession[api.cleResultatSession] !== undefined, true);
  assert.equal(sauvegarde.data.stored, false);
  assert.equal(relu.data.answers.length, 7);
  assert.equal(relu.data.series.id, "a1");
  assert.equal(api.lireResultatSession().created_at, sauvegarde.created_at);
});
