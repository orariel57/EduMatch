// js/teachers.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("search-form");
  const resultsSection = document.getElementById("results-section");
  const listEl = document.getElementById("teachers-list");
  const noResultsEl = document.getElementById("no-results");

  if (!form || !resultsSection || !listEl || !noResultsEl) return;

  function normalize(str) {
    return (str || "").trim().toLowerCase();
  }

  function renderTeachers(teachers) {
    listEl.innerHTML = "";

    teachers.forEach(t => {
      const subjectsText = (t.subjects || [])
        .map(s => `${s.subject} • ${s.price || 0}₪/שעה`)
        .join("<br>");

      const modeLabel =
        t.lessonMode === "online" ? "מקוון" :
        t.lessonMode === "in-person" ? "פרונטלי" : "שניהם";

      const card = document.createElement("article");
      card.className = "teacher-card";
      card.innerHTML = `
        <h3>${t.fullName}</h3>
        <p><strong>עיר:</strong> ${t.city || "לא צוין"}</p>
        <p><strong>מצב שיעור:</strong> ${modeLabel}</p>
        <p><strong>תחומים:</strong><br>${subjectsText}</p>
      `;
      listEl.appendChild(card);
    });
  }

  function filterTeachers(filters) {
    const all = getTeachers();

    return all.filter(t => {
      // שם
      if (filters.name) {
        if (!normalize(t.fullName).includes(filters.name)) return false;
      }

      // עיר
      if (filters.city) {
        if (normalize(t.city) !== filters.city) return false;
      }

      // מקצוע (בדיקת includes על כל אחד מהמקצועות)
      if (filters.subject) {
        const hasSubject = (t.subjects || []).some(s =>
          normalize(s.subject).includes(filters.subject)
        );
        if (!hasSubject) return false;
      }

      // מחיר מקסימלי (הסליידר הוא "עד X")
      if (typeof filters.maxPrice === "number") {
        const hasAffordable = (t.subjects || []).some(s =>
          Number(s.price || 0) <= filters.maxPrice
        );
        if (!hasAffordable) return false;
      }

      return true;
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const subject = normalize(document.getElementById("filter-subject")?.value);
    const city = normalize(document.getElementById("filter-city")?.value);
    const name = normalize(document.getElementById("filter-name")?.value);
    const maxPrice = Number(document.getElementById("search-price-range")?.value || 0);

    const results = filterTeachers({ subject, city, name, maxPrice });

    resultsSection.style.display = "block";

    if (results.length === 0) {
      listEl.innerHTML = "";
      noResultsEl.style.display = "block";
    } else {
      noResultsEl.style.display = "none";
      renderTeachers(results);
    }
  });

  // על Reset – מסתירים את תוצאות החיפוש
  form.addEventListener("reset", () => {
    resultsSection.style.display = "none";
    listEl.innerHTML = "";
    noResultsEl.style.display = "none";
  });
});
