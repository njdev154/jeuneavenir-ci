const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const racine = path.join(__dirname, "..");
const questions = JSON.parse(fs.readFileSync(path.join(racine, "data", "questions.json"), "utf8")).questions;
const series = JSON.parse(fs.readFileSync(path.join(racine, "data", "series_filieres.json"), "utf8")).series;
const filieres = JSON.parse(fs.readFileSync(path.join(racine, "data", "filieres.json"), "utf8")).filieres;
const source = fs.readFileSync(path.join(racine, "js", "orientation-state.js"), "utf8");

function chargerOrientation(stockage = {}) {
  const localStorage = {
    getItem(cle) { return Object.prototype.hasOwnProperty.call(stockage, cle) ? stockage[cle] : null; },
    setItem(cle, valeur) { stockage[cle] = valeur; },
    removeItem(cle) { delete stockage[cle]; }
  };
  const contexte = vm.createContext({ window: { localStorage }, console: { error() {} }, Date, Map, Set });
  vm.runInContext(source, contexte, { filename: "js/orientation-state.js" });
  return { api: contexte.window.JeuneAvenirOrientation, stockage };
}

function parcoursRepondu(api, serie = "c") {
  const parcours = api.creerParcours({ serie, situation: "lyceen", objectif: "explorer" });
  parcours.phase = "questions";
  parcours.questionIds = questions.slice(0, api.nombreQuestions).map(question => question.id);
  for (const id of parcours.questionIds) parcours.answers[id] = 0;
  for (let index = 0; index < api.nombreQuestions; index += 1) api.avancerEtape(parcours);
  return parcours;
}

test("un parcours versionné conserve le profil, les réponses et la position après reprise", () => {
  const { api, stockage } = chargerOrientation();
  let parcours = api.creerParcours({ serie: "d", situation: "etudiant" });
  parcours.phase = "questions";
  parcours.questionIds = questions.slice(0, api.nombreQuestions).map(question => question.id);
  parcours = api.sauvegarderParcours(parcours, questions, series);
  api.enregistrerReponse(parcours, parcours.questionIds[0], 1, questions);
  parcours = api.sauvegarderParcours(parcours, questions, series);
  api.avancerEtape(parcours);
  parcours = api.sauvegarderParcours(parcours, questions, series);

  const repris = api.lireParcours(questions, series).parcours;
  assert.equal(JSON.parse(stockage[api.cleParcours]).schemaVersion, 1);
  assert.equal(repris.profile.serie, "d");
  assert.equal(repris.currentIndex, 1);
  assert.equal(repris.answers[repris.questionIds[0]], 1);
});

test("retour arrière modifie une réponse sans doubler son poids dans le résultat", () => {
  const { api } = chargerOrientation();
  const parcours = parcoursRepondu(api);
  const id = parcours.questionIds[api.nombreQuestions - 1];
  api.revenirEtape(parcours);
  assert.equal(parcours.currentIndex, api.nombreQuestions - 1);
  api.enregistrerReponse(parcours, id, 1, questions);
  api.avancerEtape(parcours);
  const premier = api.creerResultat(parcours, questions, series);
  const second = api.creerResultat(parcours, questions, series);
  assert.deepEqual(premier.scoresRiasec, second.scoresRiasec);
  assert.equal(premier.reponses.length, api.nombreQuestions);
  assert.equal(premier.reponses[api.nombreQuestions - 1].reponse, questions.find(question => question.id === id).reponses[1].texte);
});

test("une progression corrompue est signalée sans écraser sa sauvegarde", () => {
  const raw = "{ sauvegarde illisible";
  const { api, stockage } = chargerOrientation({ [apiCle()]: raw });
  const lecture = api.lireParcours(questions, series);
  assert.ok(lecture.erreur);
  assert.equal(stockage[api.cleParcours], raw);
});

function apiCle() {
  return "jac_orientation_parcours_v1";
}

test("un parcours incomplet ne produit pas de résultat", () => {
  const { api } = chargerOrientation();
  const parcours = api.creerParcours({ serie: "c" });
  assert.throws(() => api.creerResultat(parcours, questions, series), /n’est pas terminé/);
});

test("les principales comprennent les ex æquo et les alternatives ne sont pas classées", () => {
  const { api } = chargerOrientation();
  const resultat = api.creerResultat(parcoursRepondu(api, "c"), questions, series);
  const classe = api.classerFilieres(resultat, series, filieres);
  assert.ok(classe.principales.length >= 1);
  assert.ok(classe.alternatives.length >= 1);
  assert.ok(classe.principales.every(filiere => resultat.filieresAccessibles.includes(filiere.id)));
  assert.ok(classe.alternatives.every(filiere => resultat.filieresAccessibles.includes(filiere.id)));
  assert.ok(classe.alternatives.every(filiere => !Object.prototype.hasOwnProperty.call(filiere, "correspondance")));
  const rendu = fs.readFileSync(path.join(racine, "js", "resultat.js"), "utf8");
  assert.doesNotMatch(rendu, /\b\d+\s*%|compatibilité\s+en\s+pourcentage/i);
});

test("les repères profil invalides sont refusés à la sauvegarde", () => {
  const { api } = chargerOrientation();
  const parcours = api.creerParcours({ situation: "inconnue" });
  assert.throws(() => api.sauvegarderParcours(parcours, questions, series), /situation ou d’objectif/);
});

test("les écrans et actions masqués du quiz restent invisibles malgré les styles de boutons", () => {
  const styles = fs.readFileSync(path.join(racine, "css", "orientation.css"), "utf8");
  assert.match(styles, /\.page-quiz\s+\[hidden\]\s*\{\s*display:\s*none\s*!important;/);
});

test("la page de résultat charge le calcul local avant son moteur de rendu", () => {
  const html = fs.readFileSync(path.join(racine, "resultat.html"), "utf8");
  assert.ok(html.indexOf("js/orientation-state.js") < html.indexOf("js/resultat.js"));
});
