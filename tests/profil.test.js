const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "js", "profil.js"), "utf8");

function ouvrirProfil(stockage) {
  const ids = [
    "bloc-profil", "bloc-non-connecte", "profil-erreur-session", "profil-nom", "profil-email", "profil-ville",
    "profil-resume-nom", "profil-resume-role", "profil-avatar", "profil-statut", "profil-formation",
    "profil-competences", "profil-profession", "profil-domaine", "profil-organisation-mentor",
    "profil-matiere", "profil-etablissement", "profil-organisation-entreprise", "profil-fonction",
    "profil-secteur", "formulaire-profil", "profil-erreur", "message-succes-profil",
    "bouton-enregistrer-profil", "champs-jeune", "champs-mentor", "champs-professeur", "champs-entreprise"
  ];
  const elements = Object.fromEntries(ids.map(id => [id, {
    hidden: ["bloc-profil", "profil-erreur-session", "profil-erreur", "champs-jeune", "champs-mentor", "champs-professeur", "champs-entreprise"].includes(id),
    disabled: id.startsWith("champs-"),
    value: "",
    textContent: "",
    options: id === "profil-statut" ? [
      { value: "" }, { value: "lyceen" }, { value: "etudiant" }, { value: "jeune-diplome" }
    ] : undefined,
    appendChild(option) { this.options.push(option); },
    querySelectorAll() { return []; },
    focus() {},
    addEventListener(type, callback) { this[type] = callback; }
  }]));
  const callbacks = {};
  const document = {
    addEventListener(type, callback) { callbacks[type] = callback; },
    getElementById(id) { return elements[id]; },
    createElement() { return { value: "", textContent: "" }; }
  };
  const localStorage = {
    getItem(cle) { return Object.prototype.hasOwnProperty.call(stockage, cle) ? stockage[cle] : null; },
    setItem(cle, valeur) { stockage[cle] = valeur; }
  };
  const window = { JeuneAvenirMotion: { initialiser() {}, animer() {} } };
  const contexte = vm.createContext({ document, localStorage, window, console: { error() {} }, setTimeout });
  vm.runInContext(source, contexte, { filename: "js/profil.js" });
  callbacks.DOMContentLoaded();
  return { elements, stockage };
}

test("le profil Jeune persiste les champs modifiables dans la session et le compte local", () => {
  const utilisateur = {
    nom: "Awa Koné",
    email: "awa@example.ci",
    typeCompte: "jeune",
    statut: "etudiant",
    formation: "BTS 1",
    profilDetails: { statut: "etudiant", formation: "BTS 1", noteLegacy: "conservée" }
  };
  const stockage = {
    jac_utilisateur_connecte: JSON.stringify(utilisateur),
    jac_utilisateurs: JSON.stringify([utilisateur])
  };
  const page = ouvrirProfil(stockage);
  assert.equal(page.elements["bloc-profil"].hidden, false);
  assert.equal(page.elements["champs-jeune"].hidden, false);
  assert.equal(page.elements["profil-competences"].value, "");

  page.elements["profil-nom"].value = "  Awa Koné  ";
  page.elements["profil-ville"].value = "Abidjan";
  page.elements["profil-formation"].value = "Licence informatique";
  page.elements["profil-competences"].value = "JavaScript, HTML, JavaScript";
  page.elements["profil-statut"].value = "jeune-diplome";
  page.elements["formulaire-profil"].submit({ preventDefault() {} });

  const session = JSON.parse(stockage.jac_utilisateur_connecte);
  const compte = JSON.parse(stockage.jac_utilisateurs)[0];
  assert.equal(session.nom, "Awa Koné");
  assert.equal(session.formation, "Licence informatique");
  assert.deepEqual(session.competences, ["JavaScript", "HTML", "JavaScript"]);
  assert.equal(session.profilDetails.noteLegacy, "conservée");
  assert.equal(session.profilDetails.statut, "jeune-diplome");
  assert.deepEqual(compte.profilDetails, session.profilDetails);
  assert.match(page.elements["message-succes-profil"].textContent, /dans ce navigateur/);

  const reouverture = ouvrirProfil(stockage);
  assert.equal(reouverture.elements["profil-formation"].value, "Licence informatique");
  assert.equal(reouverture.elements["profil-statut"].value, "jeune-diplome");
});

test("les champs de profil Mentor et Entreprise reprennent et sauvegardent les données disponibles", () => {
  const mentor = {
    nom: "Koffi Yao",
    email: "koffi@example.ci",
    typeCompte: "mentor",
    profilDetails: { profession: "Comptable", domaine: "Gestion", organisation: "Structure locale" }
  };
  const stockage = {
    jac_utilisateur_connecte: JSON.stringify(mentor),
    jac_utilisateurs: JSON.stringify([mentor])
  };
  const page = ouvrirProfil(stockage);
  assert.equal(page.elements["champs-mentor"].hidden, false);
  assert.equal(page.elements["profil-profession"].value, "Comptable");
  page.elements["profil-domaine"].value = "Comptabilité";
  page.elements["formulaire-profil"].submit({ preventDefault() {} });
  assert.equal(JSON.parse(stockage.jac_utilisateur_connecte).profilDetails.domaine, "Comptabilité");

  const entreprise = {
    nom: "Contact RH",
    email: "rh@example.ci",
    typeCompte: "entreprise",
    profilDetails: { organisation: "Entreprise déclarée", fonction: "Ressources humaines" }
  };
  const pageEntreprise = ouvrirProfil({
    jac_utilisateur_connecte: JSON.stringify(entreprise),
    jac_utilisateurs: JSON.stringify([entreprise])
  });
  assert.equal(pageEntreprise.elements["champs-entreprise"].hidden, false);
  assert.equal(pageEntreprise.elements["profil-organisation-entreprise"].value, "Entreprise déclarée");
  assert.equal(pageEntreprise.elements["profil-secteur"].value, "");
});

test("le sous-profil Professeur reprend la discipline et l’établissement sans les inventer", () => {
  const professeur = {
    nom: "Nadia K.",
    email: "nadia@example.ci",
    typeCompte: "mentor",
    sousTypeCompte: "professeur",
    profilDetails: { matiere: "Mathématiques" }
  };
  const page = ouvrirProfil({
    jac_utilisateur_connecte: JSON.stringify(professeur),
    jac_utilisateurs: JSON.stringify([professeur])
  });

  assert.equal(page.elements["profil-resume-role"].textContent, "Professeur / enseignant");
  assert.equal(page.elements["champs-professeur"].hidden, false);
  assert.equal(page.elements["profil-matiere"].value, "Mathématiques");
  assert.equal(page.elements["profil-etablissement"].value, "");
});

test("un profil incomplet reste utilisable et les valeurs facultatives restent vides", () => {
  const utilisateur = { nom: "Awa", email: "awa@example.ci", typeCompte: "jeune" };
  const page = ouvrirProfil({ jac_utilisateur_connecte: JSON.stringify(utilisateur), jac_utilisateurs: "[]" });

  assert.equal(page.elements["bloc-profil"].hidden, false);
  assert.equal(page.elements["profil-formation"].value, "");
  assert.equal(page.elements["profil-ville"].value, "");
  assert.equal(page.elements["profil-competences"].value, "");
});

test("un stockage de comptes corrompu bloque la sauvegarde sans écraser les données", () => {
  const session = JSON.stringify({ nom: "Awa", email: "awa@example.ci", typeCompte: "jeune" });
  const raw = "{ données corrompues";
  const stockage = { jac_utilisateur_connecte: session, jac_utilisateurs: raw };
  const page = ouvrirProfil(stockage);

  page.elements["profil-nom"].value = "Awa Koné";
  page.elements["formulaire-profil"].submit({ preventDefault() {} });

  assert.equal(stockage.jac_utilisateur_connecte, session);
  assert.equal(stockage.jac_utilisateurs, raw);
  assert.match(page.elements["profil-erreur"].textContent, /illisible/);
});

test("une session illisible produit une erreur explicite sans afficher ni modifier le profil", () => {
  const page = ouvrirProfil({ jac_utilisateur_connecte: "{invalid" });

  assert.equal(page.elements["bloc-profil"].hidden, true);
  assert.equal(page.elements["profil-erreur-session"].hidden, false);
  assert.match(page.elements["profil-erreur-session"].textContent, /illisible/);
});
