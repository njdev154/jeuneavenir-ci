// main.js
// Script commun à TOUTES les pages : menu mobile, navigation active et animations.

document.addEventListener("DOMContentLoaded", () => {

  // --- Menu mobile (hamburger) ---
  const burger = document.querySelector(".menu-burger");
  const nav = document.querySelector(".nav-principale");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      nav.classList.toggle("nav-ouverte");
      burger.classList.toggle("burger-actif");
      if (document.body.classList.contains("page-accueil")) {
        const menuOuvert = nav.classList.contains("nav-ouverte");
        const entete = burger.closest(".entete");
        burger.setAttribute("aria-expanded", String(menuOuvert));
        burger.setAttribute("aria-label", menuOuvert ? "Fermer le menu" : "Ouvrir le menu");
        if (entete) entete.classList.toggle("menu-ouvert", menuOuvert);
      }
    });
  }

  // --- Surligne le lien de la page actuelle dans le menu ---
  const pageActuelle = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-principale a").forEach(lien => {
    if (lien.getAttribute("href") === pageActuelle) {
      lien.classList.add("nav-lien-actif");
    }
  });

  if (window.JeuneAvenirMotion) {
    window.JeuneAvenirMotion.initialiser();
    return;
  }

  const elementsAAnimer = document.querySelectorAll(".carte, .hero-texte, h1, h2");
  elementsAAnimer.forEach(el => el.classList.add("reveal"));

  if (!("IntersectionObserver" in window)) {
    elementsAAnimer.forEach(el => el.classList.add("reveal-visible"));
    return;
  }

  const observateur = new IntersectionObserver(entrees => {
    entrees.forEach(entree => {
      if (entree.isIntersecting) {
        entree.target.classList.add("reveal-visible");
        observateur.unobserve(entree.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  elementsAAnimer.forEach(el => observateur.observe(el));

});
