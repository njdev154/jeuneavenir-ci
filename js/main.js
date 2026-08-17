// main.js
// Script commun à TOUTES les pages du site JeuneAvenir CI
// Rôle : menu mobile (hamburger), et tout comportement partagé entre pages

document.addEventListener("DOMContentLoaded", () => {
  const burger = document.querySelector(".menu-burger");
  const nav = document.querySelector(".nav-principale");

  if (burger && nav) {
    burger.addEventListener("click", () => {
      nav.classList.toggle("nav-ouverte");
      burger.classList.toggle("burger-actif");
    });
  }
});
