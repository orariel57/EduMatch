// js/profile.js
// מציג פרופיל מורה/תלמיד ומאפשר "עריכה" לתצוגה בלבד.

document.addEventListener("DOMContentLoaded", () => {
  const noUserCard = document.getElementById("no-user-card");
  const layout = document.getElementById("profile-layout");

  // דמו: בחירת תפקיד
  // לשינוי מהיר של הדמו: "teacher" / "student"
  const DEMO_ROLE = "teacher";

  // פרופיל דמו של מורה
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

  // פרופיל דמו של תלמיד
  const DEMO_USER_STUDENT = {
    role: "student",
    fullName: "נועה כהן",
    email: "noa.cohen@example.com",
    phone: "0549876543",
    city: "תל אביב-יפו",
  };

  //  יצירת "משתמש מחובר" בדמו 
  // אם רוצים להדגים מצב "לא מחובר:
  // const user = null;
  const user = getDemoUser(DEMO_ROLE, DEMO_USER_TEACHER, DEMO_USER_STUDENT);

  // אלמנטים להצגת פרטי פרופיל 
  const ui = {
    greetingEl: document.getElementById("profile-greeting"),
    nameEl: document.getElementById("profile-name"),
    emailEl: document.getElementById("profile-email"),
    cityEl: document.getElementById("profile-city"),
    fieldEl: document.getElementById("profile-field"),
    rolePill: document.getElementById("profile-role-pill"),
    favoritesSection: document.getElementById("favorites-section"),
  };

  //  אלמנטים לעריכה 
  const edit = {
    editBtn: document.getElementById("edit-profile-btn"),
    editForm: document.getElementById("edit-profile-form"),
    cancelBtn: document.getElementById("cancel-edit-btn"),

    editFullName: document.getElementById("edit-fullName"),
    editPhone: document.getElementById("edit-phone"),
    editCity: document.getElementById("edit-city"),

    teacherFieldsBox: document.getElementById("teacher-edit-fields"),
    editExperience: document.getElementById("edit-experience"),
    editDuration: document.getElementById("edit-duration"),

    subjectsList: document.getElementById("subjects-list"),
    newSubjectName: document.getElementById("new-subject-name"),
    newSubjectPrice: document.getElementById("new-subject-price"),
    addSubjectBtn: document.getElementById("add-subject-btn"),
  };

  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];


  if (!user) {
    // מציג הודעה "אין משתמש" ומסתיר את כל הפרופיל
    showNoUserState(noUserCard, layout);
    return;
  }

  // מציג פרופיל + מסתיר הודעת "אין משתמש"
  showUserState(noUserCard, layout);

  // כותב ברכת שלום לפי שם פרטי
  renderGreeting(ui.greetingEl, user);

  // מציג נתונים בסיסיים בפרופיל (שם/מייל/עיר)
  renderBasicProfile(ui, user);

  // מציג תפקיד ותוכן מתאים (מורה/תלמיד)
  renderRoleSpecificProfile(ui, user);

  // מחבר אירועים של עריכה (פתיחה/סגירה/שמירה/הוספת מקצוע)
  bindEditEvents(user, ui, edit, dayKeys);
});


function getDemoUser(role, teacher, student) {
  return role === "teacher" ? teacher : student;
}

// מצב "אין משתמש" -> מציג כרטיס מתאים ומסתיר פרופיל
function showNoUserState(noUserCard, layout) {
  if (noUserCard) noUserCard.style.display = "block";
  if (layout) layout.style.display = "none";
}

// מצב "יש משתמש" -> מסתיר כרטיס "אין משתמש" ומציג פרופיל
function showUserState(noUserCard, layout) {
  if (noUserCard) noUserCard.style.display = "none";
  if (layout) layout.style.display = "grid";
}

//  כותב "שלום + {שם}," לפי מילה ראשונה של fullName
function renderGreeting(greetingEl, user) {
  if (!greetingEl || !user?.fullName) return;
  const firstName = user.fullName.split(" ")[0];
  greetingEl.textContent = `שלום ${firstName},`;
}

// מציג שם/מייל/עיר בפרופיל
function renderBasicProfile(ui, user) {
  if (ui.nameEl) ui.nameEl.textContent = user.fullName || "—";
  if (ui.emailEl) ui.emailEl.textContent = user.email || "—";
  if (ui.cityEl) ui.cityEl.textContent = user.city || "—";
}

// מציג תוכן שונה למורה מול תלמיד
function renderRoleSpecificProfile(ui, user) {
  if (user.role === "teacher") {
    if (ui.rolePill) ui.rolePill.textContent = "מורה";
    if (ui.favoritesSection) ui.favoritesSection.style.display = "none";

    const subjectsText = (user.subjects || [])
      .map((s) => `${s.subject} (${s.price}₪ לשיעור)`)
      .join(", ");

    const experienceText =
      user.experience && user.experience > 0 ? ` • ${user.experience} שנות ניסיון` : "";

    if (ui.fieldEl) ui.fieldEl.textContent = subjectsText ? `${subjectsText}${experienceText}` : "פרופיל מורה";
  } else {
    if (ui.rolePill) ui.rolePill.textContent = "תלמיד/ה";
    if (ui.favoritesSection) ui.favoritesSection.style.display = "block";
    if (ui.fieldEl) ui.fieldEl.textContent = "פרופיל תלמיד/ה";
  }
}

// מחבר את כל אירועי העריכה: פתיחה/סגירה/הוספת מקצוע/שמירה
function bindEditEvents(user, ui, edit, dayKeys) {
  if (edit.editBtn) edit.editBtn.addEventListener("click", () => openEditForm(user, edit, dayKeys));
  if (edit.cancelBtn) edit.cancelBtn.addEventListener("click", () => closeEditForm(edit));

  if (edit.addSubjectBtn) {
    edit.addSubjectBtn.addEventListener("click", () => {
      if (user.role !== "teacher") return;
      addSubject(user, edit);
      renderSubjects(user, edit);
    });
  }

  if (edit.editForm) {
    edit.editForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitEditForm(user, ui, edit, dayKeys);
    });
  }
}

// פותח את טופס העריכה וממלא אותו בערכי המשתמש
function openEditForm(user, edit, dayKeys) {
  if (!edit.editForm) return;

  if (edit.editFullName) edit.editFullName.value = user.fullName || "";
  if (edit.editPhone) edit.editPhone.value = user.phone || "";
  if (edit.editCity) edit.editCity.value = user.city || "";

  if (user.role === "teacher") {
    if (edit.teacherFieldsBox) edit.teacherFieldsBox.style.display = "block";
    if (edit.editExperience) edit.editExperience.value = user.experience ?? 0;
    if (edit.editDuration) edit.editDuration.value = user.duration ?? 60;

    renderSubjects(user, edit);
    setWeeklyAvailabilityToForm(user.availabilityWeekly, dayKeys);
  } else {
    if (edit.teacherFieldsBox) edit.teacherFieldsBox.style.display = "none";
  }

  edit.editForm.style.display = "block";
}

// סוגר את טופס העריכה (בלי לשמור)
function closeEditForm(edit) {
  if (!edit.editForm) return;
  edit.editForm.style.display = "none";
}

// מוסיף מקצוע חדש 
function addSubject(user, edit) {
  const subject = (edit.newSubjectName?.value || "").trim();
  const price = Number(edit.newSubjectPrice?.value || 0);

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

  if (edit.newSubjectName) edit.newSubjectName.value = "";
  if (edit.newSubjectPrice) edit.newSubjectPrice.value = "";
}

// עריכת מקצועות
function renderSubjects(user, edit) {
  if (!edit.subjectsList || user.role !== "teacher") return;

  edit.subjectsList.innerHTML = "";

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
      renderSubjects(user, edit);
    });

    edit.subjectsList.appendChild(row);
  });
}

// קורא זמינות שבועית מהטופס
function getWeeklyAvailabilityFromForm(dayKeys) {
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

// טוען זמינות שבועית לתוך הטופס
function setWeeklyAvailabilityToForm(weekly, dayKeys) {
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

// • בדיקת תקינות לזמינות: חובה התחלה+סיום, וסיום אחרי התחלה
function validateWeeklyAvailability(weekly) {
  for (const [day, obj] of Object.entries(weekly || {})) {
    if (!obj || obj.enabled === false) continue;

    const s = obj.start || "";
    const e = obj.end || "";

    if (!s || !e) return { ok: false, message: `ביום ${day} חסרה שעת התחלה או סיום.` };
    if (s >= e) return { ok: false, message: `ביום ${day} שעת הסיום חייבת להיות אחרי שעת ההתחלה.` };
  }
  return { ok: true };
}

// • שומר "עריכה" לתצוגה בלבד + מרענן טקסטים במסך
function submitEditForm(user, ui, edit, dayKeys) {
  const newFullName = (edit.editFullName?.value || "").trim();
  const newPhone = (edit.editPhone?.value || "").trim();
  const newCity = (edit.editCity?.value || "").trim();

  if (!newFullName || !newPhone) {
    alert("שם וטלפון הם שדות חובה.");
    return;
  }

  // עדכון דמו מקומי
  user.fullName = newFullName;
  user.phone = newPhone;
  user.city = newCity;

  if (user.role === "teacher") {
    const exp = Number(edit.editExperience?.value || 0);
    const dur = Number(edit.editDuration?.value || 60);

    if (dur <= 0) {
      alert("משך שיעור חייב להיות גדול מ-0.");
      return;
    }

    const weekly = getWeeklyAvailabilityFromForm(dayKeys);
    const weeklyValidation = validateWeeklyAvailability(weekly);
    if (!weeklyValidation.ok) {
      alert(weeklyValidation.message);
      return;
    }

    user.experience = exp;
    user.duration = dur;
    user.availabilityWeekly = weekly;
  }

  // רענון המסך (דמו)
  renderBasicProfile(ui, user);
  renderRoleSpecificProfile(ui, user);
  renderGreeting(ui.greetingEl, user);

  closeEditForm(edit);
  alert("דמו בלבד 🙂 הפרטים עודכנו לתצוגה בלבד (אין שמירה כי אין DB).");
}
