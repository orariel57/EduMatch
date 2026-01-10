// public/js/login.js
document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // Helpers
  // =========================
  const isEmailValid = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

  const isIsraeliPhoneValid = (value) => /^05\d{8}$/.test(value.trim());

  function getRowEl(input) {
    return input?.closest?.(".form-row") || null;
  }

  function setFieldError(input, message) {
    const row = getRowEl(input);
    if (!row || !input) return;
    const p = row.querySelector(".error-message");
    if (p) p.textContent = message || "";
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function clearFieldError(input) {
    if (!input) return;
    setFieldError(input, "");
  }

  function shakeInput(input) {
    if (!input) return;
    input.classList.remove("input-error");
    void input.offsetWidth;
    input.classList.add("input-error");
    input.addEventListener(
      "animationend",
      () => input.classList.remove("input-error"),
      { once: true }
    );
  }

  function setAlert(alertEl, messages) {
    if (!alertEl) return;

    if (!messages || messages.length === 0) {
      alertEl.hidden = true;
      alertEl.innerHTML = "";
      return;
    }

    alertEl.hidden = false;
    alertEl.innerHTML = `
      <strong>יש לתקן את השדות הבאים:</strong>
      <ul>
        ${messages.map((m) => `<li>${m}</li>`).join("")}
      </ul>
    `;
    alertEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // NOTE: cookie is the real auth now.
  // Keeping this only if some old code still checks it.
  function setLoggedInLegacy() {
    try {
      sessionStorage.setItem("edumatchLoggedIn", "true");
    } catch (_) { }
  }

  // =========================
  // ✅ Prevent Chrome autofill from leaving values filled
  // while still allowing password suggestions
  // =========================
  function clearLoginFieldsIfPresent() {
    const loginForm = document.querySelector("#login-form");
    if (!loginForm) return;

    const email = loginForm.querySelector("#login-email");
    const password = loginForm.querySelector("#login-password");

    // clear values (Chrome may autofill after DOMContentLoaded -> we clear with timeout too)
    if (email) email.value = "";
    if (password) password.value = "";

    // also clear any prior alerts/errors
    const loginAlert = loginForm.querySelector("#login-alert");
    if (loginAlert) setAlert(loginAlert, []);
    [email, password].forEach(clearFieldError);
  }

  function clearRegisterFieldsIfPresent() {
    const registerForm = document.querySelector("#register-form");
    if (!registerForm) return;

    const email = registerForm.querySelector("#register-email");
    const password = registerForm.querySelector("#register-password");

    if (email) email.value = "";
    if (password) password.value = "";

    const registerAlert = registerForm.querySelector("#register-alert");
    if (registerAlert) registerAlert.hidden = true;
  }


  // Clear on initial load (after Chrome autofills)
  setTimeout(clearLoginFieldsIfPresent, 80);

  // Clear when navigating back/forward from cache (bfcache)
  window.addEventListener("pageshow", () => {
    setTimeout(clearLoginFieldsIfPresent, 80);
  });

  setTimeout(clearRegisterFieldsIfPresent, 80);
  window.addEventListener("pageshow", () => {
    setTimeout(clearRegisterFieldsIfPresent, 80);
  });


  // =========================
  // REGISTER
  // =========================
  const registerForm = document.querySelector("#register-form");
  if (registerForm) {
    const first_name = registerForm.querySelector("#first-name");
    const last_name = registerForm.querySelector("#last-name");
    const email = registerForm.querySelector("#register-email");
    const phone = registerForm.querySelector("#register-phone");
    const password = registerForm.querySelector("#register-password");

    const terms = registerForm.querySelector("input[name='terms']");
    const roleRadios = registerForm.querySelectorAll("input[name='role']");
    const teacherFields = registerForm.querySelector(".role-teacher");
    const registerAlert = registerForm.querySelector("#register-alert");

    function updateRoleFields() {
      const role =
        registerForm.querySelector("input[name='role']:checked")?.value;
      if (teacherFields) {
        teacherFields.classList.toggle("is-open", role === "teacher");
      }
    }

    // =========================
    // ADD SUBJECT ROW (Teacher register)
    // =========================
    const subjectsContainer = registerForm.querySelector("#subjects-container");
    const addSubjectBtn = registerForm.querySelector("#add-subject-btn");

    if (subjectsContainer && addSubjectBtn) {
      let subjectIndex = subjectsContainer.querySelectorAll(".subject-row").length || 1;

      addSubjectBtn.addEventListener("click", () => {
        subjectIndex += 1;

        const row = document.createElement("div");
        row.className = "subject-row";
        row.innerHTML = `
      <input type="text" name="teacher-subject-${subjectIndex}" placeholder="מקצוע">
      <input type="number" name="teacher-price-${subjectIndex}" placeholder="מחיר לשעה" min="0">
      <button type="button" class="btn-secondary subject-remove-btn" aria-label="מחק מקצוע">✕</button>
    `;

        subjectsContainer.appendChild(row);
      });

      // מחיקה של שורה (event delegation)
      subjectsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".subject-remove-btn");
        if (!btn) return;
        btn.closest(".subject-row")?.remove();
      });
    }


    roleRadios.forEach((r) => r.addEventListener("change", updateRoleFields));
    updateRoleFields();

    function validateRegister() {
      const errors = [];
      const invalidInputs = [];

      [first_name, last_name, email, phone, password].forEach(clearFieldError);

      if (!first_name.value.trim()) {
        errors.push("שם פרטי חסר");
        invalidInputs.push(first_name);
      }

      if (!last_name.value.trim()) {
        errors.push("שם משפחה חסר");
        invalidInputs.push(last_name);
      }

      if (!email.value.trim() || !isEmailValid(email.value)) {
        errors.push("אימייל לא תקין");
        invalidInputs.push(email);
      }

      // phone is required in your UI? if required -> enforce. if not, keep optional:
      if (phone.value && !isIsraeliPhoneValid(phone.value)) {
        errors.push("טלפון לא תקין");
        invalidInputs.push(phone);
      }

      if (!password.value || password.value.length < 6) {
        errors.push("סיסמה קצרה מדי");
        invalidInputs.push(password);
      }

      if (terms && !terms.checked) {
        errors.push("יש לאשר תנאי שימוש");
      }

      const role =
        registerForm.querySelector("input[name='role']:checked")?.value;

      if (role === "teacher") {
        const subject = registerForm.querySelector(
          "input[name='teacher-subject[]']"
        );
        const price = registerForm.querySelector("input[name='teacher-price[]']");
        const duration = registerForm.querySelector("input[name='lesson-duration']");

        if (!subject?.value.trim()) {
          errors.push("יש להזין מקצוע");
          invalidInputs.push(subject);
        }

        if (!price?.value || Number(price.value) <= 0) {
          errors.push("יש להזין מחיר תקין");
          invalidInputs.push(price);
        }

        if (!duration?.value || Number(duration.value) <= 0) {
          errors.push("יש להזין משך שיעור בדקות");
          invalidInputs.push(duration);
        }
      }

      return { errors, invalidInputs };
    }

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const { errors, invalidInputs } = validateRegister();
      if (errors.length) {
        invalidInputs.forEach(shakeInput);
        setAlert(registerAlert, errors);
        return;
      }

      const role =
        registerForm.querySelector("input[name='role']:checked")?.value;

      const lesson_mode =
        registerForm.querySelector("input[name='lesson-mode']:checked")?.value ||
        "both";

      const payload = {
        first_name: first_name.value.trim(),
        last_name: last_name.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim() || null,
        password: password.value,
        role,
        lesson_mode,
      };

      if (role === "teacher") {
        payload["teacher-city"] =
          registerForm.querySelector("#teacher-city")?.value.trim() || null;

        payload["teacher-experience"] =
          Number(registerForm.querySelector("#teacher-experience")?.value) || null;

        payload["teacher-subject-1"] = registerForm
          .querySelector("input[name='teacher-subject-1']")
          ?.value.trim();

        payload["teacher-price-1"] = Number(
          registerForm.querySelector("input[name='teacher-price-1']")?.value
        );

        payload["lesson-duration"] = Number(
          registerForm.querySelector("input[name='lesson-duration']")?.value
        );
      }

      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setAlert(registerAlert, [data?.message || "שגיאה בהרשמה"]);
          return;
        }

        // auto-login after register
        const loginRes = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            email: payload.email,
            password: payload.password,
          }),
        });

        if (!loginRes.ok) {
          setAlert(registerAlert, ["נרשמת אך ההתחברות נכשלה"]);
          return;
        }

        setLoggedInLegacy();
        window.location.href = "profile.html";
      } catch (err) {
        console.error(err);
        setAlert(registerAlert, ["שגיאת שרת"]);
      }
    });
  }

  // =========================
  // LOGIN
  // =========================
  const loginForm = document.querySelector("#login-form");
  if (loginForm) {
    const email = loginForm.querySelector("#login-email");
    const password = loginForm.querySelector("#login-password");
    const loginAlert = loginForm.querySelector("#login-alert");

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // basic client validation (optional but nice)
      const errs = [];
      [email, password].forEach(clearFieldError);

      if (!email?.value.trim() || !isEmailValid(email.value)) {
        errs.push("אימייל לא תקין");
        setFieldError(email, "אימייל לא תקין");
      }

      if (!password?.value || password.value.length < 6) {
        errs.push("סיסמה קצרה מדי");
        setFieldError(password, "סיסמה קצרה מדי");
      }

      if (errs.length) {
        if (email) shakeInput(email);
        if (password) shakeInput(password);
        setAlert(loginAlert, errs);
        return;
      }

      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            email: email.value.trim(),
            password: password.value,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setAlert(loginAlert, [data?.message || "שגיאת התחברות"]);
          return;
        }

        setLoggedInLegacy();
        window.location.href = "profile.html";
      } catch (err) {
        console.error(err);
        setAlert(loginAlert, ["שגיאת שרת"]);
      }
    });
  }
});
