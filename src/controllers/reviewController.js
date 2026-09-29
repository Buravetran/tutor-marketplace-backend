const pool = require('../db');

// POST /reviews  (learner only) - after a completed booking
async function createReview(req, res) {
  const { booking_id, rating, comment } = req.body;

  const bookingId = parseInt(booking_id, 10);
  const ratingNum = parseInt(rating, 10);

  if (Number.isNaN(bookingId)) {
    return res.status(400).json({ error: 'booking_id is required' });
  }
  if (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'rating must be a whole number 1-5' });
  }

  try {
    const bookingResult = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const booking = bookingResult.rows[0];

    if (booking.learner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the learner from this booking can review it' });
    }
    if (booking.status !== 'completed') {
      return res.status(409).json({ error: 'Booking must be completed before it can be reviewed' });
    }

    const existing = await pool.query('SELECT id FROM reviews WHERE booking_id = $1', [bookingId]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'This booking has already been reviewed' });
    }

    const result = await pool.query(
      `INSERT INTO reviews (booking_id, rating, comment)
       VALUES ($1, $2, $3) RETURNING id, booking_id, rating, comment, created_at`,
      [bookingId, ratingNum, comment ? comment.trim() : null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// GET /tutors/:id/reviews  (public)
async function tutorReviews(req, res) {
  const tutorId = parseInt(req.params.id, 10);
  if (Number.isNaN(tutorId)) return res.status(400).json({ error: 'Invalid tutor id' });

  try {
    const result = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, l.name AS learner_name
       FROM reviews r
       JOIN bookings b ON b.id = r.booking_id
       JOIN users l ON l.id = b.learner_id
       WHERE b.tutor_id = $1
       ORDER BY r.created_at DESC`,
      [tutorId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { createReview, tutorReviews };
