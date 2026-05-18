
const express = require('express');
const { getAllEvents, getUserEvents, buyEvent, cancelUserEvent } = require('../controllers/userEventController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/all', protect, getAllEvents);

router.route('/').get(protect, getUserEvents).post(protect, buyEvent);
router.route('/:id').delete(protect, cancelUserEvent);

module.exports = router;
