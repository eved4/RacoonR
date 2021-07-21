var express = require('express');
var indexloggedin_route = express.Router();

var mysql = require('mysql');
var connection = require('../database');

indexloggedin_route.get('/indexloggedin', function (req, res, next) {
  return res.render('indexloggedin');
});

module.exports = indexloggedin_route;
