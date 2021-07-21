var express = require('express');
var additem_route = express.Router();

var mysql = require('mysql');
var connection = require('../database');

additem_route.get('/additem', function (req, res, next) {
  return res.render('additem');
});

module.exports = additem_route;
