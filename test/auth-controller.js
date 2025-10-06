import { expect } from 'chai';
import sinon from 'sinon';
import mongoose from 'mongoose';

import User from '../models/user.js';
import * as AuthController from '../controllers/auth.js';  // import all functions

describe('Auth Controller', function () {
  before(async function () {
    await mongoose.connect(
      "mongodb+srv://fatjonveseli2002:Tirana%402025@cluster0.lfy2m4e.mongodb.net/test-messages"
    );

    const user = new User({
      email: 'test@test.com',
      password: 'tester',
      name: 'Test',
      posts: [],
      status: 'I am new',
      _id: new mongoose.Types.ObjectId('6878b9c626695ab5b3cf72cc')
    });

    await user.save();
  });

  it('should throw an error with code 500 if accessing the database fails', async function () {
    sinon.stub(User, 'findOne');
    User.findOne.throws(); // simulate DB error

    const req = {
      body: {
        email: 'test@test.com',
        password: 'tester'
      }
    };

    try {
      await AuthController.login(req, {}, () => {});
    } catch (err) {
      expect(err).to.be.an('error');
      expect(err).to.have.property('statusCode', 500);
    }

    User.findOne.restore();
  });

  it('should send a response with a valid user status for an existing user', async function () {
    const req = { userId: '6878b9c626695ab5b3cf72cc' };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.userStatus = data.status;
      }
    };

    await AuthController.getUserStatus(req, res, () => {});

    expect(res.statusCode).to.be.equal(200);
    expect(res.userStatus).to.be.equal('I am new');
  });

  after(async function () {
    await User.deleteMany({});
    await mongoose.disconnect();
  });
});
