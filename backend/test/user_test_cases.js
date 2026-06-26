const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Userevent = require('../models/Userevent');
const Event = require('../models/Event');
const UserTransactions = require('../models/UserTransactions');
const transactionService = require('../services/transactionService'); 
const { getAllEvents, getUserEvents, buyEvent, cancelUserEvent } = require('../controllers/userEventController');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;

// Start the server before running tests
// first function: test cases for getAllEvents function in userEventController.js
describe('getAllEvents Function Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve events successfully', async () => {
  const userId = new mongoose.Types.ObjectId();
  const eventId1 = new mongoose.Types.ObjectId();
  const eventId2 = new mongoose.Types.ObjectId();
  
  const events = [
    { _id: eventId1, title: "Event 1", date: new Date(), location: "Loc1", description: "Desc1", price: "$50", imagekey: "img1" },
    { _id: eventId2, title: "Event 2", date: new Date(), location: "Loc2", description: "Desc2", price: "$75", imagekey: "img2" }
  ];
  
  // User has booked eventId1
  const userEvents = [{ eventId: eventId1 }];

  sinon.stub(Event, 'find').resolves(events);
  
  // Stub the chained Userevent.find().select()
  const selectStub = sinon.stub().resolves(userEvents);
  sinon.stub(Userevent, 'find').returns({ select: selectStub });

  const req = { user: { id: userId.toString() } };
  const res = {
    json: sinon.spy(),
    status: sinon.stub().returnsThis()
  };

  await getAllEvents(req, res);

  expect(res.json.calledOnce).to.be.true;
  expect(res.status.called).to.be.false;
  
  // Verify decorated structure
  const result = res.json.firstCall.args[0];
  expect(result).to.be.an('array').with.lengthOf(2);
  expect(result[0]).to.have.property('id');        // BaseEventDetails uses 'id' not '_id'
  expect(result[0]).to.have.property('isBooked');  // BookingStatusDecorator adds this
  expect(result[0].isBooked).to.be.true;           // First event is booked
  expect(result[1].isBooked).to.be.false;          // Second event is not booked
});

  it('should return 500 if an error occurs', async () => {
    sinon.stub(Event, 'find').throws(new Error('DB Error'));

    const req = {};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getAllEvents(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});

// second function: test cases for getUserEvents function in userEventController.js
// now we need to pass a userID
describe('getUserEvents Function Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve events successfully', async () => {
    const eventId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const userEventId = new mongoose.Types.ObjectId();
    
    const userevents = [{
      _id: userEventId,
      userId: userId.toString(),
      eventId: { _id: eventId, imagekey: "image", title: "Event Title", date: new Date(), location: "Location", description: "Description" },
      qty: 1
    }];

    // Stub Userevent.find().populate().lean()
    const leanStub = sinon.stub().resolves(userevents);
    const populateStub = sinon.stub().returns({ lean: leanStub });
    sinon.stub(Userevent, 'find').returns({ populate: populateStub });
    
    // Stub UserTransactions.find().lean() - used by calculatePaidTotals internally
    const transLeanStub = sinon.stub().resolves([{
      userEventObjRef: userEventId,
      price: "50",
      transactionqty: "1"
    }]);
    sinon.stub(UserTransactions, 'find').returns({ lean: transLeanStub });

    const req = { user: { id: userId.toString() } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getUserEvents(req, res);

    expect(res.json.calledOnce).to.be.true;
    expect(res.status.called).to.be.false;
    
    const result = res.json.firstCall.args[0];
    expect(result[0].price).to.equal(50);
  });

  it('should return 500 if an error occurs', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    // Stub Userevent.find to throw on chained call
    const populateStub = sinon.stub().throws(new Error('DB Error'));
    sinon.stub(Userevent, 'find').returns({ populate: populateStub });

    const req = { user: { id: userId.toString() } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getUserEvents(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});


// third function: test cases for buyEvent function in userEventController.js
// this should behave more like a create function, where we add an event to the userevents collection.
describe('buyEvent Function Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should add an event to userevents successfully', async () => {
    const userId = new mongoose.Types.ObjectId();
    const eventId = new mongoose.Types.ObjectId();
    const userEventId = new mongoose.Types.ObjectId();
    
    const req = {
      user: { id: userId.toString() },
      body: { eventId: eventId.toString(), price: 100, paymenttype: "card" }
    };
    
    const createdUserEvent = { _id: userEventId, userId: userId.toString(), eventId: eventId, qty: 1 };
    const createdTransaction = { _id: new mongoose.Types.ObjectId() };
    
    // Stub creates
    sinon.stub(Userevent, 'create').resolves(createdUserEvent);
    sinon.stub(UserTransactions, 'create').resolves(createdTransaction);
    
    // Stub Userevent.find().populate().lean()
    const leanStub = sinon.stub().resolves([{
      _id: userEventId,
      userId: userId.toString(),
      eventId: { _id: eventId, imagekey: "image", title: "Event Title", date: new Date(), location: "Location", description: "Description" },
      qty: 1
    }]);
    const populateStub = sinon.stub().returns({ lean: leanStub });
    sinon.stub(Userevent, 'find').returns({ populate: populateStub });
    
    // Stub UserTransactions.find().lean() - used by calculatePaidTotals
    const transLeanStub = sinon.stub().resolves([{
      userEventObjRef: userEventId,
      price: "100",
      transactionqty: "1"
    }]);
    sinon.stub(UserTransactions, 'find').returns({ lean: transLeanStub });
    
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await buyEvent(req, res);

    expect(Userevent.create.calledOnce).to.be.true;
    expect(UserTransactions.create.calledOnce).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    const userId = new mongoose.Types.ObjectId();
    const eventId = new mongoose.Types.ObjectId();
    const req = {
      user: { id: userId.toString() },
      body: { eventId: eventId.toString(), price: 100, paymenttype: "card" }
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    sinon.stub(Userevent, 'create').throws(new Error('DB Error'));

    await buyEvent(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});


// fourth function: test cases for cancelUserEvent function in usereventcontroller.js
// this should behave like a delete function, where we remove an event from the userevents collection. 
// We need to check if the event exists and if the user is authorized to delete it (i.e., they are the one who reserved it).
describe('cancelUserEvent Function Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should cancel an userEvent successfully', async () => {
    const eventId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const userEventId = new mongoose.Types.ObjectId();
    
    const req = { 
      params: { id: userEventId.toString() }, 
      user: { id: userId.toString() }, 
      body: { price: 100 }
    };

    const event = { 
      _id: userEventId, 
      userId: userId, 
      eventId: eventId,
      qty: 1,
      deleteOne: sinon.stub().resolves() 
    };

    sinon.stub(Userevent, 'findById').resolves(event);
    sinon.stub(UserTransactions, 'create').resolves({ _id: new mongoose.Types.ObjectId() });
    
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };
    
    await cancelUserEvent(req, res);

    sinon.assert.calledOnce(event.deleteOne);
    expect(res.json.calledWith({ message: 'Reservation cancelled' })).to.be.true;
  });

  it('should return 404 if event is not found', async () => {
    sinon.stub(Userevent, 'findById').resolves(null);

    const eventId = new mongoose.Types.ObjectId();
    const req = { params: { id: eventId.toString() }, body: { price: 100 }};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await cancelUserEvent(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Event not found' })).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    sinon.stub(Userevent, 'findById').throws(new Error('DB Error'));

    const eventId = new mongoose.Types.ObjectId();
    const req = { params: { id: eventId.toString() }, body: { price: 100 }};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await cancelUserEvent(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});
