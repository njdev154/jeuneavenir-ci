(() => {
  let observateur = null;
  let initialise = false;
  let elementsMotion = [];
  let verificationPlanifiee = false;

  function mouvementsReduits() {
    return window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function rendreVisible(element) {
    element.classList.add("motion-visible");
    if (observateur) observateur.unobserve(element);
  }

  function verifierVisibles() {
    verificationPlanifiee = false;
    elementsMotion.forEach(element => {
      if (element.classList.contains("motion-visible")) return;
      const boite = element.getBoundingClientRect();
      if (boite.bottom > 0 && boite.top < window.innerHeight) {
        rendreVisible(element);
      }
    });
  }

  function planifierVerification() {
    if (verificationPlanifiee) return;
    verificationPlanifiee = true;
    window.requestAnimationFrame(verifierVisibles);
  }

  function initialiser() {
    if (initialise) return;
    initialise = true;

    elementsMotion = Array.from(document.querySelectorAll("[data-motion]"));
    document.querySelectorAll("[data-motion-stagger]").forEach(groupe => {
      Array.from(groupe.children)
        .filter(element => element.matches("[data-motion]"))
        .forEach((element, index) => {
          element.style.setProperty("--motion-index", String(Math.min(index, 6)));
        });
    });

    if (!elementsMotion.length || mouvementsReduits()) {
      elementsMotion.forEach(rendreVisible);
      return;
    }

    if ("IntersectionObserver" in window) {
      observateur = new IntersectionObserver(entrees => {
        entrees.forEach(entree => {
          if (entree.isIntersecting) rendreVisible(entree.target);
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });

      elementsMotion.forEach(element => observateur.observe(element));
    }

    document.documentElement.classList.add("motion-enabled");
    window.addEventListener("scroll", planifierVerification, { passive: true });
    window.addEventListener("resize", planifierVerification, { passive: true });
    planifierVerification();
  }

  function animer(element) {
    if (!element) return;
    rendreVisible(element);
    if (mouvementsReduits()) return;

    element.classList.remove("motion-feedback");
    void element.offsetWidth;
    element.classList.add("motion-feedback");
    element.addEventListener("animationend", () => {
      element.classList.remove("motion-feedback");
    }, { once: true });
  }

  window.JeuneAvenirMotion = { initialiser, animer };
})();
