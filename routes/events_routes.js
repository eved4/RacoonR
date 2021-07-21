var express = require('express');
var events_route = express.Router();

var mysql = require('mysql');
var connection = require('../database');

events_route.get('/events', function (req, res, next) {
  return res.render('events');
});

module.exports = events_route;
