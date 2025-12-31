// js/login.js
document.addEventListener("DOMContentLoaded", () => {
  // Helpers
  const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
  const isIsraeliPhoneValid = (value) => /^05\d{8}$/.test(value.trim());

  function getRowEl(input) {
    return input?.closest?.(".form-row") || null;
  }

  function setFieldError(input, message) {
    const row = getRowEl(input);
    if (!row) return;

    const p = row.querySelector(".error-message");
    if (p) p.textContent = message || "";
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function clearFieldError(input) {
    setFieldError(input, "");
  }

  function shakeInput(input) {
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

  // ✅ THIS is the important part for your NAV:
  // nav.js checks: sessionStorage.getItem("edumatchLoggedIn") === "true"
  function setLoggedIn() {
    sessionStorage.setItem("edumatchLoggedIn", "true");
  }

  // =========================
  // REGISTER
  // =========================
  const registerForm = document.querySelector("#register-form");
  if (registerForm) {
    const fullName = registerForm.querySelector("#full-name");
    const email = registerForm.querySelector("#register-email");
    const phone = registerForm.querySelector("#register-phone");
    const password = registerForm.querySelector("#register-password");
    const terms = registerForm.querySelector("input[name='terms']");
    const roleRadios = registerForm.querySelectorAll("input[name='role']");
    const teacherFields = registerForm.querySelector(".role-teacher");
    const addSubjectBtn = registerForm.querySelector("#add-subject-btn");
    const subjectsContainer = registerForm.querySelector("#subjects-container");
    const registerAlert = registerForm.querySelector("#register-alert");

    function updateRoleFields() {
      const selectedRole = registerForm.querySelector("input[name='role']:checked")?.value;
      if (teacherFields) {
        teacherFields.style.display = selectedRole === "teacher" ? "block" : "none";
      }
    }
    roleRadios.forEach((r) => r.addEventListener("change", updateRoleFields));
    updateRoleFields();

    if (addSubjectBtn && subjectsContainer) {
      addSubjectBtn.addEventListener("click", () => {
        const index = subjectsContainer.querySelectorAll(".subject-row").length + 1;

        const row = document.createElement("div");
        row.className = "subject-row";
        row.innerHTML = `
          <input type="text" name="teacher-subject-${index}" placeholder="לדוגמה: מתמטיקה">
          <input type="number" name="teacher-price-${index}" min="0" step="1" inputmode="numeric" pattern="[0-9]*" placeholder="מחיר לשעה">
        `;
        subjectsContainer.appendChild(row);
      });
    }

    [fullName, email, phone, password].forEach((inp) => {
      if (!inp) return;
      inp.addEventListener("input", () => clearFieldError(inp));
    });

    function validateRegister() {
      const errors = [];
      const invalidInputs = [];

      [fullName, email, phone, password].forEach((inp) => inp && clearFieldError(inp));

      if (!fullName.value.trim()) {
        setFieldError(fullName, "נא להזין שם מלא.");
        errors.push("שם מלא חסר.");
        invalidInputs.push(fullName);
      } else if (fullName.value.trim().length < 2) {
        setFieldError(fullName, "השם קצר מדי.");
        errors.push("שם מלא קצר מדי.");
        invalidInputs.push(fullName);
      }

      if (!email.value.trim()) {
        setFieldError(email, "נא להזין אימייל.");
        errors.push("אימייל חסר.");
        invalidInputs.push(email);
      } else if (!isEmailValid(email.value)) {
        setFieldError(email, "נא להזין אימייל תקין (למשל: name@mail.com).");
        errors.push("אימייל לא תקין.");
        invalidInputs.push(email);
      }

      if (!phone.value.trim()) {
        setFieldError(phone, "נא להזין מספר טלפון.");
        errors.push("טלפון חסר.");
        invalidInputs.push(phone);
      } else if (!isIsraeliPhoneValid(phone.value)) {
        setFieldError(phone, "נא להזין טלפון בפורמט 05XXXXXXXX (10 ספרות).");
        errors.push("טלפון לא תקין (צריך להתחיל ב־05 ולהיות 10 ספרות).");
        invalidInputs.push(phone);
      }

      if (!password.value) {
        setFieldError(password, "נא להזין סיסמה.");
        errors.push("סיסמה חסרה.");
        invalidInputs.push(password);
      } else if (password.value.length < 6) {
        setFieldError(password, "הסיסמה חייבת להיות לפחות 6 תווים.");
        errors.push("סיסמה קצרה מדי (מינימום 6 תווים).");
        invalidInputs.push(password);
      }

      if (terms && !terms.checked) {
        errors.push("יש לאשר תנאי שימוש ומדיניות פרטיות.");
      }

      const selectedRole = registerForm.querySelector("input[name='role']:checked")?.value;
      if (selectedRole === "teacher") {
        const subjectInputs = subjectsContainer
          ? Array.from(subjectsContainer.querySelectorAll("input[type='text']"))
          : [];
        const priceInputs = subjectsContainer
          ? Array.from(subjectsContainer.querySelectorAll("input[type='number']"))
          : [];

        const hasAnySubject = subjectInputs.some((i) => i.value.trim().length > 0);
        const hasAnyPrice = priceInputs.some((i) => i.value && Number(i.value) > 0);

        if (!hasAnySubject || !hasAnyPrice) {
          errors.push("כדי להירשם כמורה, יש להזין לפחות מקצוע אחד ומחיר לשעה.");
        }
      }

      return { errors, invalidInputs };
    }

    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const { errors, invalidInputs } = validateRegister();

      if (errors.length > 0) {
        invalidInputs.forEach(shakeInput);
        setAlert(registerAlert, errors);
        if (invalidInputs[0]) invalidInputs[0].focus();
        return;
      }

      // ✅ this makes NAV show "התנתק"
      setLoggedIn();

      setAlert(registerAlert, []);
      alert("נרשמת בהצלחה! (דמו) עכשיו אפשר להמשיך לפרופיל.");
      window.location.href = "profile.html";
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

    [email, password].forEach((inp) => {
      if (!inp) return;
      inp.addEventListener("input", () => clearFieldError(inp));
    });

    function validateLogin() {
      const errors = [];
      const invalidInputs = [];

      clearFieldError(email);
      clearFieldError(password);

      if (!email.value.trim()) {
        setFieldError(email, "נא להזין אימייל.");
        errors.push("אימייל חסר.");
        invalidInputs.push(email);
      } else if (!isEmailValid(email.value)) {
        setFieldError(email, "נא להזין אימייל תקין.");
        errors.push("אימייל לא תקין.");
        invalidInputs.push(email);
      }

      if (!password.value) {
        setFieldError(password, "נא להזין סיסמה.");
        errors.push("סיסמה חסרה.");
        invalidInputs.push(password);
      } else if (password.value.length < 6) {
        setFieldError(password, "הסיסמה חייבת להיות לפחות 6 תווים.");
        errors.push("סיסמה קצרה מדי (מינימום 6 תווים).");
        invalidInputs.push(password);
      }

      return { errors, invalidInputs };
    }

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const { errors, invalidInputs } = validateLogin();

      if (errors.length > 0) {
        invalidInputs.forEach(shakeInput);
        setAlert(loginAlert, errors);
        if (invalidInputs[0]) invalidInputs[0].focus();
        return;
      }

      // ✅ this makes NAV show "התנתק"
      setLoggedIn();

      setAlert(loginAlert, []);
      alert("התחברת בהצלחה! (דמו)");
      window.location.href = "profile.html";
    });
  }
});
