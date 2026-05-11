
const express = require('express');
const { getAllEvents, getUserEvents, buyEvent, cancelUserEvent } = require('../controllers/userEventController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getAllEvents).post(protect, buyEvent);
router.route('/:id').delete(protect, cancelUserEvent);

module.exports = router;
