const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "js", "dashboard.js"), "utf8");

function executerDashboard(utilisateur, stockage = {}, accountsEnabled = true, fetchFn) {
  const elements = {};
  [
    "bloc-non-connecte", "bloc-dashboard", "avatar-initiale", "sidebar-nom", "sidebar-type",
    "dashboard-role-kicker", "dashboard-salutation", "dashboard-sous-titre", "dashboard-nav",
    "dashboard-actions", "dashboard-erreur", "dashboard-espaces", "dashboard-stats", "dashboard-sections", "bouton-deconnexion"
  ].forEach(id => {
    elements[id] = {
      hidden: id === "bloc-dashboard" || id === "dashboard-erreur",
      textContent: "",
      innerHTML: "",
      children: [],
      appendChild(element) { this.children.push(element); },
      setAttribute() {},
      addEventListener(type, callback) { this[type] = callback; }
    };
  });
  const callbacks = {};
  const document = {
    addEventListener(event, callback) { callbacks[event] = callback; },
    getElementById(id) { return elements[id]; },
    querySelector(selector) {
      if (selector === ".pilot-notice") return { setAttribute() {}, querySelector: () => ({ textContent: "" }) };
      return null;
    },
    querySelectorAll(selector) {
      if (selector === ".pilot-disabled-link") {
        return [{
          textContent: "Compte indisponible",
          replaceWith(element) { this.replacement = element; }
        }];
      }
      return [];
    },
    createElement() {
      return { className: "", textContent: "", setAttribute() {}, replaceWith() {} };
    }
  };
  const donnees = { ...stockage };
  let lecturesStockage = 0;
  if (utilisateur !== undefined) donnees.jac_utilisateur_connecte = JSON.stringify(utilisateur);
  const localStorage = {
    getItem(cle) {
      lecturesStockage += 1;
      return Object.prototype.hasOwnProperty.call(donnees, cle) ? donnees[cle] : null;
    },
    removeItem(cle) { delete donnees[cle]; }
  };
  const window = {
    location: { href: "" },
    JeuneAvenirMotion: { initialiser() {} },
    JeuneAvenirPilot: { accountsEnabled },
    JeuneAvenirFavoris: {
      lire() {
        const valeur = donnees.jac_favoris ? JSON.parse(donnees.jac_favoris) : {};
        return {
          favoris: { filieres: [], ecoles: [], metiers: [], mentors: [], offres: [], ...valeur },
          erreur: null
        };
      }
    }
  };
  const fetch = fetchFn || (async () => ({
    ok: true,
    status: 200,
    json: async () => ({ data: { enabled: false } })
  }));
  const contexte = vm.createContext({ document, localStorage, window, fetch, console: { error() {} } });
  vm.runInContext(source, contexte, { filename: "js/dashboard.js" });
  const ready = callbacks.DOMContentLoaded();
  return { elements, donnees, window, ready, get lecturesStockage() { return lecturesStockage; } };
}

test("le code historique du tableau Jeune relie ses données locales par courriel", () => {
  const page = executerDashboard(
    { nom: "Awa Koné", email: " AWA@example.ci ", typeCompte: "jeune", formation: "BTS 1" },
    {
      jac_favoris: JSON.stringify({ filieres: ["informatique"], offres: ["o1"] }),
      jac_candidatures: JSON.stringify([
        { offreId: "o1", candidatEmail: "awa@example.ci", mode: "demonstration_locale" },
        { offreId: "o2", candidatEmail: "autre@example.ci", mode: "demonstration_locale" }
      ]),
      jac_demandes_mentorat: JSON.stringify([
        { mentorId: "m1", jeuneEmail: "awa@example.ci", mode: "simulation_locale" },
        { mentorId: "m2", jeuneEmail: "autre@example.ci", mode: "simulation_locale" }
      ]),
      jac_dernier_resultat_quiz: JSON.stringify({
        date: "2026-11-17T10:00:00.000Z",
        filieresAccessibles: ["informatique", "droit"]
      })
    }
  );

  assert.equal(page.elements["bloc-dashboard"].hidden, false);
  assert.match(page.elements["dashboard-nav"].innerHTML, /href="profil\.html"/);
  assert.match(page.elements["dashboard-nav"].innerHTML, /href="favoris\.html"/);
  assert.match(page.elements["dashboard-stats"].innerHTML, /2<\/strong>[\s\S]*Favoris enregistrés/);
  assert.match(page.elements["dashboard-stats"].innerHTML, /1<\/strong>[\s\S]*Candidatures locales/);
  assert.match(page.elements["dashboard-stats"].innerHTML, /1<\/strong>[\s\S]*Demandes mentorat locales/);
  assert.match(page.elements["dashboard-sections"].innerHTML, /BTS 1/);
  assert.match(page.elements["dashboard-sections"].innerHTML, /Consulter le résultat/);
  assert.doesNotMatch(page.elements["dashboard-sections"].innerHTML, /Candidature envoyée|Activité récente/);
  assert.doesNotMatch(page.elements["dashboard-sections"].innerHTML, /autre@example/);
});

test("le code historique de l’espace central distingue les piliers et les limites locales", () => {
  const page = executerDashboard({ nom: "Awa Koné", email: "awa@example.ci", typeCompte: "jeune" });
  const espaces = page.elements["dashboard-espaces"].innerHTML;

  for (const href of ["quiz.html", "filieres.html", "mentorat.html", "offres.html", "dashboard.html"]) {
    assert.match(espaces, new RegExp(`href="${href.replace(".", "\\.")}"`));
  }
  assert.match(espaces, /aria-current="page"/);
  assert.match(espaces, /démonstration ne sont transmises à aucun mentor/);
  assert.match(espaces, /ne sont pas synchronisés avec un service en ligne/);
  assert.doesNotMatch(espaces, /échange confirmé|candidature transmise|mentor disponible/);
});

test("le tableau Mentor n’attribue pas une demande par simple nom", () => {
  const page = executerDashboard(
    { nom: "Koffi Yao", email: "koffi@example.ci", typeCompte: "mentor" },
    {
      jac_demandes_mentorat: JSON.stringify([
        { mentorId: "m1", mentorNom: "Koffi Yao", jeuneNom: "Awa", statut: "en attente" }
      ])
    }
  );

  assert.match(page.elements["dashboard-sections"].innerHTML, /ne peut être rattachée de façon fiable/);
  assert.doesNotMatch(page.elements["dashboard-sections"].innerHTML, /Awa/);
  assert.match(page.elements["dashboard-stats"].innerHTML, /Non reliées/);
  assert.doesNotMatch(page.elements["dashboard-sections"].innerHTML, /Mentorés actifs|Échanges réels/);
});

test("le tableau Mentor ne montre que les demandes avec identifiant de profil correspondant", () => {
  const page = executerDashboard(
    { nom: "Mentor", email: "mentor@example.ci", typeCompte: "mentor", profilDetails: { mentorId: "m1" } },
    {
      jac_demandes_mentorat: JSON.stringify([
        { mentorId: "m1", jeuneNom: "Awa", statut: "en attente" },
        { mentorId: "m2", jeuneNom: "Koffi", statut: "acceptée" }
      ])
    }
  );

  assert.match(page.elements["dashboard-sections"].innerHTML, /Awa/);
  assert.doesNotMatch(page.elements["dashboard-sections"].innerHTML, /Koffi/);
  assert.match(page.elements["dashboard-sections"].innerHTML, /démonstration locale, non transmise/);
});

test("le tableau Entreprise filtre ses offres et n’invente aucun candidat ni entretien", () => {
  const page = executerDashboard(
    { nom: "Contact RH", email: "rh@example.ci", typeCompte: "entreprise", profilDetails: { organisation: "Structure déclarée" } },
    {
      jac_offres_entreprise: JSON.stringify([
        { id: "local-1", entrepriseEmail: "rh@example.ci", titre: "<script>offre</script>", statut: "a_verifier" },
        { id: "local-2", entrepriseEmail: "autre@example.ci", titre: "Offre tierce", statut: "brouillon" }
      ])
    }
  );

  assert.match(page.elements["dashboard-nav"].innerHTML, /publier-offre\.html#mes-offres/);
  assert.match(page.elements["dashboard-stats"].innerHTML, /1<\/strong>[\s\S]*Offres locales/);
  assert.doesNotMatch(page.elements["dashboard-stats"].innerHTML, /Candidatures reçues|Entretiens/);
  assert.match(page.elements["dashboard-sections"].innerHTML, /Structure déclarée/);
  assert.match(page.elements["dashboard-sections"].innerHTML, /À vérifier, non transmis/);
  assert.match(page.elements["dashboard-sections"].innerHTML, /&lt;script&gt;offre/);
  assert.doesNotMatch(page.elements["dashboard-sections"].innerHTML, /Offre tierce|Candidature consultée|Entretien planifié|<script>offre/);
});

test("une donnée locale corrompue est signalée au lieu d’être comptée comme zéro", () => {
  const page = executerDashboard(
    { nom: "Awa", email: "awa@example.ci", typeCompte: "jeune" },
    { jac_candidatures: "{invalid" }
  );

  assert.equal(page.elements["dashboard-erreur"].hidden, false);
  assert.match(page.elements["dashboard-erreur"].textContent, /historique des candidatures locales est illisible/);
  assert.match(page.elements["dashboard-stats"].innerHTML, /Indisponible/);
});

test("la déconnexion retire seulement la session et conserve les comptes locaux", () => {
  const comptes = JSON.stringify([{ email: "awa@example.ci", typeCompte: "jeune" }]);
  const page = executerDashboard(
    { nom: "Awa", email: "awa@example.ci", typeCompte: "jeune" },
    { jac_utilisateurs: comptes }
  );

  page.elements["bouton-deconnexion"].click();

  assert.equal(Object.prototype.hasOwnProperty.call(page.donnees, "jac_utilisateur_connecte"), false);
  assert.equal(page.donnees.jac_utilisateurs, comptes);
  assert.equal(page.window.location.href, "index.html");
});

test("une session corrompue affiche une erreur et n’ouvre pas un espace par défaut", () => {
  const page = executerDashboard(undefined, { jac_utilisateur_connecte: "{invalid" });

  assert.equal(page.elements["bloc-dashboard"].hidden, true);
  assert.equal(page.elements["bloc-non-connecte"].children.length, 1);
  assert.match(page.elements["bloc-non-connecte"].children[0].textContent, /session locale est illisible/);
});

test("le pilote public ne lit pas les comptes locaux et laisse le tableau de bord fermé", async () => {
  const stockage = { jac_utilisateur_connecte: "{invalid", jac_utilisateurs: "[{}]" };
  const page = executerDashboard(
    undefined,
    stockage,
    false
  );
  await page.ready;

  assert.equal(page.lecturesStockage, 0);
  assert.equal(page.elements["bloc-dashboard"].hidden, true);
  assert.equal(page.elements["bouton-deconnexion"].click, undefined);
  assert.deepEqual(page.donnees, stockage);
});

test("le tableau de bord affiche l'identité de la session serveur sans lire les anciennes données du navigateur", async () => {
  const calls = [];
  const page = executerDashboard(undefined, { jac_utilisateur_connecte: "{invalid" }, false, async (url) => {
    calls.push(url);
    if (url === "/auth/status") {
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: { enabled: true, csrf_token: "csrf-test" } })
      };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({
        data: { user: { id: 7, name: "Awa Koné", email: "awa@example.ci", role: "jeune" } }
      })
    };
  });
  await page.ready;

  assert.deepEqual(calls, ["/auth/status", "/auth/current"]);
  assert.equal(page.lecturesStockage, 0);
  assert.equal(page.elements["bloc-dashboard"].hidden, false);
  assert.equal(page.elements["sidebar-nom"].textContent, "Awa Koné");
  assert.match(page.elements["dashboard-sections"].innerHTML, /pas encore liés à ce compte/);
});

test("la déconnexion du tableau de bord envoie le jeton CSRF et ferme la session serveur", async () => {
  let logoutOptions;
  const page = executerDashboard(undefined, {}, false, async (url, options = {}) => {
    if (url === "/auth/status") {
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: { enabled: true, csrf_token: "csrf-test" } })
      };
    }
    if (url === "/auth/current") {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: { user: { id: 7, name: "Awa Koné", email: "awa@example.ci", role: "jeune" } }
        })
      };
    }
    logoutOptions = options;
    return { ok: true, status: 200, json: async () => ({}) };
  });
  await page.ready;
  await page.elements["bouton-deconnexion"].click({
    currentTarget: page.elements["bouton-deconnexion"]
  });

  assert.equal(logoutOptions.method, "POST");
  assert.equal(logoutOptions.headers["X-CSRF-TOKEN"], "csrf-test");
  assert.equal(page.window.location.href, "/connexion.html");
  assert.equal(page.lecturesStockage, 0);
});
