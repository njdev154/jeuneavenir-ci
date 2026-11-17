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
    const candidats = Array.from(document.querySelectorAll("[data-motion]"));
    document.querySelectorAll("[data-motion-stagger]").forEach(groupe => {
      Array.from(groupe.children)
        .filter(element => element.matches("[data-motion]"))
        .forEach((element, index) => {
          element.style.setProperty("--motion-index", String(Math.min(index, 6)));
        });
    });

    elementsMotion = elementsMotion.filter(element => {
      if (element.isConnected) return true;
      if (observateur) observateur.unobserve(element);
      return false;
    });

    const nouveauxElements = candidats.filter(element => !elementsMotion.includes(element));
    elementsMotion.push(...nouveauxElements);

    if (!initialise) {
      initialise = true;
      window.addEventListener("scroll", planifierVerification, { passive: true });
      window.addEventListener("resize", planifierVerification, { passive: true });
    }

    if (mouvementsReduits()) {
      candidats.forEach(rendreVisible);
      return;
    }

    if (candidats.length) document.documentElement.classList.add("motion-enabled");

    if ("IntersectionObserver" in window && !observateur) {
      observateur = new IntersectionObserver(entrees => {
        entrees.forEach(entree => {
          if (entree.isIntersecting) rendreVisible(entree.target);
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
    }

    if (observateur) nouveauxElements.forEach(element => observateur.observe(element));
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
