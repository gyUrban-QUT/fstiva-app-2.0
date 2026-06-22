const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Event = require('../models/Event');
const EventDetail = require('../models/EventDetail');
const { getEvents, addEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;

// Start the server before running tests
// first function: test cases for addEvent function in eventController.js
describe('AddEvent Function Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should create a new event successfully', async () => {
    // Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { title: "New Event", date: "2025-12-31", location: "Event location", description: "Event description", price: 100, imagekey: "image", descriptionDetail: "details", schedule: [] }
    };

    // Mock event that would be created
    const createdEvent = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };
    const createdEventDetail = { _id: new mongoose.Types.ObjectId(), eventId: createdEvent._id, descriptionDetail: "details", schedule: [] };

    // Stub Event.create and EventDetail.create
    sinon.stub(Event, 'create').resolves(createdEvent);
    sinon.stub(EventDetail, 'create').resolves(createdEventDetail);
    
    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addEvent(req, res);

    // Assertions
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    // Stub Event.create to throw an error
    sinon.stub(Event, 'create').throws(new Error('DB Error'));
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
  });
});

// second function: test cases for updateEvent function in eventController.js
describe('UpdateEvent Function Test', () => {
  afterEach(() => {
    sinon.restore();
  });

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
      save: sinon.stub().resolvesThis(),
    };
    
    // Stub Event.findById to return mock event
    sinon.stub(Event, 'findById').resolves(existingEvent);
    // Stub EventDetail.findOneAndUpdate
    sinon.stub(EventDetail, 'findOneAndUpdate').resolves({ _id: new mongoose.Types.ObjectId(), eventId });
    
    const req = {
      params: { id: eventId },
      body: { title: "New Event", description: "New Description", location: "New Location", date: new Date(), price: 100, imagekey: "newimage", descriptionDetail: "details", schedule: [] },
    };
    
    const res = {
      json: sinon.spy(), 
      status: sinon.stub().returnsThis()
    };

    // Call function
    await updateEvent(req, res);

    // Assertions
    expect(existingEvent.title).to.equal("New Event");
    expect(existingEvent.description).to.equal("New Description");
    expect(existingEvent.location).to.equal("New Location");
    expect(existingEvent.date).to.be.a('date');
    expect(existingEvent.price).to.equal(100);
    expect(existingEvent.imagekey).to.equal("newimage");
    expect(existingEvent.save.calledOnce).to.be.true;
    expect(res.json.calledOnce).to.be.true;
  });

  it('should return 404 if event is not found', async () => {
    sinon.stub(Event, 'findById').resolves(null);
        
    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateEvent(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Event not found' })).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    sinon.stub(Event, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
    };

    await updateEvent(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;
  });
});

// third function: test cases for getEvents function in eventController.js
describe('GetEvents Function Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve events successfully', async () => {
    const events = [
      { _id: new mongoose.Types.ObjectId(), title: "Event 1" },
      { _id: new mongoose.Types.ObjectId(), title: "Event 2" }
    ];

    sinon.stub(Event, 'find').resolves(events);
    const req = {};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getEvents(req, res);

    expect(res.json.calledWith(events)).to.be.true;
    expect(res.status.called).to.be.false;
  });

  it('should return 500 if an error occurs', async () => {
    sinon.stub(Event, 'find').throws(new Error('DB Error'));

    const req = {};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getEvents(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});


// fourth function: test cases for deleteEvent function in eventController.js
describe('DeleteEvent Function Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should delete an event successfully', async () => {
    const eventId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const req = { params: { id: eventId.toString() }, user: { id: userId.toString() }};

    const event = { _id: eventId, userId: userId, deleteOne: sinon.stub().resolves() };

    sinon.stub(Event, 'findById').resolves(event);
    // Stub EventDetail.deleteOne for the controller's eventDetail.deleteOne call
    sinon.stub(EventDetail, 'deleteOne').resolves();
    
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };
    
    await deleteEvent(req, res);

    sinon.assert.calledOnce(event.deleteOne);
  });

  it('should return 404 if event is not found', async () => {
    sinon.stub(Event, 'findById').resolves(null);

    const eventId = new mongoose.Types.ObjectId();
    const req = { params: { id: eventId.toString() }};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await deleteEvent(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Event not found' })).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    sinon.stub(Event, 'findById').throws(new Error('DB Error'));

    const eventId = new mongoose.Types.ObjectId();
    const req = { params: { id: eventId.toString() }};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await deleteEvent(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});
