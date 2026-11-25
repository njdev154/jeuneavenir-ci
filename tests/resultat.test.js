const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const racine = path.join(__dirname, "..");
const sourceOrientation = fs.readFileSync(path.join(racine, "js", "orientation-state.js"), "utf8");
const sourceOrientationApi = fs.readFileSync(path.join(racine, "js", "orientation-api.js"), "utf8");
const sourceResultat = fs.readFileSync(path.join(racine, "js", "resultat.js"), "utf8");
const questions = JSON.parse(fs.readFileSync(path.join(racine, "data", "questions.json"), "utf8")).questions;
const series = JSON.parse(fs.readFileSync(path.join(racine, "data", "series_filieres.json"), "utf8")).series;
const catalogueFilieres = JSON.parse(fs.readFileSync(path.join(racine, "data", "filieres.json"), "utf8"));
const catalogueEcoles = JSON.parse(fs.readFileSync(path.join(racine, "data", "ecoles.json"), "utf8"));

function creerPage(stockage = {}, donnees = {
  "data/filieres.json": catalogueFilieres,
  "data/series_filieres.json": { series },
  "data/ecoles.json": catalogueEcoles
}, search = "") {
  const ids = [
    "bloc-pas-de-resultat", "bloc-resultat", "bloc-erreur-resultat", "message-erreur-resultat",
    "resultat-etiquette", "resultat-titre", "resultat-description", "resultat-synthese",
    "resultat-liste-filieres", "resultat-alternatives", "resultat-reponses", "resultat-date"
  ];
  const elements = Object.fromEntries(ids.map(id => [id, {
    hidden: id.startsWith("bloc-"),
    textContent: "",
    innerHTML: "",
    children: [],
    appendChild(child) { this.children.push(child); },
    querySelectorAll() { return []; }
  }]));
  const document = {
    addEventListener(type, callback) { this.ready = callback; },
    getElementById(id) { return elements[id]; },
    querySelectorAll() { return []; },
    createElement() { return { className: "", textContent: "" }; }
  };
  let lecturesStockage = 0;
  const localStorage = {
    getItem(key) {
      lecturesStockage += 1;
      return Object.prototype.hasOwnProperty.call(stockage, key) ? stockage[key] : null;
    },
    setItem(key, value) { stockage[key] = value; }
  };
  const stockageSession = {};
  const sessionStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(stockageSession, key) ? stockageSession[key] : null; },
    setItem(key, value) { stockageSession[key] = value; },
    removeItem(key) { delete stockageSession[key]; }
  };
  const window = { localStorage, sessionStorage, location: { search } };
  const context = vm.createContext({
    document,
    window,
    localStorage,
    sessionStorage,
    console: { error() {} },
    URL,
    URLSearchParams,
    Date,
    fetch: async url => ({
      ok: Object.prototype.hasOwnProperty.call(donnees, url),
      json: async () => donnees[url]
    })
  });
  vm.runInContext(sourceOrientation, context, { filename: "js/orientation-state.js" });
  vm.runInContext(sourceOrientationApi, context, { filename: "js/orientation-api.js" });
  vm.runInContext(sourceResultat, context, { filename: "js/resultat.js" });
  return { context, elements, stockage, stockageSession, get lecturesStockage() { return lecturesStockage; } };
}

function creerResultat(api, profil = {}) {
  const parcours = api.creerParcours({ serie: "c", ...profil });
  parcours.phase = "questions";
  parcours.questionIds = questions.slice(0, api.nombreQuestions).map(question => question.id);
  parcours.questionIds.forEach((id, index) => { parcours.answers[id] = index % questions.find(item => item.id === id).reponses.length; });
  for (let index = 0; index < api.nombreQuestions; index += 1) api.avancerEtape(parcours);
  return api.creerResultat(parcours, questions, series);
}

test("un résultat absent affiche un état vide sans charger les catalogues", async () => {
  const page = creerPage();
  await page.context.document.ready();
  assert.equal(page.elements["bloc-pas-de-resultat"].hidden, false);
  assert.equal(page.elements["bloc-resultat"].hidden, true);
});

test("un résultat valide expose profil, pistes, alternatives et réponses sans fuite HTML", async () => {
  const page = creerPage();
  const resultat = creerResultat(page.context.window.JeuneAvenirOrientation, {
    serie: "a1",
    niveau: "<script>alert(1)</script>",
    situation: "lyceen",
    objectif: "explorer"
  });
  resultat.codeInterne = "C";
  page.stockage.jac_dernier_resultat_quiz = JSON.stringify(resultat);

  await page.context.document.ready();

  const mainHtml = page.elements["resultat-liste-filieres"].innerHTML;
  assert.equal(page.elements["bloc-resultat"].hidden, false);
  assert.equal(page.elements["resultat-reponses"].innerHTML.match(/<li>/g).length, 7);
  assert.match(page.elements["resultat-synthese"].innerHTML, /Lycéen ou bachelier récent/);
  assert.match(page.elements["resultat-synthese"].innerHTML, /&lt;script&gt;/);
  assert.doesNotMatch(page.elements["resultat-synthese"].innerHTML, /<script>/);
  assert.match(page.elements["resultat-alternatives"].innerHTML, /Autres filières associées/);
  assert.match(mainHtml, /Établissements associés/);
  assert.match(mainHtml, /rattachement à confirmer|domaine documenté/);
  assert.doesNotMatch(
    `${page.elements["resultat-titre"].textContent} ${mainHtml} ${page.elements["resultat-description"].textContent}`,
    /\b\d+\s*%/
  );
});

test("un résultat corrompu affiche une erreur et n'est pas remplacé", async () => {
  const raw = "{ résultat corrompu";
  const page = creerPage({ jac_dernier_resultat_quiz: raw });
  await page.context.document.ready();
  assert.equal(page.elements["bloc-erreur-resultat"].hidden, false);
  assert.match(page.elements["message-erreur-resultat"].textContent, /illisible/);
  assert.equal(page.stockage.jac_dernier_resultat_quiz, raw);
});

test("un résultat terminé peut être récupéré depuis sa progression si la clé historique manque", async () => {
  const page = creerPage();
  const api = page.context.window.JeuneAvenirOrientation;
  const parcours = creerResultat(api);
  const etat = api.creerParcours();
  Object.assign(etat, {
    status: "termine",
    phase: "terminee",
    currentIndex: api.nombreQuestions,
    profile: parcours.profil,
    questionIds: questions.slice(0, api.nombreQuestions).map(question => question.id),
    answers: Object.fromEntries(parcours.reponses.map(reponse => [reponse.questionId,
      questions.find(question => question.id === reponse.questionId).reponses.findIndex(item => item.texte === reponse.reponse)])),
    result: parcours
  });
  page.stockage[api.cleParcours] = JSON.stringify(etat);

  await page.context.document.ready();

  assert.equal(page.elements["bloc-resultat"].hidden, false);
  assert.match(page.elements["resultat-date"].textContent, /récupéré depuis la progression locale/);
});

test("le résultat API est rendu depuis l'onglet sans lire localStorage et signale les données manquantes", async () => {
  const page = creerPage({}, undefined, "?source=api");
  const api = page.context.window.JeuneAvenirOrientationApi;
  const piste = {
    id: "gestion-commerce",
    name: "Gestion & Commerce",
    description: "<script>description</script>",
    duration: "2 ans (BTS)",
    main_subjects: ["Gestion"],
    outcomes: ["Comptabilité"],
    verification: "non_renseignee",
    missing_data: ["institutions", "sources", "verification"]
  };
  api.sauvegarderResultatSession({
    version: 1,
    type: "piste_exploratoire",
    stored: false,
    series: { id: "a1", name: "A1 — Lettres-Langues", verification: "confirmee" },
    main_tracks: [piste],
    alternatives: [],
    answers: Array.from({ length: 7 }, (_, index) => ({
      question_id: `q${index + 1}`,
      question: `Question ${index + 1}`,
      answer: `Réponse ${index + 1}`
    })),
    notice: "Piste exploratoire; aucune réponse n’est conservée par l’API."
  });

  await page.context.document.ready();

  assert.equal(page.lecturesStockage, 0);
  assert.equal(page.elements["bloc-resultat"].hidden, false);
  assert.equal(page.elements["resultat-titre"].textContent, "Gestion & Commerce");
  assert.match(page.elements["resultat-liste-filieres"].innerHTML, /&lt;script&gt;description&lt;\/script&gt;/);
  assert.doesNotMatch(page.elements["resultat-liste-filieres"].innerHTML, /<script>/);
  assert.match(page.elements["resultat-liste-filieres"].innerHTML, /établissements associés, sources de vérification, statut de vérification/);
  assert.match(page.elements["resultat-liste-filieres"].innerHTML, /ne fournit pas de rattachement d’établissement/);
  assert.equal((page.elements["resultat-reponses"].innerHTML.match(/<li>/g) || []).length, 7);
  assert.match(page.elements["resultat-date"].textContent, /Résultat temporaire dans cet onglet/);
});
