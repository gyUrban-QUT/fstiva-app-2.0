const { Timestamp } = require('mongodb');
const mongoose = require('mongoose');

const userTransactionSchema = new mongoose.Schema({
    userEventObjRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Userevent', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    price: { type: String, required: true }, //neg for cancellation
    transactionqty: { type: String, required: true }, //neg for cancellation
    transactiondate: { type: Date, required: true },
    paymenttype: { type: String }, //card, paypal, etc. changin to not req for now
    transactiontype: { type: String, required: true } //purchase, cancellation

});

module.exports = mongoose.model('UserTransaction', userTransactionSchema);
