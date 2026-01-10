// public/js/nav.js

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  renderAuthNav(); // ✅ now based on server cookie (/api/me), not sessionStorage
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

// ===== Auth nav (Login/Logout) using SERVER COOKIE =====
async function renderAuthNav() {
  const authNav = document.getElementById("auth-nav");
  if (!authNav) return;

  try {
    // Ask the server if we are logged in (cookie-based)
    const res = await fetch(`/api/me?ts=${Date.now()}`, {
      credentials: "same-origin",
      cache: "no-store",
    });

    const data = await res.json();

    // Not logged in
    if (!res.ok || !data?.ok) {
      authNav.innerHTML = `<li><a href="login.html">התחברות</a></li>`;
      return;
    }

    // Logged in
    authNav.innerHTML = `<li><a href="#" id="logout-link">התנתק</a></li>`;

    const logoutLink = document.getElementById("logout-link");
    if (!logoutLink) return;

    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault();

      try {
        // Tell server to clear cookie
        await fetch("/api/logout", {
          method: "POST",
          credentials: "same-origin",
        });
      } catch (err) {
        console.error("Logout error:", err);
      }

      // ✅ Update nav immediately
      authNav.innerHTML = `<li><a href="login.html">התחברות</a></li>`;

      // Redirect to home (or reload current page)
      window.location.href = "login.html";
    });
  } catch (err) {
    console.error("Auth nav error:", err);
    // fallback to logged-out view
    authNav.innerHTML = `<li><a href="login.html">התחברות</a></li>`;
  }
}
