let TOUS_MENTORS = [];
let TOUTES_FILIERES = [];
let profilsIncomplets = 0;
let evenementsInitialises = false;

document.addEventListener("DOMContentLoaded", () => {
  initialiserAnnuaire();
});

async function initialiserAnnuaire() {
  initialiserEvenementsAnnuaire();
  afficherChargement();

  try {
    const [repMentors, repFilieres] = await Promise.all([
      fetch("data/mentors.json"),
      fetch("data/filieres.json")
    ]);

    if (!repMentors.ok) {
      throw new Error(`Chargement des mentors impossible (${repMentors.status}).`);
    }
    if (!repFilieres.ok) {
      throw new Error(`Chargement des filières impossible (${repFilieres.status}).`);
    }

    const [donneesMentors, donneesFilieres] = await Promise.all([
      repMentors.json(),
      repFilieres.json()
    ]);

    if (!Array.isArray(donneesMentors.mentors) || !Array.isArray(donneesFilieres.filieres)) {
      throw new Error("Le format des données du mentorat est invalide.");
    }

    TOUTES_FILIERES = donneesFilieres.filieres;
    profilsIncomplets = 0;
    TOUS_MENTORS = donneesMentors._statut_publication === "verifie"
      ? donneesMentors.mentors.map(normaliserMentor).filter(Boolean)
      : [];
    profilsIncomplets = donneesMentors._statut_publication === "verifie"
      ? donneesMentors.mentors.length - TOUS_MENTORS.length
      : 0;

    remplirFiltreDomaine();
    appliquerFiltres();
    afficherRoute(false);
  } catch (erreur) {
    console.error("Chargement de l'annuaire des mentors :", erreur);
    afficherErreurChargement(erreur);
  }
}

function initialiserEvenementsAnnuaire() {
  if (evenementsInitialises) return;
  evenementsInitialises = true;

  document.getElementById("recherche-mentor").addEventListener("input", appliquerFiltres);
  document.getElementById("filtre-domaine-mentor").addEventListener("change", appliquerFiltres);
  window.addEventListener("hashchange", () => afficherRoute(true));
}

function normaliserMentor(mentor) {
  if (!mentor || (typeof mentor.id !== "string" && typeof mentor.id !== "number")) return null;
  if (!String(mentor.id).trim() || typeof mentor.nom !== "string" || !mentor.nom.trim()) return null;
  return { ...mentor, id: String(mentor.id).trim(), nom: mentor.nom.trim() };
}

function normaliserTexte(valeur) {
  if (typeof valeur === "string" || typeof valeur === "number") return String(valeur).trim();
  if (Array.isArray(valeur)) {
    return valeur.map(normaliserTexte).filter(Boolean).join(" ");
  }
  return "";
}

function normaliserRecherche(valeur) {
  return normaliserTexte(valeur)
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function champMentor(mentor, ...champs) {
  for (const champ of champs) {
    const valeur = normaliserTexte(mentor[champ]);
    if (valeur) return valeur;
  }
  return "";
}

function listeMentor(valeur) {
  const elements = Array.isArray(valeur) ? valeur : typeof valeur === "string" ? [valeur] : [];
  return elements.map(normaliserTexte).filter(Boolean);
}

function nomFiliere(id) {
  return TOUTES_FILIERES.find(filiere => filiere.id === id)?.nom || id || "";
}

function remplirFiltreDomaine() {
  const select = document.getElementById("filtre-domaine-mentor");
  select.replaceChildren(new Option("Tous les domaines", ""));

  const domaines = new Map();
  TOUS_MENTORS.forEach(mentor => {
    const domaine = champMentor(mentor, "domaine");
    if (domaine) domaines.set(domaine, nomFiliere(domaine));
  });

  Array.from(domaines.entries())
    .sort((a, b) => a[1].localeCompare(b[1], "fr"))
    .forEach(([id, libelle]) => select.add(new Option(libelle, id)));

  const controlsActifs = TOUS_MENTORS.length > 0;
  document.getElementById("recherche-mentor").disabled = !controlsActifs;
  select.disabled = !controlsActifs || domaines.size === 0;
  document.getElementById("aide-recherche-mentor").textContent = controlsActifs
    ? "Les résultats se mettent à jour pendant la saisie."
    : "La recherche s'active dès qu'un profil est publié.";
}

function appliquerFiltres() {
  const champRecherche = document.getElementById("recherche-mentor");
  const selectDomaine = document.getElementById("filtre-domaine-mentor");
  const terme = normaliserRecherche(champRecherche.value);
  const domaine = selectDomaine.value;

  const resultats = TOUS_MENTORS.filter(mentor => {
    const domaines = champMentor(mentor, "domaine");
    const texte = [
      mentor.nom,
      nomFiliere(domaines),
      champMentor(mentor, "bio", "presentation", "description"),
      champMentor(mentor, "experience"),
      champMentor(mentor, "disponibilite"),
      ...listeMentor(mentor.competences),
      ...listeMentor(mentor.parcours)
    ].join(" ");

    return (!terme || normaliserRecherche(texte).includes(terme)) && (!domaine || domaines === domaine);
  });

  afficherListe(resultats);
}

function echapperHTML(valeur) {
  return String(valeur)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function initiales(nom) {
  return nom.trim().split(/\s+/).slice(0, 2).map(mot => mot.charAt(0)).join("").toUpperCase();
}

function compteurProfils(nombre) {
  if (nombre === 1) return "1 profil publié";
  return `${nombre} profils publiés`;
}

function afficherListe(mentors) {
  const compteur = document.getElementById("compteur-mentors");
  const grille = document.getElementById("grille-mentors");

  if (TOUS_MENTORS.length === 0) {
    compteur.textContent = profilsIncomplets > 0
      ? "Aucun profil publiable : certaines données de profil sont incomplètes."
      : "Aucun mentor vérifié n'est publié pour le moment.";
    grille.innerHTML = `
      <div class="mentorat-vide" data-motion="rise">
        <img src="assets/icons/logo.svg" alt="" width="44" height="44">
        <h3>${profilsIncomplets > 0 ? "Les informations doivent être complétées" : "Les profils publiés apparaîtront ici"}</h3>
        <p>${profilsIncomplets > 0
          ? "Les profils sans identifiant ou nom ne sont pas affichés."
          : "Un mentor n'est affiché qu'après son accord et la vérification des informations de son profil."}</p>
        <a href="filieres.html" class="mentorat-lien">Explorer les filières en attendant</a>
      </div>
    `;
    actualiserAnimations();
    return;
  }

  if (mentors.length === 0) {
    compteur.textContent = "Aucun profil ne correspond à ces critères.";
    grille.innerHTML = `
      <div class="mentorat-vide" data-motion="fade">
        <h3>Aucun résultat pour cette recherche</h3>
        <p>Essaie un autre nom, domaine ou compétence, ou réinitialise le filtre.</p>
        <button type="button" class="mentorat-action mentorat-action-secondaire" id="reinitialiser-filtres-mentor">Réinitialiser la recherche</button>
      </div>
    `;
    document.getElementById("reinitialiser-filtres-mentor").addEventListener("click", reinitialiserFiltres);
    actualiserAnimations();
    return;
  }

  compteur.textContent = `${compteurProfils(mentors.length)}${profilsIncomplets ? " · certains profils incomplets ne sont pas affichés" : ""}`;
  grille.innerHTML = mentors.map(carteMentorHTML).join("");
  actualiserAnimations();
}

function carteMentorHTML(mentor) {
  const domaine = nomFiliere(champMentor(mentor, "domaine"));
  const presentation = champMentor(mentor, "presentation", "bio", "description");
  const competences = listeMentor(mentor.competences);
  const disponibilite = champMentor(mentor, "disponibilite");
  const experience = champMentor(mentor, "experience");

  return `
    <article class="mentorat-carte" data-motion="rise">
      <a class="mentorat-carte-lien" href="#${encodeURIComponent(mentor.id)}" aria-label="Voir le profil de ${echapperHTML(mentor.nom)}">
        <div class="mentorat-carte-entete">
          <span class="mentorat-initiales" aria-hidden="true">${echapperHTML(initiales(mentor.nom))}</span>
          <div>
            <h3>${echapperHTML(mentor.nom)}</h3>
            ${domaine ? `<p class="mentorat-domaine">${echapperHTML(domaine)}</p>` : ""}
          </div>
        </div>
        ${presentation ? `<p class="mentorat-carte-resume">${echapperHTML(presentation)}</p>` : ""}
        ${competences.length || experience || disponibilite ? `
          <div class="mentorat-meta">
            ${experience ? `<span>Expérience : ${echapperHTML(experience)}</span>` : ""}
            ${competences.length ? `<span>Compétences : ${echapperHTML(competences.join(", "))}</span>` : ""}
            ${disponibilite ? `<span>Disponibilité : ${echapperHTML(disponibilite)}</span>` : ""}
          </div>
        ` : ""}
        <span class="mentorat-lien">Consulter le profil</span>
      </a>
    </article>
  `;
}

function actualiserAnimations() {
  if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.initialiser();
}

function afficherChargement() {
  document.getElementById("compteur-mentors").textContent = "Chargement de l'annuaire…";
  document.getElementById("grille-mentors").innerHTML = `
    <p class="mentorat-compteur" role="status">Lecture des profils publiés…</p>
  `;
}

function afficherErreurChargement(erreur) {
  const message = erreur instanceof Error ? erreur.message : "Une erreur inconnue est survenue.";
  document.getElementById("compteur-mentors").textContent = "L'annuaire n'a pas pu être chargé.";
  document.getElementById("grille-mentors").innerHTML = `
    <div class="mentorat-erreur" role="alert">
      <h3>Impossible de charger l'annuaire</h3>
      <p>${echapperHTML(message)} Vérifie que le site est servi par un serveur local, puis réessaie.</p>
      <button type="button" class="mentorat-action mentorat-action-secondaire" id="recharger-annuaire">Réessayer</button>
    </div>
  `;
  document.getElementById("recharger-annuaire").addEventListener("click", initialiserAnnuaire);
}

function lireUtilisateurConnecte() {
  try {
    const utilisateur = JSON.parse(localStorage.getItem("jac_utilisateur_connecte") || "null");
    if (!utilisateur || typeof utilisateur !== "object") return null;
    return utilisateur;
  } catch (erreur) {
    console.error("Lecture du compte local impossible :", erreur);
    return { erreurLecture: true };
  }
}

function lireDemandesMentorat() {
  const demandes = JSON.parse(localStorage.getItem("jac_demandes_mentorat") || "[]");
  if (!Array.isArray(demandes)) {
    throw new Error("Les demandes de démonstration enregistrées sont illisibles.");
  }
  return demandes;
}

function normaliserStatutDemande(statut) {
  const valeur = normaliserRecherche(statut);
  if (valeur === "en attente" || valeur === "en_attente" || valeur === "pending") {
    return { classe: "attente", libelle: "En attente" };
  }
  if (valeur === "acceptee" || valeur === "accepted") {
    return { classe: "acceptee", libelle: "Acceptée" };
  }
  if (valeur === "refusee" || valeur === "refused") {
    return { classe: "refusee", libelle: "Refusée" };
  }
  return { classe: "indisponible", libelle: "Statut indisponible" };
}

function afficherStatutDemande(zone, demande, mentor) {
  const statut = normaliserStatutDemande(demande.statut);
  const date = new Date(demande.date);
  const dateLisible = Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("fr-CI", { dateStyle: "long" }).format(date);
  const mentorNom = champMentor(mentor || {}, "nom") || normaliserTexte(demande.mentorNom);
  const message = normaliserTexte(demande.message);
  zone.innerHTML = `
    <div class="mentorat-statut mentorat-statut-${statut.classe}" role="status">
      <strong>Statut de démonstration : ${statut.libelle}.</strong>
      <p>Ce statut est une simulation locale, pas une réponse du mentor. La demande reste dans ce navigateur : aucune notification ni mise en relation réelle n'a eu lieu.</p>
      <div class="mentorat-recapitulatif">
        <h3>Récapitulatif de la demande</h3>
        <dl>
          ${mentorNom ? `<div><dt>Mentor choisi</dt><dd>${echapperHTML(mentorNom)}</dd></div>` : ""}
          ${dateLisible ? `<div><dt>Enregistrée le</dt><dd>${echapperHTML(dateLisible)}</dd></div>` : ""}
          ${message ? `<div><dt>Ton message</dt><dd>${echapperHTML(message)}</dd></div>` : ""}
        </dl>
      </div>
    </div>
  `;
  actualiserAnimations();
  if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.animer(zone);
}

function afficherDemande(mentor, zone) {
  const utilisateur = lireUtilisateurConnecte();
  if (utilisateur?.erreurLecture) {
    zone.innerHTML = `<p class="mentorat-statut mentorat-statut-erreur" role="alert">Impossible de lire la session locale. Recharge la page ou reconnecte-toi.</p>`;
    return;
  }

  if (!utilisateur) {
    zone.innerHTML = `
      <p>Connecte-toi avec un compte Jeune pour essayer le parcours de demande.</p>
      <a class="mentorat-action" href="connexion.html?profil=jeune">Se connecter comme jeune</a>
      <a class="mentorat-action mentorat-action-secondaire" href="inscription.html?profil=jeune">Créer un compte Jeune</a>
      <p>En V1, toute demande reste une démonstration locale et n'est pas transmise.</p>
    `;
    return;
  }

  if (utilisateur.typeCompte !== "jeune") {
    zone.innerHTML = `
      <p>Le parcours de demande est réservé aux comptes Jeune.</p>
      <a class="mentorat-action mentorat-action-secondaire" href="inscription.html?profil=jeune">Créer un compte Jeune</a>
      <p>En V1, toute demande reste une démonstration locale et n'est pas transmise.</p>
    `;
    return;
  }

  const email = normaliserTexte(utilisateur.email).toLocaleLowerCase("fr");
  if (!email) {
    zone.innerHTML = `<p class="mentorat-statut mentorat-statut-erreur" role="alert">Le compte local ne contient pas d'adresse e-mail. La demande de démonstration est indisponible.</p>`;
    return;
  }

  let demandes;
  try {
    demandes = lireDemandesMentorat();
  } catch (erreur) {
    console.error("Lecture des demandes locales impossible :", erreur);
    zone.innerHTML = `<p class="mentorat-statut mentorat-statut-erreur" role="alert">${echapperHTML(erreur.message)}</p>`;
    return;
  }

  const demandeExistante = demandes.find(demande =>
    demande.mentorId === mentor.id &&
    normaliserTexte(demande.jeuneEmail).toLocaleLowerCase("fr") === email
  );
  if (demandeExistante) {
    afficherStatutDemande(zone, demandeExistante, mentor);
    return;
  }

  zone.innerHTML = `
    <p>Présente ton projet ou ce que tu aimerais apprendre. Cette demande de démonstration sera enregistrée sur cet appareil, sans être envoyée au mentor.</p>
    <form id="formulaire-demande-mentor">
      <label for="message-mentor">Ton message (facultatif)</label>
      <textarea id="message-mentor" rows="4" maxlength="1000" placeholder="Ex. J'aimerais mieux comprendre les premières étapes de ce métier."></textarea>
      <button type="submit" class="mentorat-action">Enregistrer une demande de démonstration</button>
    </form>
  `;

  document.getElementById("formulaire-demande-mentor").addEventListener("submit", evenement => {
    evenement.preventDefault();
    const message = document.getElementById("message-mentor").value.trim();
    const nom = normaliserTexte(utilisateur.nom);

    try {
      const demandesActuelles = lireDemandesMentorat();
      const dejaEnregistree = demandesActuelles.find(demande =>
        demande.mentorId === mentor.id &&
        normaliserTexte(demande.jeuneEmail).toLocaleLowerCase("fr") === email
      );
      if (dejaEnregistree) {
        afficherStatutDemande(zone, dejaEnregistree, mentor);
        return;
      }

      const demande = {
        mentorId: mentor.id,
        mentorNom: mentor.nom,
        jeuneNom: nom,
        jeuneEmail: email,
        message,
        statut: "en attente",
        mode: "simulation_locale",
        date: new Date().toISOString()
      };
      demandesActuelles.push(demande);
      localStorage.setItem("jac_demandes_mentorat", JSON.stringify(demandesActuelles));
      afficherStatutDemande(zone, demande, mentor);
    } catch (erreur) {
      console.error("Enregistrement de la demande locale impossible :", erreur);
      zone.innerHTML = `<p class="mentorat-statut mentorat-statut-erreur" role="alert">La demande n'a pas pu être enregistrée dans ce navigateur. Aucune transmission n'a eu lieu.</p>`;
    }
  });
}

function sectionTexte(titre, contenu) {
  return `
    <section class="mentorat-section" data-motion="rise">
      <h2>${echapperHTML(titre)}</h2>
      <p>${echapperHTML(contenu)}</p>
    </section>
  `;
}

function sectionListe(titre, elements) {
  return `
    <section class="mentorat-section" data-motion="rise">
      <h2>${echapperHTML(titre)}</h2>
      <ul>${elements.map(element => `<li>${echapperHTML(element)}</li>`).join("")}</ul>
    </section>
  `;
}

function afficherFiche(mentor, donnerFocus) {
  const annuaire = document.getElementById("mentorat-annuaire");
  const fiche = document.getElementById("fiche-mentor");
  const domaine = nomFiliere(champMentor(mentor, "domaine"));
  const presentation = champMentor(mentor, "presentation", "bio", "description");
  const parcours = listeMentor(mentor.parcours);
  const competences = listeMentor(mentor.competences);
  const experience = champMentor(mentor, "experience");
  const disponibilite = champMentor(mentor, "disponibilite");
  const approche = champMentor(mentor, "approche");
  const faits = [
    domaine ? ["Domaine", domaine] : null,
    experience ? ["Expérience", experience] : null,
    disponibilite ? ["Disponibilité", disponibilite] : null
  ].filter(Boolean);
  const sections = [
    approche ? sectionTexte("Son approche", approche) : "",
    parcours.length ? sectionListe("Parcours documenté", parcours) : "",
    competences.length ? sectionListe("Compétences", competences) : "",
    `<section class="mentorat-section" data-motion="rise">
      <p class="mentorat-surtitre">POUR ALLER PLUS LOIN</p>
      <h2>Continuer l'exploration</h2>
      <p>Consulte les filières et les métiers documentés par JeuneAvenir CI.</p>
      <a class="mentorat-lien" href="filieres.html">Explorer les filières</a>
      <a class="mentorat-lien" href="metiers.html">Découvrir les métiers</a>
    </section>`
  ].filter(Boolean).join("");

  annuaire.hidden = true;
  fiche.hidden = false;
  fiche.innerHTML = `
    <a class="mentorat-retour" href="#annuaire">← Retour à l'annuaire</a>
    <div class="mentorat-profil-hero">
      <div data-motion="rise">
        <p class="mentorat-surtitre">FICHE MENTOR</p>
        <div class="mentorat-profil-identite">
          <span class="mentorat-initiales mentorat-initiales-grand" aria-hidden="true">${echapperHTML(initiales(mentor.nom))}</span>
          <div>
            <h1>${echapperHTML(mentor.nom)}</h1>
            ${domaine ? `<p class="mentorat-domaine">${echapperHTML(domaine)}</p>` : ""}
          </div>
        </div>
        ${presentation ? `<p class="mentorat-profil-intro">${echapperHTML(presentation)}</p>` : ""}
        ${faits.length ? `
          <dl class="mentorat-faits">
            ${faits.map(([libelle, valeur]) => `<div class="mentorat-fait"><dt>${echapperHTML(libelle)}</dt><dd>${echapperHTML(valeur)}</dd></div>`).join("")}
          </dl>
        ` : ""}
        ${boutonFavoriHTML("mentors", mentor.id)}
      </div>
      <aside class="mentorat-demande" aria-labelledby="titre-demande-mentor">
        <p class="mentorat-surtitre">ÉCHANGER</p>
        <h2 id="titre-demande-mentor">Demander une mise en relation</h2>
        <p>La demande V1 sert uniquement à tester le parcours. Le mentor ne la reçoit pas.</p>
        <div id="zone-demande-mentor" aria-live="polite" aria-atomic="true"></div>
      </aside>
    </div>
    ${sections ? `<div class="mentorat-profil-sections">${sections}</div>` : ""}
  `;

  const boutonFavori = fiche.querySelector(".bouton-favori");
  if (boutonFavori) {
    boutonFavori.classList.add("mentorat-favori");
    boutonFavori.setAttribute("aria-pressed", String(estFavori("mentors", mentor.id)));
    activerBoutonFavori(fiche);
    boutonFavori.addEventListener("click", () => {
      boutonFavori.setAttribute("aria-pressed", String(estFavori("mentors", mentor.id)));
    });
  }

  afficherDemande(mentor, document.getElementById("zone-demande-mentor"));
  actualiserAnimations();

  if (donnerFocus) {
    fiche.focus({ preventScroll: true });
    const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    fiche.scrollIntoView({ behavior: mouvementReduit ? "auto" : "smooth", block: "start" });
  }
}

function afficherFicheIndisponible() {
  document.getElementById("mentorat-annuaire").hidden = true;
  const fiche = document.getElementById("fiche-mentor");
  fiche.hidden = false;
  fiche.innerHTML = `
    <a class="mentorat-retour" href="#annuaire">← Retour à l'annuaire</a>
    <div class="mentorat-erreur" role="status">
      <h2>Ce profil n'est pas disponible</h2>
      <p>Il n'existe pas dans les profils publiés ou il n'est pas vérifié.</p>
    </div>
  `;
  fiche.focus({ preventScroll: true });
}

function afficherRoute(donnerFocus) {
  let id;
  try {
    id = decodeURIComponent(window.location.hash.slice(1));
  } catch (erreur) {
    console.warn("Identifiant de profil invalide dans l'URL.", erreur);
    afficherFicheIndisponible();
    return;
  }

  if (!id || id === "annuaire") {
    document.getElementById("fiche-mentor").hidden = true;
    document.getElementById("mentorat-annuaire").hidden = false;
    return;
  }

  const mentor = TOUS_MENTORS.find(item => item.id === id);
  if (!mentor) {
    afficherFicheIndisponible();
    return;
  }
  afficherFiche(mentor, donnerFocus);
}

function reinitialiserFiltres() {
  document.getElementById("recherche-mentor").value = "";
  document.getElementById("filtre-domaine-mentor").value = "";
  appliquerFiltres();
}
