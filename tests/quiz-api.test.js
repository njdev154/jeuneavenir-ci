const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const orientationSource = fs.readFileSync(path.join(root, "js", "orientation-state.js"), "utf8");
const apiSource = fs.readFileSync(path.join(root, "js", "orientation-api.js"), "utf8");
const quizSource = fs.readFileSync(path.join(root, "js", "quiz.js"), "utf8");
const localQuestions = JSON.parse(fs.readFileSync(path.join(root, "data", "questions.json"), "utf8"));
const localSeries = JSON.parse(fs.readFileSync(path.join(root, "data", "series_filieres.json"), "utf8"));

function element(id, hidden = false) {
  const classes = new Set();
  return {
    id,
    value: "",
    textContent: "",
    innerHTML: "",
    hidden,
    disabled: false,
    children: [],
    attributes: {},
    listeners: {},
    classList: {
      toggle(name, enabled) {
        if (enabled) classes.add(name);
        else classes.delete(name);
      }
    },
    addEventListener(type, callback) { this.listeners[type] = callback; },
    appendChild(child) { this.children.push(child); return child; },
    replaceChildren(...children) { this.children = children; },
    querySelectorAll(selector) { return selector === ".bouton-reponse" ? this.children : []; },
    querySelector(selector) {
      if (selector === "h1" || selector === "h2") return { focus() {} };
      return null;
    },
    setAttribute(name, value) { this.attributes[name] = value; },
    focus() {}
  };
}

function creerPage(fetchFn, { refuserLocalStorage = false } = {}) {
  const ids = [
    "ecran-intro", "quiz-niveau", "quiz-situation", "quiz-objectif", "quiz-serie",
    "ecran-question", "ecran-ouverte", "quiz-question-texte", "quiz-reponses",
    "quiz-etat", "quiz-etapes-texte", "quiz-etapes", "quiz-texte-libre",
    "bouton-demarrer", "bouton-reprendre", "bouton-recommencer", "quiz-dernier-resultat",
    "bouton-precedent", "bouton-suivant", "bouton-precedent-ouverte", "bouton-voir-resultat",
    "quiz-intro-description"
  ];
  const elements = Object.fromEntries(ids.map(id => [
    id,
    element(id, ["ecran-question", "ecran-ouverte", "bouton-reprendre", "bouton-recommencer", "quiz-dernier-resultat"].includes(id))
  ]));
  const placeholder = element("option-serie-vide");
  placeholder.value = "";
  elements["quiz-serie"].children.push(placeholder);
  Object.defineProperty(elements["quiz-serie"], "options", {
    get() { return this.children; }
  });

  const profil = element("orientation-profil");
  const noteStockage = element("orientation-stockage-note");
  noteStockage.textContent =
    "Ton profil, tes réponses et ton texte facultatif restent uniquement dans ce navigateur. Ils ne sont pas envoyés ni synchronisés.";
  const callbacks = {};
  const document = {
    addEventListener(type, callback) { callbacks[type] = callback; },
    getElementById(id) { return elements[id]; },
    querySelector(selector) {
      if (selector === ".orientation-profil") return profil;
      if (selector === ".orientation-stockage-note") return noteStockage;
      return null;
    },
    createElement() { return element("created"); }
  };
  const localData = {};
  let localStorageReads = 0;
  let localStorageWrites = 0;
  const localStorage = {
    getItem(key) {
      localStorageReads += 1;
      if (refuserLocalStorage) throw new Error("localStorage should not be read in API mode");
      return Object.prototype.hasOwnProperty.call(localData, key) ? localData[key] : null;
    },
    setItem(key, value) {
      localStorageWrites += 1;
      if (refuserLocalStorage) throw new Error("localStorage should not be written in API mode");
      localData[key] = value;
    },
    removeItem(key) { delete localData[key]; }
  };
  const sessionData = {};
  const sessionStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(sessionData, key) ? sessionData[key] : null; },
    setItem(key, value) { sessionData[key] = value; },
    removeItem(key) { delete sessionData[key]; }
  };
  const window = {
    localStorage,
    sessionStorage,
    location: { href: "", search: "" },
    confirm: () => true
  };
  const context = vm.createContext({
    document,
    window,
    localStorage,
    sessionStorage,
    fetch: fetchFn,
    console: { error() {} },
    Date,
    Map,
    Set
  });
  vm.runInContext(orientationSource, context, { filename: "js/orientation-state.js" });
  vm.runInContext(apiSource, context, { filename: "js/orientation-api.js" });
  vm.runInContext(quizSource, context, { filename: "js/quiz.js" });
  return {
    callbacks,
    elements,
    window,
    profil,
    noteStockage,
    localData,
    sessionData,
    get localStorageReads() { return localStorageReads; },
    get localStorageWrites() { return localStorageWrites; }
  };
}

function questionnaireApi() {
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

function resultatApi() {
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
    notice: "Piste exploratoire."
  };
}

test("le quiz Laravel envoie sept réponses sans lire ni écrire le localStorage", async () => {
  const questionnaire = questionnaireApi();
  const requests = [];
  const page = creerPage(async (url, options) => {
    requests.push({ url, options });
    if (url.endsWith("/questionnaire")) {
      return { status: 200, ok: true, json: async () => ({ data: questionnaire }) };
    }
    return { status: 200, ok: true, json: async () => ({ data: resultatApi() }) };
  }, { refuserLocalStorage: true });

  await page.callbacks.DOMContentLoaded();
  assert.equal(page.profil.hidden, true);
  assert.match(page.noteStockage.textContent, /ne sont pas conservées par l’API/);
  page.elements["quiz-serie"].value = "a1";
  await page.elements["quiz-serie"].listeners.change();
  await page.elements["bouton-demarrer"].listeners.click();

  for (let index = 0; index < questionnaire.question_count; index += 1) {
    await page.elements["quiz-reponses"].children[0].listeners.click();
    await page.elements["bouton-suivant"].listeners.click();
  }

  const resultRequest = requests.find(request => request.url.endsWith("/results"));
  const body = JSON.parse(resultRequest.options.body);
  assert.equal(page.window.location.href, "resultat.html?source=api");
  assert.equal(page.localStorageReads, 0);
  assert.equal(page.localStorageWrites, 0);
  assert.deepEqual(Object.keys(body).sort(), ["answers", "questionnaire_token", "serie_id"]);
  assert.equal(body.answers.length, 7);
  assert.equal(Object.keys(page.sessionData).length, 1);
});

test("un site sans API conserve le parcours local et sa reprise dans localStorage", async () => {
  const page = creerPage(async url => {
    if (url === "/api/v1/orientation/questionnaire") return { status: 404, ok: false };
    const data = url === "data/questions.json" ? localQuestions : localSeries;
    return { status: 200, ok: true, json: async () => data };
  });

  await page.callbacks.DOMContentLoaded();

  assert.equal(page.profil.hidden, false);
  assert.match(page.noteStockage.textContent, /restent uniquement dans ce navigateur/);
  page.elements["quiz-serie"].value = "a1";
  await page.elements["quiz-serie"].listeners.change();
  await page.elements["bouton-demarrer"].listeners.click();

  assert.match(page.elements["quiz-question-texte"].textContent, /.+/);
  assert.equal(JSON.parse(page.localData.jac_orientation_parcours_v1).phase, "questions");
});
