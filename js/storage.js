// js/storage.js
const STORAGE_KEYS = {
  TEACHERS: "edumatch_teachers",
  STUDENTS: "edumatch_students",
  CURRENT_USER: "edumatch_current_user"
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// (לא חובה, אבל נוח)
function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

// ===== Current User API =====
function setCurrentUser(user) {
  saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
}

function getCurrentUser() {
  return loadFromStorage(STORAGE_KEYS.CURRENT_USER, null);
}

// ===== Teachers API =====
function getTeachers() {
  return loadFromStorage(STORAGE_KEYS.TEACHERS, []);
}

function saveTeachers(teachers) {
  saveToStorage(STORAGE_KEYS.TEACHERS, teachers);
}

function addTeacher(teacher) {
  const teachers = getTeachers();
  teachers.push(teacher);
  saveTeachers(teachers);
  return teacher;
}

// ===== Students API =====
function getStudents() {
  return loadFromStorage(STORAGE_KEYS.STUDENTS, []);
}

function saveStudents(students) {
  saveToStorage(STORAGE_KEYS.STUDENTS, students);
}

function addStudent(student) {
  const students = getStudents();
  students.push(student);
  saveStudents(students);
  return student;
}
