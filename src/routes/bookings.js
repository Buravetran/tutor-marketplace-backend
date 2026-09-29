const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { createBooking, myBookings, updateBooking } = require('../controllers/bookingController');

router.use(authenticate); // every booking route requires login

router.post('/', requireRole('learner'), createBooking);
router.get('/mine', myBookings);
router.patch('/:id', updateBooking);

module.exports = router;
