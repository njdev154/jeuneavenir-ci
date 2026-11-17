const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sourceFavoris = fs.readFileSync(path.join(__dirname, "..", "js", "favoris.js"), "utf8");
const sourcePage = fs.readFileSync(path.join(__dirname, "..", "js", "favoris-page.js"), "utf8");

function creerContexteFavoris(stockage = {}) {
  const localStorage = {
    getItem(cle) {
      return Object.prototype.hasOwnProperty.call(stockage, cle) ? stockage[cle] : null;
    },
    setItem(cle, valeur) {
      stockage[cle] = valeur;
    }
  };
  const window = {
    JeuneAvenirMotion: { animer() {}, initialiser() {} },
    dispatchEvent() {},
    addEventListener() {}
  };
  const document = { createElement: () => ({ setAttribute() {}, textContent: "" }) };
  const contexte = vm.createContext({ localStorage, window, document, console: { error() {} } });
  vm.runInContext(sourceFavoris, contexte, { filename: "js/favoris.js" });
  return { contexte, stockage, window };
}

test("les favoris conservent les anciennes catégories et partagent un stockage unique", () => {
  const { contexte, stockage } = creerContexteFavoris({
    jac_favoris: JSON.stringify({ filieres: ["informatique"], ecoles: ["esatic"], autres: ["repere"] })
  });

  assert.equal(contexte.estFavori("filieres", "informatique"), true);
  for (const [categorie, id] of [
    ["ecoles", "upgc"], ["metiers", "developpeur-web"], ["mentors", "mentor-1"], ["offres", "offre-1"]
  ]) {
    assert.equal(contexte.basculerFavori(categorie, id), true);
    assert.equal(contexte.estFavori(categorie, id), true);
    assert.equal(contexte.basculerFavori(categorie, id), false);
  }
  const persistes = JSON.parse(stockage.jac_favoris);
  assert.deepEqual(persistes.filieres, ["informatique"]);
  assert.deepEqual(persistes.ecoles, ["esatic"]);
  assert.deepEqual(persistes.autres, ["repere"]);
  assert.deepEqual(persistes.mentors, []);
  assert.deepEqual(persistes.offres, []);
});

test("un stockage de favoris corrompu est signalé et n’est pas écrasé", () => {
  const raw = "{ données illisibles";
  const { contexte, stockage } = creerContexteFavoris({ jac_favoris: raw });

  assert.match(contexte.window.JeuneAvenirFavoris.lire().erreur.message, /illisibles/);
  assert.throws(() => contexte.basculerFavori("filieres", "informatique"), /illisibles/);
  assert.equal(stockage.jac_favoris, raw);
});

test("les boutons favoris exposent et mettent à jour aria-pressed", () => {
  const { contexte, stockage } = creerContexteFavoris();
  const html = contexte.boutonFavoriHTML("filieres", 'id" onclick="x');
  assert.match(html, /aria-pressed="false"/);
  assert.match(html, /aria-label="Ajouter aux favoris"/);
  assert.doesNotMatch(html, /data-id="id" onclick=/);

  const attributs = {};
  const bouton = {
    dataset: { categorie: "filieres", id: "informatique" },
    parentElement: { querySelector: () => null },
    classList: { toggle() {} },
    addEventListener(type, callback) { this.click = callback; },
    setAttribute(cle, valeur) { attributs[cle] = valeur; },
    insertAdjacentElement() {}
  };
  contexte.activerBoutonFavori({ querySelectorAll: () => [bouton] });
  bouton.click();

  assert.equal(JSON.parse(stockage.jac_favoris).filieres[0], "informatique");
  assert.equal(attributs["aria-pressed"], "true");
  assert.equal(attributs["aria-label"], "Retirer des favoris");
});

function chargerPageFavoris(stockage, catalogues) {
  const elements = {
    "favoris-etat": { textContent: "", innerHTML: "" },
    "favoris-categories": {
      innerHTML: "",
      querySelectorAll: () => [],
      replaceChildren() { this.innerHTML = ""; }
    }
  };
  const filtres = {
    boutons: ["tout", "filieres", "ecoles", "metiers", "mentors", "offres"].map(id => ({
      dataset: { favorisFiltre: id },
      textContent: "",
      setAttribute() {}
    })),
    addEventListener() {},
    querySelectorAll() { return this.boutons; },
    querySelector() { return { dataset: { favorisFiltre: "tout" } }; }
  };
  elements["favoris-filtres"] = filtres;
  const callbacks = {};
  const document = {
    addEventListener(type, callback) { callbacks[type] = callback; },
    getElementById(id) { return elements[id]; },
    querySelectorAll() { return []; }
  };
  const fetch = async chemin => ({ ok: true, json: async () => catalogues[chemin] });
  const { contexte, window } = creerContexteFavoris(stockage);
  contexte.document = document;
  contexte.fetch = fetch;
  contexte.window.addEventListener = (type, callback) => { window[type] = callback; };
  vm.runInContext(sourcePage, contexte, { filename: "js/favoris-page.js" });
  callbacks.DOMContentLoaded();
  return new Promise(resolve => setImmediate(() => resolve({ elements, window, stockage })));
}

test("la page Favoris montre les cinq catégories, les liens et les références absentes", async () => {
  const catalogues = {
    "data/filieres.json": { filieres: [{ id: "informatique", nom: "Informatique", description: "Numérique" }] },
    "data/ecoles.json": { ecoles: [{ id: "esatic", nom: "ESATIC", ville: "Abidjan" }] },
    "data/metiers.json": { metiers: [{ id: "developpeur-web", nom: "Développeur web", description: "Conçoit des sites." }] },
    "data/mentors.json": { _statut_publication: "aucune_publication", mentors: [{ id: "m-1", nom: "Profil privé" }] },
    "data/offres.json": { _statut_publication: "aucune_publication", offres: [{ id: "o-1", titre: "Offre privée" }] }
  };
  const { elements } = await chargerPageFavoris({
    jac_favoris: JSON.stringify({
      filieres: ["informatique"], ecoles: ["esatic", "supprimee"], metiers: ["developpeur-web"],
      mentors: ["m-1"], offres: []
    })
  }, catalogues);
  const html = elements["favoris-categories"].innerHTML;

  for (const categorie of ["Filières", "Écoles", "Métiers", "Mentors", "Offres"]) {
    assert.match(html, new RegExp(categorie));
  }
  assert.match(html, /href="filieres\.html#informatique"/);
  assert.match(html, /href="ecoles\.html#esatic"/);
  assert.match(html, /href="metiers\.html#developpeur-web"/);
  assert.match(html, /Élément indisponible/);
  assert.match(html, /Aucun favori dans cette catégorie/);
  assert.doesNotMatch(html, /Profil privé|Offre privée/);
  assert.match(html, /aria-pressed="true"/);
});

test("la page signale les favoris corrompus sans remplacer le stockage", async () => {
  const raw = "invalid";
  const catalogues = {
    "data/filieres.json": { filieres: [] },
    "data/ecoles.json": { ecoles: [] },
    "data/metiers.json": { metiers: [] },
    "data/mentors.json": { _statut_publication: "aucune_publication", mentors: [] },
    "data/offres.json": { _statut_publication: "aucune_publication", offres: [] }
  };
  const { elements, stockage } = await chargerPageFavoris({ jac_favoris: raw }, catalogues);

  assert.match(elements["favoris-etat"].innerHTML, /illisibles/);
  assert.equal(stockage.jac_favoris, raw);
});
