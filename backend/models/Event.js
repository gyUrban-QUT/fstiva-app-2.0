
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    date: { type: String, required: true }, //old date format string - will be filled from startdate and enddate
    location: { type: String, required: true },
    description: { type: String },
    price: { type: String, required: true },
    imagekey: { type: String },
    startdate: { type: String, required: true },
    enddate: { type: String, required: true },
});

module.exports = mongoose.model('Event', eventSchema);
