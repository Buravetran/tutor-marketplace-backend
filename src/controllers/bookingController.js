const pool = require('../db');

const BOOKING_SELECT = `
  SELECT b.id, b.subject, b.requested_time, b.status, b.created_at,
    b.learner_id, l.name AS learner_name,
    b.tutor_id, t.name AS tutor_name
  FROM bookings b
  JOIN users l ON l.id = b.learner_id
  JOIN users t ON t.id = b.tutor_id
`;

// POST /bookings  (learner only) - request a session
async function createBooking(req, res) {
  const { tutor_id, subject, requested_time } = req.body;

  const tutorId = parseInt(tutor_id, 10);
  if (Number.isNaN(tutorId)) {
    return res.status(400).json({ error: 'tutor_id is required' });
  }
  if (!subject || !subject.trim()) {
    return res.status(400).json({ error: 'subject is required' });
  }
  const when = new Date(requested_time);
  if (!requested_time || Number.isNaN(when.getTime())) {
    return res.status(400).json({ error: 'requested_time must be a valid date/time' });
  }
  if (when.getTime() < Date.now()) {
    return res.status(400).json({ error: 'requested_time must be in the future' });
  }

  try {
    // Confirm the target is actually a tutor with a profile
    const tutorCheck = await pool.query(
      `SELECT u.id FROM users u
       JOIN tutor_profiles tp ON tp.user_id = u.id
       WHERE u.id = $1 AND u.role = 'tutor'`,
      [tutorId]
    );
    if (tutorCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }
    if (tutorId === req.user.id) {
      return res.status(400).json({ error: 'You cannot book yourself' });
    }

    const result = await pool.query(
      `INSERT INTO bookings (learner_id, tutor_id, subject, requested_time)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [req.user.id, tutorId, subject.trim(), when]
    );

    const full = await pool.query(`${BOOKING_SELECT} WHERE b.id = $1`, [result.rows[0].id]);
    res.status(201).json(full.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// GET /bookings/mine  (either role) - bookings where I'm learner or tutor
async function myBookings(req, res) {
  try {
    const result = await pool.query(
      `${BOOKING_SELECT}
       WHERE b.learner_id = $1 OR b.tutor_id = $1
       ORDER BY b.requested_time DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// Allowed status transitions, and who is allowed to make each one
const TRANSITIONS = {
  accepted: { from: 'pending', by: 'tutor' },
  declined: { from: 'pending', by: 'tutor' },
  completed: { from: 'accepted', by: 'either' },
};

// PATCH /bookings/:id  (learner or tutor on that booking)
async function updateBooking(req, res) {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid booking id' });
  const rule = TRANSITIONS[status];
  if (!rule) {
    return res.status(400).json({ error: 'status must be accepted, declined, or completed' });
  }

  try {
    const existing = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const booking = existing.rows[0];

    const isLearner = booking.learner_id === req.user.id;
    const isTutor = booking.tutor_id === req.user.id;
    if (!isLearner && !isTutor) {
      return res.status(403).json({ error: 'This is not your booking' });
    }
    if (rule.by === 'tutor' && !isTutor) {
      return res.status(403).json({ error: 'Only the tutor can do that' });
    }
    if (booking.status !== rule.from) {
      return res.status(409).json({ error: `Booking must be ${rule.from} first, it is ${booking.status}` });
    }

    await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', [status, id]);
    const full = await pool.query(`${BOOKING_SELECT} WHERE b.id = $1`, [id]);
    res.json(full.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { createBooking, myBookings, updateBooking };
