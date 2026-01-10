app.get("/api/teachers", (req, res) => {
  const subject = (req.query.subject || "").trim();
  const city = (req.query.city || "").trim();
  const name = (req.query.name || "").trim();
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;

  if (!subject || subject.length < 2) {
    return res.status(400).json({ ok: false, message: "חובה להזין מקצוע (לפחות 2 תווים)" });
  }

  const params = [];
  let where = `
    WHERE r.role_name = 'teacher'
      AND s.subject_name LIKE ?
  `;
  params.push(`%${subject}%`);

  if (city) {
    where += " AND tp.city = ? ";
    params.push(city);
  }

  if (name) {
    // first+last contains
    where += " AND CONCAT(u.first_name,' ',u.last_name) LIKE ? ";
    params.push(`%${name}%`);
  }

  if (Number.isFinite(maxPrice)) {
    where += " AND ts.price_per_hour <= ? ";
    params.push(maxPrice);
  }

  const sql = `
    SELECT
      u.user_id,
      u.email,
      u.first_name,
      u.last_name,
      tp.city,
      tp.lesson_mode,
      s.subject_name,
      ts.price_per_hour,
      ts.duration_minutes
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.user_id
    JOIN roles r ON r.role_id = ur.role_id
    JOIN teacher_profile tp ON tp.user_id = u.user_id
    JOIN teacher_subjects ts ON ts.user_id = u.user_id
    JOIN subjects s ON s.subject_id = ts.subject_id
    ${where}
    ORDER BY u.user_id DESC
  `;

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("DB error (GET /api/teachers):", err);
      return res.status(500).json({ ok: false, message: "DB error" });
    }

    // group rows by teacher
    const map = new Map();

    rows.forEach((r) => {
      const id = r.user_id;
      if (!map.has(id)) {
        map.set(id, {
          user_id: id,
          email: r.email,
          fullName: `${r.first_name} ${r.last_name}`.trim(),
          city: r.city,
          lesson_mode: r.lesson_mode,
          subjects: [],
        });
      }
      map.get(id).subjects.push({
        subject: r.subject_name,
        price: Number(r.price_per_hour),
        duration_minutes: Number(r.duration_minutes),
      });
    });

    return res.json({ ok: true, teachers: Array.from(map.values()) });
  });
});
