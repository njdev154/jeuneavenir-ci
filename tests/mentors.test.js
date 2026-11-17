const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "js", "mentors.js"), "utf8");

function creerContexte(elements = {}) {
  const document = {
    addEventListener() {},
    getElementById(id) {
      return elements[id];
    }
  };
  const window = {
    JeuneAvenirMotion: {
      initialiser() {},
      animer() {}
    }
  };
  const contexte = vm.createContext({ document, window, console });
  vm.runInContext(source, contexte, { filename: "js/mentors.js" });
  return contexte;
}

test("la recherche mentor ignore les accents et combine recherche et domaine", () => {
  const elements = {
    "recherche-mentor": { value: "developpement web" },
    "filtre-domaine-mentor": { value: "informatique" },
    "compteur-mentors": { textContent: "" },
    "grille-mentors": { innerHTML: "" }
  };
  const contexte = creerContexte(elements);
  const mentors = [
    {
      id: "mentor-informatique",
      nom: "Awa Koné",
      domaine: "informatique",
      presentation: "Spécialisée en développement web."
    },
    {
      id: "mentor-gestion",
      nom: "Koffi Yao",
      domaine: "gestion-commerce",
      presentation: "Développement commercial."
    }
  ];
  const filieres = [
    { id: "informatique", nom: "Informatique" },
    { id: "gestion-commerce", nom: "Gestion & Commerce" }
  ];
  vm.runInContext(`TOUS_MENTORS = ${JSON.stringify(mentors)}`, contexte);
  vm.runInContext(`TOUTES_FILIERES = ${JSON.stringify(filieres)}`, contexte);

  contexte.appliquerFiltres();

  assert.match(elements["grille-mentors"].innerHTML, /Awa Koné/);
  assert.doesNotMatch(elements["grille-mentors"].innerHTML, /Koffi Yao/);
  assert.equal(elements["compteur-mentors"].textContent, "1 profil publié");
});

test("les statuts de démonstration distinguent attente, acceptation, refus et statut inconnu", () => {
  const contexte = creerContexte();

  assert.equal(contexte.normaliserStatutDemande("en attente").classe, "attente");
  assert.equal(contexte.normaliserStatutDemande("accepted").classe, "acceptee");
  assert.equal(contexte.normaliserStatutDemande("refusée").classe, "refusee");
  assert.equal(contexte.normaliserStatutDemande("autre").classe, "indisponible");
});

test("le récapitulatif local échappe le message et précise qu'aucune réponse réelle n'existe", () => {
  const contexte = creerContexte();
  const zone = { innerHTML: "" };

  contexte.afficherStatutDemande(zone, {
    statut: "en attente",
    mentorNom: "Awa Koné",
    date: "2026-11-17T12:00:00.000Z",
    message: "<script>alert(1)</script>"
  });

  assert.match(zone.innerHTML, /Statut de démonstration : En attente/);
  assert.match(zone.innerHTML, /Awa Koné/);
  assert.match(zone.innerHTML, /aucune notification ni mise en relation réelle/);
  assert.match(zone.innerHTML, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(zone.innerHTML, /<script>alert/);
});
