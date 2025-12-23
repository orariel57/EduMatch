// js/teachers.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("search-form");
  const resultsSection = document.getElementById("results-section");
  const listEl = document.getElementById("teachers-list");
  const noResultsEl = document.getElementById("no-results");

  // Price slider elements + price bubble
  const slider = document.getElementById("search-price-range");
  const bubble = document.getElementById("search-price-bubble");

  if (!form || !resultsSection || !listEl || !noResultsEl) return;

  // Demo teachers data
  const DEMO_TEACHERS = getDemoTeachers();

  // Initialize price bubble + listen to slider changes
  initPriceBubble(slider, bubble, form, 150);

  // Bind form events (search / reset)
  bindFormEvents(form, resultsSection, listEl, noResultsEl, DEMO_TEACHERS);
});


// Normalizes text for comparisons: trims spaces and converts to lowercase
function normalize(str) {
  return (str || "").trim().toLowerCase();
}


// Teacher examples
function getDemoTeachers() {
  return [
    {
      fullName: "דנה לוי",
      email: "dana.levi@example.com",
      city: "באר שבע",
      lessonMode: "online",
      duration: 60,
      subjects: [
        { subject: "מתמטיקה", price: 120 },
        { subject: "אנגלית", price: 110 },
      ],
    },
    {
      fullName: "יואב כהן",
      email: "yoav.cohen@example.com",
      city: "תל אביב",
      lessonMode: "in-person",
      duration: 45,
      subjects: [
        { subject: "פייתון", price: 180 },
        { subject: "מתמטיקה", price: 130 },
        { subject: "SQL", price: 160 },
      ],
    },
    {
      fullName: "נועה מזרחי",
      email: "noa.mizrahi@example.com",
      city: "חיפה",
      lessonMode: "both",
      duration: 60,
      subjects: [
        { subject: "לשון", price: 100 },
        { subject: "היסטוריה", price: 90 },
      ],
    },
    {
      fullName: "רון פרץ",
      email: "ron.peretz@example.com",
      city: "ירושלים",
      lessonMode: "online",
      duration: 90,
      subjects: [
        { subject: "סטטיסטיקה", price: 200 },
        { subject: "אקסל", price: 150 },
      ],
    },
  ];
}


function bindFormEvents(form, resultsSection, listEl, noResultsEl, allTeachers) {
  form.addEventListener("submit", (e) => {
    // Prevent actual form submission (no server in demo stage)
    e.preventDefault();

    // Read filters from form
    const filters = readFiltersFromForm();

    // Filter teachers by the filters
    const results = filterTeachers(allTeachers, filters);

    // Show results section
    showResults(resultsSection);

    // If there are no results 
    if (results.length === 0) {
      showNoResults(listEl, noResultsEl);
      return;
    }

    // Results exist -> hide "no results" message and render cards
    hideNoResults(noResultsEl);
    renderTeachers(results, listEl, { subject: filters.subject });
  });

  form.addEventListener("reset", () => {
    // On reset: hide search results and clear lists/messages
    hideResults(resultsSection);
    clearList(listEl);
    hideNoResults(noResultsEl);
  });
}


// Reads form values and returns a filters object
function readFiltersFromForm() {
  const subject = normalize(document.getElementById("filter-subject")?.value);
  const city = normalize(document.getElementById("filter-city")?.value);
  const name = normalize(document.getElementById("filter-name")?.value);

  const rawMaxPrice = document.getElementById("search-price-range")?.value;
  const maxPrice = rawMaxPrice === "" || rawMaxPrice == null ? NaN : Number(rawMaxPrice);

  return {
    subject,
    city,
    name,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
  };
}


// Filters teachers by: name / city / subject / price
// • Subject+price: the same subject must also match the price
function filterTeachers(allTeachers, filters) {
  return allTeachers.filter((t) => {
    // • Filter by name
    if (filters.name) {
      if (!normalize(t.fullName).includes(filters.name)) return false;
    }

    //  Filter by city 
    if (filters.city) {
      if (normalize(t.city) !== filters.city) return false;
    }

    const subjects = t.subjects || [];
    const hasSubjectFilter = !!filters.subject;
    const hasPriceFilter = typeof filters.maxPrice === "number";

    // Filter by subject / price (or both)
    if (hasSubjectFilter || hasPriceFilter) {
      const ok = subjects.some((s) => {
        const subjectOk = !hasSubjectFilter ? true : normalize(s.subject).includes(filters.subject);
        const priceOk = !hasPriceFilter ? true : Number(s.price || 0) <= filters.maxPrice;
        return subjectOk && priceOk;
      });

      if (!ok) return false;
    }

    return true;
  });
}



function renderTeachers(teachers, listEl, renderOptions = {}) {
  clearList(listEl);

  teachers.forEach((t) => {
    // Choose which subject to display on the card)
    const chosenSubject = chooseSubjectForCard(t, renderOptions.subject);

    const card = buildTeacherCard(t, chosenSubject);

    // "Favorites" button (demo only)
    card.querySelector(".add-fav-btn")?.addEventListener("click", () => {
      alert("המורה נוסף למועדפים! (דמו)");
    });

    // Check availability button - navigate to book page
    card.querySelector(".check-availability-btn")?.addEventListener("click", () => {
      window.location.href = buildBookUrl(t.email, chosenSubject.subject);
    });

    listEl.appendChild(card);
  });
}


// Choose subject to display on card
function chooseSubjectForCard(teacher, normalizedSubjectFilter) {
  const subjects = teacher.subjects || [];
  let chosen = null;

  if (normalizedSubjectFilter) {
    chosen = subjects.find((s) => normalize(s.subject).includes(normalizedSubjectFilter)) || null;
  }

  if (!chosen) chosen = subjects[0] || { subject: "לא צוין", price: "—" };
  return chosen;
}


// Build a teacher card
function buildTeacherCard(teacher, chosenSubject) {
  const card = document.createElement("article");
  card.className = "teacher-card";

  const modeLabel = getLessonModeLabel(teacher.lessonMode);
  const durationText = teacher.duration ? `${teacher.duration} דק׳` : "לא צוין";

  card.innerHTML = `
    <div class="teacher-card-header">
      <h3 class="teacher-name">${teacher.fullName || "ללא שם"}</h3>
      <div class="teacher-meta">
        <p><strong>תחום:</strong> ${chosenSubject.subject}</p>
        <p><strong>עיר:</strong> ${teacher.city || "לא צוין"}</p>
      </div>
    </div>

    <div class="teacher-details">
      <p><strong>מחיר לשיעור:</strong> ${chosenSubject.price ?? "—"}₪</p>
      <p><strong>משך שיעור:</strong> ${durationText}</p>
      <p><strong>אופן שיעור:</strong> ${modeLabel}</p>
    </div>

    <div class="teacher-actions">
      <button type="button" class="btn-secondary add-fav-btn">הוסף למועדפים</button>
      <button type="button" class="btn-primary check-availability-btn">בדוק זמינות</button>
    </div>
  `;

  return card;
}


// Returns Hebrew label for lesson mode
function getLessonModeLabel(mode) {
  return mode === "online" ? "אונליין" : mode === "in-person" ? "פרונטלי" : "שניהם";
}


function buildBookUrl(email, subject) {
  return `book.html?teacher=${encodeURIComponent(email || "")}&subject=${encodeURIComponent(subject || "")}`;
}


// Show the results section
function showResults(resultsSection) {
  resultsSection.style.display = "block";
}


// Hide the results section
function hideResults(resultsSection) {
  resultsSection.style.display = "none";
}


// Show "no results" message and clear list
function showNoResults(listEl, noResultsEl) {
  clearList(listEl);
  noResultsEl.style.display = "block";
}


// Hide "no results" message
function hideNoResults(noResultsEl) {
  noResultsEl.style.display = "none";
}


// Clear the cards list
function clearList(listEl) {
  listEl.innerHTML = "";
}
// Module: slider price bubble

// Positions a bubble above the slider showing the selected value
// Resets to a default value when the form is reset
function initPriceBubble(slider, bubble, form, defaultValue = 150) {
  if (!slider || !bubble || !form) return;

  function updateBubble() {
    const val = Number(slider.value);
    const min = Number(slider.min);
    const max = Number(slider.max);
    const percent = ((val - min) / (max - min)) * 100;

    bubble.textContent = String(val);
    bubble.style.left = `calc(${percent}%)`;
  }

  // Initialize default value
  slider.value = String(defaultValue);
  updateBubble();

  // Update while dragging
  slider.addEventListener("input", updateBubble);

  // Reset to default and update bubble after form reset
  form.addEventListener("reset", () => {
    setTimeout(() => {
      slider.value = String(defaultValue);
      updateBubble();
    }, 0);
  });
}
