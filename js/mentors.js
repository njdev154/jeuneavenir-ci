// mentors.js
// Annuaire des mentors : liste filtrable par domaine, fiche détaillée,
// demande de mise en relation. V1 : la demande est stockée en
// localStorage (simulation), pas encore envoyée à un vrai mentor -- ce
// sera fait via une vraie base de données en V2.

let TOUS_MENTORS = [];
let TOUTES_FILIERES = [];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [repMentors, repFilieres] = await Promise.all([
      fetch("data/mentors.json"),
      fetch("data/filieres.json")
    ]);
    TOUS_MENTORS = (await repMentors.json()).mentors;
    TOUTES_FILIERES = (await repFilieres.json()).filieres;

    remplirFiltreDomaine();
    appliquerFiltres();

    document.getElementById("recherche-mentor").addEventListener("input", appliquerFiltres);
    document.getElementById("filtre-domaine-mentor").addEventListener("change", appliquerFiltres);

    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const m = TOUS_MENTORS.find(x => x.id === id);
      if (m) afficherFiche(m);
    }

  } catch (erreur) {
    console.error(erreur);
    document.getElementById("grille-mentors").innerHTML = "<p class='message-vide'>Impossible de charger les mentors. Vérifie que tu utilises un serveur local (Live Server).</p>";
  }
});

function nomFiliere(id) {
  return TOUTES_FILIERES.find(f => f.id === id)?.nom || id;
}

function remplirFiltreDomaine() {
  const select = document.getElementById("filtre-domaine-mentor");
  TOUTES_FILIERES.forEach(f => {
    const option = document.createElement("option");
    option.value = f.id;
    option.textContent = f.nom;
    select.appendChild(option);
  });
}

function appliquerFiltres() {
  const terme = document.getElementById("recherche-mentor").value.toLowerCase().trim();
  const domaine = document.getElementById("filtre-domaine-mentor").value;

  const resultats = TOUS_MENTORS.filter(m => {
    if (terme && !m.nom.toLowerCase().includes(terme) && !m.bio.toLowerCase().includes(terme)) return false;
    if (domaine && m.domaine !== domaine) return false;
    return true;
  });

  afficherListe(resultats);
}

function initiales(nom) {
  return nom.split(" ").map(mot => mot.charAt(0)).join("").slice(0, 2).toUpperCase();
}

function afficherListe(mentors) {
  document.getElementById("compteur-mentors").textContent =
    `${mentors.length} mentor${mentors.length > 1 ? "s" : ""} trouvé${mentors.length > 1 ? "s" : ""}`;

  const grille = document.getElementById("grille-mentors");

  if (mentors.length === 0) {
    grille.innerHTML = "<p class='message-vide'>Aucun mentor ne correspond à ta recherche.</p>";
    return;
  }

  grille.innerHTML = mentors.map(m => `
    <button type="button" class="carte carte-mentor" data-id="${m.id}">
      <div class="avatar-cercle avatar-cercle-mentor">${initiales(m.nom)}</div>
      <h3>${m.nom}</h3>
      <p class="mentor-domaine">${nomFiliere(m.domaine)}</p>
      <p>${m.bio.slice(0, 80)}${m.bio.length > 80 ? "…" : ""}</p>
      <span class="lien-explorer">Voir le profil →</span>
    </button>
  `).join("");

  grille.querySelectorAll(".carte-mentor").forEach(carte => {
    carte.addEventListener("click", () => {
      const m = TOUS_MENTORS.find(x => x.id === carte.dataset.id);
      afficherFiche(m);
      history.replaceState(null, "", `#${m.id}`);
    });
  });
}

function afficherFiche(mentor) {
  const fiche = document.getElementById("fiche-mentor");
  if (!mentor) { fiche.style.display = "none"; return; }

  const utilisateur = JSON.parse(localStorage.getItem("jac_utilisateur_connecte") || "null");

  fiche.innerHTML = `
    <div class="fiche-filiere-entete">
      <div class="fiche-mentor-entete-infos">
        <div class="avatar-cercle avatar-cercle-mentor avatar-cercle-grand">${initiales(mentor.nom)}</div>
        <div>
          <h2>${mentor.nom}</h2>
          <p class="mentor-domaine">${nomFiliere(mentor.domaine)}</p>
        </div>
      </div>
      <button type="button" class="bouton-fermer-fiche" id="bouton-fermer-fiche-mentor" aria-label="Fermer">✕</button>
    </div>

    <p class="fiche-description">${mentor.bio}</p>
    <p class="mentor-disponibilite"><strong>Disponibilité :</strong> ${mentor.disponibilite}</p>

    ${boutonFavoriHTML("mentors", mentor.id)}

    <div id="zone-demande-mentor"></div>
  `;

  const zoneDemande = document.getElementById("zone-demande-mentor");

  if (!utilisateur) {
    zoneDemande.innerHTML = `
      <div class="encart-connexion-requise">
        <p>Connecte-toi pour envoyer une demande de mise en relation à ce mentor.</p>
        <a href="connexion.html" class="bouton-principal">Se connecter</a>
      </div>
    `;
  } else {
    // Vérifie si une demande a déjà été envoyée à ce mentor par cet utilisateur
    const demandes = JSON.parse(localStorage.getItem("jac_demandes_mentorat") || "[]");
    const dejaEnvoyee = demandes.some(d => d.mentorId === mentor.id && d.jeuneEmail === utilisateur.email);

    if (dejaEnvoyee) {
      zoneDemande.innerHTML = `<p class="confirmation-demande">✔ Demande déjà envoyée à ${mentor.nom}. Tu recevras une réponse par e-mail.</p>`;
    } else {
      zoneDemande.innerHTML = `
        <form id="formulaire-demande-mentor">
          <label for="message-mentor">Un message pour te présenter (optionnel)</label>
          <textarea id="message-mentor" class="quiz-textarea" rows="3" placeholder="Bonjour, je m'intéresse à..."></textarea>
          <button type="submit" class="bouton-principal bouton-pleine-largeur">Envoyer une demande de mise en relation</button>
        </form>
      `;

      document.getElementById("formulaire-demande-mentor").addEventListener("submit", (e) => {
        e.preventDefault();
        const message = document.getElementById("message-mentor").value.trim();

        const demandes = JSON.parse(localStorage.getItem("jac_demandes_mentorat") || "[]");
        demandes.push({
          mentorId: mentor.id,
          mentorNom: mentor.nom,
          jeuneNom: utilisateur.nom,
          jeuneEmail: utilisateur.email,
          message,
          statut: "en attente",
          date: new Date().toISOString()
        });
        localStorage.setItem("jac_demandes_mentorat", JSON.stringify(demandes));

        zoneDemande.innerHTML = `<p class="confirmation-demande">✔ Ta demande a bien été envoyée à ${mentor.nom}.</p>`;
      });
    }
  }

  fiche.style.display = "block";
  activerBoutonFavori(fiche);
  document.getElementById("bouton-fermer-fiche-mentor").addEventListener("click", () => {
    fiche.style.display = "none";
    history.replaceState(null, "", window.location.pathname);
  });

  fiche.scrollIntoView({ behavior: "smooth", block: "start" });
}
