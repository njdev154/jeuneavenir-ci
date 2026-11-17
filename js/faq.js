document.addEventListener("DOMContentLoaded", () => {
  const barreOutils = document.getElementById("faq-outils");
  const recherche = document.getElementById("faq-recherche");
  const filtres = document.getElementById("faq-filtres");
  const questions = Array.from(document.querySelectorAll("[data-faq-item]"));
  const statut = document.getElementById("faq-statut");
  const messageVide = document.getElementById("faq-vide");
  if (!barreOutils || !recherche || !filtres || !statut || !messageVide) return;

  let categorieActive = "tout";
  barreOutils.hidden = false;
  recherche.addEventListener("input", appliquerFiltres);
  filtres.addEventListener("click", evenement => {
    const bouton = evenement.target.closest("[data-faq-categorie]");
    if (!bouton) return;
    categorieActive = bouton.dataset.faqCategorie;
    filtres.querySelectorAll("[data-faq-categorie]").forEach(item => {
      item.setAttribute("aria-pressed", String(item === bouton));
    });
    appliquerFiltres();
  });

  function appliquerFiltres() {
    const termes = normaliserFAQ(recherche.value);
    let visibles = 0;
    questions.forEach(question => {
      const categorieCorrespond = categorieActive === "tout"
        || question.dataset.faqItem === categorieActive;
      const texteCorrespond = !termes
        || normaliserFAQ(question.textContent).includes(termes);
      const visible = categorieCorrespond && texteCorrespond;
      question.hidden = !visible;
      if (visible) visibles++;
    });

    messageVide.hidden = visibles !== 0;
    statut.textContent = `${visibles} question${visibles === 1 ? "" : "s"} affichée${visibles === 1 ? "" : "s"}.`;
    if (window.JeuneAvenirMotion) window.JeuneAvenirMotion.initialiser();
  }

  appliquerFiltres();
});

function normaliserFAQ(texte) {
  return String(texte || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim()
    .replace(/\s+/g, " ");
}
