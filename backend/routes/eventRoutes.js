
const express = require('express');
const { getEvents, addEvent, updateEvent, deleteEvent, getEventDetails, getDeleteImpact } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();


router.route('/').get(protect, getEvents).post(protect, addEvent);
router.get('/:id/details', protect, getEventDetails);
router.route('/:id').put(protect, updateEvent).delete(protect, deleteEvent);
// to get impact of deleteEvent
router.get('/:id', protect, getDeleteImpact);

module.exports = router;
