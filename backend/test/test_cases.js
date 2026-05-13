const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Event = require('../models/Event');
const { getEvents, addEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;

// Start the server before running tests
// first function: test cases for addEvent function in eventController.js
describe('AddEvent Function Test', () => {
      it('should create a new event successfully', async () => {
// Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { title: "New Event", date: "2025-12-31", location: "Event location", description: "Event description", price: 100, imagekey: "image" }
    };

     // Mock event that would be created
    const createdEvent = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };

        // Stub Event.create to return the createdEvent
    const createStub = sinon.stub(Event, 'create').resolves(createdEvent);
    
    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

        // Call function
    await addEvent(req, res);

        // Assertions
    expect(createStub.calledOnceWith({ userId: req.user.id, ...req.body })).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdEvent)).to.be.true;

    // Restore stubbed methods
    createStub.restore();
  });

   it('should return 500 if an error occurs', async () => {
    // Stub Event.create to throw an error
    const createStub = sinon.stub(Event, 'create').throws(new Error('DB Error'));
    // Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { title: "New Event", date: "2025-12-31", location: "Event location", description: "Event description", price: 100, imagekey: "image" }
    };
        // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

        // Call function
    await addEvent(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    createStub.restore();
  });

});

// second function: test cases for updateEvent function in eventController.js
describe('UpdateEvent Function Test', () => {
  it('should update an existing event successfully', async () => {
    // Mock existing event
    const eventId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const existingEvent = {
      _id: eventId,
      title: "Old Event",
      description: "Old Description",
      location: "Old Location",
      date: new Date(),
      price: 50,
      imagekey: "oldimage",
      save: sinon.stub().resolvesThis(), // Mock save method
    };
        // Stub Event.findById to return mock event
    const findByIdStub = sinon.stub(Event, 'findById').resolves(existingEvent);
        // Mock request & response
    
    const req = {
      params: { id: eventId },
      body: { title: "New Event", description: "New Description", location: "New Location", date: new Date(), price: 100, imagekey: "newimage" },
    };
    
    const res = {
      json: sinon.spy(), 
      status: sinon.stub().returnsThis()
    };

    // Call function
    await updateEvent(req, res);

    // Assertions
    expect(findByIdStub.calledOnceWith(eventId)).to.be.true;
    expect(existingEvent.title).to.equal("New Event");
    expect(existingEvent.description).to.equal("New Description");
    expect(existingEvent.location).to.equal("New Location");
    expect(existingEvent.date).to.be.a('date');
    expect(existingEvent.price).to.equal(100);
    expect(existingEvent.imagekey).to.equal("newimage");
    expect(existingEvent.save.calledOnce).to.be.true;
    expect(res.json.calledOnce).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

   it('should return 404 if event is not found', async () => {
    const findByIdStub = sinon.stub(Event, 'findById').resolves(null);
        
    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateEvent(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Event not found' })).to.be.true;
    findByIdStub.restore();
    });

    it('should return 500 if an error occurs', async () => {
     const findByIdStub = sinon.stub(Event, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
    };

    await updateEvent(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;

    findByIdStub.restore();
    });

});

// third function: test cases for getEvents function in eventController.js
describe('GetEvents Function Test', () => {

    it('should retrieve events successfully', async () => {
        // Mock events. This is for admin users who can see all events. For regular users, we would filter by userId.

        const events = [
            { _id: new mongoose.Types.ObjectId(), title: "Event 1" },
            { _id: new mongoose.Types.ObjectId(), title: "Event 2" }
        ];

        // Stub Event.find to return the mock events
        const findStub = sinon.stub(Event, 'find').resolves(events);
        // Mock request and response objects
        const req = {};
        const res = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis()
        };

        // Call the function
        await getEvents(req, res);

        // Assertions
        // expect(findStub.calledOnceWith({ userId })).to.be.true;
        expect(res.json.calledWith(events)).to.be.true;
        expect(res.status.called).to.be.false; // No error status should be set

        // Restore stubbed methods
        findStub.restore();
    });

    it('should return 500 if an error occurs', async () => {
        // Stub Event.find to throw an error
        const findStub = sinon.stub(Event, 'find').throws(new Error('DB Error'));

        // Mock request and response objects
        const req = { };
        const res = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis()
        };

        // Call the function
        await getEvents(req, res);

        // Assertions
        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

        // Restore stubbed methods
        findStub.restore();

    });
});


// fourth function: test cases for deleteEvent function in eventController.js
describe('DeleteEvent Function Test', () => {

    it('should delete an event successfully', async () => {
        const eventId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId();
        // Mock event ID and user ID
        const req = { params: { id: eventId.toString() }, user: { id: userId.toString() }};

        // Mock event that would be found
        const event = { _id: eventId, userId: userId, deleteOne: sinon.stub().resolves() };

        // Stub Event.findById to return the mock event
        const findByIdStub = sinon.stub(Event, 'findById').resolves(event);
        
        // Mock response object


        const res = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis()
        };
        
        // Call the function
        await deleteEvent(req, res);

        // Assertions
        expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
        sinon.assert.calledOnce(event.deleteOne);
        // expect(event.deleteOne.calledOnce).to.be.true;
        // expect(res.json.calledWith({ message: 'Event deleted' })).to.be.true;



        // Restore stubbed methods
        findByIdStub.restore();
    });

    it('should return 404 if event is not found', async () => {
        const findByIdStub = sinon.stub(Event, 'findById').resolves(null);

        const eventId = new mongoose.Types.ObjectId();
        // const userId = new mongoose.Types.ObjectId();
        // Mock event ID and user ID
        const req = { params: { id: eventId.toString() }};
        const res = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis()
        };

        await deleteEvent(req, res);

        expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'Event not found' })).to.be.true;

        findByIdStub.restore();
    });

    it('should return 500 if an error occurs', async () => {
        const findByIdStub = sinon.stub(Event, 'findById').throws(new Error('DB Error'));

        const eventId = new mongoose.Types.ObjectId();
        // const userId = new mongoose.Types.ObjectId();
        const req = { params: { id: eventId.toString() }};
        const res = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis()
        };

        await deleteEvent(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

        findByIdStub.restore();
    });
});
