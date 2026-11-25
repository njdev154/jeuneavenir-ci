const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "js", "auth.js"), "utf8");

async function executerAuth(page, comptesActifs, stockage = {}, statusCode = 200) {
  const elements = {
    "message-erreur": { textContent: "" },
    "message-succes": { textContent: "" },
    "auth-demo-note": { textContent: "Inscription indisponible pendant le pilote." },
    "auth-login-note": { textContent: "Compte indisponible pendant le pilote." },
    "nom": { value: "Awa Koné" },
    "email": { value: "awa@example.ci" },
    "mot_de_passe": { value: "UnePhraseTresSure2026" },
    "confirmation": { value: "UnePhraseTresSure2026" }
  };
  if (page !== "inscription") delete elements["auth-demo-note"];
  if (page !== "connexion") delete elements["auth-login-note"];
  const formulaire = {
    disabled: false,
    addEventListener(type, callback) { this[type] = callback; },
    querySelector(selecteur) {
      if (selecteur === 'input[name="type_compte"]:checked') return { value: "jeune" };
      if (selecteur === 'button[type="submit"]') return { disabled: false };
      return null;
    }
  };
  elements[page === "inscription" ? "formulaire-inscription" : "formulaire-connexion"] = formulaire;

  const callbacks = {};
  const document = {
    addEventListener(type, callback) { callbacks[type] = callback; },
    getElementById(id) { return elements[id] || null; }
  };
  const localStorage = {
    getItem(cle) {
      if (Object.prototype.hasOwnProperty.call(stockage, cle)) return stockage[cle];
      return null;
    },
    setItem(cle, valeur) { stockage[cle] = valeur; }
  };
  const calls = [];
  const errors = [];
  const fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (url === "/auth/status") {
      if (statusCode === 404) return { ok: false, status: 404 };
      return {
        ok: true,
        json: async () => ({
          data: {
            enabled: comptesActifs,
            csrf_token: comptesActifs ? "csrf-token-test" : null
          }
        })
      };
    }
    return {
      ok: true,
      json: async () => ({ data: { user: { role: "jeune" } } })
    };
  };
  const window = {
    location: { href: "" },
    JeuneAvenirPilot: {
      activerComptesLocauxPourLeTest() { return comptesActifs; }
    }
  };
  const contexte = vm.createContext({
    document,
    fetch,
    localStorage,
    window,
    console: { error(...argumentsErreur) { errors.push(argumentsErreur); } },
    Object,
    JSON
  });

  vm.runInContext(source, contexte, { filename: "js/auth.js" });
  await callbacks.DOMContentLoaded();
  return { formulaire, elements, stockage, calls, errors, window };
}

test("les comptes fermés côté serveur n'ouvrent pas les formulaires et ne lisent pas le stockage local", async () => {
  const stockage = { jac_utilisateurs: "{invalid" };
  const page = await executerAuth("connexion", false, stockage);

  assert.equal(page.formulaire.submit, undefined);
  assert.equal(page.stockage.jac_utilisateur_connecte, undefined);
  assert.equal(page.stockage.jac_utilisateurs, "{invalid");
  assert.equal(page.calls.length, 1);
  assert.equal(page.calls[0].url, "/auth/status");
});

test("l'hébergement statique sans API laisse le message pilote et les comptes fermés", async () => {
  const page = await executerAuth("inscription", false, {}, 404);

  assert.equal(page.formulaire.submit, undefined);
  assert.equal(page.elements["auth-demo-note"].textContent, "Inscription indisponible pendant le pilote.");
  assert.equal(page.calls.length, 1);
  assert.equal(page.errors.length, 0);
});

test("l'inscription locale envoie uniquement les identifiants au backend avec le jeton CSRF", async () => {
  const page = await executerAuth("inscription", true);
  await page.formulaire.submit({ preventDefault() {} });

  assert.equal(page.calls.length, 2);
  assert.equal(page.calls[1].url, "/auth/register");
  assert.equal(page.calls[1].options.headers["X-CSRF-TOKEN"], "csrf-token-test");
  assert.deepEqual(JSON.parse(page.calls[1].options.body), {
    name: "Awa Koné",
    email: "awa@example.ci",
    password: "UnePhraseTresSure2026",
    password_confirmation: "UnePhraseTresSure2026"
  });
  assert.match(page.elements["message-succes"].textContent, /Compte Jeune de test créé/);
  assert.equal(page.window.location.href, "/dashboard.html");
  assert.deepEqual(page.stockage, {});
});

test("la connexion locale transmet les identifiants au serveur sans enregistrer la session dans localStorage", async () => {
  const page = await executerAuth("connexion", true);
  await page.formulaire.submit({ preventDefault() {} });

  assert.equal(page.calls[1].url, "/auth/login");
  assert.equal(page.calls[1].options.headers["X-CSRF-TOKEN"], "csrf-token-test");
  assert.deepEqual(JSON.parse(page.calls[1].options.body), {
    email: "awa@example.ci",
    password: "UnePhraseTresSure2026"
  });
  assert.match(page.elements["message-succes"].textContent, /Connexion réussie/);
  assert.equal(page.window.location.href, "/dashboard.html");
  assert.deepEqual(page.stockage, {});
});
