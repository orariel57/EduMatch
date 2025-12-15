// js/profile.js
document.addEventListener("DOMContentLoaded", () => {
  const noUserCard = document.getElementById("no-user-card");
  const layout = document.getElementById("profile-layout");

  const user = getCurrentUser();

  // אם אין משתמש מחובר – מציגים הודעה
  if (!user) {
    if (noUserCard) noUserCard.style.display = "block";
    if (layout) layout.style.display = "none";
    return;
  }

  // יש משתמש – מציגים את הפריסה
  if (noUserCard) noUserCard.style.display = "none";
  if (layout) layout.style.display = "flex";

  // מילוי פרטים בסיסיים
  const nameEl = document.getElementById("profile-name");
  const emailEl = document.getElementById("profile-email");
  const cityEl = document.getElementById("profile-city");
  const fieldEl = document.getElementById("profile-field");
  const rolePill = document.getElementById("profile-role-pill");

  if (nameEl) nameEl.textContent = user.fullName || "—";
  if (emailEl) emailEl.textContent = user.email || "—";
  if (cityEl) cityEl.textContent = user.city || "—";

  const favoritesSection = document.getElementById("favorites-section");

  // תצוגה לפי תפקיד
  if (user.role === "teacher") {
    if (rolePill) rolePill.textContent = "מורה";
    if (favoritesSection) favoritesSection.style.display = "none";

    // ניסיון להביא נתוני מורה מלאים ממאגר המורים לפי אימייל
    const teachers = getTeachers();
    const teacher = teachers.find(
      (t) => (t.email || "").toLowerCase() === (user.email || "").toLowerCase()
    );

    if (fieldEl) {
      if (teacher && Array.isArray(teacher.subjects) && teacher.subjects.length > 0) {
        const subjectsText = teacher.subjects
          .map((s) => `${s.subject} (${s.price || 0}₪/שעה)`)
          .join(", ");

        const durationText = teacher.duration ? `${teacher.duration} דקות` : "משך לא צוין";
        const expText = (teacher.experience ?? "") !== "" ? `${teacher.experience} שנות ניסיון` : "ניסיון לא צוין";

        fieldEl.textContent = `${subjectsText} • ${durationText} • ${expText}`;
      } else {
        fieldEl.textContent = "פרופיל מורה";
      }
    }
  } else {
    if (rolePill) rolePill.textContent = "תלמיד/ה";
    if (favoritesSection) favoritesSection.style.display = "block";
    if (fieldEl) fieldEl.textContent = "פרופיל תלמיד/ה";

    // כרגע אין מועדפים אמיתיים – מציגים הודעה
    const favoritesEmpty = document.getElementById("favorites-empty");
    const favoritesList = document.getElementById("favorites-list");
    if (favoritesList) favoritesList.innerHTML = "";
    if (favoritesEmpty) favoritesEmpty.style.display = "block";
  }
});
