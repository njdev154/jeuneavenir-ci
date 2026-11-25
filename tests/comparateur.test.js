const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const racine = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(racine, "js", "comparateur.js"), "utf8");
const filieres = JSON.parse(fs.readFileSync(path.join(racine, "data", "filieres.json"), "utf8")).filieres;

async function ouvrirComparateur(query, catalogue = filieres) {
  const selects = [0, 1, 2].map(slot => ({
    dataset: { slot: String(slot) },
    value: "",
    options: [{ value: "", disabled: false }],
    appendChild(option) { this.options.push(option); },
    addEventListener(type, callback) { this[type] = callback; }
  }));
  const retirer = [0, 1, 2].map(slot => ({
    dataset: { slot: String(slot) },
    disabled: true,
    addEventListener(type, callback) { this[type] = callback; }
  }));
  const elements = {
    "tableau-comparateur": {
      innerHTML: "",
      querySelector() { return null; }
    },
    "comparateur-annonce": { textContent: "" }
  };
  const document = {
    addEventListener(type, callback) { this.ready = callback; },
    getElementById(id) { return elements[id]; },
    createElement() { return { value: "", textContent: "", disabled: false }; },
    querySelectorAll(selector) {
      return selector === ".comparateur-select" ? selects
        : selector === ".comparateur-retirer" ? retirer : [];
    },
    querySelector(selector) {
      let match = selector.match(/comparateur-select.*data-slot="(\d+)"/);
      if (match) return selects[Number(match[1])];
      match = selector.match(/comparateur-retirer.*data-slot="(\d+)"/);
      if (match) return retirer[Number(match[1])];
      return null;
    }
  };
  const window = { location: { search: query }, JeuneAvenirMotion: null };
  const context = vm.createContext({
    document,
    window,
    URLSearchParams,
    encodeURIComponent,
    console: { error() {} },
    fetch: async () => ({ ok: true, json: async () => ({ filieres: catalogue }) })
  });
  vm.runInContext(source, context);
  document.ready();
  await new Promise(resolve => setImmediate(resolve));
  return { elements, selects, annonce: elements["comparateur-annonce"].textContent };
}

test("le comparateur préremplit jusqu'à trois filières existantes sans doublons", async () => {
  const { selects, elements } = await ouvrirComparateur(
    "?filieres=informatique,gestion-commerce,informatique,absente,droit"
  );
  assert.deepEqual(selects.map(select => select.value), ["informatique", "gestion-commerce", "droit"]);
  assert.match(elements["tableau-comparateur"].innerHTML, /Repères côte à côte/);
  assert.match(elements["tableau-comparateur"].innerHTML, /frais ne sont pas renseignés/);
});

test("le comparateur affiche les champs absents au lieu de leur attribuer une valeur", async () => {
  const fixture = [
    { id: "alpha", nom: "Alpha" },
    { id: "beta", nom: "Beta", matieres_principales: ["Mathématiques"] }
  ];
  const { elements } = await ouvrirComparateur("?filieres=alpha,beta", fixture);
  const html = elements["tableau-comparateur"].innerHTML;
  assert.match(html, /Non renseignée/);
  assert.match(html, /Non renseignées/);
  assert.match(html, /Non renseignés/);
});
