// js/profile.js
// Profile page + edit modal wizard (teacher/student demo)

document.addEventListener("DOMContentLoaded", () => {
  const noUserCard = document.getElementById("no-user-card");
  const layout = document.getElementById("profile-layout");

  // ===== Logout button (Demo) =====
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("edumatchLoggedIn");
      alert("התנתקת מהמערכת (דמו בלבד)");
      window.location.href = "index.html";
    });
  }

  // ===== Demo data =====
  // Quick role change (for your demo):
  const DEMO_ROLE = "teacher"; // "teacher" / "student"

  const DEMO_USER_TEACHER = {
    role: "teacher",
    fullName: "דנה לוי",
    email: "dana.levi@example.com",
    phone: "0521234567",
    city: "באר שבע",
    experience: 3,
    duration: 60,
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

  // Logged-in state (your nav.js uses this flag)
  const isLoggedIn = sessionStorage.getItem("edumatchLoggedIn") === "true";

  // If you want to always show the demo even if not logged in, set this true:
  const FORCE_DEMO = false;

  const user = (isLoggedIn || FORCE_DEMO) ? getDemoUser(DEMO_ROLE, DEMO_USER_TEACHER, DEMO_USER_STUDENT) : null;

  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  // UI (profile display)
  const ui = {
    greetingEl: document.getElementById("profile-greeting"),
    nameEl: document.getElementById("profile-name"),
    emailEl: document.getElementById("profile-email"),
    cityEl: document.getElementById("profile-city"),
    fieldEl: document.getElementById("profile-field"),
    rolePill: document.getElementById("profile-role-pill"),
    favoritesSection: document.getElementById("favorites-section"),
  };

  // Modal elements
  const modal = {
    root: document.getElementById("edit-modal"),
    stepsWrap: document.getElementById("edit-steps"),
    stepButtons: Array.from(document.querySelectorAll(".edit-step")),
    panels: Array.from(document.querySelectorAll(".edit-panel")),
    closeButtons: Array.from(document.querySelectorAll("[data-close='true']")),
    cancelBtn: document.getElementById("edit-cancel-btn"),
    backBtn: document.getElementById("edit-back-btn"),
    nextBtn: document.getElementById("edit-next-btn"),
    saveBtn: document.getElementById("edit-save-btn"),
    alertBox: document.getElementById("edit-alert"),

    // Teacher step buttons (for hiding)
    step2Btn: document.getElementById("step-teacher-2"),
    step3Btn: document.getElementById("step-teacher-3"),
  };

  // Edit inputs (same ids as before)
  const edit = {
    editBtn: document.getElementById("edit-profile-btn"),

    editFullName: document.getElementById("edit-fullName"),
    editPhone: document.getElementById("edit-phone"),
    editCity: document.getElementById("edit-city"),

    teacherExpRow: document.getElementById("teacher-exp-row"),
    teacherDurRow: document.getElementById("teacher-dur-row"),
    editExperience: document.getElementById("edit-experience"),
    editDuration: document.getElementById("edit-duration"),

    subjectsList: document.getElementById("subjects-list"),
    newSubjectName: document.getElementById("new-subject-name"),
    newSubjectPrice: document.getElementById("new-subject-price"),
    addSubjectBtn: document.getElementById("add-subject-btn"),

    errFullName: document.getElementById("err-fullName"),
    errPhone: document.getElementById("err-phone"),
    errCity: document.getElementById("err-city"),
    errExperience: document.getElementById("err-experience"),
    errDuration: document.getElementById("err-duration"),
  };

  if (!user) {
    showNoUserState(noUserCard, layout);
    return;
  }

  showUserState(noUserCard, layout);
  renderGreeting(ui.greetingEl, user);
  renderBasicProfile(ui, user);
  renderRoleSpecificProfile(ui, user);

  // ===== Bind "Edit" => open modal wizard =====
  if (edit.editBtn) {
    edit.editBtn.addEventListener("click", () => {
      prepareWizardForUser(user, modal, edit);
      fillFormFromUser(user, edit, dayKeys);
      openModal(modal);
      goToStep(modal, user, 1);
    });
  }

  // Close / cancel
  modal.closeButtons.forEach((btn) => btn.addEventListener("click", () => closeModal(modal)));
  if (modal.cancelBtn) modal.cancelBtn.addEventListener("click", () => closeModal(modal));

  // Back / Next / Save
  if (modal.backBtn) modal.backBtn.addEventListener("click", () => stepBack(modal, user));
  if (modal.nextBtn) modal.nextBtn.addEventListener("click", () => stepNext(modal, user, edit, dayKeys));
  if (modal.saveBtn) modal.saveBtn.addEventListener("click", () => saveWizard(user, ui, modal, edit, dayKeys));

  // Step clicks
  modal.stepButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = Number(btn.dataset.step || "1");
      // Only allow teacher to click steps 2-3
      if (user.role !== "teacher" && step !== 1) return;
      goToStep(modal, user, step);
    });
  });

  // Add subject
  if (edit.addSubjectBtn) {
    edit.addSubjectBtn.addEventListener("click", () => {
      if (user.role !== "teacher") return;
      addSubject(user, edit);
      renderSubjects(user, edit);
    });
  }

  // Close modal on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.root && modal.root.classList.contains("is-open")) {
      closeModal(modal);
    }
  });
});

function getDemoUser(role, teacher, student) {
  return role === "teacher" ? teacher : student;
}

function showNoUserState(noUserCard, layout) {
  if (noUserCard) noUserCard.style.display = "block";
  if (layout) layout.style.display = "none";
}

function showUserState(noUserCard, layout) {
  if (noUserCard) noUserCard.style.display = "none";
  if (layout) layout.style.display = "grid";
}

function renderGreeting(greetingEl, user) {
  if (!greetingEl || !user?.fullName) return;
  const firstName = user.fullName.split(" ")[0];
  greetingEl.textContent = `שלום ${firstName},`;
}

function renderBasicProfile(ui, user) {
  if (ui.nameEl) ui.nameEl.textContent = user.fullName || "—";
  if (ui.emailEl) ui.emailEl.textContent = user.email || "—";
  if (ui.cityEl) ui.cityEl.textContent = user.city || "—";
}

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

/* =========================
   Modal + Wizard
   ========================= */

function openModal(modal) {
  if (!modal.root) return;
  modal.root.classList.add("is-open");
  modal.root.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeModal(modal) {
  if (!modal.root) return;
  modal.root.classList.remove("is-open");
  modal.root.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  clearAlert(modal);
}

function prepareWizardForUser(user, modal, edit) {
  // Teacher-only UI show/hide
  const teacherOnly = user.role === "teacher";

  if (edit.teacherExpRow) edit.teacherExpRow.style.display = teacherOnly ? "block" : "none";
  if (edit.teacherDurRow) edit.teacherDurRow.style.display = teacherOnly ? "block" : "none";

  if (modal.step2Btn) modal.step2Btn.style.display = teacherOnly ? "inline-flex" : "none";
  if (modal.step3Btn) modal.step3Btn.style.display = teacherOnly ? "inline-flex" : "none";
}

function goToStep(modal, user, step) {
  const maxStep = user.role === "teacher" ? 3 : 1;
  const safeStep = Math.max(1, Math.min(step, maxStep));

  modal.stepButtons.forEach((b) => b.classList.toggle("is-active", Number(b.dataset.step) === safeStep));
  modal.panels.forEach((p) => p.classList.toggle("is-active", Number(p.dataset.panel) === safeStep));

  // Footer buttons
  if (modal.backBtn) modal.backBtn.disabled = safeStep === 1;

  if (user.role !== "teacher") {
    if (modal.nextBtn) modal.nextBtn.style.display = "none";
    if (modal.saveBtn) modal.saveBtn.style.display = "inline-block";
    return;
  }

  if (safeStep < 3) {
    if (modal.nextBtn) modal.nextBtn.style.display = "inline-block";
    if (modal.saveBtn) modal.saveBtn.style.display = "none";
  } else {
    if (modal.nextBtn) modal.nextBtn.style.display = "none";
    if (modal.saveBtn) modal.saveBtn.style.display = "inline-block";
  }
}

function getCurrentStep(modal) {
  const activeBtn = modal.stepButtons.find((b) => b.classList.contains("is-active"));
  return Number(activeBtn?.dataset.step || "1");
}

function stepBack(modal, user) {
  const current = getCurrentStep(modal);
  goToStep(modal, user, current - 1);
}

function stepNext(modal, user, edit, dayKeys) {
  const current = getCurrentStep(modal);

  // Validate step 1 before moving forward
  if (current === 1) {
    const ok = validateStep1(edit, user, modal);
    if (!ok) return;
  }

  // Step 2: no hard validation required, go next
  goToStep(modal, user, current + 1);
}

/* =========================
   Fill / Save
   ========================= */

function fillFormFromUser(user, edit, dayKeys) {
  clearInlineErrors(edit);

  if (edit.editFullName) edit.editFullName.value = user.fullName || "";
  if (edit.editPhone) edit.editPhone.value = user.phone || "";
  if (edit.editCity) edit.editCity.value = user.city || "";

  if (user.role === "teacher") {
    if (edit.editExperience) edit.editExperience.value = user.experience ?? 0;
    if (edit.editDuration) edit.editDuration.value = user.duration ?? 60;

    renderSubjects(user, edit);
    setWeeklyAvailabilityToForm(user.availabilityWeekly, dayKeys);
  }
}

function saveWizard(user, ui, modal, edit, dayKeys) {
  clearAlert(modal);
  clearInlineErrors(edit);

  // Validate step 1 (always)
  const ok = validateStep1(edit, user, modal);
  if (!ok) {
    goToStep(modal, user, 1);
    return;
  }

  // Teacher: validate weekly availability
  if (user.role === "teacher") {
    const weekly = getWeeklyAvailabilityFromForm(dayKeys);
    const weeklyValidation = validateWeeklyAvailability(weekly);
    if (!weeklyValidation.ok) {
      showAlert(modal, weeklyValidation.message);
      goToStep(modal, user, 3);
      return;
    }
    user.availabilityWeekly = weekly;

    const exp = Number(edit.editExperience?.value || 0);
    const dur = Number(edit.editDuration?.value || 60);
    user.experience = exp;
    user.duration = dur;
  }

  // Save basics
  user.fullName = (edit.editFullName?.value || "").trim();
  user.phone = (edit.editPhone?.value || "").trim();
  user.city = (edit.editCity?.value || "").trim();

  // Refresh display
  renderBasicProfile(ui, user);
  renderRoleSpecificProfile(ui, user);
  renderGreeting(ui.greetingEl, user);

  closeModal(modal);
  alert("הפרטים עודכנו בהצלחה! (דמו בלבד)");
}

function validateStep1(edit, user, modal) {
  const errors = [];

  const fullName = (edit.editFullName?.value || "").trim();
  const phone = (edit.editPhone?.value || "").trim();
  const city = (edit.editCity?.value || "").trim();

  if (!fullName) {
    errors.push("שם מלא הוא שדה חובה.");
    if (edit.errFullName) edit.errFullName.textContent = "יש להזין שם מלא";
  }
  if (!phone) {
    errors.push("טלפון הוא שדה חובה.");
    if (edit.errPhone) edit.errPhone.textContent = "יש להזין טלפון";
  }

  // Teacher additional checks
  if (user.role === "teacher") {
    const dur = Number(edit.editDuration?.value || 0);
    if (!Number.isFinite(dur) || dur <= 0) {
      errors.push("משך שיעור חייב להיות גדול מ-0.");
      if (edit.errDuration) edit.errDuration.textContent = "משך שיעור חייב להיות גדול מ-0";
    }
  }

  if (errors.length > 0) {
    showAlert(modal, errors);
    return false;
  }

  return true;
}

/* =========================
   Subjects
   ========================= */

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

function renderSubjects(user, edit) {
  if (!edit.subjectsList || user.role !== "teacher") return;

  edit.subjectsList.innerHTML = "";

  (user.subjects || []).forEach((s, index) => {
    const row = document.createElement("div");
    row.className = "subject-row";

    row.innerHTML = `
      <span class="subject-row__text">${s.subject} – ${s.price}₪</span>
      <button type="button" class="btn-secondary subject-row__remove">❌</button>
    `;

    row.querySelector("button").addEventListener("click", () => {
      user.subjects.splice(index, 1);
      renderSubjects(user, edit);
    });

    edit.subjectsList.appendChild(row);
  });
}

/* =========================
   Weekly availability
   ========================= */

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

/* =========================
   Alert + inline errors
   ========================= */

function showAlert(modal, messages) {
  if (!modal.alertBox) return;
  const list = Array.isArray(messages) ? messages : [messages];

  modal.alertBox.style.display = "block";
  modal.alertBox.innerHTML = `
    <strong>יש לתקן את השדות הבאים:</strong>
    <ul>
      ${list.map((m) => `<li>${m}</li>`).join("")}
    </ul>
  `;
}

function clearAlert(modal) {
  if (!modal.alertBox) return;
  modal.alertBox.style.display = "none";
  modal.alertBox.innerHTML = "";
}

function clearInlineErrors(edit) {
  if (edit.errFullName) edit.errFullName.textContent = "";
  if (edit.errPhone) edit.errPhone.textContent = "";
  if (edit.errCity) edit.errCity.textContent = "";
  if (edit.errExperience) edit.errExperience.textContent = "";
  if (edit.errDuration) edit.errDuration.textContent = "";
}
