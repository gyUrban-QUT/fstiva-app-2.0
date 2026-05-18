const Event = require('../models/Event');
// get events function
const getEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// add event function
const addEvent = async (req, res) => {
    const { title, date, location, description, price, imagekey } = req.body;
    try {
        const event = await Event.create({ userId: req.user.id, title, date, location, description, price, imagekey });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// update event function
const updateEvent = async (req, res) => {
    const { title, date, location, description, price, imagekey } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        // if (event.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });
        
        event.title = title || event.title;
        event.date = date || event.date;
        event.location = location || event.location;
        event.description = description || event.description;
        event.price = price || event.price;
        event.imagekey = imagekey || event.imagekey;
        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// delete event function
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });

        await event.deleteOne();
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { getEvents, addEvent, updateEvent, deleteEvent };