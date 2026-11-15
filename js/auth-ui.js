document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    const input = document.getElementById(button.getAttribute("aria-controls"));
    if (!input) return;

    const label = button.getAttribute("aria-label").replace(/^Afficher/, "");
    button.addEventListener("click", () => {
      const showPassword = input.type === "password";
      input.type = showPassword ? "text" : "password";
      button.textContent = showPassword ? "Masquer" : "Afficher";
      button.setAttribute("aria-label", `${showPassword ? "Masquer" : "Afficher"}${label}`);
      button.setAttribute("aria-pressed", String(showPassword));
    });
  });
});
