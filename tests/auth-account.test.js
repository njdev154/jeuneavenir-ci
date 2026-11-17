const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "js", "auth.js"), "utf8");

function executerAuth(page, stockage) {
  const elements = {
    "bouton-google": null,
    "bouton-apple": null,
    "message-erreur": { textContent: "" },
    "nom": { value: "Awa Koné" },
    "email": { value: "awa@example.ci" },
    "mot_de_passe": { value: "motdepassevalide" },
    "confirmation": { value: "motdepassevalide" },
    "ville": { value: "Abidjan" }
  };
  const formulaire = {
    disabled: false,
    addEventListener(type, callback) { this[type] = callback; },
    querySelector(selecteur) {
      if (selecteur === 'input[name="type_compte"]:checked') return { value: "jeune" };
      if (selecteur === '[data-profile-fields="jeune"]') {
        return { disabled: false, querySelectorAll: () => [] };
      }
      return null;
    }
  };
  elements[page === "inscription" ? "formulaire-inscription" : "formulaire-connexion"] = formulaire;
  const callbacks = {};
  const document = {
    addEventListener(type, callback) { callbacks[type] = callback; },
    getElementById(id) { return elements[id]; }
  };
  const localStorage = {
    getItem(cle) { return Object.prototype.hasOwnProperty.call(stockage, cle) ? stockage[cle] : null; },
    setItem(cle, valeur) { stockage[cle] = valeur; }
  };
  const window = { location: { href: "" } };
  const contexte = vm.createContext({ document, localStorage, window, console: { error() {} }, URL });
  vm.runInContext(source, contexte, { filename: "js/auth.js" });
  callbacks.DOMContentLoaded();
  return { formulaire, elements, stockage, window };
}

test("la connexion signale les comptes locaux corrompus sans créer de session", () => {
  const stockage = { jac_utilisateurs: "{invalid" };
  const page = executerAuth("connexion", stockage);

  page.formulaire.submit({ preventDefault() {} });

  assert.match(page.elements["message-erreur"].textContent, /comptes locaux sont illisibles/);
  assert.equal(stockage.jac_utilisateur_connecte, undefined);
  assert.equal(stockage.jac_utilisateurs, "{invalid");
});

test("l’inscription ne remplace pas une liste de comptes locaux corrompue", () => {
  const stockage = { jac_utilisateurs: "not-an-array" };
  const page = executerAuth("inscription", stockage);

  page.formulaire.submit({ preventDefault() {} });

  assert.match(page.elements["message-erreur"].textContent, /comptes locaux sont illisibles/);
  assert.equal(stockage.jac_utilisateurs, "not-an-array");
  assert.equal(stockage.jac_utilisateur_connecte, undefined);
});
