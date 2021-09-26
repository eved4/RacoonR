/* This is a basic unit test which ensures that a 200 HTTP response is returned at these /browse<something> endpoints

Running the test:
    - In a terminal navigate to the directory containing the project (server.js file)
    - Run npm start
    - In a separate terminal navigate to the same directory
    - Run npm test
*/
const chai = require('chai');
var expect = require('chai').expect;
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
const serverUrl = 'http://localhost:3000';
describe('GET /browse', () => {
  it('should return status 200 when called:', function (done) {
    chai
      .request(serverUrl)
      .get('/browse')
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done();
      });
  });
});

describe('GET /browseLoggedIn without being logged in', () => {
  it('should redirect, 301', function (done) {
    chai
      .request(serverUrl)
      .get('/browseloggedin')
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done();
      });
  });
});
