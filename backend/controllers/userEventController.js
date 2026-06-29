const Userevent = require('../models/Userevent');
const Event = require('../models/Event');
const UserTransactions = require('../models/UserTransactions');
const { Timestamp } = require('mongodb');
const Fun = require('../utils/functions.js');
const {
  BaseEventDetails,
  BookingStatusDecorator
} = require('../services/eventDetailsDecorator');
const { pricingFactory } = require('../services/pricingStrategy');
const { calculatePaidTotals } = require('../services/transactionService');

// Helper: fetch and format all user events for a user
const fetchFormattedUserEvents = async (userId) => {
    const userEvents = await Userevent.find({ userId })
        .populate('eventId', 'imagekey title date location description startdate enddate')
        .lean();

    const bookingIds = userEvents.map(e => e._id);
    const paidTotals = await calculatePaidTotals(bookingIds);

    return userEvents.map((userEvent) => {
        const event = userEvent.eventId || {};
        return {
            _id: userEvent._id,
            userId: userEvent.userId,
            eventId: event._id,
            qty: userEvent.qty,
            imagekey: event.imagekey,
            title: event.title,
            date: event.date,
            location: event.location,
            description: event.description,
            price: paidTotals[userEvent._id.toString()] || 0,
            startdate: event.startdate,
            enddate: event.enddate,
        };
    });
};


// get user events - now uses the helper
const getUserEvents = async (req, res) => {
    try {
        const events = await fetchFormattedUserEvents(req.user.id);
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// buy event - returns just the new event from the full list
const buyEvent = async (req, res) => {
    const { eventId, price, paymenttype } = req.body;
    try {
        const userEvent = await Userevent.create({userId: req.user.id, eventId, qty: 1});
        await UserTransactions.create({userEventObjRef: userEvent._id, userId: req.user.id, eventId, price, transactionqty: 1, transactiondate: new Date(), paymenttype, transactiontype: 'B'});
        
        const allEvents = await fetchFormattedUserEvents(req.user.id);
        const newEvent = allEvents.find(e => e._id.toString() === userEvent._id.toString());
        res.status(201).json(newEvent); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// get user events function
const getAllEvents = async (req, res) => {
    // 
    try {
        const allevents = await Event.find();
        // 2. Fetch current user's booked event IDs (if logged in)
        let bookedEventIds = new Set();
        // if (req.user.id) {
        const userEvents = await Userevent.find({ userId: req.user.id }).select('eventId');
        bookedEventIds = new Set(userEvents.map(b => b.eventId.toString()));

        // }
        // 3. Map through events and layer the decorations
        const decoratedEvents = allevents.map(event => {
            // Create base structure
            let eventPipeline = new BaseEventDetails(event);

            // Layer the user booking status dynamically
            eventPipeline = new BookingStatusDecorator(eventPipeline, bookedEventIds);

        // Execute the build chain
        return eventPipeline.build();
        
        });
        // console.log(decoratedEvents);
        res.json(decoratedEvents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// update quantity function
const updateQty = async (req, res) => {
    const { qty, paymenttype } = req.body;
    try {
        const event = await Userevent.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        
        const oldQty = event.qty;
        const qtyDiff = qty - oldQty;
        
        if (qtyDiff === 0) {
            return res.json({ event, message: 'No change' });
        }

        // Use Strategy Pattern for pricing calculation
        const strategy = pricingFactory.getStrategy(qtyDiff);
        const { transactionPrice, transactionType, paymentType } = await strategy.calculate({
            eventId: event.eventId,
            userEventObjRef: req.params.id,
            qtyDiff
        });
        
        event.qty = qty;
        const updatedEvent = await event.save();
        
        const transaction = await UserTransactions.create({
            userEventObjRef: req.params.id,
            userId: req.user.id,
            eventId: event.eventId,
            price: transactionPrice,
            transactionqty: qtyDiff,
            transactiondate: new Date(),
            paymenttype: paymentType,
            transactiontype: transactionType
        });
        
        res.json({ event: updatedEvent, transaction });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// cancel event function
const cancelUserEvent = async (req, res) => {
    
    
    try {
        const event = await Userevent.findById(req.params.id);
        const price = req.body.price;
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });
        
        const eventIdToLog = event.eventId;  // <-- capture before deletion
        const cancelQty = event.qty;  // <-- capture before deletion
        await event.deleteOne({_id: req.params.id});
        const transaction = await UserTransactions.create({userEventObjRef: req.params.id, userId: req.user.id, eventId: eventIdToLog, price: -price, transactionqty: cancelQty, transactiondate: new Date(), paymenttype: "NA", transactiontype: 'C'});
        
        res.json({ message: 'Reservation cancelled' });
        // console.log(req.params.id)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { getAllEvents, getUserEvents, buyEvent, updateQty, cancelUserEvent };
