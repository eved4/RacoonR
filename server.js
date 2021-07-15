var express = require('express'),
  routes = require('./routes'),
  //  , user = require('./routes/user')
  https = require('https'),
  path = require('path');
var session = require('express-session');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');

const port = 3000;

// static files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/img'));

var registration = require('./routes/registration.js');

// set views
app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/registration', registration);

app.use('/register', registration);

app.post('/registration', function (req, res, next) {
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
  var sql = 'SELECT * FROM users WHERE email =?';
  db.query(sql, [inputData.Email], function (err, data, fields) {
    if (err) throw err;
    if (data.length > 1) {
      var msg = inputData.email_address + 'was already exist';
    } else if (inputData.confirm_password != inputData.password) {
      var msg = 'Password & Confirm Password is not Matched';
    } else {
      // save users data into database
      var sql = 'INSERT INTO users SET ?';
      db.query(sql, inputData, function (err, data) {
        if (err) throw err;
      });
      var msg = 'Your are successfully registered';
    }
    res.render('register', { alertMsg: msg });
  });
});

app.get('', (req, res) => {
  res.render('index');
});

app.get('/browse', (req, res) => {
  res.render('browse');
});

app.get('/account', (req, res) => {
  res.render('account');
});

app.get('/additem', (req, res) => {
  res.render('additem');
});

app.get('/browsewanted', (req, res) => {
  res.render('browsewanted');
});

app.get('/communities', (req, res) => {
  res.render('communities');
});

app.get('/community', (req, res) => {
  res.render('community');
});

app.get('/communityform', (req, res) => {
  res.render('communityform');
});

app.get('/eventpage', (req, res) => {
  res.render('eventpage');
});

app.get('/events', (req, res) => {
  res.render('events');
});

app.get('/indexloggedin', (req, res) => {
  res.render('indexloggedin');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/offeritem', (req, res) => {
  res.render('offeritem');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/wanteditem', (req, res) => {
  res.render('wanteditem');
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}!`);
});
