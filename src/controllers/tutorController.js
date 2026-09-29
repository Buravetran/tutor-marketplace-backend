const pool = require('../db');

// Shared SELECT: tutor profile + name + average rating + review count
const TUTOR_SELECT = `
  SELECT u.id, u.name, tp.bio, tp.subjects, tp.hourly_rate, tp.is_free, tp.availability,
    (SELECT ROUND(AVG(r.rating), 1) FROM reviews r
       JOIN bookings b ON b.id = r.booking_id WHERE b.tutor_id = u.id) AS avg_rating,
    (SELECT COUNT(*)::int FROM reviews r
       JOIN bookings b ON b.id = r.booking_id WHERE b.tutor_id = u.id) AS review_count
  FROM tutor_profiles tp
  JOIN users u ON u.id = tp.user_id
`;

// GET /tutors?subject=python  (public)
async function searchTutors(req, res) {
  const { subject } = req.query;
  try {
    let result;
    if (subject && subject.trim()) {
      result = await pool.query(
        `${TUTOR_SELECT}
         WHERE EXISTS (SELECT 1 FROM unnest(tp.subjects) s WHERE s ILIKE $1)
         ORDER BY avg_rating DESC NULLS LAST, u.name`,
        [`%${subject.trim()}%`]
      );
    } else {
      result = await pool.query(`${TUTOR_SELECT} ORDER BY avg_rating DESC NULLS LAST, u.name`);
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// GET /tutors/:id  (public)
async function getTutor(req, res) {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid tutor id' });

  try {
    const result = await pool.query(`${TUTOR_SELECT} WHERE u.id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// GET /tutors/me  (tutor only) - to prefill the edit form
async function getMyProfile(req, res) {
  try {
    const result = await pool.query(`${TUTOR_SELECT} WHERE u.id = $1`, [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'You have not created a profile yet' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// PUT /tutors/me  (tutor only) - create or update own profile
async function saveMyProfile(req, res) {
  const { bio, subjects, hourly_rate, is_free, availability } = req.body;

  if (!Array.isArray(subjects) || subjects.length === 0 ||
      !subjects.every((s) => typeof s === 'string' && s.trim())) {
    return res.status(400).json({ error: 'subjects must be a non-empty list of names' });
  }

  const free = Boolean(is_free);
  let rate = null;
  if (!free && hourly_rate !== undefined && hourly_rate !== null && hourly_rate !== '') {
    rate = Number(hourly_rate);
    if (Number.isNaN(rate) || rate < 0) {
      return res.status(400).json({ error: 'hourly_rate must be a number, 0 or more' });
    }
  }

  const cleanSubjects = subjects.map((s) => s.trim());

  try {
    await pool.query(
      `INSERT INTO tutor_profiles (user_id, bio, subjects, hourly_rate, is_free, availability)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         bio = EXCLUDED.bio,
         subjects = EXCLUDED.subjects,
         hourly_rate = EXCLUDED.hourly_rate,
         is_free = EXCLUDED.is_free,
         availability = EXCLUDED.availability`,
      [req.user.id, bio || null, cleanSubjects, rate, free, availability || null]
    );

    const result = await pool.query(`${TUTOR_SELECT} WHERE u.id = $1`, [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { searchTutors, getTutor, getMyProfile, saveMyProfile };
