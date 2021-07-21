var express = require('express');
var communityform_route = express.Router();

var mysql = require('mysql');
var connection = require('../database');

communityform_route.get('/communityform', function (req, res, next) {
  return res.render('communityform');
});

module.exports = communityform_route;
