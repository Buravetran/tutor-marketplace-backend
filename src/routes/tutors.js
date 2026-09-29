const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  searchTutors,
  getTutor,
  getMyProfile,
  saveMyProfile,
} = require('../controllers/tutorController');
const { tutorReviews } = require('../controllers/reviewController');

router.get('/', searchTutors);

// "/me" routes must come BEFORE "/:id", or Express treats "me" as an id
router.get('/me', authenticate, requireRole('tutor'), getMyProfile);
router.put('/me', authenticate, requireRole('tutor'), saveMyProfile);

router.get('/:id', getTutor);
router.get('/:id/reviews', tutorReviews);

module.exports = router;
