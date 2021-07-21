var express = require('express');
var communities_route = express.Router();

var mysql = require('mysql');
var connection = require('../database');

communities_route.get('/communities', function (req, res, next) {
  return res.render('communities');
});

module.exports = communities_route;
