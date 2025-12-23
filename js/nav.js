//nav.js
// תפריט המבורגר
// איפוס מצב התפריט בחזרה לדסקטופ

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
});

// מאתחל את כל לוגיקת הניווט
function initMobileNavigation() {
  const toggle = document.querySelector(".nav-toggle"); // כפתור תפריט (☰)
  const nav = document.querySelector("header nav");

  if (!toggle || !nav) return;

  bindToggleClick(toggle, nav);
  bindResizeReset(toggle, nav);
}

// מטפל בלחיצה על כפתור התפריט (פתיחה / סגירה)
function bindToggleClick(toggle, nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open"); // הוספת / הסרת מחלקה

    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

    toggle.textContent = isOpen ? "✕" : "☰";
  });
}

// סוגר את התפריט אוטומטית כאשר עוברים חזרה למסך רחב (דסקטופ)
function bindResizeReset(toggle, nav) {
  window.addEventListener("resize", () => {
    if (window.innerWidth > 600) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    }
  });
}
