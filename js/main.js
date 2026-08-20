// main.js
// Script commun à TOUTES les pages : menu mobile, animation d'apparition
// au chargement de page, et animation "reveal" des cartes au scroll.

document.addEventListener("DOMContentLoaded", () => {

  // --- Menu mobile (hamburger) ---
  const burger = document.querySelector(".menu-burger");
  const nav = document.querySelector(".nav-principale");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      nav.classList.toggle("nav-ouverte");
      burger.classList.toggle("burger-actif");
    });
  }

  // --- Surligne le lien de la page actuelle dans le menu ---
  const pageActuelle = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-principale a").forEach(lien => {
    if (lien.getAttribute("href") === pageActuelle) {
      lien.classList.add("nav-lien-actif");
    }
  });

  // --- Animation douce à l'arrivée sur la page (fondu + léger glissement) ---
  document.body.classList.add("page-prete");

  // --- Animation "reveal" : les cartes apparaissent en douceur au scroll,
  // au lieu d'être toutes visibles d'un coup (donne une impression de vie) ---
  const elementsAAnimer = document.querySelectorAll(".carte, .hero-texte, h1, h2");
  elementsAAnimer.forEach(el => el.classList.add("reveal"));

  const observateur = new IntersectionObserver((entrees) => {
    entrees.forEach(entree => {
      if (entree.isIntersecting) {
        entree.target.classList.add("reveal-visible");
        observateur.unobserve(entree.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  elementsAAnimer.forEach(el => observateur.observe(el));

});
