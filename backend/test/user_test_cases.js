const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Userevent = require('../models/Userevent');
const Event = require('../models/Event');
const { getAllEvents, getUserEvents, buyEvent, cancelUserEvent } = require('../controllers/userEventController');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;

// Start the server before running tests
// first function: test cases for getAllEvents function in userEventController.js
describe('getAllEvents Function Test', () => {

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
        await getAllEvents(req, res);

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
        await getAllEvents(req, res);

        // Assertions
        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

        // Restore stubbed methods
        findStub.restore();

    });
});

// second function: test cases for getUserEvents function in userEventController.js
// now we need to pass a userID
describe('getUserEvents Function Test', () => {

    it('should retrieve events successfully', async () => {
        // Mock events. This is for users who can see all available events for purchase
        const eventId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId();
        const userevents = [
        {_id: eventId, userId,
        title: "Event Title",
        description: "Description",
        location: " Location",
        date: new Date(),
        price: 50,
        imagekey: "image",
        save: sinon.stub().resolvesThis(), // Mock save method
        }];

        // Stub Userevent.find to return the mock events
        const findStub = sinon.stub(Userevent, 'find').resolves(userevents);
        // Mock request and response objects
        const req = { user: { id: userId.toString() } };
        const res = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis()
        };

        // Call the function
        await getUserEvents(req, res);

        // Assertions
        expect(findStub.calledOnceWith({ userId: req.user.id })).to.be.true;
        expect(res.json.calledWith(userevents)).to.be.true;
        expect(res.status.called).to.be.false;

        // Restore stubbed methods
        findStub.restore();
    });

    it('should return 500 if an error occurs', async () => {
        // Stub Userevent.find to throw an error
        const userId = new mongoose.Types.ObjectId();
        const findStub = sinon.stub(Userevent, 'find').throws(new Error('DB Error'));

        // Mock request and response objects
        const req = { user: { id: userId.toString() } };
        const res = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis()
        };

        // Call the function
        await getUserEvents(req, res);

        // Assertions
        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

        // Restore stubbed methods
        findStub.restore();

    });
});


// third function: test cases for buyEvent function in userEventController.js
// this should behave more like a create function, where we add an event to the userevents collection.
describe('buyEvent Function Test', () => {
  it('should add an event to userevents successfully', async () => {
      const userId = new mongoose.Types.ObjectId();
    // Mock existing event
      const req = {
          user: { id: userId.toString() },
          body: { title: "New Event", date: "2025-12-31", location: "Event location", description: "Event description", price: 100, imagekey: "image" }
        };
         // Mock event that would be created
      const createdEvent = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id, purchased: true, purchasedate: new Date() };
        // Mock request & response
    
    // Stub Userevent.create to return the createdEvent
    const createStub = sinon.stub(Userevent, 'create').resolves(createdEvent);
    
    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

        // Call function
    await buyEvent(req, res);

    // Assertions
    expect(createStub.calledOnce).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdEvent)).to.be.true;

    // Restore stubbed methods
    createStub.restore();
  });

       it('should return 500 if an error occurs', async () => {
        
        const userId = new mongoose.Types.ObjectId();
        const req = {
            user: { id: userId.toString() },
            body: { title: "New Event", date: "2025-12-31", location: "Event location", description: "Event description", price: 100, imagekey: "image" }
          };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        const createStub = sinon.stub(Userevent, 'create').throws(new Error('DB Error'));

        await buyEvent(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

        createStub.restore();
    });
});


// fourth function: test cases for cancelUserEvent function in usereventcontroller.js
// this should behave like a delete function, where we remove an event from the userevents collection. 
// We need to check if the event exists and if the user is authorized to delete it (i.e., they are the one who reserved it).
describe('cancelUserEvent Function Test', () => {

    it('should cancel an userEvent successfully', async () => {
        const eventId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId();
        // Mock event ID and user ID
        const req = { params: { id: eventId.toString() }, user: { id: userId.toString() }};

        // Mock event that would be found
        const event = { _id: eventId, userId: userId, deleteOne: sinon.stub().resolves() };

        // Stub Userevent.findById to return the mock event
        const findByIdStub = sinon.stub(Userevent, 'findById').resolves(event);
        
        // Mock response object


        const res = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis()
        };
        
        // Call the function
        await cancelUserEvent(req, res);

        // Assertions
        expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
        sinon.assert.calledOnce(event.deleteOne);
        expect(event.deleteOne.calledOnce).to.be.true;
        expect(res.json.calledWith({ message: 'Reservation cancelled' })).to.be.true;



        // Restore stubbed methods
        findByIdStub.restore();
    });

    it('should return 404 if event is not found', async () => {
        const findByIdStub = sinon.stub(Userevent, 'findById').resolves(null);

        const eventId = new mongoose.Types.ObjectId();
        // const userId = new mongoose.Types.ObjectId();
        // Mock event ID and user ID
        const req = { params: { id: eventId.toString() }};
        const res = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis()
        };

        await cancelUserEvent(req, res);

        expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'Event not found' })).to.be.true;

        findByIdStub.restore();
    });

    it('should return 500 if an error occurs', async () => {
        const findByIdStub = sinon.stub(Userevent, 'findById').throws(new Error('DB Error'));

        const eventId = new mongoose.Types.ObjectId();
        // const userId = new mongoose.Types.ObjectId();
        const req = { params: { id: eventId.toString() }};
        const res = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis()
        };

        await cancelUserEvent(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

        findByIdStub.restore();
    });

});
