const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "js", "offres.js"), "utf8");

function creerContexte(elements = {}, stockage = {}) {
  const document = {
    addEventListener() {},
    getElementById(id) {
      return elements[id];
    }
  };
  const localStorage = {
    getItem(cle) {
      return Object.prototype.hasOwnProperty.call(stockage, cle) ? stockage[cle] : null;
    },
    setItem(cle, valeur) {
      stockage[cle] = valeur;
    }
  };
  const window = {
    addEventListener() {},
    location: { hash: "", pathname: "/offres.html", search: "" },
    JeuneAvenirMotion: { initialiser() {}, animer() {} },
    JeuneAvenirPilot: { submissionsEnabled: false }
  };
  const contexte = vm.createContext({ document, window, localStorage, console, history: { replaceState() {} } });
  vm.runInContext(source, contexte, { filename: "js/offres.js" });
  return contexte;
}

function elementsCatalogue({ recherche = "", domaine = "", ville = "", type = "", contrat = "" } = {}) {
  return {
    "recherche-offre": { value: recherche },
    "filtre-domaine-offre": { value: domaine },
    "filtre-ville-offre": { value: ville },
    "filtre-type-offre": { value: type },
    "filtre-contrat-offre": { value: contrat },
    "compteur-offres": { textContent: "" },
    "liste-offres": {
      innerHTML: "",
      setAttribute() {},
      removeAttribute() {}
    }
  };
}

test("recherche accentuée et filtres domaine, ville, type et contrat se combinent", () => {
  const elements = elementsCatalogue({
    recherche: "developpeur web",
    domaine: "informatique",
    ville: "Abidjan",
    type: "stage",
    contrat: "Stage conventionné"
  });
  const contexte = creerContexte(elements);
  vm.runInContext('TOUTES_FILIERES = [{ id: "informatique", nom: "Informatique" }]', contexte);
  vm.runInContext(`TOUTES_OFFRES = ${JSON.stringify([
    {
      id: "offre-1",
      titre: "Stagiaire développeur web",
      type: "stage",
      domaine: "informatique",
      ville: "Abidjan",
      entreprise: "Équipe numérique",
      contrat: "Stage conventionné"
    },
    {
      id: "offre-2",
      titre: "Développeur web junior",
      type: "emploi",
      domaine: "informatique",
      ville: "Abidjan",
      entreprise: "Équipe numérique",
      contrat: "CDI"
    },
    {
      id: "offre-3",
      titre: "Stagiaire développeur web",
      type: "stage",
      domaine: "informatique",
      ville: "Bouaké",
      entreprise: "Équipe numérique",
      contrat: "Stage conventionné"
    }
  ])}`, contexte);

  contexte.appliquerFiltres();

  assert.match(elements["liste-offres"].innerHTML, /Stagiaire développeur web/);
  assert.doesNotMatch(elements["liste-offres"].innerHTML, /Développeur web junior/);
  assert.doesNotMatch(elements["liste-offres"].innerHTML, /offre-3/);
  assert.equal(elements["compteur-offres"].textContent, "1 offre vérifiée");
});

test("les offres sans identifiant, titre ou type reconnu ne sont pas normalisées", () => {
  const contexte = creerContexte();

  assert.equal(contexte.normaliserOffre({ titre: "Sans identifiant", type: "stage" }), null);
  assert.equal(contexte.normaliserOffre({ id: "x", titre: "Sans type" }), null);
  assert.equal(contexte.normaliserOffre({ id: "x", titre: "Type inventé", type: "freelance" }), null);
  assert.equal(contexte.normaliserOffre({ id: "x", titre: "Stage vérifié", type: "stage" }).id, "x");
});

test("le catalogue vide n’affiche pas les offres locales comme des annonces publiques", () => {
  const elements = elementsCatalogue();
  const contexte = creerContexte(elements);
  vm.runInContext("OFFRES_PUBLIEES = false; TOUTES_OFFRES = []", contexte);

  contexte.afficherListeOffres([]);

  assert.equal(elements["compteur-offres"].textContent, "Aucune offre vérifiée publiée pour le moment.");
  assert.match(elements["liste-offres"].innerHTML, /Espace entreprise/);
  assert.doesNotMatch(elements["liste-offres"].innerHTML, /offre-1/);
});

test("les cartes échappent les contenus issus des données d’annonce", () => {
  const contexte = creerContexte();
  const html = contexte.carteOffreHTML({
    id: '"><script>alert(1)</script>',
    titre: "<img src=x onerror=alert(1)>",
    entreprise: "Entreprise & fils",
    type: "stage",
    domaine: "informatique",
    ville: "Abidjan"
  });

  assert.doesNotMatch(html, /<script>|<img/);
  assert.match(html, /&lt;img/);
  assert.match(html, /Entreprise &amp; fils/);
});

test("le pilote bloque aussi les candidatures pour les rôles non Jeune", () => {
  const elements = { "zone-candidature": { innerHTML: "" } };
  const contexte = creerContexte(elements);

  contexte.afficherFormulaireCandidature({ id: "offre-1" }, { typeCompte: "entreprise", email: "entreprise@example.ci" });

  assert.match(elements["zone-candidature"].innerHTML, /ne sont pas disponibles pendant ce pilote/);
  assert.doesNotMatch(elements["zone-candidature"].innerHTML, /formulaire-candidature/);
});

test("le pilote public bloque une candidature et ne conserve aucune donnée de candidat", () => {
  const stockage = { jac_candidatures: "[]" };
  const zone = { innerHTML: "" };
  const contexte = creerContexte({ "zone-candidature": zone }, stockage);
  const utilisateur = { typeCompte: "jeune", nom: "Awa Koné", email: "awa@example.ci" };
  const offre = { id: "offre-1", titre: "Stage développeuse", entreprise: "Structure vérifiée" };

  contexte.afficherFormulaireCandidature(offre, utilisateur);

  const candidatures = JSON.parse(stockage.jac_candidatures);
  assert.equal(candidatures.length, 0);
  assert.match(zone.innerHTML, /ne sont pas disponibles pendant ce pilote/);
  assert.doesNotMatch(zone.innerHTML, /formulaire-candidature|awa@example\.ci/);
});

test("les statuts de candidature sont distincts et signalés comme démonstration", () => {
  const contexte = creerContexte();
  const attente = contexte.libelleStatutCandidature("en_attente");
  const acceptee = contexte.libelleStatutCandidature("acceptee");
  const refusee = contexte.libelleStatutCandidature("refusee");

  assert.notEqual(attente, acceptee);
  assert.notEqual(acceptee, refusee);
  assert.match(attente, /démonstration locale/);
  assert.match(contexte.libelleStatutCandidature("envoyée"), /non vérifiable/);
});
