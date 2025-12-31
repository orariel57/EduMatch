//nav.js
// Hamburger menu
// Reset menu state back to desktop

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  renderAuthNav();
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

// ===== Auth nav (Login/Logout) using sessionStorage =====
function renderAuthNav() {
  const authNav = document.getElementById("auth-nav");
  if (!authNav) return;

  const isLoggedIn = sessionStorage.getItem("edumatchLoggedIn") === "true";

  if (!isLoggedIn) {
    authNav.innerHTML = `<li><a href="login.html">התחברות</a></li>`;
    return;
  }

  authNav.innerHTML = `<li><a href="#" id="logout-link">התנתק</a></li>`;

  const logoutLink = document.getElementById("logout-link");
  if (!logoutLink) return;

  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    sessionStorage.removeItem("edumatchLoggedIn");
    alert("התנתקת מהמערכת (דמו בלבד)");
    window.location.href = "index.html";
  });
}
