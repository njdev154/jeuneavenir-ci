// favoris-page.js
// Logique spécifique à favoris.html : charge les filières et mentors
// sauvegardés (via favoris.js) et les affiche.

document.addEventListener("DOMContentLoaded", async () => {
  const favoris = chargerFavoris();

  try {
    const [repFilieres, repMentors] = await Promise.all([
      fetch("data/filieres.json"),
      fetch("data/mentors.json")
    ]);
    const toutesFilieres = (await repFilieres.json()).filieres;
    const donneesMentors = await repMentors.json();
    const tousMentors = donneesMentors._statut_publication === "verifie"
      ? donneesMentors.mentors
      : [];

    // --- Filières favorites ---
    const conteneurFilieres = document.getElementById("favoris-filieres");
    const filieresFavorites = toutesFilieres.filter(f => favoris.filieres.includes(f.id));

    if (filieresFavorites.length === 0) {
      conteneurFilieres.innerHTML = "<p class='message-vide'>Aucune filière en favori pour l'instant. <a href='filieres.html' class='lien-explorer'>Explorer les filières →</a></p>";
    } else {
      conteneurFilieres.innerHTML = filieresFavorites.map(f => `
        <a href="filieres.html#${f.id}" class="carte carte-filiere" style="text-decoration:none; display:block;">
          <h3>${f.nom}</h3>
          <p>${(f.description || "").slice(0, 90)}</p>
        </a>
      `).join("");
    }

    // --- Mentors favoris ---
    const conteneurMentors = document.getElementById("favoris-mentors");
    const mentorsFavoris = tousMentors.filter(m => favoris.mentors.includes(m.id));

    if (mentorsFavoris.length === 0) {
      conteneurMentors.innerHTML = "<p class='message-vide'>Aucun mentor en favori pour l'instant. <a href='mentorat.html' class='lien-explorer'>Explorer les mentors →</a></p>";
    } else {
      conteneurMentors.innerHTML = mentorsFavoris.map(m => `
        <a href="mentorat.html#${m.id}" class="carte carte-mentor" style="text-decoration:none; display:block;">
          <h3>${m.nom}</h3>
          <p>${m.bio.slice(0, 80)}</p>
        </a>
      `).join("");
    }

  } catch (erreur) {
    console.error(erreur);
  }
});
