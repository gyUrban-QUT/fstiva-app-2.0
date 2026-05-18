const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { registerUser, loginUser, loginAdmin, updateUserProfile, getProfile, updatePassword } = require('../controllers/authController');
const { error } = require('console');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;

// Start the server before running tests
// first function: test cases for registerUser function in authController.js

describe('registerUser Function Test', () => {

 it('should register a user successfully', async () => {
        const userId = new mongoose.Types.ObjectId();

        const userData = {
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'password123'
        };

        const createdUser = {
            _id: userId,
            id: userId.toString(),
            ...userData,
            role: 'user'
        };

        const findOneStub = sinon.stub(User, 'findOne').resolves(null);
        const createStub = sinon.stub(User, 'create').resolves(createdUser);

        const req = {
            body: userData
        };

        const res = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis()
        };

        await registerUser(req, res);

        expect(createStub.calledOnceWith({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: 'user'
        })).to.be.true;

        expect(res.status.calledOnceWith(201)).to.be.true;
        expect(res.json.calledOnce).to.be.true;

        createStub.restore();
        findOneStub.restore();
    });

    it('should return 500 if an error occurs', async () => {
    //     // Stub User.create to throw an error
        const findOneStub = sinon.stub(User, 'findOne').resolves(null);
        const createStub = sinon.stub(User, 'create').throws(new Error('DB Error'));
        const userData = {
                    name: 'Test User',
                    email: 'testuser@example.com',
                    password: 'password123'
                };
        // Mock request and response objects
        const req = { body: userData };
        const res = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis()
        };

        // Call the function
        await registerUser(req, res);

        // Assertions
        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

        // Restore stubbed methods
        createStub.restore();
        findOneStub.restore();
    });
});

// second function: test cases for loginUser function in authController.js
describe('loginUser Function Test', () => {
    it('should login a user successfully', async () => {
        const userId = new mongoose.Types.ObjectId();
        const userData = {
            id: userId.toString(),
            name: 'Test User',
            email: 'testuser@example.com',
            role: 'user',
            token: 'mocktoken'
        };

        const loginStub = sinon.stub(User, 'findOne').resolves(userData);
        const bcryptStub = sinon.stub(bcrypt, 'compare').resolves(true);

        const req = {   body: { email: userData.email, password: 'password123' } }; 
        const res = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis()
        };
        
        await loginUser(req, res);
        expect(res.json.calledOnce).to.be.true;
        
        loginStub.restore();
        bcryptStub.restore();
    });

    it('should throw an error for incorrect passwords', async () => {
        const userId = new mongoose.Types.ObjectId();
        const userData = {
            id: userId.toString(),
            name: 'Test User',
            email: 'testuser@example.com',
            role: 'user',
            token: 'mocktoken'
        };

        const loginStub = sinon.stub(User, 'findOne').resolves(userData);
        const bcryptStub = sinon.stub(bcrypt, 'compare').resolves(false);

        const req = {   body: { email: userData.email, password: 'wrongpassword' } }; 
        const res = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis()
        };
        try {
        await loginUser(req, res);
        } catch (error) {
        expect(error.message).to.equal('Invalid email or password');
        }
        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'Invalid email or password' })).to.be.true;
        loginStub.restore();
        bcryptStub.restore();
    });

})