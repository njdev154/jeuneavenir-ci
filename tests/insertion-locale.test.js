const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function chargerContexte(fichier, elements = {}, stockage = {}) {
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
    JeuneAvenirMotion: { initialiser() {}, animer() {} },
    location: { search: "" }
  };
  const contexte = vm.createContext({ document, localStorage, window, console, Date });
  const source = fs.readFileSync(path.join(__dirname, "..", "js", fichier), "utf8");
  vm.runInContext(source, contexte, { filename: `js/${fichier}` });
  return contexte;
}

test("les comptes sans rôle entreprise ne reçoivent pas le formulaire de publication", () => {
  const bloc = { hidden: true, innerHTML: "" };
  const contexte = chargerContexte("publication-offre.js", { "acces-publication": bloc });

  contexte.afficherAccesPublicationRefuse();

  assert.equal(bloc.hidden, false);
  assert.match(bloc.innerHTML, /Accès réservé aux comptes Entreprise/);
  assert.match(bloc.innerHTML, /ne remplace pas une autorisation côté serveur/);
});

test("les annonces locales affichent clairement brouillon et vérification non transmise", () => {
  const contexte = chargerContexte("publication-offre.js");

  assert.match(contexte.libelleStatutOffre("brouillon"), /Brouillon — local/);
  assert.match(contexte.libelleStatutOffre("a_verifier"), /non transmis/);
  assert.match(contexte.libelleStatutOffre("publiee"), /non reconnu/);
});

test("les anciennes candidatures ne sont pas présentées comme des décisions réelles", () => {
  const contexte = chargerContexte("candidatures.js");

  assert.match(contexte.statutHistorique({ mode: "demonstration_locale", statut: "en_attente" }).texte, /En attente/);
  assert.match(contexte.statutHistorique({ mode: "demonstration_locale", statut: "acceptee" }).texte, /Acceptée/);
  assert.match(contexte.statutHistorique({ mode: "demonstration_locale", statut: "refusee" }).texte, /Refusée/);
  assert.match(contexte.statutHistorique({ statut: "envoyée" }).texte, /statut non vérifiable/);
});

test("les fiches de suivi échappent le contenu local du candidat", () => {
  const contexte = chargerContexte("candidatures.js");
  const html = contexte.carteHistoriqueCandidature({
    offreId: "offre-1",
    offreTitre: "<img src=x onerror=alert(1)>",
    entreprise: "Entreprise & fils",
    mode: "demonstration_locale",
    statut: "en_attente",
    motivation: "<script>alert(1)</script>",
    date: "2026-11-17T12:00:00.000Z"
  });

  assert.doesNotMatch(html, /<img|<script>/);
  assert.match(html, /&lt;img/);
  assert.match(html, /Entreprise &amp; fils/);
  assert.match(html, /Aucune transmission à l’entreprise n’a eu lieu/);
});
