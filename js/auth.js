// js/auth.js
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector(".register-card");
  if (!registerForm) return;

  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const role = registerForm.querySelector("input[name='role']:checked")?.value; // "student" / "teacher"
    const fullName = registerForm.querySelector("#full-name")?.value.trim();
    const email = registerForm.querySelector("#register-email")?.value.trim();
    const phone = registerForm.querySelector("#register-phone")?.value.trim();
    const lessonMode = registerForm.querySelector("input[name='lesson-mode']:checked")?.value;

    if (!fullName || !email || !phone) {
      alert("אנא מלא/י את כל שדות החובה.");
      return;
    }

    // עיר לפי סוג משתמש
    const city =
      role === "teacher"
        ? (registerForm.querySelector("#teacher-city")?.value.trim() || "")
        : (registerForm.querySelector("#student-city")?.value.trim() || "");

    // ✅ אם זה תלמיד – שומרים אותו במאגר תלמידים
    if (role === "student") {
      addStudent({
        id: generateId("student"),
        fullName,
        email,
        phone,
        city,
        lessonMode: lessonMode || "online",
        createdAt: new Date().toISOString()
      });
    }

    // ✅ אם זה מורה – שומרים אותו במאגר המורים
    if (role === "teacher") {
      const experience = Number(registerForm.querySelector("#teacher-experience")?.value || 0);
      const duration = Number(registerForm.querySelector("#lesson-duration")?.value || 0);

      const subjectRows = Array.from(
        registerForm.querySelectorAll("#subjects-container .subject-row")
      );

      const subjects = subjectRows
        .map((row) => {
          const subject = row.querySelector("input[type='text']")?.value.trim();
          const price = Number(row.querySelector("input[type='number']")?.value || 0);
          if (!subject) return null;
          return { subject, price };
        })
        .filter(Boolean);

      if (subjects.length === 0) {
        alert("כדי להירשם כמורה, יש להזין לפחות מקצוע אחד.");
        return;
      }

      addTeacher({
        id: generateId("teacher"),
        fullName,
        email,
        phone,
        city,
        lessonMode: lessonMode || "online",
        experience,
        duration,
        subjects,
        createdAt: new Date().toISOString()
      });
    }

    // ✅ שמירת "משתמש נוכחי" כדי שהפרופיל ידע מי מחובר
    setCurrentUser({
      fullName,
      email,
      phone,
      role, // "teacher" / "student"
      city
    });

    // מעבר לפרופיל
    window.location.href = "profile.html";
  });
});
