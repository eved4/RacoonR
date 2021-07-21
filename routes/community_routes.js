var express = require('express');
var community_route = express.Router();

var mysql = require('mysql');
var connection = require('../database');

community_route.get('/community', function (req, res, next) {
  return res.render('community');
});

module.exports = community_route;
