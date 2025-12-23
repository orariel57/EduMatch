// js/teachers.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("search-form");
  const resultsSection = document.getElementById("results-section");
  const listEl = document.getElementById("teachers-list");
  const noResultsEl = document.getElementById("no-results");

  // אלמנטים של סליידר מחיר + בועת מחיר
  const slider = document.getElementById("search-price-range");
  const bubble = document.getElementById("search-price-bubble");

  if (!form || !resultsSection || !listEl || !noResultsEl) return;

  // נתוני דמו של מורים
  const DEMO_TEACHERS = getDemoTeachers();

  // אתחול בועת מחיר + האזנה לשינויים בסליידר
  initPriceBubble(slider, bubble, form, 150);

  // חיבור אירועי הטופס (חיפוש / ניקוי)
  bindFormEvents(form, resultsSection, listEl, noResultsEl, DEMO_TEACHERS);
});


// מנרמל טקסט להשוואות: מוריד רווחים וממיר לאותיות קטנות
function normalize(str) {
  return (str || "").trim().toLowerCase();
}


// דוגמאות למורים
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
    // מונע שליחה אמיתית של הטופס (אין שרת בשלב הדמו)
    e.preventDefault();

    // קורא פילטרים מהטופס
    const filters = readFiltersFromForm();

    // מסנן מורים לפי הפילטרים
    const results = filterTeachers(allTeachers, filters);

    // מציג את אזור התוצאות
    showResults(resultsSection);

    // אם אין תוצאות 
    if (results.length === 0) {
      showNoResults(listEl, noResultsEl);
      return;
    }

    // יש תוצאות -> מסתיר הודעת "אין תוצאות" ומרנדר כרטיסים
    hideNoResults(noResultsEl);
    renderTeachers(results, listEl, { subject: filters.subject });
  });

  form.addEventListener("reset", () => {
    // בניקוי: מסתירים את תוצאות החיפוש ומנקים רשימות/הודעות
    hideResults(resultsSection);
    clearList(listEl);
    hideNoResults(noResultsEl);
  });
}


// קורא את ערכי הטופס ומחזיר אובייקט פילטרים
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


// מסנן מורים לפי: שם / עיר / מקצוע / מחיר
// • מקצוע+מחיר: אותו מקצוע צריך גם לעמוד במחיר
function filterTeachers(allTeachers, filters) {
  return allTeachers.filter((t) => {
    // • סינון לפי שם
    if (filters.name) {
      if (!normalize(t.fullName).includes(filters.name)) return false;
    }

    //  סינון לפי עיר 
    if (filters.city) {
      if (normalize(t.city) !== filters.city) return false;
    }

    const subjects = t.subjects || [];
    const hasSubjectFilter = !!filters.subject;
    const hasPriceFilter = typeof filters.maxPrice === "number";

    // סינון לפי מקצוע / מחיר (או שניהם)
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
    // בוחר איזה מקצוע להציג בכרטיס)
    const chosenSubject = chooseSubjectForCard(t, renderOptions.subject);

    const card = buildTeacherCard(t, chosenSubject);

    // כפתור "מועדפים" (דמו בלבד)
    card.querySelector(".add-fav-btn")?.addEventListener("click", () => {
      alert("המורה נוסף למועדפים! (דמו)");
    });

    // כפתור בדוק זמינות- מעבר לעמוד book
    card.querySelector(".check-availability-btn")?.addEventListener("click", () => {
      window.location.href = buildBookUrl(t.email, chosenSubject.subject);
    });

    listEl.appendChild(card);
  });
}


// בוחר מקצוע לתצוגה בכרטיס
function chooseSubjectForCard(teacher, normalizedSubjectFilter) {
  const subjects = teacher.subjects || [];
  let chosen = null;

  if (normalizedSubjectFilter) {
    chosen = subjects.find((s) => normalize(s.subject).includes(normalizedSubjectFilter)) || null;
  }

  if (!chosen) chosen = subjects[0] || { subject: "לא צוין", price: "—" };
  return chosen;
}


// בונה כרטיס למורה
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


// מחזיר תווית בעברית לאופן שיעור
function getLessonModeLabel(mode) {
  return mode === "online" ? "אונליין" : mode === "in-person" ? "פרונטלי" : "שניהם";
}


function buildBookUrl(email, subject) {
  return `book.html?teacher=${encodeURIComponent(email || "")}&subject=${encodeURIComponent(subject || "")}`;
}


// מציג את אזור התוצאות
function showResults(resultsSection) {
  resultsSection.style.display = "block";
}


// מסתיר את אזור התוצאות
function hideResults(resultsSection) {
  resultsSection.style.display = "none";
}


// מציג הודעת "אין תוצאות" ומנקה רשימה
function showNoResults(listEl, noResultsEl) {
  clearList(listEl);
  noResultsEl.style.display = "block";
}


// מסתיר הודעת "אין תוצאות"
function hideNoResults(noResultsEl) {
  noResultsEl.style.display = "none";
}


// מנקה את רשימת הכרטיסים
function clearList(listEl) {
  listEl.innerHTML = "";
}
// מודול: בועת מחיר של הסליידר

// מציב בועה מעל הסליידר שמראה את הערך הנבחר
// מאפס לערך ברירת מחדל בלחיצה על ניקוי טופס
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

  // אתחול ערך ברירת מחדל
  slider.value = String(defaultValue);
  updateBubble();

  // עדכון בזמן גרירה
  slider.addEventListener("input", updateBubble);

  //מחזירים לברירת המחדל ומעדכנים בועה לאחר ניקוי טופס
  form.addEventListener("reset", () => {
    setTimeout(() => {
      slider.value = String(defaultValue);
      updateBubble();
    }, 0);
  });
}
