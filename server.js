var express = require('express'),
  flash = require('connect-flash'),
  session = require('express-session'),
  mysql = require('mysql'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  User = require('./models/user'),
  LocalStrategy = require('passport-local').Strategy,
  env = require('dotenv').config(),
  uuid = require('uuid').v4,
  https = require('https'),
  bcrypt = require('bcrypt'),
  path = require('path');

var app = express();

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

const port = 3000;

// static files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/img'));

//require body parser to parse requests
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// For Passport
app.use(
  session({
    secret: 'a nusery of raccoons',
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}

// database connection
var mysql = require('mysql');
var bodyParser = require('body-parser');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'racoonr',
});

connection.connect();

db = connection;

// set views
app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// INDEX
app.get('/indexloggedin', isLoggedIn, (req, res, next) => {
  return res.render('indexloggedin');
});
app.get('', (req, res) => {
  res.render('index');
});

// BROWSE
app.get('/browseloggedin', isLoggedIn, (req, res, next) => {
  return res.render('browseloggedin');
});

app.get('/browse', (req, res, next) => {
  return res.render('browse');
});

app.get('/browsewanted', (req, res, next) => {
  return res.render('browsewanted');
});

// LOGIN
app.get('/login', (req, res, next) => {
  return res.render('login');
});

app.post('/login', function (request, response, next) {
  var email = request.body.email;
  var password = request.body.password;
  if (email && password) {
    var hashed = db.query('SELECT Password FROM users WHERE Email = ?', [email]);
    bcrypt.compare(password, hashed, function (err, res) {
      if (err) {
        // handle error
      }
      if (res) {
        request.session.loggedin = true;
        request.session.email = email;
        response.redirect('/browse');
      } else {
        response.send('Passwords do not match');
      }
    });
  } else {
    response.redirect('/login?e=' + encodeURIComponent('Incorrect username or password'));
    response.end();
  }
});

// REGISTER
app.get('/register', (req, res, next) => {
  return res.render('register');
});

app.post('/register', async function (req, res, next) {
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

  var user = inputData;

  // check unique email address
  db.query('SELECT * FROM users WHERE email =?', [inputData.Email], function (err, result) {
    if (err) {
      db.end();
      return console.log(err);
    }
    if (!result.length) {
      bcrypt.hash(user.Password, 10, function (err, hash) {
        if (err) console.log(err);
        user.Password = hash;
        console.log(user.password);
        db.query('INSERT INTO users SET ?', user, function (err) {
          //saves non-hashed password
          if (err) console.log(err);
          console.log('successfull');
          db.end();
          res.redirect('/browse');
        });
      });
    } else {
      db.end();
      console.log(`Email already exists`);
      res.redirect('/events');
    }
  });
});

// ACCOUNT
app.get('/account', isLoggedIn, (req, res, next) => {
  return res.render('account');
});

// ADD ITEM
app.get('/additem', isLoggedIn, (req, res, next) => {
  return res.render('additem');
});

// ITEMS
app.get('/offeritem', (req, res, next) => {
  return res.render('offeritem');
});

app.get('/wanteditem', (req, res, next) => {
  return res.render('wanteditem');
});

// COMMUNITIES
app.get('/community', (req, res, next) => {
  return res.render('community');
});

app.get('/communities', (req, res, next) => {
  return res.render('communities');
});

app.get('/communityform', isLoggedIn, (req, res, next) => {
  return res.render('communityform');
});

// EVENTS
app.get('/eventpage', (req, res, next) => {
  return res.render('eventpage');
});

app.get('/events', (req, res, next) => {
  return res.render('events');
});

const { response } = require('express');
// Models
var models = require('./models');

// Routes
var authRoute = require('./routes/auth.js')(app, passport);

//load passport strategies
require('./config/passport/passport.js')(passport, models.user);

//Sync Database
models.sequelize
  .sync()
  .then(function () {
    console.log('Nice! Database looks fine');
  })
  .catch(function (err) {
    console.log(err, 'Something went wrong with the Database Update!');
  });

// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

app.listen(port, () => {
  console.log(`Express server listening on port ${port}!`);
});
