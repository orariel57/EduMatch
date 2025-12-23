//nav.js
// Hamburger menu
// Reset menu state back to desktop

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
});

// Initializes all navigation logic
function initMobileNavigation() {
  const toggle = document.querySelector(".nav-toggle"); // Menu button (☰)
  const nav = document.querySelector("header nav");

  if (!toggle || !nav) return;

  bindToggleClick(toggle, nav);
  bindResizeReset(toggle, nav);
}

// Handles click on the menu button (open / close)
function bindToggleClick(toggle, nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open"); // Add / remove class

    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

    toggle.textContent = isOpen ? "✕" : "☰";
  });
}

// Closes the menu automatically when switching back to a wide screen (desktop)
function bindResizeReset(toggle, nav) {
  window.addEventListener("resize", () => {
    if (window.innerWidth > 600) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    }
  });
}
