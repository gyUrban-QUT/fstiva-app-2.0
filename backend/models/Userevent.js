const mongoose = require('mongoose');

const userEventSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    // title: { type: String, required: true },
    // date: { type: String, required: true },
    // location: { type: String, required: true },
    // description: { type: String },
    // price: { type: String, required: true },
    // purchased: { type: Boolean, default: false },
    // purchasedate: { type: Date },
    // imagekey: { type: String },
    qty: { type: Number},
});

module.exports = mongoose.model('UserEvent', userEventSchema);
