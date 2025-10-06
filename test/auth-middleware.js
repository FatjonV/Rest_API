import { expect } from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';

import authMiddleware from '../middleware/auth.js';

describe('Auth middleware', function () {
  it('should set isAuth to false if no authorization header is present', function () {
    const req = {
      get: function () {
        return null;
      }
    };

   expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('Not authenticated.')
  });

  it('should throw an error if the authorization header is only one string', function () {
    const req = {
      get: function () {
        return 'xyz';
      }
    };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it('should throw an error if the token cannot be verified', function () {
    const req = {
      get: function () {
        return 'Bearer xyz';
      }
    };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it('should yield a userId after decoding the token', function () {
    const req = {
      get: function () {
        const token = jwt.sign(
          { userId: 'abc123' },
          'somesupersecretsecret'
        );
        sinon.stub(jwt, 'verify');
        jwt.verify.returns({userId: 'abc123'});
        return 'Bearer ' + token;
      }
    };

    authMiddleware(req, {}, () => {});
    expect(req.userId).to.equal('abc123');
    expect(req.isAuth).to.be.true;
    expect(req).to.have.property('userId', 'abc123');
    expect(jwt.verify.called).to.be.true;
    jwt.verify.restore()
  });
});
