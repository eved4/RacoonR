var express = require('express');
var wanteditem_route = express.Router();

var mysql = require('mysql');
var connection = require('../database');

wanteditem_route.get('/wanteditem', function (req, res, next) {
  return res.render('wanteditem');
});

module.exports = wanteditem_route;
