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
  assert.ok(reponse.cartes.every(carte => carte.lien === "ecoles.html"));
});

test("la recherche d'écoles accorde correctement le singulier et le pluriel", () => {
  const donnees = loadData();
  const question = "Quelles écoles font l'informatique à Abidjan ?";
  const pluriel = assistant.repondre(question, donnees);
  const nombre = pluriel.cartes.length;

  assert.ok(nombre > 1);
  assert.match(pluriel.paragraphes[0], new RegExp(nombre + " établissements correspondants"));

  const ecole = donnees.ecoles.find(item =>
    item.ville === "Abidjan" &&
    item.domaines.includes("informatique") &&
    item.verification &&
    item.verification.domaine_confirme
  );
  donnees.ecoles = [ecole];
  const singulier = assistant.repondre(question, donnees);

  assert.match(singulier.paragraphes[0], /1 établissement correspondant/);
});

test("le salaire reste présenté comme une estimation du catalogue", () => {
  const reponse = assistant.repondre("Quel est le salaire en informatique ?", loadData());

  assert.match(reponse.paragraphes.join(" "), /150 000 - 400 000 FCFA\/mois/);
  assert.match(reponse.paragraphes.join(" "), /estimation/i);
});

test("les mentors et offres non publiés ne sont jamais proposés", () => {
  const donnees = loadData();
  donnees.mentors = [{
    id: "mentor-test",
    nom: "Profil temporaire de test",
    domaine: "informatique",
    bio: "Donnée de test non publiée"
  }];
  donnees.offres = [{
    id: "offre-test",
    titre: "Annonce temporaire de test",
    entreprise: "Entreprise de test",
    ville: "Abidjan",
    domaine: "droit",
    type: "stage"
  }];

  for (const question of ["Je cherche un stage en droit", "Je veux un mentor en informatique"]) {
    const reponse = assistant.repondre(question, donnees);
    const texte = reponse.paragraphes.join(" ");

    assert.equal(reponse.cartes.length, 0);
    assert.match(texte, /n'est publi/);
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
