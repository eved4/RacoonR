var express = require('express');
var router = express.Router();
var db = require('../database');

// to display registration form
router.get('/register', function (req, res, next) {
  res.render('registration-form');
});

// connection.connect(function (err) {
// console.log('Connected!');
// var sql =
// "INSERT INTO events (EventName, Description, DateCreated, Author, Date, PostCode) VALUES ('Books needed for school library', 'Field School is looking for books for thier little library', '2008-11-11', 'Field Primary', '2008-11-11', 'NW33 0FF')";
// connection.query(sql, function (err, result) {
// if (err) throw err;
// console.log('1 record inserted yesssss');
// });
// });

// to store user input detail on post request
module.exports = router;
