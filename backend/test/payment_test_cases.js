const chai = require('chai');
const { expect } = chai;
const sinon = require('sinon');
const mongoose = require('mongoose');
const Userevent = require('../models/Userevent');
const UserTransactions = require('../models/UserTransactions');
const { buyEvent } = require('../controllers/userEventController');
const { paymentFactory, CardPaymentStrategy, PayPalPaymentStrategy } = require('../services/paymentStrategy');

describe('PaymentStrategyFactory Test', () => {

  it('should return a CardPaymentStrategy when type is "card"', () => {
    const strategy = paymentFactory.getStrategy('card');
    expect(strategy).to.be.instanceOf(CardPaymentStrategy);
  });

  it('should return a PayPalPaymentStrategy when type is "paypal"', () => {
    const strategy = paymentFactory.getStrategy('paypal');
    expect(strategy).to.be.instanceOf(PayPalPaymentStrategy);
  });

  it('should throw an error for an unsupported payment type', () => {
    expect(() => paymentFactory.getStrategy('bitcoin')).to.throw('Unsupported payment type: bitcoin');
  });

});

describe('buyEvent Payment Strategy Integration Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should use the Factory+Strategy result when creating a transaction', async () => {
    const userId = new mongoose.Types.ObjectId();
    const eventId = new mongoose.Types.ObjectId();
    const userEventId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: userId.toString() },
      body: { eventId: eventId.toString(), price: 150, paymenttype: "paypal" }
    };

    const createdUserEvent = { _id: userEventId, userId: userId.toString(), eventId, qty: 1 };
    sinon.stub(Userevent, 'create').resolves(createdUserEvent);
    const transactionCreateStub = sinon.stub(UserTransactions, 'create').resolves({ _id: new mongoose.Types.ObjectId() });

    const leanStub = sinon.stub().resolves([]);
    const populateStub = sinon.stub().returns({ lean: leanStub });
    sinon.stub(Userevent, 'find').returns({ populate: populateStub });
    sinon.stub(UserTransactions, 'find').returns({ lean: sinon.stub().resolves([]) });

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await buyEvent(req, res);

    // Verify the transaction was created with the Factory+Strategy's output
    const callArgs = transactionCreateStub.firstCall.args[0];
    expect(callArgs.paymenttype).to.equal('paypal');
    expect(callArgs.price).to.equal(150);
  });

});