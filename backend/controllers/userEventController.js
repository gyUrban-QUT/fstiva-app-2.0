const Userevent = require('../models/Userevent');
const Event = require('../models/Event');

// get user events function
const getAllEvents = async (req, res) => {
    // 
    try {
        const allevents = await Event.find();
        res.json(allevents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// get user events function
const getUserEvents = async (req, res) => {
    // this function will return all events that the user has reserved
    // if no event is reserved, it will return an empty array
    try {
        const events = await Userevent.find({ userId: req.user.id });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// buy event function
const buyEvent = async (req, res) => {
    const { eventId, title, date, location, description, price, imagekey } = req.body;
    try {
        const event = await Userevent.create({userId: req.user.id, eventId, title, date, location, description, price, purchased: true, purchasedate: new Date(), imagekey, qty: 1});
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// update quantity function
const updateQty = async(req, res) => {
    const { qty } = req.body;
    try {
        const event = await Userevent.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        // if (event.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });
        
        event.qty = qty || event.qty;
        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
};
};

// cancel event function
const cancelUserEvent = async (req, res) => {
    try {
        const event = await Userevent.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });

        await event.deleteOne({_id: req.params.id});
        res.json({ message: 'Reservation cancelled' });
        // console.log(req.params.id)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { getAllEvents, getUserEvents, buyEvent, updateQty, cancelUserEvent };