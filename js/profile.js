// public/js/profile.js
document.addEventListener("DOMContentLoaded", () => {
  const noUserCard = document.getElementById("no-user-card");
  const layout = document.getElementById("profile-layout");

  // Sidebar buttons
  const editBtn = document.getElementById("edit-profile-btn");
  const logoutBtn = document.getElementById("logout-btn");

  // Profile UI
  const ui = {
    greetingEl: document.getElementById("profile-greeting"),
    nameEl: document.getElementById("profile-name"),
    emailEl: document.getElementById("profile-email"),
    fieldEl: document.getElementById("profile-field"),
    rolePill: document.getElementById("profile-role-pill"),
    favoritesSection: document.getElementById("favorites-section"),
  };

  // ===== Modal elements =====
  const modal = document.getElementById("edit-modal");
  const panels = Array.from(document.querySelectorAll(".edit-panel"));
  const alertBox = document.getElementById("edit-alert");

  // Step buttons
  const stepBtns = Array.from(document.querySelectorAll(".edit-step"));

  // Footer buttons
  const nextBtn = document.getElementById("edit-next-btn");
  const saveBtn = document.getElementById("edit-save-btn");
  const cancelBtn = document.getElementById("edit-cancel-btn");

  // Close triggers
  const closeTriggers = modal ? Array.from(modal.querySelectorAll("[data-close='true']")) : [];

  // Inputs (Step 1)
  const inpFirstName = document.getElementById("edit-firstName");
  const inpLastName = document.getElementById("edit-lastName");
  const inpPhone = document.getElementById("edit-phone");
  const inpCity = document.getElementById("edit-city");
  const inpExperience = document.getElementById("edit-experience"); // teacher
  const inpDuration = document.getElementById("edit-duration");     // teacher (default duration)

  // Teacher only rows
  const teacherExpRow = document.getElementById("teacher-exp-row");
  const teacherDurRow = document.getElementById("teacher-dur-row");

  // Step 2 (subjects)
  const subjectsListEl = document.getElementById("subjects-list");
  const newSubjectName = document.getElementById("new-subject-name");
  const newSubjectPrice = document.getElementById("new-subject-price");
  const addSubjectBtn = document.getElementById("add-subject-btn");

  // ===== Exceptions UI elements =====
  const exDate = document.getElementById("ex-date");
  const exType = document.getElementById("ex-type");
  const exStart = document.getElementById("ex-start");
  const exEnd = document.getElementById("ex-end");
  const exAddBtn = document.getElementById("ex-add-btn");
  const exAlert = document.getElementById("ex-alert");
  const exList = document.getElementById("exceptions-list");

  // ===== Weekly availability mapping =====
  const DAY_TO_NUM = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  const NUM_TO_DAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  // ===== State =====
  let currentUser = null;
  let activeStep = 1;
  let isTeacher = false;

  // each: { subject_name, price_per_hour, duration_minutes }
  let subjectsDraft = [];
  // each: { date, type: "off"|"custom", start_time, end_time }
  let exceptionsDraft = [];
  // each: { day_of_week: 0..6, start_time:"HH:MM", end_time:"HH:MM" }
  let availabilityDraft = [];

  // =======================
  // Helpers
  // =======================
  const setText = (el, txt) => { if (el) el.textContent = txt; };
  const setDisplay = (el, value) => { if (el) el.style.display = value; };

  function showNoUser() {
    setDisplay(noUserCard, "block");
    setDisplay(layout, "none");
  }

  function showLayout() {
    setDisplay(noUserCard, "none");
    setDisplay(layout, "grid");
  }

  function openModal() {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    hideAlert();
    clearErrors();
  }

  function showAlert(msg) {
    if (!alertBox) return;
    alertBox.style.display = "block";
    alertBox.textContent = msg;
  }

  function hideAlert() {
    if (!alertBox) return;
    alertBox.style.display = "none";
    alertBox.textContent = "";
  }

  function clearErrors() {
    const ids = ["err-firstName", "err-lastName", "err-phone", "err-city", "err-experience", "err-duration"];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = "";
    });
  }

  function setError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  // =======================
  // Phone validation
  // =======================
  function toDigits(str) {
    return String(str || "").replace(/\D/g, "");
  }

  function isValidIsraeliMobile(phoneDigits) {
    return /^05\d{8}$/.test(phoneDigits);
  }

  function validatePhoneField({ normalize = true } = {}) {
    const raw = (inpPhone?.value || "").trim();
    const digits = toDigits(raw);

    if (normalize && inpPhone) inpPhone.value = digits;

    if (!digits) {
      setError("err-phone", "חובה להזין טלפון");
      return false;
    }
    if (!isValidIsraeliMobile(digits)) {
      setError("err-phone", "טלפון חייב להתחיל ב־05 ולהכיל בדיוק 10 ספרות");
      return false;
    }

    setError("err-phone", "");
    return true;
  }

  // =======================
  // Steps UI
  // =======================
  function setActiveStep(step) {
    activeStep = step;

    stepBtns.forEach((b) => b.classList.toggle("is-active", Number(b.dataset.step) === step));
    panels.forEach((p) => p.classList.toggle("is-active", Number(p.dataset.panel) === step));

    if (isTeacher) {
      if (step < 3) {
        nextBtn.style.display = "inline-flex";
        saveBtn.style.display = "none";
      } else {
        nextBtn.style.display = "none";
        saveBtn.style.display = "inline-flex";
      }
    } else {
      nextBtn.style.display = "none";
      saveBtn.style.display = "inline-flex";
    }
  }

  function toggleTeacherSteps(teacher) {
    isTeacher = teacher;

    if (teacherExpRow) teacherExpRow.style.display = teacher ? "block" : "none";
    if (teacherDurRow) teacherDurRow.style.display = teacher ? "block" : "none";

    const step2Btn = document.getElementById("step-teacher-2");
    const step3Btn = document.getElementById("step-teacher-3");

    if (step2Btn) step2Btn.style.display = teacher ? "inline-flex" : "none";
    if (step3Btn) step3Btn.style.display = teacher ? "inline-flex" : "none";

    if (!teacher) setActiveStep(1);
  }

  // =======================
  // Render user card
  // =======================
  function renderUser(u) {
    showLayout();

    const teacherCityRow = document.getElementById("teacher-city-row");

    if (u.role === "teacher") {
      if (teacherCityRow) teacherCityRow.style.display = "block";
    } else {
      if (teacherCityRow) teacherCityRow.style.display = "none";
    }

    const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim();
    const first = (fullName.split(" ")[0] || "").trim() || "🙂";

    setText(ui.greetingEl, `שלום ${first},`);
    setText(ui.nameEl, fullName || "—");
    setText(ui.emailEl, u.email || "—");

    if (u.role === "teacher") {
      setText(ui.rolePill, "מורה");
      if (ui.favoritesSection) ui.favoritesSection.style.display = "none";

      const subjectsText =
        u.subjects && u.subjects.length
          ? u.subjects.map((s) => `${s.subject} (${s.price}₪)`).join(", ")
          : "טרם הוגדרו מקצועות";

      const expText = u.years_experience ? ` • ${u.years_experience} שנות ניסיון` : "";
      setText(ui.fieldEl, subjectsText + expText);
    } else {
      setText(ui.rolePill, "תלמיד/ה");
      if (ui.favoritesSection) ui.favoritesSection.style.display = "block";
      setText(ui.fieldEl, "פרופיל תלמיד/ה");
    }
  }

  // =======================
  // Subjects UI
  // =======================
  function normalizeSubjectsFromServer(serverUser) {
    const arr = Array.isArray(serverUser.subjects) ? serverUser.subjects : [];
    return arr
      .map((s) => ({
        subject_name: s.subject ?? s.subject_name ?? "",
        price_per_hour: Number(s.price ?? s.price_per_hour ?? 0),
        duration_minutes: Number(s.duration_minutes ?? 0),
      }))
      .filter((x) => x.subject_name.trim());
  }

  function renderSubjectsDraft() {
    if (!subjectsListEl) return;

    subjectsListEl.innerHTML = "";

    if (!subjectsDraft.length) {
      const p = document.createElement("p");
      p.className = "edit-hint";
      p.style.margin = "0";
      p.textContent = "אין תחומים שהוגדרו עדיין.";
      subjectsListEl.appendChild(p);
      return;
    }

    subjectsDraft.forEach((s, idx) => {
      const row = document.createElement("div");
      row.className = "subject-row";

      const text = document.createElement("div");
      text.className = "subject-row__text";
      text.textContent = `${s.subject_name} • ${s.price_per_hour}₪ • ${s.duration_minutes} דק׳`;

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn-secondary subject-row__remove";
      remove.textContent = "❌";
      remove.addEventListener("click", () => {
        subjectsDraft.splice(idx, 1);
        renderSubjectsDraft();
      });

      row.appendChild(text);
      row.appendChild(remove);
      subjectsListEl.appendChild(row);
    });
  }

  function addSubjectFromInputs() {
    hideAlert();

    const name = (newSubjectName?.value || "").trim();
    const price = Number(newSubjectPrice?.value || "");
    const defaultDur = Number(inpDuration?.value || 0);

    if (!name) return showAlert("יש להזין תחום לימוד.");
    if (!Number.isFinite(price) || price <= 0) return showAlert("יש להזין מחיר תקין (> 0).");
    if (!Number.isFinite(defaultDur) || defaultDur <= 0) return showAlert("יש להזין משך שיעור תקין בשלב 1 (בדקות).");

    const exists = subjectsDraft.some((s) => s.subject_name === name);
    if (exists) return showAlert("התחום כבר קיים ברשימה.");

    subjectsDraft.push({
      subject_name: name,
      price_per_hour: price,
      duration_minutes: defaultDur,
    });

    if (newSubjectName) newSubjectName.value = "";
    if (newSubjectPrice) newSubjectPrice.value = "";

    renderSubjectsDraft();
  }

  // =======================
  // Exceptions UI
  // =======================
  function setExAlert(msg = "") {
    if (!exAlert) return;
    exAlert.style.display = msg ? "block" : "none";
    exAlert.textContent = msg;
  }

  function isTimeOrderOk(start, end) {
    return start && end && start < end;
  }

  function renderExceptions() {
    if (!exList) return;
    exList.innerHTML = "";

    if (!exceptionsDraft.length) {
      const p = document.createElement("p");
      p.className = "edit-hint";
      p.style.margin = "0";
      p.textContent = "אין חריגות שהוגדרו עדיין.";
      exList.appendChild(p);
      return;
    }

    exceptionsDraft
      .slice()
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .forEach((ex, idx) => {
        const row = document.createElement("div");
        row.className = "subject-row"; // reuse existing style

        const text = document.createElement("div");
        text.className = "subject-row__text";

        if (ex.type === "off") {
          text.textContent = `${ex.date} • לא זמין`;
        } else {
          text.textContent = `${ex.date} • זמינות מיוחדת: ${ex.start_time}–${ex.end_time}`;
        }

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "btn-secondary subject-row__remove";
        remove.textContent = "❌";
        remove.addEventListener("click", () => {
          exceptionsDraft.splice(idx, 1);
          renderExceptions();
        });

        row.appendChild(text);
        row.appendChild(remove);
        exList.appendChild(row);
      });
  }

  function syncTimeInputsByType() {
    if (!exType || !exStart || !exEnd) return;
    const t = exType.value;

    const isCustom = t === "custom";
    exStart.disabled = !isCustom;
    exEnd.disabled = !isCustom;

    if (!isCustom) {
      exStart.value = "";
      exEnd.value = "";
    }
  }

  function addExceptionFromInputs() {
    setExAlert("");

    const date = exDate?.value || "";
    const type = exType?.value || "off";
    const start = exStart?.value || "";
    const end = exEnd?.value || "";

    if (!date) return setExAlert("חובה לבחור תאריך.");

    if (type === "custom") {
      if (!start || !end) return setExAlert("בשעות זמינות ספציפיות חובה למלא התחלה וסיום.");
      if (!isTimeOrderOk(start, end)) return setExAlert("שעת הסיום חייבת להיות אחרי שעת ההתחלה.");
    }

    const existingIdx = exceptionsDraft.findIndex((x) => x.date === date);

    const newEx = {
      date,
      type,
      start_time: type === "custom" ? start : null,
      end_time: type === "custom" ? end : null,
    };

    if (existingIdx >= 0) {
      exceptionsDraft[existingIdx] = newEx; // replace
    } else {
      exceptionsDraft.push(newEx);
    }

    // reset UI
    if (exDate) exDate.value = "";
    if (exType) exType.value = "off";
    syncTimeInputsByType();

    renderExceptions();
  }

  // =======================
  // Weekly Availability UI
  // =======================
  function getStartEl(dayKey) {
    return document.querySelector(`input[type='time'][data-start='${dayKey}']`);
  }
  function getEndEl(dayKey) {
    return document.querySelector(`input[type='time'][data-end='${dayKey}']`);
  }
  function getCheckEl(dayKey) {
    return document.querySelector(`input[type='checkbox'][data-day='${dayKey}']`);
  }

  function syncDayRowUI(dayKey) {
    const cb = getCheckEl(dayKey);
    const st = getStartEl(dayKey);
    const en = getEndEl(dayKey);
    if (!cb || !st || !en) return;

    const enabled = cb.checked;
    st.disabled = !enabled;
    en.disabled = !enabled;

    if (!enabled) {
      st.value = "";
      en.value = "";
    }
  }

  function readAvailabilityFromUI() {
    const out = [];

    for (const dayKey of Object.keys(DAY_TO_NUM)) {
      const cb = getCheckEl(dayKey);
      const st = getStartEl(dayKey);
      const en = getEndEl(dayKey);
      if (!cb || !st || !en) continue;

      if (!cb.checked) continue;

      const startVal = (st.value || "").trim();
      const endVal = (en.value || "").trim();

      if (!startVal || !endVal) {
        showAlert("בזמינות שבועית: אם יום מסומן כזמין חייבים לבחור שעות התחלה וסיום.");
        return null;
      }
      if (!(startVal < endVal)) {
        showAlert("בזמינות שבועית: שעת הסיום חייבת להיות אחרי שעת ההתחלה.");
        return null;
      }

      out.push({
        day_of_week: DAY_TO_NUM[dayKey],
        start_time: startVal,
        end_time: endVal,
      });
    }

    return out;
  }

  function applyAvailabilityToUI(list) {
    // reset all
    for (const dayKey of Object.keys(DAY_TO_NUM)) {
      const cb = getCheckEl(dayKey);
      if (cb) cb.checked = false;
      syncDayRowUI(dayKey);
    }

    const arr = Array.isArray(list) ? list : [];

    // UI תומך רק בטווח אחד לכל יום -> ניקח ראשון לכל יום
    const firstPerDay = new Map();
    for (const a of arr) {
      const dow = Number(a.day_of_week);
      if (!Number.isFinite(dow) || dow < 0 || dow > 6) continue;
      if (firstPerDay.has(dow)) continue;

      const st = String(a.start_time || "").slice(0, 5);
      const en = String(a.end_time || "").slice(0, 5);
      if (!st || !en || !(st < en)) continue;

      firstPerDay.set(dow, { day_of_week: dow, start_time: st, end_time: en });
    }

    for (const a of Array.from(firstPerDay.values())) {
      const dayKey = NUM_TO_DAY[a.day_of_week];
      const cb = getCheckEl(dayKey);
      const st = getStartEl(dayKey);
      const en = getEndEl(dayKey);
      if (!cb || !st || !en) continue;

      cb.checked = true;
      syncDayRowUI(dayKey);
      st.value = a.start_time;
      en.value = a.end_time;
    }
  }

  // =======================
  // Validation
  // =======================
  function validateStep1() {
    clearErrors();
    hideAlert();

    const firstName = (inpFirstName?.value || "").trim();
    const lastName = (inpLastName?.value || "").trim();

    let ok = true;

    if (!firstName) { setError("err-firstName", "חובה להזין שם פרטי"); ok = false; }
    if (!lastName)  { setError("err-lastName", "חובה להזין שם משפחה"); ok = false; }

    if (!validatePhoneField({ normalize: true })) ok = false;

    if (isTeacher) {
      const years = Number(inpExperience?.value || 0);
      const dur = Number(inpDuration?.value || 0);

      if (!Number.isFinite(years) || years < 0) { setError("err-experience", "שנות ניסיון חייב להיות מספר תקין"); ok = false; }
      if (!Number.isFinite(dur) || dur <= 0)    { setError("err-duration", "משך שיעור חייב להיות מספר תקין (>0)"); ok = false; }
    }

    return ok;
  }

  // =======================
  // Load user
  // =======================
  async function loadMe() {
    try {
      const res = await fetch(`/api/me?ts=${Date.now()}`, {
        credentials: "same-origin",
        cache: "no-store",
      });

      const data = await res.json();

      if (!data?.ok || !data.user) {
        showNoUser();
        return;
      }

      currentUser = data.user;

      toggleTeacherSteps(currentUser.role === "teacher");
      renderUser(currentUser);
    } catch (err) {
      console.error("Profile load error:", err);
      showNoUser();
    }
  }

  // =======================
  // Prefill modal
  // =======================
  function prefillModalFromCurrentUser() {
    if (!currentUser) return;

    if (inpFirstName) inpFirstName.value = currentUser.first_name || "";
    if (inpLastName) inpLastName.value = currentUser.last_name || "";
    if (inpPhone) inpPhone.value = currentUser.phone || "";
    if (inpCity) inpCity.value = currentUser.city || "";

    if (isTeacher) {
      if (inpExperience) inpExperience.value = currentUser.years_experience ?? 0;

      const durFromFirst =
        currentUser.subjects && currentUser.subjects[0]?.duration_minutes
          ? Number(currentUser.subjects[0].duration_minutes)
          : 45;
      if (inpDuration) inpDuration.value = durFromFirst;

      subjectsDraft = normalizeSubjectsFromServer(currentUser);
      renderSubjectsDraft();

      availabilityDraft = Array.isArray(currentUser.availability) ? currentUser.availability : [];
      applyAvailabilityToUI(availabilityDraft);

      exceptionsDraft = Array.isArray(currentUser.exceptions) ? currentUser.exceptions : [];
      renderExceptions();
    } else {
      subjectsDraft = [];
      renderSubjectsDraft();
    }

    setActiveStep(1);
  }

  // =======================
  // Save profile
  // =======================
  async function saveProfile() {
    if (!currentUser) return;

    if (!validateStep1()) {
      showAlert("אנא תקני את השדות המסומנים לפני שמירה.");
      return;
    }

    const payload = {
      first_name: (inpFirstName?.value || "").trim(),
      last_name: (inpLastName?.value || "").trim(),
      phone: toDigits(inpPhone?.value || ""),
      city: (inpCity?.value || "").trim(),
    };

    if (isTeacher) {
      payload.years_experience = Number(inpExperience?.value || 0);
      payload.lesson_mode = currentUser.lesson_mode ?? null;

      // ✅ תיקון חשוב: להבטיח שלכל subject יש duration_minutes תקין
      const defaultDur = Number(inpDuration?.value || 0);
      subjectsDraft = (Array.isArray(subjectsDraft) ? subjectsDraft : []).map((s) => ({
        subject_name: s.subject_name,
        price_per_hour: Number(s.price_per_hour),
        duration_minutes: Number(s.duration_minutes) > 0 ? Number(s.duration_minutes) : defaultDur,
      }));
      payload.subjects = subjectsDraft;

      const av = readAvailabilityFromUI();
      if (av === null) return;

      availabilityDraft = av;
      payload.availability = availabilityDraft;
      payload.exceptions = exceptionsDraft;
    }

    // ✅ עוזר לדיבוג: לראות מה נשלח
    console.log("PUT /api/me payload:", payload);

    try {
      const res = await fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        const msg = data.message || "שגיאה בעדכון פרטים";
        if (msg.toLowerCase().includes("phone") || msg.includes("טלפון")) {
          setError("err-phone", "טלפון חייב להתחיל ב־05 ולהכיל בדיוק 10 ספרות");
        }
        showAlert(msg);
        return;
      }

      closeModal();
      await loadMe();
    } catch (err) {
      console.error("Save error:", err);
      showAlert("שגיאת תקשורת בעדכון");
    }
  }

  // =======================
  // Events
  // =======================
  if (inpPhone) {
    inpPhone.addEventListener("blur", () => {
      clearErrors();
      validatePhoneField({ normalize: true });
    });

    inpPhone.addEventListener("input", () => {
      const digits = toDigits(inpPhone.value);
      if (inpPhone.value !== digits) inpPhone.value = digits;
    });
  }

  if (editBtn) {
    editBtn.addEventListener("click", () => {
      prefillModalFromCurrentUser();
      openModal();
    });
  }

  closeTriggers.forEach((el) => el.addEventListener("click", closeModal));
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
  });

  stepBtns.forEach((b) => {
    b.addEventListener("click", () => {
      const step = Number(b.dataset.step);
      if (!isTeacher && step !== 1) return;

      if (step === 2 || step === 3) {
        if (!validateStep1()) {
          showAlert("לפני מעבר לשלב הבא יש למלא את הפרטים בצורה תקינה.");
          return;
        }
      }
      setActiveStep(step);
    });
  });

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (!isTeacher) return;

      if (!validateStep1()) {
        showAlert("לפני מעבר לשלב הבא יש למלא את הפרטים בצורה תקינה.");
        return;
      }

      if (activeStep < 3) setActiveStep(activeStep + 1);
    });
  }

  if (saveBtn) saveBtn.addEventListener("click", saveProfile);
  if (addSubjectBtn) addSubjectBtn.addEventListener("click", addSubjectFromInputs);

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
      } finally {
        window.location.href = "login.html";
      }
    });
  }

  // Exceptions listeners
  if (exType) exType.addEventListener("change", syncTimeInputsByType);
  if (exAddBtn) exAddBtn.addEventListener("click", addExceptionFromInputs);

  // Weekly availability checkbox listeners
  const availCheckboxes = Array.from(document.querySelectorAll("input[type='checkbox'][data-day]"));
  availCheckboxes.forEach((cb) => {
    cb.addEventListener("change", () => syncDayRowUI(cb.dataset.day));
  });

  // init UI state
  syncTimeInputsByType();
  renderExceptions();
  Object.keys(DAY_TO_NUM).forEach(syncDayRowUI);

  // init
  loadMe();
});
