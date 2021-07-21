var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var bodyParser = require('body-parser');
const { Result } = require('express-validator');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'racoonr',
});

connection.connect();

db = connection;

// to display register form
router.get('/register', function (req, res, next) {
  res.render('register');
});

router.post('/register', function (req, res, next) {
  inputData = {
    FirstName: req.body.firstname,
    LastName: req.body.lastname,
    Email: req.body.email,
    UserName: req.body.username,
    City: req.body.city,
    PostCode: req.body.postcode,
    Country: req.body.country,
    Password: req.body.password,
    DateJoined: '2021-10-10',
  };

  // check unique email address
  db.query('SELECT * FROM users WHERE email =?', [inputData.Email], function (err, result) {
    if (err) {
      db.end();
      return console.log(err);
    }

    if (!result.length) {
      db.query('INSERT INTO users SET ?', inputData, function (err, result) {
        db.end();
        res.redirect('/browse');
      });
    } else {
      db.end();
      console.log(`Email already exists`);
      res.redirect('/events');
    }
  });
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
