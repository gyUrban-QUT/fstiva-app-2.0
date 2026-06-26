// backend/services/transactionService.js
const UserTransactions = require('../models/UserTransactions');

/**
 * Calculate total paid amount per booking from transactions
 * @param {Array} bookingIds - Array of userEvent ObjectIds
 * @param {string} eventId - Optional: filter by specific event
 * @returns {Object} Map of bookingId -> totalPaid
 */
const calculatePaidTotals = async (bookingIds, eventId = null) => {
    const query = { userEventObjRef: { $in: bookingIds } };
    if (eventId) query.eventId = eventId;

    const transactions = await UserTransactions.find(query).lean();

    return transactions.reduce((prices, transaction) => {
        const userEventObjRef = transaction.userEventObjRef.toString();
        
        if (!prices[userEventObjRef]) {
            prices[userEventObjRef] = 0;
        }
        
        const transactionPrice = parseFloat(transaction.price) * parseFloat(transaction.transactionqty) || 0;
        prices[userEventObjRef] += transactionPrice;
        return prices;
    }, {});
};

module.exports = { calculatePaidTotals };