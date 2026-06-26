const Event = require('../models/Event');
const EventDetail = require('../models/EventDetail');
const userEvent = require('../models/Userevent');
const userTransactions = require('../models/UserTransactions');
const { calculatePaidTotals } = require('./transactionService');

class eventManagerFacade {
    /**
     * The Facade method that handles the complex cascading deletion
     * @param {string} eventId 
     */
    async cancelEventBookings(eventId, refundPrice = 0) {
        // 1. Check that event exists
        const event = await Event.findById(eventId);
        if (!event) {
            throw new Error('Event not found'); // Or return { success: false, message: 'Event not found' }
        }

        // 2. Find all active bookings linked to this event
        const associatedBookings = await userEvent.find({ eventId: eventId }); // Fixed: userEvent
        console.log(`[Facade] Found ${associatedBookings.length} associated user bookings to process.`);

        // 3. Generate transaction logs for cancelled bookings
        if (associatedBookings.length > 0) {
            const bookingIds = associatedBookings.map(b => b._id);
            const paidTotals = await calculatePaidTotals(bookingIds, eventId);

            const transactionPromises = associatedBookings.map(booking => {
                const paidTotal = paidTotals[booking._id.toString()] || 0;
                return userTransactions.create({
                    userEventObjRef: booking._id,
                    userId: booking.userId,
                    eventId: eventId,
                    price: Math.abs(paidTotal),
                    transactionqty: -booking.qty,
                    transactiondate: new Date(),
                    paymenttype: "NA",
                    transactiontype: 'C'
                });
            });
            await Promise.all(transactionPromises);
            console.log(`[Facade] Generated ${transactionPromises.length} refund transaction logs.`);

            // Delete all associated bookings
            const bookingResult = await userEvent.deleteMany({ eventId: eventId }); // Fixed: userEvent
            console.log(`[Facade] Cancelled ${bookingResult.deletedCount} bookings.`);
        }

        // Delete the event
        await event.deleteOne(); // Fixed: no arguments needed on document instance
        // Delete associated event details
        await EventDetail.deleteOne({ _id: eventId }); // Fixed: query by eventId field

        return {
            deletedEvent: event,
            processedBookingsCount: associatedBookings.length
        };
    }

    }


module.exports = new eventManagerFacade();