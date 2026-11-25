const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const faqSource = fs.readFileSync(path.join(root, "js", "faq.js"), "utf8");
const contactSource = fs.readFileSync(path.join(root, "js", "contact.js"), "utf8");
const mainSource = fs.readFileSync(path.join(root, "js", "main.js"), "utf8");

function creerPageFAQ(categories) {
  const callbacks = {};
  const questions = categories.map((categorie, index) => ({
    dataset: { faqItem: categorie },
    textContent: [
      "Le résultat dépend-il du questionnaire ?",
      "Comment consulter les favoris ?",
      "Le site fonctionne-t-il hors connexion ?"
    ][index],
    hidden: false
  }));
  const filtres = {
    boutons: ["tout", ...new Set(categories)].map(categorie => ({
      dataset: { faqCategorie: categorie },
      setAttribute(nom, valeur) { this[nom] = valeur; }
    })),
    addEventListener(type, callback) { this[type] = callback; },
    querySelectorAll() { return this.boutons; }
  };
  const elements = {
    "faq-outils": { hidden: true },
    "faq-recherche": {
      value: "",
      addEventListener(type, callback) { this[type] = callback; }
    },
    "faq-filtres": filtres,
    "faq-statut": { textContent: "" },
    "faq-vide": { hidden: true }
  };
  const document = {
    addEventListener(type, callback) { callbacks[type] = callback; },
    getElementById(id) { return elements[id]; },
    querySelectorAll() { return questions; }
  };
  const window = { JeuneAvenirMotion: { initialiser() {} } };
  const contexte = vm.createContext({ document, window });
  vm.runInContext(faqSource, contexte, { filename: "js/faq.js" });
  callbacks.DOMContentLoaded();
  return { elements, questions, filtres };
}

test("la recherche FAQ ignore les accents et affiche un état vide explicite", () => {
  const page = creerPageFAQ(["orientation", "compte", "technique"]);
  const recherche = page.elements["faq-recherche"];

  recherche.value = "resultat";
  recherche.input();
  assert.deepEqual(page.questions.map(question => question.hidden), [false, true, true]);

  recherche.value = "hors connexion";
  recherche.input();
  assert.deepEqual(page.questions.map(question => question.hidden), [true, true, false]);
  assert.match(page.elements["faq-statut"].textContent, /1 question affichée/);

  recherche.value = "aïe, aucun résultat";
  recherche.input();
  assert.ok(page.questions.every(question => question.hidden));
  assert.equal(page.elements["faq-vide"].hidden, false);
});

test("les filtres FAQ se combinent avec la recherche et mettent à jour aria-pressed", () => {
  const page = creerPageFAQ(["orientation", "compte", "technique"]);
  const bouton = page.filtres.boutons.find(item => item.dataset.faqCategorie === "compte");
  page.elements["faq-recherche"].value = "favoris";

  page.filtres.click({ target: { closest: () => bouton } });

  assert.deepEqual(page.questions.map(question => question.hidden), [true, false, true]);
  assert.equal(bouton["aria-pressed"], "true");
  assert.equal(page.filtres.boutons[0]["aria-pressed"], "false");
});

test("les questions FAQ utilisent les accordéons natifs et restent accessibles sans script", () => {
  const html = fs.readFileSync(path.join(root, "faq.html"), "utf8");
  assert.match(html, /<details class="institutional-faq-item"/);
  assert.match(html, /<summary>Comment fonctionne le questionnaire/);
  assert.match(html, /id="faq-outils"[^>]*hidden/);
  assert.match(html, /aria-live="polite"/);
  for (const categorie of ["orientation", "decouverte", "mentorat", "insertion", "compte", "technique"]) {
    assert.match(html, new RegExp(`data-faq-item="${categorie}"`));
  }
});

function creerFormulaireContact(estValide) {
  const callbacks = {};
  const champs = {
    "contact-nom": {
      value: estValide ? "Nom test" : "   ",
      addEventListener(type, callback) { this[type] = callback; },
      setCustomValidity(message) { this.validationMessage = message; }
    },
    "contact-message": {
      value: estValide ? "Message test" : "  ",
      addEventListener(type, callback) { this[type] = callback; },
      setCustomValidity(message) { this.validationMessage = message; }
    }
  };
  const statut = {
    hidden: true,
    className: "",
    textContent: "",
    focus() {}
  };
  const formulaire = {
    addEventListener(type, callback) {
      callbacks[type] = callback;
      this[type] = callback;
    },
    checkValidity() { return estValide; },
    reportValidity() { this.aDemandeValidation = true; }
  };
  const document = {
    addEventListener(type, callback) { callbacks[type] = callback; },
    getElementById(id) {
      if (id === "formulaire-contact") return formulaire;
      if (id === "etat-contact") return statut;
      return champs[id];
    }
  };
  const window = { JeuneAvenirPilot: { submissionsEnabled: false } };
  const contexte = vm.createContext({ document, window });
  vm.runInContext(contactSource, contexte, { filename: "js/contact.js" });
  callbacks.DOMContentLoaded();
  return { formulaire, statut };
}

test("le formulaire Contact est désactivé dans le pilote et ne collecte rien", () => {
  const html = fs.readFileSync(path.join(root, "contact.html"), "utf8");
  const formulaireHTML = html.match(/<form id="formulaire-contact"[\s\S]*?<\/form>/)[0];
  const page = creerFormulaireContact(true);

  assert.equal(page.formulaire.submit, undefined);
  assert.match(formulaireHTML, /<fieldset class="pilot-disabled-controls" disabled/);
  assert.match(html, /Le contact n’est pas ouvert pendant ce pilote/);
  assert.doesNotMatch(contactSource, /localStorage|jac_messages_contact/);
  assert.match(formulaireHTML, /action="contact\.html" method="get"/);
});

test("les fonctions du pilote désactivent comptes et envois et n’effacent que les clés JeuneAvenir", () => {
  const stockage = {
    jac_orientation_parcours_v1: "{}",
    jac_utilisateurs: "[]",
    autre_application: "à conserver"
  };
  const cles = Object.keys(stockage);
  const localStorage = {
    get length() { return cles.length; },
    key(index) { return cles[index] ?? null; },
    removeItem(cle) {
      delete stockage[cle];
      cles.splice(cles.indexOf(cle), 1);
    }
  };
  const stockageSession = { jac_orientation_api_resultat_session: "{}" };
  const clesSession = Object.keys(stockageSession);
  const sessionStorage = {
    get length() { return clesSession.length; },
    key(index) { return clesSession[index] ?? null; },
    removeItem(cle) {
      delete stockageSession[cle];
      clesSession.splice(clesSession.indexOf(cle), 1);
    }
  };
  const document = { addEventListener() {} };
  const window = { localStorage, sessionStorage };
  const contexte = vm.createContext({ document, window });
  vm.runInContext(mainSource, contexte, { filename: "js/main.js" });

  assert.equal(window.JeuneAvenirPilot.accountsEnabled, false);
  assert.equal(window.JeuneAvenirPilot.submissionsEnabled, false);
  assert.equal(window.JeuneAvenirPilot.effacerDonneesLocales(), 3);
  assert.deepEqual(stockage, { autre_application: "à conserver" });
  assert.deepEqual(stockageSession, {});
});

test("les pages institutionnelles documentent les mécanismes de stockage réellement utilisés", () => {
  const confidentialite = fs.readFileSync(path.join(root, "confidentialite.html"), "utf8");
  const scripts = fs.readdirSync(path.join(root, "js"))
    .filter(nom => nom.endsWith(".js"))
    .map(nom => fs.readFileSync(path.join(root, "js", nom), "utf8"))
    .join("\n");
  const clesDocumentees = [
    "jac_utilisateurs", "jac_utilisateur_connecte", "jac_dernier_resultat_quiz",
    "jac_orientation_parcours_v1", "jac_favoris", "jac_candidatures", "jac_demandes_mentorat",
    "jac_offres_entreprise", "jac_avis", "jac_orientation_api_resultat_session"
  ];

  for (const cle of clesDocumentees) {
    assert.ok(scripts.includes(cle), `La clé ${cle} existe dans les scripts.`);
    assert.ok(confidentialite.includes(cle), `La clé ${cle} est documentée.`);
  }
  assert.doesNotMatch(scripts, /jac_messages_contact/);
  assert.match(confidentialite, /Google Fonts/);
  assert.match(confidentialite, /Effacer les données de cet appareil/);
  assert.match(confidentialite, /commençant par <code>jac_<\/code>/);
});

test("les liens internes des quatre pages institutionnelles pointent vers des fichiers existants", () => {
  for (const nom of ["faq.html", "a-propos.html", "contact.html", "confidentialite.html"]) {
    const html = fs.readFileSync(path.join(root, nom), "utf8");
    const liens = [...html.matchAll(/\bhref="([^"]+)"/g)].map(match => match[1]);
    for (const lien of liens) {
      if (/^(?:https?:|mailto:|tel:|#)/i.test(lien)) continue;
      const fichier = lien.split("#")[0];
      assert.ok(fs.existsSync(path.join(root, fichier)), `${nom} référence ${lien}.`);
    }
    assert.match(html, /css\/motion\.css/);
    assert.match(html, /js\/motion\.js/);
  }
});
