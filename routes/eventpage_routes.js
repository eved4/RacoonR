var express = require('express');
var eventpage_route = express.Router();

var mysql = require('mysql');
var connection = require('../database');

eventpage_route.get('/eventpage', function (req, res, next) {
  return res.render('eventpage');
});

module.exports = eventpage_route;
