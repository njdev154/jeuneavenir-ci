// assistant.js — JeuneAvenir CI
// Assistant d'orientation, PHASE A (locale), ajoutée en V1.
//
// CE QUE C'EST :
// Un assistant local qui consulte les fichiers data/*.json et signale
// les informations encore à confirmer. Ce n'est pas une IA générative.
//
// SÉCURITÉ (par conception) :
// - Aucune clé API ni appel à un service externe : les JSON sont chargés
//   depuis le site et les questions restent dans le navigateur.
// - Les questions tapées par le visiteur ne sont envoyées NULLE PART et
//   ne sont PAS enregistrées (ni localStorage, ni base, ni statistique).
// - Tout affichage passe par textContent / createElement : le texte de
//   l'utilisateur et celui des données ne sont jamais injectés comme du
//   HTML (protection contre les injections de code, XSS).
// - Seule lecture autorisée en plus des JSON : le résultat du quiz déjà
//   stocké par le site lui-même (clé "jac_dernier_resultat_quiz"), pour
//   personnaliser les conseils. Lecture seule, jamais modifiée ici.
//
// VERROU COMPTE (demandé par Junior, 2026-11-15) :
// L'assistant ne répond qu'aux visiteurs CONNECTÉS : sans compte et sans
// connexion, il affiche un message et les boutons Inscription / Connexion
// au lieu de répondre. La vérification lit la clé que le site utilise
// déjà ("jac_utilisateur_connecte", posée par js/auth.js).
// Limite honnête : en V1, les comptes sont SIMULÉS (localStorage, mot de
// passe non vérifié — voir le CDC, section 3). Ce verrou est donc un
// verrou de parcours : il arrête les visiteurs ordinaires, pas un
// technicien déterminé. La vraie serrure arrivera avec la V2 (Supabase
// Auth) et, pour la Phase B, le serveur vérifiera la session AVANT tout
// appel à Gemini — c'est aussi ce qui protégera le quota et, plus tard,
// le paiement.
//
// LIMITES HONNÊTES :
// Ce n'est PAS une intelligence artificielle générative : l'assistant
// comprend les questions prévues (filières, écoles, métiers, mentors,
// offres, séries du bac, résultat du quiz) et cherche dans les données.
// Hors de ces sujets, il le dit clairement au lieu d'inventer.
// La conversation libre (Phase B, Gemini côté serveur) viendra ensuite,
// par-dessus ce même assistant qui restera en secours.

(function () {
  "use strict";

  // ------------------------------------------------------------------
  // 1. OUTILS TEXTE
  // ------------------------------------------------------------------

  // Met un texte en forme comparable : minuscules, sans accents,
  // sans ponctuation. Ex : "Écoles à Abidjan !" -> "ecoles a abidjan"
  function normaliser(texte) {
    return String(texte || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  var MOTS_VIDES = {
    le: 1, la: 1, les: 1, de: 1, des: 1, du: 1, un: 1, une: 1, et: 1,
    a: 1, au: 1, aux: 1, en: 1, je: 1, tu: 1, il: 1, elle: 1, on: 1,
    nous: 1, vous: 1, mon: 1, ma: 1, mes: 1, ton: 1, ta: 1, tes: 1,
    son: 1, sa: 1, ses: 1, ce: 1, cette: 1, ces: 1, pour: 1, par: 1,
    avec: 1, sans: 1, sur: 1, sous: 1, chez: 1, dans: 1, qui: 1,
    que: 1, quoi: 1, est: 1, sont: 1, ai: 1, as: 1, avons: 1, avez: 1,
    ont: 1, etre: 1, suis: 1, es: 1, sommes: 1, etes: 1, moi: 1,
    toi: 1, lui: 1, y: 1, d: 1, l: 1, n: 1, s: 1, qu: 1, se: 1,
    ou: 1, plus: 1, tres: 1, aussi: 1, comme: 1, si: 1, ne: 1, pas: 1
  };

  // Découpe une question en mots utiles (on garde aussi les mots courts
  // utiles comme "a2" ou "d" quand ils désignent une série).
  function motsUtiles(questionNormalisee) {
    return questionNormalisee.split(" ").filter(function (mot) {
      return mot.length >= 2 && !MOTS_VIDES[mot];
    });
  }

  // Vrai si le mot apparaît comme mot entier dans le texte normalisé.
  function contientMot(texteNormalise, mot) {
    return (" " + texteNormalise + " ").indexOf(" " + mot + " ") !== -1;
  }

  // Score de pertinence : pour chaque mot de la question, on regarde
  // s'il apparaît dans les champs de l'élément, avec un poids par champ.
  // champs = [{ texte: "...", poids: 6 }, ...]
  function scorer(mots, champs) {
    var total = 0;
    champs.forEach(function (champ) {
      var texteN = normaliser(champ.texte);
      mots.forEach(function (mot) {
        if (contientMot(texteN, mot)) total += champ.poids;
      });
    });
    return total;
  }

  // ------------------------------------------------------------------
  // 2. ACCÈS AUX DONNÉES (objets du site, déjà chargés)
  // ------------------------------------------------------------------

  function filiereParId(donnees, id) {
    return (donnees.filieres || []).find(function (f) { return f.id === id; }) || null;
  }
  function nomFiliere(donnees, id) {
    var f = filiereParId(donnees, id);
    return f ? f.nom : id;
  }
  function ecoleParId(donnees, id) {
    return (donnees.ecoles || []).find(function (e) { return e.id === id; }) || null;
  }
  function metierParId(donnees, id) {
    return (donnees.metiers || []).find(function (m) { return m.id === id; }) || null;
  }

  // Villes présentes dans les données (écoles + offres), forme normalisée
  // -> forme affichée. Ex : "abidjan" -> "Abidjan"
  function villesConnues(donnees) {
    var villes = {};
    (donnees.ecoles || []).forEach(function (e) { villes[normaliser(e.ville)] = e.ville; });
    (donnees.offres || []).forEach(function (o) { villes[normaliser(o.ville)] = o.ville; });
    return villes;
  }
  function villeDetectee(questionN, donnees) {
    var villes = villesConnues(donnees);
    for (var cle in villes) {
      if (contientMot(questionN, cle)) return villes[cle];
    }
    return null;
  }

  // Détecte une série du bac dans la question.
  // Gère : "bac A2", "série D", "terminale C", "filière F3",
  // et les noms complets ("lettres sciences humaines" -> A2).
  function serieDetectee(questionN, donnees) {
    var series = donnees.series || [];
    var parId = {};
    series.forEach(function (s) { parId[s.id] = s; });

    var m = questionN.match(/\b(a1|a2|f1|f2|f3|f4|f7|g1|g2|g3|h1|h2|h3)\b/);
    if (m && parId[m[1]]) return parId[m[1]];

    m = questionN.match(/\b(?:bac|serie|terminale)\s+([bcde])\b/);
    if (m && parId[m[1]]) return parId[m[1]];

    // Noms complets des séries
    var noms = [
      ["lettres langues", "a1"],
      ["lettres sciences humaines", "a2"],
      ["sciences economiques et sociales", "b"],
      ["economiques et sociales", "b"],
      ["mathematiques et physique", "c"],
      ["biologie geologie", "d"],
      ["mathematiques et techniques", "e"],
      ["construction mecanique", "f1"],
      ["electronique", "f2"],
      ["electrotechnique", "f3"],
      ["genie civil", "f4"],
      ["biochimie", "f7"],
      ["techniques administratives", "g1"],
      ["techniques quantitatives de gestion", "g2"],
      ["techniques commerciales", "g3"],
      ["arts plastiques", "h1"],
      ["musique", "h2"],
      ["art dramatique", "h3"]
    ];
    for (var i = 0; i < noms.length; i++) {
      if (questionN.indexOf(noms[i][0]) !== -1 && parId[noms[i][1]]) return parId[noms[i][1]];
    }
    return null;
  }

  // La filière la mieux assortie à la question (par son nom surtout).
  function meilleureFiliere(mots, donnees) {
    var meilleur = null, meilleurScore = 0;
    (donnees.filieres || []).forEach(function (f) {
      var score = scorer(mots, [
        { texte: f.nom, poids: 6 },
        { texte: (f.matieres_principales || []).join(" "), poids: 2 },
        { texte: f.description, poids: 1 }
      ]);
      if (score > meilleurScore) { meilleurScore = score; meilleur = f; }
    });
    return meilleurScore >= 6 ? meilleur : null;
  }

  // ------------------------------------------------------------------
  // 3. FABRIQUE DE CARTES (format commun d'affichage)
  // ------------------------------------------------------------------

  function carteFiliere(donnees, f) {
    return {
      titre: f.nom,
      lignes: [
        "Durée indicative : " + (f.duree_etudes || "à confirmer") + " — à vérifier auprès des établissements.",
        "Débouchés mentionnés : " + ((f.debouches || []).slice(0, 3).join(", ") || "voir la fiche")
      ],
      lien: "filieres.html#" + f.id,
      texteLien: "Voir la fiche filière"
    };
  }
  function carteEcole(donnees, e) {
    var domainesConfirmes = Boolean(e.verification && e.verification.domaine_confirme);
    var domaines = (e.domaines || []).map(function (d) {
      return nomFiliere(donnees, d);
    }).join(", ");
    return {
      titre: e.nom,
      lignes: [
        e.ville + (e.commune ? " — " + e.commune : ""),
        "Type indiqué : " + (e.statut === "prive" ? "privé" : e.statut === "public" ? "public" : "à confirmer"),
        "Domaines listés : " + (domaines || "non précisés") + (domainesConfirmes
          ? " — rattachement confirmé pour cette fiche; voir la portée des sources."
          : " — rattachements à confirmer.")
      ],
      lien: "ecoles.html",
      texteLien: "Voir la page Écoles",
      sources: (e.sources || []).filter(function (source) {
        return source && /^https?:\/\//i.test(String(source.url || ""));
      }).map(function (source) {
        return {
          href: source.url,
          label: source.libelle || "Consulter la source",
          description: source.portee || ""
        };
      })
    };
  }
  function carteMetier(donnees, m) {
    return {
      titre: m.nom,
      lignes: [(m.description || "").slice(0, 140)],
      lien: "metiers.html#" + m.id,
      texteLien: "Voir la fiche métier"
    };
  }
  function carteMentor(donnees, m) {
    return {
      titre: m.nom + " — mentor " + nomFiliere(donnees, m.domaine),
      lignes: [m.bio || "", "Disponibilité : " + (m.disponibilite || "à confirmer")],
      lien: "mentorat.html#" + m.id,
      texteLien: "Voir le profil du mentor"
    };
  }
  function carteOffre(donnees, o) {
    return {
      titre: o.titre,
      lignes: [
        o.entreprise + " — " + o.ville,
        "Type : " + o.type + " · Domaine : " + nomFiliere(donnees, o.domaine)
      ],
      lien: "offres.html#" + o.id,
      texteLien: "Voir l'offre"
    };
  }

  function reponseBase() { return { paragraphes: [], cartes: [], actions: [] }; }

  var ACTION_QUIZ = { label: "Faire le quiz d'orientation", href: "quiz.html" };
  var ACTION_FILIERES = { label: "Voir toutes les filières", href: "filieres.html" };
  var ACTION_CONTACT = { label: "Contacter l'équipe", href: "contact.html" };

  // ------------------------------------------------------------------
  // 4. LE CERVEAU : question -> réponse structurée
  //    Fonction pure (testable) : ne touche ni au DOM ni au réseau.
  //    contexte = { resultatQuiz: { filieresAccessibles: [ids] } | null }
  // ------------------------------------------------------------------

  function repondre(question, donnees, contexte) {
    contexte = contexte || {};
    var q = String(question || "").trim();
    var qn = normaliser(q);
    var mots = motsUtiles(qn);
    var rep = reponseBase();

    if (!qn) {
      rep.paragraphes.push("Écris-moi ta question, par exemple : « Quelles filières après un bac D ? » ou « Quelles écoles font l'informatique à Abidjan ? »");
      return rep;
    }

    // --- Salutations / politesse / présentation ---
    if (/^(bonjour|bonsoir|salut|hello|coucou|bjr)\b/.test(qn) && qn.split(" ").length <= 4) {
      rep.paragraphes.push("Bonjour et bienvenue sur JeuneAvenir CI. Je consulte le catalogue du site et je signale les informations qui restent à confirmer.");
      rep.paragraphes.push("Pose-moi une question, ou utilise un des boutons ci-dessous.");
      return rep;
    }
    if (/\bmerci\b/.test(qn)) {
      rep.paragraphes.push("Avec plaisir. Si tu hésites encore sur ton orientation, le quiz du site peut t'aider à y voir plus clair.");
      rep.actions.push(ACTION_QUIZ);
      return rep;
    }
    if (/\b(qui es tu|tu es qui|que peux tu faire|que sais tu faire|a quoi tu sers|comment ca marche|aide|au secours)\b/.test(qn)) {
      rep.paragraphes.push("Je suis l'assistant de JeuneAvenir CI. Je peux :");
      rep.paragraphes.push("• te présenter des pistes associées à ta série du bac ;\n• chercher les établissements recensés et signaler les rattachements à confirmer ;\n• présenter les métiers et estimations du catalogue ;\n• vérifier si des mentors ou offres réels et confirmés sont publiés ;\n• retrouver les pistes de ton quiz enregistré sur cet appareil.");
      rep.paragraphes.push("Je réponds uniquement avec les données du site : si une information n'y est pas, je te le dis au lieu d'inventer.");
      return rep;
    }

    // --- Résultat du quiz (personnalisé) ---
    var demandeResultat = /\b(mon resultat|resultat du quiz|selon mon quiz|selon le quiz|mes resultats|tu me conseilles quoi|conseille moi)\b/.test(qn);
    if (demandeResultat) {
      var ids = contexte.resultatQuiz && contexte.resultatQuiz.filieresAccessibles;
      if (ids && ids.length) {
        var filieresQuiz = ids.map(function (id) { return filiereParId(donnees, id); }).filter(Boolean);
        rep.paragraphes.push("D'après ton résultat au quiz enregistré sur cet appareil, voici les pistes associées. Elles ne garantissent ni l'admissibilité ni une admission : vérifie les conditions auprès de chaque établissement.");
        filieresQuiz.slice(0, 4).forEach(function (f) { rep.cartes.push(carteFiliere(donnees, f)); });
        rep.paragraphes.push("Ouvre une fiche pour voir les matières, les débouchés et les écoles liées. Tu peux aussi refaire le quiz si ta situation a changé.");
        rep.actions.push(ACTION_QUIZ);
        return rep;
      }
      rep.paragraphes.push("Tu n'as pas encore de résultat de quiz enregistré sur cet appareil. Fais le quiz, il prend quelques minutes, et je pourrai ensuite te conseiller à partir de ton résultat.");
      rep.actions.push(ACTION_QUIZ);
      return rep;
    }

    // --- Quiz : demande directe ---
    if (/\bquiz\b/.test(qn) || /\btest d orientation\b/.test(qn)) {
      rep.paragraphes.push("Le quiz d'orientation tient compte de ta série du bac et de tes goûts. À la fin, il te propose les filières qui te correspondent, sans jamais forcer un seul choix en cas d'égalité.");
      rep.actions.push(ACTION_QUIZ);
      return rep;
    }

    // --- Série du bac -> filières ouvertes ---
    var serie = serieDetectee(qn, donnees);
    var veutEcoles = /\b(ecole|ecoles|universite|universites|institut|etablissement|etudier)\b/.test(qn);
    if (serie && serie.id !== "autre" && !veutEcoles) {
      var ouvertes = (serie.filieres_possibles || [])
        .map(function (id) { return filiereParId(donnees, id); }).filter(Boolean);
      rep.paragraphes.push("Pour un bac " + serie.nom + ", le catalogue propose ces pistes à explorer :");
      ouvertes.forEach(function (f) { rep.cartes.push(carteFiliere(donnees, f)); });
      rep.paragraphes.push("Ce sont des pistes d'orientation, pas une décision d'admissibilité ni une garantie d'admission. Vérifie les conditions auprès des établissements.");
      rep.actions.push(ACTION_QUIZ);
      return rep;
    }

    var filiere = meilleureFiliere(mots, donnees);
    var ville = villeDetectee(qn, donnees);

    // --- Détail chiffré sur UNE filière : salaire, durée, débouchés, matières, écoles ---
    var demandeSalaire = /\b(salaire|gagne|gagner|remuneration|paye|combien)\b/.test(qn) && /\b(salaire|gagne|remuneration|paye)\b/.test(qn);
    var demandeDuree = /\b(duree|combien de temps|combien d annees|annees d etudes)\b/.test(qn);
    var demandeDebouches = /\b(debouche|debouches|apres|sortie)\b/.test(qn) && /\b(debouche|debouches)\b/.test(qn);
    var demandeMatieres = /\b(matiere|matieres|programme|cours)\b/.test(qn);
    if (filiere && (demandeSalaire || demandeDuree || demandeDebouches || demandeMatieres)) {
      if (demandeSalaire) rep.paragraphes.push("Pour la filière " + filiere.nom + ", le salaire indicatif indiqué sur le site est : " + (filiere.salaire_indicatif || "non précisé") + ". C'est une estimation de début de carrière, à vérifier selon l'entreprise et l'expérience.");
      if (demandeDuree) rep.paragraphes.push("La filière " + filiere.nom + " dure : " + (filiere.duree_etudes || "durée non précisée sur le site") + ".");
      if (demandeDebouches) rep.paragraphes.push("Débouchés de la filière " + filiere.nom + " : " + ((filiere.debouches || []).join(", ") || "voir la fiche") + ".");
      if (demandeMatieres) rep.paragraphes.push("Matières principales en " + filiere.nom + " : " + ((filiere.matieres_principales || []).join(", ") || "voir la fiche") + ".");
      rep.cartes.push(carteFiliere(donnees, filiere));
      return rep;
    }

    // --- Mentors ---
    if (/\b(mentor|mentors|mentorat|parrain|marraine)\b/.test(qn)) {
      var mentors = (donnees.mentorsPublies ? donnees.mentors : []).filter(function (m) {
        return !filiere || m.domaine === filiere.id;
      });
      if (!mentors.length) {
        rep.paragraphes.push("Aucun mentor réel et vérifié n'est publié pour le moment.");
        return rep;
      }
      rep.paragraphes.push(filiere
        ? "Voici les mentors du domaine " + filiere.nom + " présents sur le site :"
        : "Voici les mentors présents sur le site. Dis-moi un domaine, par exemple « mentor en droit », pour affiner.");
      mentors.slice(0, 5).forEach(function (m) { rep.cartes.push(carteMentor(donnees, m)); });
      return rep;
    }

    // --- Offres stage / emploi ---
    if (/\b(stage|stages|offre|offres|emploi|emplois|boulot|postuler|recrutement|travail)\b/.test(qn)) {
      var veutStage = /\bstage/.test(qn);
      var veutEmploi = /\b(emploi|boulot|travail)/.test(qn);
      var offres = (donnees.offresPubliees ? donnees.offres : []).filter(function (o) {
        if (filiere && o.domaine !== filiere.id) return false;
        if (ville && o.ville !== ville) return false;
        if (veutStage && !veutEmploi && o.type !== "stage") return false;
        if (veutEmploi && !veutStage && o.type !== "emploi") return false;
        return true;
      });
      rep.paragraphes.push(offres.length
        ? "Voici les offres présentes sur le site qui correspondent :"
        : "Aucune offre réelle et vérifiée n'est publiée dans le catalogue pour le moment.");
      offres.slice(0, 5).forEach(function (o) { rep.cartes.push(carteOffre(donnees, o)); });
      return rep;
    }

    // --- Écoles ---
    if (veutEcoles || ville) {
      var ecoles = (donnees.ecoles || []).filter(function (e) {
        if (filiere && ((e.domaines || []).indexOf(filiere.id) === -1 ||
          !e.verification || !e.verification.domaine_confirme)) return false;
        if (ville && e.ville !== ville) return false;
        return true;
      });
      // Si la question ne précise rien d'utile, on ne vide pas la réponse :
      // on ne déclenche la liste d'écoles que si un critère existe.
      if (filiere || ville || veutEcoles) {
        rep.paragraphes.push(ecoles.length
          ? "J'ai trouvé " + ecoles.length + " établissement(s) correspondant(s) dans le catalogue" +
            (filiere ? " pour " + filiere.nom : "") + (ville ? " à " + ville : "") + " :"
          : "Aucun établissement ne correspond dans les données du site" +
            (filiere ? " pour " + filiere.nom : "") + (ville ? " à " + ville : "") + ". Essaie une autre ville ou un autre domaine.");
        ecoles.slice(0, 5).forEach(function (e) { rep.cartes.push(carteEcole(donnees, e)); });
        if (ecoles.length > 5) rep.paragraphes.push("Il y en a d'autres : la page Écoles permet de filtrer par ville, statut et domaine.");
        return rep;
      }
    }

    // --- Métiers ---
    if (/\b(metier|metiers|profession|professions)\b/.test(qn) || (filiere && /\b(debouche|debouches)\b/.test(qn))) {
      var metiers = [];
      if (filiere && (filiere.metiers_lies || []).length) {
        metiers = filiere.metiers_lies.map(function (id) { return metierParId(donnees, id); }).filter(Boolean);
        rep.paragraphes.push("Les métiers liés à la filière " + filiere.nom + " sur le site :");
      } else {
        var scoresM = (donnees.metiers || []).map(function (m) {
          return { m: m, s: scorer(mots, [
            { texte: m.nom, poids: 6 }, { texte: m.description, poids: 1 },
            { texte: (m.competences || []).join(" "), poids: 2 },
            { texte: (m.missions || []).join(" "), poids: 1 }
          ]) };
        }).filter(function (x) { return x.s >= 4; })
          .sort(function (a, b) { return b.s - a.s; });
        metiers = scoresM.map(function (x) { return x.m; });
        rep.paragraphes.push(metiers.length ? "Voici les métiers qui correspondent à ta recherche :" : "Précise un domaine, par exemple « métiers de la santé », et je te montre les métiers liés.");
      }
      metiers.slice(0, 5).forEach(function (m) { rep.cartes.push(carteMetier(donnees, m)); });
      if (!filiere && !metiers.length) rep.actions.push(ACTION_FILIERES);
      return rep;
    }

    // --- Une filière reconnue, question générale ---
    if (filiere) {
      rep.paragraphes.push(filiere.description || "");
      rep.cartes.push(carteFiliere(donnees, filiere));
      var liees = (filiere.ecoles_liees || []).slice(0, 3)
        .map(function (id) { return ecoleParId(donnees, id); }).filter(Boolean);
      if (liees.length) {
        rep.paragraphes.push("Quelques établissements liés à cette filière :");
        liees.forEach(function (e) { rep.cartes.push(carteEcole(donnees, e)); });
      }
      return rep;
    }

    // --- Recherche libre dans toutes les données ---
    var trouvailles = [];
    (donnees.filieres || []).forEach(function (f) {
      var s = scorer(mots, [{ texte: f.nom, poids: 6 }, { texte: f.description, poids: 1 }, { texte: (f.debouches || []).join(" "), poids: 2 }]);
      if (s >= 5) trouvailles.push({ s: s, carte: carteFiliere(donnees, f) });
    });
    (donnees.metiers || []).forEach(function (m) {
      var s = scorer(mots, [{ texte: m.nom, poids: 6 }, { texte: m.description, poids: 1 }]);
      if (s >= 6) trouvailles.push({ s: s, carte: carteMetier(donnees, m) });
    });
    (donnees.ecoles || []).forEach(function (e) {
      var s = scorer(mots, [{ texte: e.nom, poids: 5 }, { texte: e.sigle || "", poids: 4 }, { texte: e.ville, poids: 3 }]);
      if (s >= 5) trouvailles.push({ s: s, carte: carteEcole(donnees, e) });
    });
    if (trouvailles.length) {
      trouvailles.sort(function (a, b) { return b.s - a.s; });
      rep.paragraphes.push("Voici ce que j'ai trouvé dans les données du site :");
      trouvailles.slice(0, 5).forEach(function (t) { rep.cartes.push(t.carte); });
      return rep;
    }

    // --- Réponse honnête par défaut : on n'invente rien ---
    rep.paragraphes.push("Je n'ai pas trouvé la réponse dans les données du site, et je préfère te le dire plutôt que d'inventer.");
    rep.paragraphes.push("Essaie avec des mots simples, par exemple : « filières après un bac A2 », « écoles d'informatique à Abidjan », « stage en droit », « mentor en santé ». Ou commence par le quiz d'orientation.");
    rep.actions.push(ACTION_QUIZ);
    rep.actions.push(ACTION_FILIERES);
    rep.actions.push(ACTION_CONTACT);
    return rep;
  }

  // ------------------------------------------------------------------
  // 5. EXPORT POUR LES TESTS (Node) — sans effet dans le navigateur
  // ------------------------------------------------------------------
  var API = {
    normaliser: normaliser,
    serieDetectee: serieDetectee,
    repondre: repondre
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  if (typeof window !== "undefined") window.JACAssistant = API;

  // ------------------------------------------------------------------
  // 6. INTERFACE (navigateur uniquement)
  // ------------------------------------------------------------------
  if (typeof document === "undefined") return;

  var donneesChargees = null;
  var chargementEnCours = null;

  function chargerDonnees() {
    if (donneesChargees) return Promise.resolve(donneesChargees);
    if (chargementEnCours) return chargementEnCours;
    var fichiers = {
      filieres: "data/filieres.json",
      ecoles: "data/ecoles.json",
      metiers: "data/metiers.json",
      mentors: "data/mentors.json",
      offres: "data/offres.json",
      series: "data/series_filieres.json"
    };
    var cles = Object.keys(fichiers);
    chargementEnCours = Promise.all(cles.map(function (cle) {
      return fetch(fichiers[cle]).then(function (r) {
        if (!r.ok) throw new Error("Chargement impossible : " + fichiers[cle]);
        return r.json();
      }).then(function (json) {
        // Chaque JSON du site enveloppe sa liste sous une clé du même nom,
        // sauf series_filieres.json dont la clé est "series".
        var liste = json[cle] || json.series || json;
        var statutVerifie = json._statut_publication === "verifie";
        if ((cle === "mentors" || cle === "offres") && !statutVerifie) liste = [];
        return [cle, liste, statutVerifie];
      });
    })).then(function (paires) {
      donneesChargees = {};
      paires.forEach(function (p) {
        donneesChargees[p[0]] = p[1];
        if (p[0] === "mentors") donneesChargees.mentorsPublies = p[2];
        if (p[0] === "offres") donneesChargees.offresPubliees = p[2];
      });
      return donneesChargees;
    }).catch(function (err) {
      chargementEnCours = null;
      throw err;
    });
    return chargementEnCours;
  }

  function lireResultatQuiz() {
    try {
      return JSON.parse(localStorage.getItem("jac_dernier_resultat_quiz") || "null");
    } catch (e) { return null; }
  }

  // Utilisateur connecté selon le mécanisme actuel du site (V1 simulée).
  // Renvoie l'objet utilisateur ({ nom, email, typeCompte }) ou null.
  function lireUtilisateurConnecte() {
    try {
      var u = JSON.parse(localStorage.getItem("jac_utilisateur_connecte") || "null");
      return u && u.email ? u : null;
    } catch (e) { return null; }
  }

  var ACTIONS_VERROU = [
    { label: "Créer un compte", href: "inscription.html" },
    { label: "Se connecter", href: "connexion.html" }
  ];

  function construireInterface() {
    if (document.querySelector(".jac-assistant-bouton")) return;

    var bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "jac-assistant-bouton";
    bouton.setAttribute("aria-label", "Ouvrir l'assistant d'orientation");
    var imgBouton = document.createElement("img");
    imgBouton.src = "assets/icons/logo.svg";
    imgBouton.alt = "";
    var texteBouton = document.createElement("span");
    texteBouton.textContent = "Assistant";
    bouton.appendChild(imgBouton);
    bouton.appendChild(texteBouton);

    var panneau = document.createElement("section");
    panneau.className = "jac-assistant-panneau";
    panneau.hidden = true;
    panneau.setAttribute("role", "dialog");
    panneau.setAttribute("aria-label", "Assistant d'orientation JeuneAvenir CI");

    var entete = document.createElement("div");
    entete.className = "jac-assistant-entete";
    var imgEntete = document.createElement("img");
    imgEntete.src = "assets/icons/logo-blanc.svg";
    imgEntete.alt = "";
    var textes = document.createElement("div");
    textes.className = "jac-assistant-entete-textes";
    var titre = document.createElement("div");
    titre.className = "jac-assistant-titre";
    titre.textContent = "Assistant JeuneAvenir";
    var sousTitre = document.createElement("div");
    sousTitre.className = "jac-assistant-sous-titre";
    sousTitre.textContent = "Catalogue du site · certaines fiches restent à confirmer";
    textes.appendChild(titre);
    textes.appendChild(sousTitre);
    var fermer = document.createElement("button");
    fermer.type = "button";
    fermer.className = "jac-assistant-fermer";
    fermer.setAttribute("aria-label", "Fermer l'assistant");
    fermer.textContent = "✕";
    entete.appendChild(imgEntete);
    entete.appendChild(textes);
    entete.appendChild(fermer);

    var messages = document.createElement("div");
    messages.className = "jac-assistant-messages";

    var suggestions = document.createElement("div");
    suggestions.className = "jac-assistant-suggestions";
    [
      { label: "Quelle filière après mon bac ?", question: "Quelles filières après un bac A2 ?" },
      { label: "Écoles à Abidjan", question: "Quelles écoles y a-t-il à Abidjan ?" },
      { label: "Trouver un mentor", question: "Je cherche un mentor" },
      { label: "Stages et offres", question: "Je cherche un stage" },
      { label: "Selon mon quiz", question: "Que me conseilles-tu selon mon résultat de quiz ?" }
    ].forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "jac-assistant-suggestion";
      b.textContent = s.label;
      b.addEventListener("click", function () { poserQuestion(s.question); });
      suggestions.appendChild(b);
    });

    var formulaire = document.createElement("form");
    formulaire.className = "jac-assistant-formulaire";
    var champ = document.createElement("input");
    champ.type = "text";
    champ.className = "jac-assistant-champ";
    champ.placeholder = "Pose ta question d'orientation…";
    champ.setAttribute("aria-label", "Ta question");
    champ.maxLength = 300;
    var envoyer = document.createElement("button");
    envoyer.type = "submit";
    envoyer.className = "jac-assistant-envoyer";
    envoyer.textContent = "Envoyer";
    formulaire.appendChild(champ);
    formulaire.appendChild(envoyer);

    panneau.appendChild(entete);
    panneau.appendChild(messages);
    panneau.appendChild(suggestions);
    panneau.appendChild(formulaire);
    document.body.appendChild(bouton);
    document.body.appendChild(panneau);

    var dejaAccueilli = false;

    function ajouterBulle(texte, qui) {
      var bulle = document.createElement("div");
      bulle.className = "jac-assistant-bulle jac-assistant-bulle-" + qui;
      bulle.textContent = texte;
      messages.appendChild(bulle);
      messages.scrollTop = messages.scrollHeight;
      return bulle;
    }

    function afficherReponse(rep) {
      rep.paragraphes.forEach(function (p) { ajouterBulle(p, "assistant"); });
      rep.cartes.forEach(function (carte) {
        var bloc = document.createElement("div");
        bloc.className = "jac-assistant-carte";
        var t = document.createElement("div");
        t.className = "jac-assistant-carte-titre";
        t.textContent = carte.titre;
        bloc.appendChild(t);
        (carte.lignes || []).forEach(function (ligne) {
          if (!ligne) return;
          var l = document.createElement("div");
          l.className = "jac-assistant-carte-ligne";
          l.textContent = ligne;
          bloc.appendChild(l);
        });
        if (carte.lien) {
          var a = document.createElement("a");
          a.className = "jac-assistant-carte-lien";
          a.href = carte.lien;
          a.textContent = carte.texteLien || "Voir";
          bloc.appendChild(a);
        }
        messages.appendChild(bloc);
      });
      if (rep.actions && rep.actions.length) {
        var rangee = document.createElement("div");
        rangee.className = "jac-assistant-actions";
        rep.actions.forEach(function (action) {
          var a = document.createElement("a");
          a.className = "jac-assistant-action";
          a.href = action.href;
          a.textContent = action.label;
          rangee.appendChild(a);
        });
        messages.appendChild(rangee);
      }
      messages.scrollTop = messages.scrollHeight;
    }

    function poserQuestion(question) {
      var q = String(question || "").trim();
      if (!q) return;
      // Verrou compte : sans connexion, aucune réponse, juste le chemin.
      if (!lireUtilisateurConnecte()) {
        afficherReponse({
          paragraphes: ["Pour utiliser l'assistant, il faut d'abord créer un compte ou te connecter. C'est gratuit et ça prend une minute."],
          cartes: [],
          actions: ACTIONS_VERROU
        });
        return;
      }
      ajouterBulle(q, "utilisateur");
      envoyer.disabled = true;
      var attente = ajouterBulle("Je cherche dans les données du site…", "assistant");
      chargerDonnees().then(function (donnees) {
        attente.remove();
        var rep = repondre(q, donnees, { resultatQuiz: lireResultatQuiz() });
        afficherReponse(rep);
      }).catch(function () {
        attente.textContent = "Je n'arrive pas à charger les données du site. Vérifie ta connexion, ou ouvre le site avec un serveur local (Live Server) si tu es en train de le tester sur ton ordinateur.";
      }).finally(function () {
        envoyer.disabled = false;
        champ.focus();
      });
    }

    bouton.addEventListener("click", function () {
      var ouvert = panneau.hidden;
      panneau.hidden = !ouvert;
      if (ouvert) {
        if (!dejaAccueilli) {
          dejaAccueilli = true;
          var utilisateur = lireUtilisateurConnecte();
          if (utilisateur) {
            ajouterBulle("Bonjour" + (utilisateur.nom ? " " + utilisateur.nom : "") + ", je consulte le catalogue de JeuneAvenir CI et je signale les informations qui restent à confirmer.", "assistant");
            ajouterBulle("Dis-moi par exemple ta série du bac, une ville, ou le métier qui t'intéresse.", "assistant");
          } else {
            afficherReponse({
              paragraphes: [
                "Bonjour, je suis l'assistant de JeuneAvenir CI. Je consulte le catalogue du site et je signale les informations qui restent à confirmer.",
                "L'assistant est réservé aux membres : crée un compte gratuit ou connecte-toi, et je pourrai te répondre tout de suite."
              ],
              cartes: [],
              actions: ACTIONS_VERROU
            });
          }
        }
        champ.focus();
      }
    });
    fermer.addEventListener("click", function () { panneau.hidden = true; bouton.focus(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panneau.hidden) { panneau.hidden = true; bouton.focus(); }
    });
    formulaire.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = champ.value;
      champ.value = "";
      poserQuestion(q);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", construireInterface);
  } else {
    construireInterface();
  }
})();
