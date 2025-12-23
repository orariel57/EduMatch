// js/login.js
document.addEventListener("DOMContentLoaded", () => {
    // הצגה/הסתרה של שדות לפי תפקיד (תלמיד/מורה)
    const roleRadios = document.querySelectorAll("input[name='role']");
    const teacherFields = document.querySelector(".role-teacher");
    const studentFields = document.querySelector(".role-student"); // כרגע לא קיים ב-HTML, אבל נשאר ליכולת הרחבה

    function updateRoleFields() {
        const selected = document.querySelector("input[name='role']:checked")?.value;

        if (selected === "teacher") {
            if (teacherFields) teacherFields.style.display = "block";
            if (studentFields) studentFields.style.display = "none";
        } else {
            if (teacherFields) teacherFields.style.display = "none";
            if (studentFields) studentFields.style.display = "block";
        }
    }

    roleRadios.forEach((radio) => radio.addEventListener("change", updateRoleFields));
    updateRoleFields();


    // הוספת מקצועות נוספים (רק למורה)
    const addBtn = document.getElementById("add-subject-btn");
    const subjectsContainer = document.getElementById("subjects-container");
    let subjectIndex = 1;

    if (addBtn && subjectsContainer) {
        addBtn.addEventListener("click", () => {
            subjectIndex++;

            const row = document.createElement("div");
            row.className = "subject-row";

            row.innerHTML = `
        <input type="text" name="teacher-subject-${subjectIndex}" placeholder="מקצוע נוסף">
        <input type="number" name="teacher-price-${subjectIndex}" min="0" step="1"
          inputmode="numeric" pattern="[0-9]*" placeholder="מחיר לשעה">
      `;

            subjectsContainer.appendChild(row);
        });
    }

    // נעילת שדות מספריים לספרות בלבד
    const numericNamesStartsWith = ["teacher-price-"];
    const numericIds = ["teacher-experience", "lesson-duration"];

    document.addEventListener("input", (e) => {
        const el = e.target;
        if (!el) return;

        const isPrice =
            typeof el.name === "string" &&
            numericNamesStartsWith.some((prefix) => el.name.startsWith(prefix));

        const isOtherNumeric = numericIds.includes(el.id);

        if (isPrice || isOtherNumeric) {
            el.value = String(el.value).replace(/[^\d]/g, "");
        }
    });

    // דמו: מניעת שליחה אמיתית של הטפסים
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    // ===== אנימציית שגיאה (Shake) לשדות לא תקינים =====
    function triggerInputErrorAnimation(inputEl) {
        if (!inputEl) return;

        inputEl.classList.add("input-error");

        setTimeout(() => {
            inputEl.classList.remove("input-error");
        }, 450);
    }

    // מריצים "shake" על כל השדות הלא תקינים בטופס
    function shakeInvalidFields(formEl) {
        if (!formEl) return;

        const invalidInputs = formEl.querySelectorAll("input:invalid, select:invalid, textarea:invalid");
        invalidInputs.forEach((input) => triggerInputErrorAnimation(input));
    }

    if (loginForm) {
        // אם יש שדות לא תקינים- נריץ shake
        loginForm.addEventListener("submit", (e) => {
            if (!loginForm.checkValidity()) {
                e.preventDefault();
                shakeInvalidFields(loginForm);
                return;
            }

            e.preventDefault();
            alert(
                "נעביר אותך לפרופיל לדוגמה! (דמו בלבד)"
            );
            window.location.href = "profile.html";
        });

        //גם אם הדפדפן מציג הודעת ולידציה נריץ shake
        loginForm.addEventListener("invalid", (e) => {
            e.preventDefault();
            triggerInputErrorAnimation(e.target);
        }, true);
    }

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            if (!registerForm.checkValidity()) {
                e.preventDefault();
                shakeInvalidFields(registerForm);
                return;
            }

            e.preventDefault();
            alert(
                "נעביר אותך לפרופיל לדוגמה! (דמו בלבד)"
            );
            window.location.href = "profile.html";
        });

        // גם אם הדפדפן מציג הודעת ולידציה (בלי submit תקין) – נריץ shake
        registerForm.addEventListener("invalid", (e) => {
            e.preventDefault();
            triggerInputErrorAnimation(e.target);
        }, true);
    }
});
