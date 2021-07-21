var express = require('express');
var passport = require('passport');
var login_route = express.Router();

var mysql = require('mysql');
var bodyParser = require('body-parser');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'racoonr',
});

connection.connect();

login_route.get('/login', function (req, res, next) {
  return res.render('login');
});

login_route.post('/login', function (request, response, next) {
  passport.authenticate('local', function (error, user) {
    var username = request.body.username;
    var password = request.body.password;
    if (username && password) {
      connection.query(
        'SELECT * FROM users WHERE UserName = ? AND Password = ?',
        [username, password],
        function (error, results, fields) {
          if (results.length > 0) {
            request.session.loggedin = true;
            request.session.username = username;
            response.redirect('/browse');
          } else {
            response.send('Incorrect Email and/or Password!');
          }
          response.end();
        }
      );
    } else {
      response.send('Please enter Email and Password!');
      response.end();
    }
  });
});

module.exports = login_route;
