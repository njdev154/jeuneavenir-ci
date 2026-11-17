const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "js", "dashboard.js"), "utf8");

function executerDashboard(utilisateur, stockage) {
  const elements = {};
  [
    "bloc-non-connecte",
    "bloc-dashboard",
    "avatar-initiale",
    "sidebar-nom",
    "sidebar-type",
    "dashboard-salutation",
    "dashboard-nav",
    "dashboard-stats",
    "dashboard-activite",
    "bouton-deconnexion"
  ].forEach(id => {
    elements[id] = { style: {}, textContent: "", innerHTML: "", addEventListener() {} };
  });
  const callbacks = {};
  const document = {
    addEventListener(event, callback) {
      callbacks[event] = callback;
    },
    getElementById(id) {
      return elements[id];
    }
  };
  const donnees = {
    ...stockage,
    jac_utilisateur_connecte: JSON.stringify(utilisateur)
  };
  const localStorage = {
    getItem(cle) {
      return Object.prototype.hasOwnProperty.call(donnees, cle) ? donnees[cle] : null;
    },
    removeItem(cle) {
      delete donnees[cle];
    }
  };
  const contexte = vm.createContext({ document, localStorage, window: { location: { href: "" } }, console });
  vm.runInContext(source, contexte, { filename: "js/dashboard.js" });
  callbacks.DOMContentLoaded();
  return elements;
}

test("le tableau Jeune relie l’historique et affiche le nombre de candidatures locales", () => {
  const elements = executerDashboard(
    { nom: "Awa Koné", email: "awa@example.ci", typeCompte: "jeune" },
    {
      jac_favoris: JSON.stringify({ filieres: ["informatique"], ecoles: [] }),
      jac_candidatures: JSON.stringify([
        { offreId: "offre-1", candidatEmail: "awa@example.ci", mode: "demonstration_locale" }
      ])
    }
  );

  assert.match(elements["dashboard-nav"].innerHTML, /href="candidatures.html"/);
  assert.match(elements["dashboard-stats"].innerHTML, /Candidatures locales \(démo\)/);
  assert.match(elements["dashboard-activite"].innerHTML, /aucune n’a été transmise/);
  assert.doesNotMatch(elements["dashboard-activite"].innerHTML, /Candidature envoyée/);
});

test("le tableau Entreprise n’invente pas de candidatures reçues", () => {
  const elements = executerDashboard(
    { nom: "Entreprise test", email: "recrutement@example.ci", typeCompte: "entreprise" },
    {
      jac_offres_entreprise: JSON.stringify([
        {
          id: "local-1",
          entrepriseEmail: "recrutement@example.ci",
          titre: "<script>offre</script>",
          statut: "a_verifier",
          dateMiseAJour: "2026-11-17T10:00:00.000Z"
        }
      ])
    }
  );

  assert.match(elements["dashboard-nav"].innerHTML, /href="publier-offre.html#mes-offres"/);
  assert.match(elements["dashboard-stats"].innerHTML, /1/);
  assert.match(elements["dashboard-stats"].innerHTML, /Candidatures reçues \(V2\)/);
  assert.match(elements["dashboard-activite"].innerHTML, /à vérifier, non transmis/);
  assert.match(elements["dashboard-activite"].innerHTML, /&lt;script&gt;offre/);
  assert.doesNotMatch(elements["dashboard-activite"].innerHTML, /<script>offre/);
});
