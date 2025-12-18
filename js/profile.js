// js/profile.js
// ✅ גרסה סטטית ללא LocalStorage / ללא DB.
// מציגה פרופיל דמו (מורה/תלמיד) + מאפשרת "עריכה" מקומית רק על המסך (לא נשמר).

document.addEventListener("DOMContentLoaded", () => {
  const noUserCard = document.getElementById("no-user-card");
  const layout = document.getElementById("profile-layout");

  // ======== דמו: בחרי תפקיד פרופיל ========
  // אפשר לשנות ל-"student" אם את רוצה שהדמו יהיה תלמיד
  const DEMO_ROLE = "teacher"; // "teacher" / "student"

  const DEMO_USER_TEACHER = {
    role: "teacher",
    fullName: "דנה לוי",
    email: "dana.levi@example.com",
    phone: "0521234567",
    city: "באר שבע",
    experience: 3,
    duration: 60,
    lessonMode: "online",
    subjects: [
      { subject: "מתמטיקה", price: 120 },
      { subject: "אנגלית", price: 110 },
    ],
    availabilityWeekly: {
      sun: { enabled: true, start: "16:00", end: "20:00" },
      mon: { enabled: true, start: "10:00", end: "14:00" },
      tue: { enabled: false, start: "", end: "" },
      wed: { enabled: true, start: "12:00", end: "18:00" },
      thu: { enabled: true, start: "09:00", end: "13:00" },
      fri: { enabled: false, start: "", end: "" },
      sat: { enabled: false, start: "", end: "" },
    },
  };

  const DEMO_USER_STUDENT = {
    role: "student",
    fullName: "נועה כהן",
    email: "noa.cohen@example.com",
    phone: "0549876543",
    city: "תל אביב-יפו",
  };

  // דמו "מחובר": תמיד יש משתמש.
  const user = DEMO_ROLE === "teacher" ? DEMO_USER_TEACHER : DEMO_USER_STUDENT;

  // ===== אין משתמש מחובר (אם תרצי להדגים מצב) =====
  // אם את רוצה להציג את כרטיס "לא נמצאה התחברות", שימי כאן null:
  // const user = null;

  if (!user) {
    if (noUserCard) noUserCard.style.display = "block";
    if (layout) layout.style.display = "none";
    return;
  }

  if (noUserCard) noUserCard.style.display = "none";
  if (layout) layout.style.display = "flex";

  // ===== ברכת שלום =====
  const greetingEl = document.getElementById("profile-greeting");
  if (greetingEl && user.fullName) {
    const firstName = user.fullName.split(" ")[0];
    greetingEl.textContent = `שלום ${firstName},`;
  }

  // ===== פרטי משתמש =====
  const nameEl = document.getElementById("profile-name");
  const emailEl = document.getElementById("profile-email");
  const cityEl = document.getElementById("profile-city");
  const fieldEl = document.getElementById("profile-field");
  const rolePill = document.getElementById("profile-role-pill");
  const favoritesSection = document.getElementById("favorites-section");

  if (nameEl) nameEl.textContent = user.fullName || "—";
  if (emailEl) emailEl.textContent = user.email || "—";
  if (cityEl) cityEl.textContent = user.city || "—";

  if (user.role === "teacher") {
    if (rolePill) rolePill.textContent = "מורה";
    if (favoritesSection) favoritesSection.style.display = "none";

    const subjectsText = (user.subjects || [])
      .map((s) => `${s.subject} (${s.price}₪ לשיעור)`)
      .join(", ");

    const experienceText =
      user.experience && user.experience > 0 ? ` • ${user.experience} שנות ניסיון` : "";

    if (fieldEl) fieldEl.textContent = subjectsText ? `${subjectsText}${experienceText}` : "פרופיל מורה";
  } else {
    if (rolePill) rolePill.textContent = "תלמיד/ה";
    if (favoritesSection) favoritesSection.style.display = "block";
    if (fieldEl) fieldEl.textContent = "פרופיל תלמיד/ה";
  }

  // ================= עריכת פרטים (דמו) =================
  const editBtn = document.getElementById("edit-profile-btn");
  const editForm = document.getElementById("edit-profile-form");
  const cancelBtn = document.getElementById("cancel-edit-btn");

  const editFullName = document.getElementById("edit-fullName");
  const editPhone = document.getElementById("edit-phone");
  const editCity = document.getElementById("edit-city");

  const teacherFieldsBox = document.getElementById("teacher-edit-fields");
  const editExperience = document.getElementById("edit-experience");
  const editDuration = document.getElementById("edit-duration");

  const subjectsList = document.getElementById("subjects-list");
  const newSubjectName = document.getElementById("new-subject-name");
  const newSubjectPrice = document.getElementById("new-subject-price");
  const addSubjectBtn = document.getElementById("add-subject-btn");

  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  function getWeeklyAvailabilityFromForm() {
    const weekly = {};
    dayKeys.forEach((day) => {
      const cb = document.querySelector(`input[type="checkbox"][data-day="${day}"]`);
      const start = document.querySelector(`input[type="time"][data-start="${day}"]`);
      const end = document.querySelector(`input[type="time"][data-end="${day}"]`);

      const enabled = !!cb?.checked;
      const sVal = start?.value || "";
      const eVal = end?.value || "";

      if (!enabled) {
        weekly[day] = { enabled: false, start: "", end: "" };
        return;
      }

      weekly[day] = { enabled: true, start: sVal, end: eVal };
    });
    return weekly;
  }

  function setWeeklyAvailabilityToForm(weekly) {
    const data = weekly || {};
    dayKeys.forEach((day) => {
      const cb = document.querySelector(`input[type="checkbox"][data-day="${day}"]`);
      const start = document.querySelector(`input[type="time"][data-start="${day}"]`);
      const end = document.querySelector(`input[type="time"][data-end="${day}"]`);

      const obj = data[day] || { enabled: false, start: "", end: "" };

      if (cb) cb.checked = !!obj.enabled;
      if (start) start.value = obj.start || "";
      if (end) end.value = obj.end || "";
    });
  }

  function validateWeeklyAvailability(weekly) {
    for (const [day, obj] of Object.entries(weekly || {})) {
      if (!obj || obj.enabled === false) continue;

      const s = obj.start || "";
      const e = obj.end || "";

      if (!s || !e) {
        return { ok: false, message: `ביום ${day} חסרה שעת התחלה או סיום.` };
      }
      if (s >= e) {
        return { ok: false, message: `ביום ${day} שעת הסיום חייבת להיות אחרי שעת ההתחלה.` };
      }
    }
    return { ok: true };
  }

  function renderSubjects() {
    if (!subjectsList || user.role !== "teacher") return;

    subjectsList.innerHTML = "";

    (user.subjects || []).forEach((s, index) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.gap = "8px";
      row.style.marginBottom = "6px";

      row.innerHTML = `
        <span style="flex:1">${s.subject} – ${s.price}₪</span>
        <button type="button" class="btn-secondary">❌</button>
      `;

      row.querySelector("button").addEventListener("click", () => {
        user.subjects.splice(index, 1);
        renderSubjects();
      });

      subjectsList.appendChild(row);
    });
  }

  function openEditForm() {
    if (!editForm) return;

    if (editFullName) editFullName.value = user.fullName || "";
    if (editPhone) editPhone.value = user.phone || "";
    if (editCity) editCity.value = user.city || "";

    if (user.role === "teacher") {
      if (teacherFieldsBox) teacherFieldsBox.style.display = "block";
      if (editExperience) editExperience.value = user.experience ?? 0;
      if (editDuration) editDuration.value = user.duration ?? 60;

      renderSubjects();
      setWeeklyAvailabilityToForm(user.availabilityWeekly);
    } else {
      if (teacherFieldsBox) teacherFieldsBox.style.display = "none";
    }

    editForm.style.display = "block";
  }

  function closeEditForm() {
    if (!editForm) return;
    editForm.style.display = "none";
  }

  if (editBtn) editBtn.addEventListener("click", openEditForm);
  if (cancelBtn) cancelBtn.addEventListener("click", closeEditForm);

  if (addSubjectBtn) {
    addSubjectBtn.addEventListener("click", () => {
      if (user.role !== "teacher") return;

      const subject = (newSubjectName?.value || "").trim();
      const price = Number(newSubjectPrice?.value || 0);

      if (!subject) {
        alert("יש להזין שם תחום");
        return;
      }
      if (!Number.isFinite(price) || price < 0) {
        alert("יש להזין מחיר תקין");
        return;
      }

      user.subjects = user.subjects || [];
      user.subjects.push({ subject, price });

      if (newSubjectName) newSubjectName.value = "";
      if (newSubjectPrice) newSubjectPrice.value = "";

      renderSubjects();
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const newFullName = (editFullName?.value || "").trim();
      const newPhone = (editPhone?.value || "").trim();
      const newCity = (editCity?.value || "").trim();

      if (!newFullName || !newPhone) {
        alert("שם וטלפון הם שדות חובה.");
        return;
      }

      // עדכון דמו מקומי
      user.fullName = newFullName;
      user.phone = newPhone;
      user.city = newCity;

      if (user.role === "teacher") {
        const exp = Number(editExperience?.value || 0);
        const dur = Number(editDuration?.value || 60);

        if (dur <= 0) {
          alert("משך שיעור חייב להיות גדול מ-0.");
          return;
        }

        const weekly = getWeeklyAvailabilityFromForm();
        const weeklyValidation = validateWeeklyAvailability(weekly);
        if (!weeklyValidation.ok) {
          alert(weeklyValidation.message);
          return;
        }

        user.experience = exp;
        user.duration = dur;
        user.availabilityWeekly = weekly;
      }

      // רענון טקסטים במסך (דמו)
      if (nameEl) nameEl.textContent = user.fullName || "—";
      if (cityEl) cityEl.textContent = user.city || "—";

      if (user.role === "teacher") {
        const subjectsText = (user.subjects || [])
          .map((s) => `${s.subject} (${s.price}₪ לשיעור)`)
          .join(", ");
        const experienceText =
          user.experience && user.experience > 0 ? ` • ${user.experience} שנות ניסיון` : "";
        if (fieldEl) fieldEl.textContent = subjectsText ? `${subjectsText}${experienceText}` : "פרופיל מורה";
      }

      closeEditForm();
      alert("דמו בלבד 🙂 הפרטים עודכנו לתצוגה בלבד (אין שמירה כי אין DB).");
    });
  }
});
