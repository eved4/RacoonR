var express = require('express');
var account_route = express.Router();

var mysql = require('mysql');
var connection = require('../database');

account_route.get('/account', function (req, res, next) {
  return res.render('account');
});

module.exports = account_route;
