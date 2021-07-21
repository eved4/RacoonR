var express = require('express');
var offeritem_route = express.Router();

var mysql = require('mysql');
var connection = require('../database');

offeritem_route.get('/offeritem', function (req, res, next) {
  return res.render('offeritem');
});

module.exports = offeritem_route;
