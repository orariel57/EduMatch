// js/teachers.js
// ✅ גרסה סטטית ללא LocalStorage / ללא getTeachers().
// משתמשת בדאטה דמו קבוע כדי לדמות מידע שיגיע בעתיד מ-DB.

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("search-form");
  const resultsSection = document.getElementById("results-section");
  const listEl = document.getElementById("teachers-list");
  const noResultsEl = document.getElementById("no-results");

  if (!form || !resultsSection || !listEl || !noResultsEl) return;

  function normalize(str) {
    return (str || "").trim().toLowerCase();
  }

  // ===== DB DUMMY (סטטי) =====
  // אפשר לשנות שמות/ערים/מחירים לפי מה שמתאים לכם להגשה
  const DEMO_TEACHERS = [
    {
      fullName: "דנה לוי",
      email: "dana.levi@example.com",
      city: "באר שבע",
      lessonMode: "online", // online / in-person / both
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

  function renderTeachers(teachers, filters = {}) {
    listEl.innerHTML = "";

    teachers.forEach((t) => {
      const subjects = t.subjects || [];

      // אם חיפשו מקצוע -> נציג בכרטיס את המקצוע שתואם לחיפוש
      // אחרת -> נציג את הראשון
      let chosen = null;
      if (filters.subject) {
        chosen = subjects.find((s) => normalize(s.subject).includes(filters.subject)) || null;
      }
      if (!chosen) chosen = subjects[0] || { subject: "לא צוין", price: "—" };

      const modeLabel =
        t.lessonMode === "online"
          ? "אונליין"
          : t.lessonMode === "in-person"
          ? "פרונטלי"
          : "שניהם";

      const durationText = t.duration ? `${t.duration} דק׳` : "לא צוין";

      const card = document.createElement("article");
      card.className = "teacher-card";

      card.innerHTML = `
        <div class="teacher-card-header">
          <h3 class="teacher-name">${t.fullName || "ללא שם"}</h3>
          <div class="teacher-meta">
            <p><strong>תחום:</strong> ${chosen.subject}</p>
            <p><strong>עיר:</strong> ${t.city || "לא צוין"}</p>
          </div>
        </div>

        <div class="teacher-details">
          <p><strong>מחיר לשיעור:</strong> ${chosen.price ?? "—"}₪</p>
          <p><strong>משך שיעור:</strong> ${durationText}</p>
          <p><strong>אופן שיעור:</strong> ${modeLabel}</p>
        </div>

        <div class="teacher-actions">
          <button type="button" class="btn-secondary add-fav-btn">הוסף למועדפים</button>
          <button type="button" class="btn-primary check-availability-btn">בדוק זמינות</button>
        </div>
      `;

      // דמו: מועדפים
      card.querySelector(".add-fav-btn").addEventListener("click", () => {
        alert("דמו בלבד 🙂 בשלב הבא זה יישמר בבסיס נתונים.");
      });

      // מעבר להזמנה (עדיין דמו, מעבירים פרטים ב-QueryString)
      card.querySelector(".check-availability-btn").addEventListener("click", () => {
        window.location.href = `book.html?teacher=${encodeURIComponent(t.email)}&subject=${encodeURIComponent(
          chosen.subject
        )}`;
      });

      listEl.appendChild(card);
    });
  }

  function filterTeachers(filters) {
    const all = DEMO_TEACHERS;

    return all.filter((t) => {
      // שם
      if (filters.name) {
        if (!normalize(t.fullName).includes(filters.name)) return false;
      }

      // עיר
      if (filters.city) {
        if (normalize(t.city) !== filters.city) return false;
      }

      const subjects = t.subjects || [];

      // מקצוע + מחיר ביחד (אותו מקצוע צריך לעמוד במחיר)
      const hasSubjectFilter = !!filters.subject;
      const hasPriceFilter = typeof filters.maxPrice === "number";

      if (hasSubjectFilter || hasPriceFilter) {
        const ok = subjects.some((s) => {
          const subjectOk = !hasSubjectFilter
            ? true
            : normalize(s.subject).includes(filters.subject);

          const priceOk = !hasPriceFilter
            ? true
            : Number(s.price || 0) <= filters.maxPrice;

          return subjectOk && priceOk;
        });

        if (!ok) return false;
      }

      return true;
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const subject = normalize(document.getElementById("filter-subject")?.value);
    const city = normalize(document.getElementById("filter-city")?.value);
    const name = normalize(document.getElementById("filter-name")?.value);

    const rawMaxPrice = document.getElementById("search-price-range")?.value;
    const maxPrice = rawMaxPrice === "" || rawMaxPrice == null ? NaN : Number(rawMaxPrice);

    const results = filterTeachers({
      subject,
      city,
      name,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    });

    resultsSection.style.display = "block";

    if (results.length === 0) {
      listEl.innerHTML = "";
      noResultsEl.style.display = "block";
    } else {
      noResultsEl.style.display = "none";
      renderTeachers(results, { subject });
    }
  });

  // על Reset – מסתירים את תוצאות החיפוש
  form.addEventListener("reset", () => {
    resultsSection.style.display = "none";
    listEl.innerHTML = "";
    noResultsEl.style.display = "none";
  });

  // אופציונלי: אם את רוצה שכבר בכניסה יופיעו מורים בלי לחפש
  // renderTeachers(DEMO_TEACHERS);
  // resultsSection.style.display = "block";
});

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".teacher-card");

  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
  });
});
