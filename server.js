'use strict';
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
  bcrypt = require('bcryptjs'),
  authRouter = require('./routes/auth'),
  path = require('path');
//passport = require('./config/passport/passport');

var app = express();
app.use(flash());
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
app.use(passport.session());

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    console.log('>>>SUCCESS<<<');
    return next();
  }
  console.log(req.isAuthenticated());
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

var db = connection;

app.use('/auth', authRouter);

// set views
app.set('views', './views');
app.set('view engine', 'ejs');

// Let's see what happens when this is commented
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());

// INDEX
app.get('/indexloggedin', (req, res, next) => {
  return res.render('indexloggedin');
});
app.get('', (req, res) => {
  res.render('index');
});

// BROWSE

app.get('/browseloggedin', isLoggedIn, (req, res, next) => {
  var sql = "SELECT * FROM items WHERE Type='offering'";
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('browseloggedin', { title: 'Item List', itemData: data });
  });
});

app.get('/browse', (req, res, next) => {
  var sql = "SELECT * FROM items WHERE Type='offering'";
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('browse', { title: 'Item List', itemData: data });
  });
});

app.get('/browsewanted', (req, res, next) => {
  var sql = "SELECT * FROM items WHERE Type='wanted'";
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('browsewanted', { title: 'User List', itemData: data });
  });
});

app.get('/browsewantedloggedin', isLoggedIn, (req, res, next) => {
  var sql = "SELECT * FROM items WHERE Type='wanted'";
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('browsewantedloggedin', { title: 'Item List', itemData: data });
  });
});

// LOGIN
app.get('/login', (req, res, next) => {
  return res.render('login');
});

app.get('/loginfailed', (req, res, next) => {
  return res.render('loginfailed');
});

//authenticate user
app.post(
  '/login',
  passport.authenticate('local-login', {
    successRedirect: '/browseloggedin',
    failureRedirect: '/login',
    failureFlash: true,
  })
);
/*
app.post('/login', async (req, res, next) => {
  var email = req.body.email;
  var password = req.body.password;
  const hash = await hashPassword(password);
  db.query('SELECT password FROM users WHERE Email = ?', [email], function (err, rows, fields) {
    if (err) {
      console.log('Failed to log in');
      throw err;
    }
    // if user not found
    if (rows.length <= 0) {
      req.flash('error', 'Email not found!');
      res.redirect('/loginfailed');
    } else {
      // if user found
      // render to views/user/edit.ejs template file
      //bcrypt.compare(password, )
      bcrypt.compare(password, rows[0].password, function (err, result) {
        if (err) {
          console.log('That is the wrang password');
          req.flash('error', 'Incorrect password');
        } else {
          console.log('IT WORKED!');
          req.session.loggedin = true;
          req.session.name = email;
          res.redirect('/browse');
        }
      });
    }
  });
});
*/

// REGISTER
app.get('/register', (req, res, next) => {
  return res.render('register');
});

//authenticate user
app.post(
  '/register',
  passport.authenticate('local-signup', {
    successRedirect: '/browseloggedin',
    failureRedirect: '/register',
    failureFlash: true,
  }),
  function (req, res) {
    console.log('EAT MY SHORTS');
    console.log(res);
  }
);

/*
// REGISTER
// TODO: Validate data and throw error for user if required fields are NULL
app.post('/register', async function (req, res, next) {
  var inputData = {
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
*/

// ACCOUNT
app.get('/account', isLoggedIn, (req, res, next) => {
  return res.render('account');
});

//display home page
app.get('/account', function (req, res, next) {
  if (req.session.loggedin) {
    res.render('auth/home', {
      title: 'Dashboard',
      name: req.session.name,
    });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/login');
  }
});
// Logout user
app.get('/logout', function (req, res) {
  req.session.destroy();
  req.flash('success', 'Login Again Here');
  res.redirect('/login');
});

// ADD ITEM
app.get('/additem', isLoggedIn, (req, res, next) => {
  return res.render('additem');
});

app.get('/additemsuccess', isLoggedIn, (req, res, next) => {
  return res.render('additemsuccess');
});

app.post('/additem', isLoggedIn, async function (req, res, next) {
  let sampleFile;
  let uploadPath;

  var inputData = {
    Type: req.body.type,
    Title: req.body.title,
    Description: req.body.description,
    Category: req.body.category,
    Collection: req.body.collection,
    UserID: req.session.passport.user,
    Image: req.body.img,
  };

  sampleFile = inputData.Image;
  uploadPath = '/img/test/' + sampleFile;

  console.log(sampleFile);
  console.log(uploadPath);

  db.query(
    `INSERT INTO items (UserID, Type, Title, Description, Category, Collection, DateAdded, ImagePath) VALUES ("${inputData.UserID}", "${inputData.Type}", "${inputData.Title}", "${inputData.Description}","${inputData.Category}","${inputData.Collection}",NOW(), "${uploadPath}")`
  );
  res.redirect('browseloggedin');
});

// ITEMS
app.get('/offeritem', (req, res, next) => {
  return res.render('offeritem');
});

app.get('/wanteditem', (req, res, next) => {
  return res.render('wanteditem');
});

app.get('/offeritemloggedin', isLoggedIn, (req, res, next) => {
  return res.render('offeritemloggedin');
});

app.get('/wanteditemloggedin', isLoggedIn, (req, res, next) => {
  return res.render('wanteditemloggedin');
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

app.get('/communityloggedin', isLoggedIn, (req, res, next) => {
  return res.render('communityloggedin');
});

app.get('/communitiesloggedin', isLoggedIn, (req, res, next) => {
  return res.render('communitiesloggedin');
});

// EVENTS
app.get('/eventpage', (req, res, next) => {
  return res.render('eventpage');
});

app.get('/events', (req, res, next) => {
  return res.render('events');
});

app.get('/eventpageloggedin', isLoggedIn, (req, res, next) => {
  return res.render('eventpageloggedin');
});

app.get('/eventsloggedin', isLoggedIn, (req, res, next) => {
  return res.render('eventsloggedin');
});

const { response } = require('express');
// Models
var models = require('./models');
// const { regexp } = require('sequelize/types/lib/operators');

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
