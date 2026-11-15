const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const assistant = require("../js/assistant.js");

function readData(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", file), "utf8"));
}

function loadData() {
  return {
    filieres: readData("filieres.json").filieres,
    ecoles: readData("ecoles.json").ecoles,
    metiers: readData("metiers.json").metiers,
    mentors: readData("mentors.json").mentors,
    offres: readData("offres.json").offres,
    series: readData("series_filieres.json").series,
    mentorsPublies: false,
    offresPubliees: false
  };
}

test("bac A2 proposes des pistes sans promettre une admission", () => {
  const reponse = assistant.repondre("Quelles filières après un bac A2 ?", loadData());

  assert.deepEqual(reponse.cartes.map(carte => carte.titre), [
    "Droit",
    "Communication & Marketing",
    "Gestion & Commerce"
  ]);
  assert.match(reponse.paragraphes.join(" "), /garantie d'admission/);
});

test("la recherche par domaine ne montre que les rattachements confirmés et leurs sources", () => {
  const donnees = loadData();
  const attendus = donnees.ecoles
    .filter(ecole => ecole.ville === "Abidjan" &&
      ecole.domaines.includes("informatique") &&
      ecole.verification &&
      ecole.verification.domaine_confirme)
    .map(ecole => ecole.nom);
  const reponse = assistant.repondre(
    "Quelles écoles font l'informatique à Abidjan ?",
    donnees
  );

  assert.ok(attendus.length > 0);
  assert.deepEqual(reponse.cartes.map(carte => carte.titre), attendus);
  assert.ok(reponse.cartes.every(carte => carte.sources.length > 0));
});

test("les données de démonstration ne sont jamais proposées sans publication vérifiée", () => {
  const donnees = loadData();

  for (const [question, fauxNom] of [
    ["Je cherche un stage en droit", "Stagiaire juriste d'entreprise"],
    ["Je veux un mentor en informatique", "Aya K."]
  ]) {
    const reponse = assistant.repondre(question, donnees);
    const texte = reponse.paragraphes.join(" ") + reponse.cartes.map(carte => carte.titre).join(" ");

    assert.equal(reponse.cartes.length, 0);
    assert.ok(!texte.includes(fauxNom));
    assert.match(texte, /démonstration/);
  }
});

test("le résultat de quiz local est reconnu et reste une piste", () => {
  const reponse = assistant.repondre(
    "Que me conseilles-tu selon mon résultat de quiz ?",
    loadData(),
    { resultatQuiz: { filieresAccessibles: ["droit"] } }
  );

  assert.deepEqual(reponse.cartes.map(carte => carte.titre), ["Droit"]);
  assert.match(reponse.paragraphes.join(" "), /ne garantissent ni l'admissibilité ni une admission/);
});
