var express = require('express');
var browse_route = express.Router();

var mysql = require('mysql');
var connection = require('../database');

browse_route.get('/browse', function (req, res, next) {
  return res.render('browse');
});

// app.get('/browse', function (req, res) {
// if (request.session.loggedin) {
// response.send('Welcome back, ' + requestAnimationFrame.session.username + '!');
// } else {
//  response.send('Please login to view this page');
// }
// response.end();
// res.render('browse');
// });

module.exports = browse_route;
