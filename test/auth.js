var should = require('should'); 
var request = require('supertest');  
var app = require('../server').app;
var security = require('../infrastructure/security');

describe('Authentication tests', function () {

  describe('GET /auth/facebook', function () {
   
    it('returns a 302 redirect to facebook for authentication', function (done) {
      request(app)
        .get('/auth/facebook')
        .expect(302)
        .end(function (err, res) {
          should.not.exist(err);
          res.header['location'].should.include('facebook');
          done();
        });
    });

  });

  describe('GET /auth/google', function () {
   
    it('returns a 302 redirect to google for authentication', function (done) {
      request(app)
        .get('/auth/google')
        .expect(302)
        .end(function (err, res) {
          should.not.exist(err);
          res.header['location'].should.include('google');
          done();
        });
    });

  });

  describe('POST /auth/facebook', function () {
   
    it('returns a 401 when an invalid facebook token is sent', function (done) {
      request(app)
        .post('/auth/facebook')
        .send({ token: 'an invalid token'})
        .expect(401)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.message.should.startWith('Access denied');
          done();
        });
    });

  });  

  describe('POST /auth/google', function () {
   
    it('returns a 401 when an invalid google token is sent', function (done) {
      request(app)
        .post('/auth/google')
        .send({ token: 'an invalid token'})
        .expect(401)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.message.should.startWith('Access denied');
          done();
        });
    });

  });

  describe('GET /me', function () {

    var user = {
      provider: 'test',
      userId: 1,
      email: 'testuser@test.com',
      displayName: 'testUser'
    }

    it('returns a 401 response when no authorization header is set', function (done) {
      request(app)
        .get('/me')
        .expect(401)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.details.should.equal('No Authorization header was found');
          done();
        })    
    });

    it('returns a 401 response when an invalid header is set', function (done) {
      request(app)
        .get('/me')
        .set('authorization', 'blahblah')
        .expect(401)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.details.should.equal('Invalid header. Format is Authorization: Bearer [token]');
          done();
        })    
    });

    it('returns a 401 response when an invalid authorization token is set', function (done) {
      request(app)
        .get('/me')
        .set('authorization', 'Bearer blahblah')
        .expect(401)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.details.should.equal('Invalid or expired token');
          done();
        })    
    });

    it('returns a 401 response when an expired authorization token is set', function (done) {
      var expiredToken = security.createTokenForUser(user, -1);

      request(app)
        .get('/me')
        .set('authorization', 'Bearer ' + expiredToken)
        .expect(401)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.details.should.equal('Invalid or expired token');
          done();
        })    
    });

    it('returns a 200 response with the user properties when an proper authorization token is set', function (done) {
      var token = security.createTokenForUser(user, 60);

      request(app)
        .get('/me')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.provider.should.equal(user.provider);
          res.body.userId.should.equal(user.userId);
          res.body.email.should.equal(user.email);
          res.body.displayName.should.equal(user.displayName);
          done();
        })    
    });

  });

});
