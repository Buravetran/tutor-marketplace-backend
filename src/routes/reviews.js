const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { createReview } = require('../controllers/reviewController');

router.post('/', authenticate, requireRole('learner'), createReview);

module.exports = router;
