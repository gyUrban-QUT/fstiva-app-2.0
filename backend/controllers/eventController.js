const Event = require('../models/Event');
const EventDetail = require('../models/EventDetail');
const {
  BaseEventDetails,
  ScheduleDecorator,
  LongDescriptionDecorator,
  PresentationDecorator,
} = require('../services/eventDetailsDecorator');

// get events function
const getEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// get event details
const getEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const eventDetail = await EventDetail.findOne({ eventId: event._id });

    let decorated = new BaseEventDetails(event);
    decorated = new ScheduleDecorator(decorated, eventDetail);
    decorated = new LongDescriptionDecorator(decorated, eventDetail);
    decorated = new PresentationDecorator(decorated);

    res.json(decorated.build());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// add event function
const addEvent = async (req, res) => {
    const { title, date, location, description, price, imagekey, descriptionDetail, schedule } = req.body;
    try {
        const event = await Event.create({ userId: req.user.id, title, date, location, description, price, imagekey });
        const normalisedSchedule = Array.isArray(schedule)?schedule:[];
        // 3. Create the event details using the new event's ID
        const eventDetail = await EventDetail.create({
            userId: req.user.id,
            eventId: event._id, // Links details to the main event
            descriptionDetail,
            schedule: normalisedSchedule
        });
        res.status(201).json(event, eventDetail);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// add eventDetails function
// const addEventDetail = async (req, res) => {
//     const { descriptionDetail, schedule } = req.body;
//     try {
//         const event = await EventDetail.create({ userId: req.user.id, eventId: event._id, descriptionDetail, schedule });
//         res.status(201).json(event);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
// update event function
const updateEvent = async (req, res) => {
    const { title, date, location, description, price, imagekey, descriptionDetail, schedule  } = req.body;
    const normalisedSchedule = Array.isArray(schedule)?schedule:[];
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

        // 3. Update the associated event details
        // { new: true, upsert: true } creates the detail document if it doesn't exist yet
        const updatedDetail = await EventDetail.findOneAndUpdate(
            { eventId: req.params.id }, 
            { eventId: event._id, descriptionDetail, schedule: normalisedSchedule},
            { new: true, upsert: true } 
        );

        // 4. Return both updated documents
        res.json({
            message: "Event and details updated successfully",
            event: updatedEvent,
            eventDetail: updatedDetail
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// update eventDetails function
// const updateEventDetail = async (req, res) => {
//     const { descriptionDetail, schedule } = req.body;
//     try {
//         const event = await EventDetail.findById(req.params.id);
//         if (!event) return res.status(404).json({ message: 'Event not found' });
//         // if (event.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });
        
//         event.descriptionDetail = descriptionDetail || event.descriptionDetail;
//         event.schedule = schedule || event.schedule;
//         const updatedEvent = await event.save();
//         res.json(updatedEvent);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
// delete event function
// this is for admin and admin should be able to delete any event
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        // if (event.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });

        await event.deleteOne({_id: req.params.id});
        // also delete details if event deleted
        await EventDetail.deleteOne({_id: req.params.id});
        
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { getEvents, addEvent, updateEvent, deleteEvent, getEventDetails };