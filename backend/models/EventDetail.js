
const mongoose = require('mongoose');

const eventDetailSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    descriptionDetail: { type: String },
    schedule: [{day: String, time: String, location: String, program: String, Details: String}]
});

module.exports = mongoose.model('EventDetail', eventDetailSchema);
