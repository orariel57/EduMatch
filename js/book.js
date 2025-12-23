// js/book.js
document.addEventListener("DOMContentLoaded", () => {

    function normalize(str) {
        return (str || "").trim().toLowerCase();
    }

    function getQueryParam(name) {
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    }

    function buildModeTags(lessonMode) {
        const box = document.getElementById("teacher-modes");
        if (!box) return;
        box.innerHTML = "";

        const addTag = (mode, label) => {
            const span = document.createElement("span");
            span.className = "lesson-mode-tag";
            span.dataset.mode = mode;
            span.textContent = label;
            box.appendChild(span);
        };

        if (lessonMode === "online") addTag("online", "💻 מקוון");
        else if (lessonMode === "in-person") addTag("in-person", "🏫 פרונטלי");
        else {
            addTag("online", "💻 מקוון");
            addTag("in-person", "🏫 פרונטלי");
        }
    }

    // Allows selecting lesson mode
    function buildModeRadios(lessonMode) {
        const box = document.getElementById("summary-mode-box");
        if (!box) return;
        box.innerHTML = "";

        const mk = (value, label, checked) => {
            const lab = document.createElement("label");
            lab.className = "summary-radio";
            lab.innerHTML = `<input type="radio" name="summary-lesson-mode" value="${value}" ${checked ? "checked" : ""
                }> ${label}`;
            box.appendChild(lab);
        };

        if (lessonMode === "online") mk("online", "מקוון", true);
        else if (lessonMode === "in-person") mk("in-person", "פרונטלי", true);
        else {
            mk("online", "מקוון", true);
            mk("in-person", "פרונטלי", false);
        }
    }

    // Checks whether the teacher has any availability at all
    function hasAnyAvailability(av) {
        if (!av) return false;
        return Object.values(av).some((v) => v && v.enabled);
    }

    // Handles time
    function timeToMinutes(t) {
        const [h, m] = (t || "00:00").split(":").map(Number);
        return h * 60 + (m || 0);
    }

    function minutesToTime(mins) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }

    // Builds time slots based on day availability and lesson duration
    function buildSlotsForDay(availabilityDay, durationMinutes) {
        if (!availabilityDay?.enabled) return [];
        if (!availabilityDay.start || !availabilityDay.end) return [];

        const start = timeToMinutes(availabilityDay.start);
        const end = timeToMinutes(availabilityDay.end);
        const dur = Math.max(1, Number(durationMinutes) || 60);

        if (start >= end) return [];

        const slots = [];
        for (let t = start; t + dur <= end; t += dur) {
            slots.push(minutesToTime(t));
        }
        return slots;
    }

    // 2 example teachers who entered availability
    const DEMO_TEACHERS = [
        {
            fullName: "דנה לוי",
            email: "dana.levi@example.com",
            city: "באר שבע",
            lessonMode: "online",
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
        },
        {
            fullName: "יואב כהן",
            email: "yoav.cohen@example.com",
            city: "תל אביב",
            lessonMode: "in-person",
            duration: 45,
            subjects: [
                { subject: "פייתון", price: 180 },
                { subject: "מתמטיקה", price: 130 },
                { subject: "SQL", price: 160 },
            ],
            availabilityWeekly: {
                sun: { enabled: true, start: "17:00", end: "21:00" },
                mon: { enabled: false, start: "", end: "" },
                tue: { enabled: true, start: "09:00", end: "12:00" },
                wed: { enabled: true, start: "15:00", end: "19:00" },
                thu: { enabled: false, start: "", end: "" },
                fri: { enabled: false, start: "", end: "" },
                sat: { enabled: false, start: "", end: "" },
            },
        },
    ];

    const dayKeyByGetDay = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];


    let currentYear, currentMonth;
    let selectedDate = null;
    let selectedTime = null;

    const monthNamesHebrew = [
        "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
        "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
    ];


    const layoutEl = document.getElementById("booking-layout");
    const errorEl = document.getElementById("booking-error");
    const noAvailEl = document.getElementById("booking-no-availability");

    const teacherNameEl = document.getElementById("teacher-name");
    const teacherCityEl = document.getElementById("teacher-city");
    const teacherSubjectEl = document.getElementById("teacher-subject");
    const teacherPriceEl = document.getElementById("teacher-price");
    const durationLabelEl = document.getElementById("lesson-duration-label");

    const calendarMonthLabel = document.getElementById("calendar-month-label");
    const calendarDaysContainer = document.getElementById("calendar-days");
    const timeSlotsContainer = document.getElementById("time-slots");
    const timesHintEl = document.getElementById("times-hint");

    const summaryDateEl = document.getElementById("summary-date");
    const summaryTimeEl = document.getElementById("summary-time");
    const summaryDurationEl = document.getElementById("summary-duration");
    const summaryPriceEl = document.getElementById("summary-price");
    const confirmBtn = document.getElementById("confirm-booking");

    // =========================
    // 1) Load teacher from URL
    // =========================


    const teacherEmail = getQueryParam("teacher");
    const requestedSubject = getQueryParam("subject");

    const teacher =
        (teacherEmail
            ? DEMO_TEACHERS.find((t) => normalize(t.email) === normalize(teacherEmail))
            : null) || DEMO_TEACHERS[0];

    const teacherWeeklyAvailability = teacher?.availabilityWeekly || {};

    // If there is no teacher at all
    if (!teacher) {
        if (errorEl) errorEl.style.display = "block";
        return;
    }

    // If there is a teacher but no availability
    if (!hasAnyAvailability(teacherWeeklyAvailability)) {
        if (noAvailEl) noAvailEl.style.display = "block";
        return;
    }

    // Valid state: show booking layout
    if (layoutEl) layoutEl.style.display = "block";

    // Select subject to display
    const subjects = teacher.subjects || [];
    let chosen = null;

    if (requestedSubject) {
        chosen =
            subjects.find((s) => normalize(s.subject) === normalize(requestedSubject)) ||
            subjects.find((s) => normalize(s.subject).includes(normalize(requestedSubject))) ||
            null;
    }
    if (!chosen) chosen = subjects[0] || { subject: "לא צוין", price: "—" };

    const duration = Number(teacher.duration || 60);

    // Display teacher details on screen
    if (teacherNameEl) teacherNameEl.textContent = teacher.fullName || "—";
    if (teacherCityEl) teacherCityEl.textContent = teacher.city || "לא צוין";
    if (teacherSubjectEl) teacherSubjectEl.textContent = chosen.subject || "לא צוין";
    if (teacherPriceEl) teacherPriceEl.textContent = `${chosen.price ?? "—"} ש"ח`;
    if (durationLabelEl) durationLabelEl.textContent = `${duration} דקות`;

    // Display details in summary
    if (summaryDurationEl) summaryDurationEl.textContent = `${duration} דקות`;
    if (summaryPriceEl) summaryPriceEl.textContent = `${chosen.price ?? "—"} ש"ח`;

    buildModeTags(teacher.lessonMode);
    buildModeRadios(teacher.lessonMode);

    const summaryModeBox = document.getElementById("summary-mode-box");
    const modeChosenLine = document.createElement("div");
    modeChosenLine.id = "mode-chosen-line";
    modeChosenLine.style.marginTop = "8px";
    modeChosenLine.style.fontSize = "14px";
    modeChosenLine.style.opacity = "0.9";

    function updateModeChosenLine() {
        const picked =
            document.querySelector('input[name="summary-lesson-mode"]:checked')?.value || "online";
        modeChosenLine.textContent = `נבחר: ${picked === "in-person" ? "פרונטלי" : "מקוון"}`;
    }

    if (summaryModeBox && !document.getElementById("mode-chosen-line")) {
        summaryModeBox.appendChild(modeChosenLine);
        updateModeChosenLine();
        summaryModeBox.addEventListener("change", updateModeChosenLine);
    }

    // Initialize calendar
    initCalendar();

    // Initialize current month + listeners for month navigation
    function initCalendar() {
        const today = new Date();
        currentYear = today.getFullYear();
        currentMonth = today.getMonth();

        renderCalendar(currentYear, currentMonth);

        document.getElementById("prev-month")?.addEventListener("click", () => changeMonth(-1));
        document.getElementById("next-month")?.addEventListener("click", () => changeMonth(1));
    }

    // Change month: reset selections and re-render
    function changeMonth(offset) {
        currentMonth += offset;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        else if (currentMonth > 11) { currentMonth = 0; currentYear++; }

        selectedDate = null;
        selectedTime = null;

        updateSummary();
        updateConfirmButtonState();

        if (timeSlotsContainer) timeSlotsContainer.innerHTML = "";
        if (timesHintEl) timesHintEl.textContent = "בחרי קודם תאריך ביומן כדי לראות שעות זמינות.";

        renderCalendar(currentYear, currentMonth);
    }

    // Check if teacher is available on a specific day
    function isTeacherAvailableOnDate(dateObj) {
        const key = dayKeyByGetDay[dateObj.getDay()];
        const dayAvail = teacherWeeklyAvailability?.[key];
        return !!dayAvail?.enabled;
    }

    function renderCalendar(year, month) {
        if (!calendarDaysContainer || !calendarMonthLabel) return;

        calendarDaysContainer.innerHTML = "";

        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDayIndex = firstDayOfMonth.getDay(); // 0=Sun

        calendarMonthLabel.textContent = `${monthNamesHebrew[month]} ${year}`;

        // Empty squares until month start
        for (let i = 0; i < startDayIndex; i++) {
            const blankCell = document.createElement("div");
            blankCell.className = "calendar-day calendar-day--empty";
            calendarDaysContainer.appendChild(blankCell);
        }

        const today = new Date();
        const isSameMonthAsToday = (year === today.getFullYear() && month === today.getMonth());
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();

            const dayCell = document.createElement("button");
            dayCell.type = "button";
            dayCell.classList.add("calendar-day");
            dayCell.textContent = day;

            // Mark "today"
            if (isSameMonthAsToday && day === today.getDate()) {
                dayCell.classList.add("calendar-day--today");
            }

            const startOfCellDate = new Date(year, month, day);

            const isPastDay = startOfCellDate < startOfToday;
            const isWeekend = (dayOfWeek === 5 || dayOfWeek === 6);
            const isUnavailableForTeacher = !isTeacherAvailableOnDate(date);

            const isDisabled = isPastDay || isWeekend || isUnavailableForTeacher;

            if (isDisabled) {
                dayCell.classList.add("calendar-day--disabled");
                dayCell.disabled = true;
            } else {
                dayCell.addEventListener("click", () => onDateSelected(year, month, day));
            }

            // If a date is already selected – mark it
            if (
                selectedDate &&
                selectedDate.getFullYear() === year &&
                selectedDate.getMonth() === month &&
                selectedDate.getDate() === day
            ) {
                dayCell.classList.add("calendar-day--selected");
            }

            calendarDaysContainer.appendChild(dayCell);
        }
    }

    // Day selection: mark it and load times
    function onDateSelected(year, month, day) {
        selectedDate = new Date(year, month, day);
        selectedTime = null;

        document.querySelectorAll(".calendar-day--selected")
            .forEach((el) => el.classList.remove("calendar-day--selected"));

        calendarDaysContainer?.querySelectorAll(".calendar-day").forEach((cell) => {
            if (cell.textContent === String(day) && !cell.classList.contains("calendar-day--disabled")) {
                cell.classList.add("calendar-day--selected");
            }
        });

        if (summaryDateEl) summaryDateEl.textContent = `${day} ${monthNamesHebrew[month]} ${year}`;
        if (summaryTimeEl) summaryTimeEl.textContent = "לא נבחר";

        loadTimeSlotsForDate(selectedDate);
        updateConfirmButtonState();
    }

    // Load available times for selected day
    function loadTimeSlotsForDate(dateObj) {
        if (!timeSlotsContainer || !timesHintEl) return;

        timeSlotsContainer.innerHTML = "";

        const key = dayKeyByGetDay[dateObj.getDay()];
        const dayAvail = teacherWeeklyAvailability?.[key];
        const dur = Number(teacher?.duration || 60);

        const slots = buildSlotsForDay(dayAvail, dur);

        if (!slots.length) {
            timesHintEl.textContent = "אין שעות זמינות ביום הזה. בחרי יום אחר.";
            return;
        }

        timesHintEl.textContent = "בחרי שעה זמינה מתוך הרשימה.";

        slots.forEach((timeStr) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "time-slot";
            btn.textContent = timeStr;
            btn.addEventListener("click", () => onTimeSelected(timeStr));
            timeSlotsContainer.appendChild(btn);
        });
    }

    // Time selection: mark it and enable confirmation
    function onTimeSelected(timeStr) {
        selectedTime = timeStr;

        document.querySelectorAll(".time-slot--selected")
            .forEach((el) => el.classList.remove("time-slot--selected"));

        document.querySelectorAll(".time-slot").forEach((el) => {
            if (el.textContent === timeStr) el.classList.add("time-slot--selected");
        });

        if (summaryTimeEl) summaryTimeEl.textContent = timeStr;
        updateConfirmButtonState();
    }

    // Update summary texts when resetting selection
    function updateSummary() {
        if (!selectedDate && summaryDateEl) summaryDateEl.textContent = "לא נבחר";
        if (!selectedTime && summaryTimeEl) summaryTimeEl.textContent = "לא נבחר";
    }

    // Confirmation button enabled only if date + time are selected
    function updateConfirmButtonState() {
        if (!confirmBtn) return;
        confirmBtn.disabled = !(selectedDate && selectedTime);
    }

    // Booking confirmation
    // Shows confirmation message on booking
    confirmBtn?.addEventListener("click", () => {
        if (!selectedDate || !selectedTime) return;

        const pickedMode =
            document.querySelector('input[name="summary-lesson-mode"]:checked')?.value || "online";
        const modeLabel = pickedMode === "in-person" ? "פרונטלי" : "מקוון";

        alert(
            "הזמנה נשלחה .\n\n" +
            `מורה: ${teacher.fullName}\n` +
            `תאריך: ${summaryDateEl?.textContent || ""}\n` +
            `שעה: ${selectedTime}\n` +
            `אופן: ${modeLabel}`
        );
    });
});
