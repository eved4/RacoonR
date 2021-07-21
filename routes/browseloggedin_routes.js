var express = require('express');
var browseloggedin_route = express.Router();

var mysql = require('mysql');
var connection = require('../database');

browseloggedin_route.get('/browseloggedin', function (req, res, next) {
  return res.render('browseloggedin');
});

module.exports = browseloggedin_route;
