var express = require('express');
var browsewanted_route = express.Router();

var mysql = require('mysql');
var connection = require('../database');

browsewanted_route.get('/browsewanted', function (req, res, next) {
  return res.render('browsewanted');
});

module.exports = browsewanted_route;
