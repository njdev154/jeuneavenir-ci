const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const racine = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(racine, "js", "main.js"), "utf8");
const pagesPrincipales = [
  "index.html",
  "quiz.html",
  "resultat.html",
  "filieres.html",
  "mentorat.html",
  "offres.html",
  "dashboard.html"
];
const piliers = ["quiz.html", "filieres.html", "mentorat.html", "offres.html", "dashboard.html"];

function creerClassList(initial = []) {
  const classes = new Set(initial);
  return {
    add(nom) { classes.add(nom); },
    remove(nom) { classes.delete(nom); },
    contains(nom) { return classes.has(nom); },
    toggle(nom) {
      if (classes.has(nom)) {
        classes.delete(nom);
        return false;
      }
      classes.add(nom);
      return true;
    }
  };
}

function ouvrirPage(href = "quiz.html") {
  const attributs = {};
  const liens = piliers.map(page => ({
    href: `http://localhost/${page}`,
    attributs: {},
    classList: creerClassList(),
    setAttribute(cle, valeur) { this.attributs[cle] = valeur; },
    removeAttribute(cle) { delete this.attributs[cle]; }
  }));
  const entete = { classList: creerClassList() };
  const burger = {
    classList: creerClassList(),
    setAttribute(cle, valeur) { attributs[cle] = valeur; },
    addEventListener(type, callback) { this[type] = callback; },
    closest() { return entete; },
    focus() { this.focused = true; }
  };
  const nav = {
    id: "nav-principale",
    classList: creerClassList(),
    addEventListener(type, callback) { this[type] = callback; },
    querySelectorAll() { return liens; }
  };
  const callbacks = {};
  const document = {
    addEventListener(type, callback) { callbacks[type] = callback; },
    querySelector(selector) {
      if (selector === ".menu-burger") return burger;
      if (selector === ".nav-principale") return nav;
      return null;
    },
    querySelectorAll() { return liens; }
  };
  const window = {
    location: { pathname: `/${href}`, href: `http://localhost/${href}` },
    JeuneAvenirMotion: { initialiser() {} }
  };
  vm.runInContext(source, vm.createContext({ document, window, URL }), { filename: "js/main.js" });
  callbacks.DOMContentLoaded();
  return { attributs, burger, callbacks, entete, liens, nav };
}

test("les pages principales donnent accès aux cinq piliers", () => {
  for (const nomPage of pagesPrincipales) {
    const page = fs.readFileSync(path.join(racine, nomPage), "utf8");
    const navigation = page.match(/<nav\b[^>]*class="nav-principale"[\s\S]*?<\/nav>/);
    assert.ok(navigation, `Navigation principale absente dans ${nomPage}`);
    for (const pilier of piliers) {
      assert.match(navigation[0], new RegExp(`href="${pilier.replace(".", "\\.")}"`), `${pilier} absent de ${nomPage}`);
    }
  }
});

test("la navigation expose le pilier courant et le menu mobile se ferme avec Échap ou un lien", () => {
  const page = ouvrirPage();
  const lienOrientation = page.liens.find(lien => lien.href.endsWith("/quiz.html"));

  assert.equal(lienOrientation.attributs["aria-current"], "page");
  assert.equal(page.attributs["aria-expanded"], "false");

  page.burger.click();
  assert.equal(page.attributs["aria-expanded"], "true");
  page.callbacks.keydown({ key: "Escape" });
  assert.equal(page.attributs["aria-expanded"], "false");
  assert.equal(page.burger.focused, true);

  page.burger.click();
  page.nav.click({ target: { closest() { return lienOrientation; } } });
  assert.equal(page.attributs["aria-expanded"], "false");
  assert.equal(page.entete.classList.contains("menu-ouvert"), false);
});

test("les sous-pages reprennent le pilier de leur parcours principal", () => {
  const pages = [
    ["resultat.html", "quiz.html"],
    ["comparateur.html", "quiz.html"],
    ["ecoles.html", "filieres.html"],
    ["metiers.html", "filieres.html"],
    ["recherche.html", "filieres.html"],
    ["candidatures.html", "offres.html"],
    ["publier-offre.html", "offres.html"],
    ["profil.html", "dashboard.html"],
    ["favoris.html", "dashboard.html"]
  ];

  for (const [pageActuelle, hrefPilier] of pages) {
    const page = ouvrirPage(pageActuelle);
    const lienActif = page.liens.find(lien => lien.href.endsWith(`/${hrefPilier}`));
    assert.equal(lienActif.attributs["aria-current"], "page", `${pageActuelle} ne marque pas ${hrefPilier} comme actif`);
  }
});
