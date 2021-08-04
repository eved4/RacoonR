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

app.get('/browselogcat', (req, res, next) => {
  var cat = req.query.cat;
  var sql = "SELECT * FROM items WHERE Type= 'offering' AND Category = ?";
  db.query(sql, cat, function (err, data, fields) {
    if (err) throw err;
    res.render('browseloggedin', { title: 'Item List', itemData: data });
  });
});

app.get('/browselogsort', (req, res, next) => {
  // var user = req.session.passport.user;
  var sort = req.query.sort;
  if (sort == 'atoz') {
    var sql = "SELECT * FROM items WHERE Type='offering' ORDER BY Title";
  }
  if (sort == 'ztoa') {
    var sql = "SELECT * FROM items WHERE Type='offering' ORDER BY Title desc";
  }
  if (sort == 'date') {
    var sql = "SELECT * FROM items WHERE Type='offering' ORDER BY (DateAdded)";
  }
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

app.get('/browsesort', (req, res, next) => {
  // var user = req.session.passport.user;
  var sort = req.query.sort;
  if (sort == 'atoz') {
    var sql = "SELECT * FROM items WHERE Type='offering' ORDER BY Title";
  }
  if (sort == 'ztoa') {
    var sql = "SELECT * FROM items WHERE Type='offering' ORDER BY Title desc";
  }
  if (sort == 'date') {
    var sql = "SELECT * FROM items WHERE Type='offering' ORDER BY (DateAdded)";
  }
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('browse', { title: 'Item List', itemData: data });
  });
});

app.post('/searchbrowselog', (req, res, next) => {
  var s = req.body.search;
  var search = `%${s}%`;
  var sql = "SELECT * FROM items WHERE Type = 'offering' AND Title COLLATE UTF8_GENERAL_CI LIKE ?";
  db.query(sql, search, function (err, data, fields) {
    if (err) throw err;
    res.render('browseloggedin', { title: 'Item List', itemData: data });
  });
});

app.get('/browsecat', (req, res, next) => {
  var cat = req.query.cat;
  var sql = "SELECT * FROM items WHERE Type= 'offering' AND Category = ?";
  db.query(sql, cat, function (err, data, fields) {
    if (err) throw err;
    res.render('browse', { title: 'Item List', itemData: data });
  });
});

app.get('/browsecoll', (req, res, next) => {
  var coll = req.query.coll;
  var sql = "SELECT * FROM items WHERE Type= 'offering' AND Collection = ?";
  db.query(sql, coll, function (err, data, fields) {
    if (err) throw err;
    res.render('browse', { title: 'Item List', itemData: data });
  });
});

app.post('/searchbrowse', (req, res, next) => {
  var s = req.body.search;
  var search = `%${s}%`;
  var sql = "SELECT * FROM items WHERE Type = 'offering' AND Title COLLATE UTF8_GENERAL_CI LIKE ?";
  db.query(sql, search, function (err, data, fields) {
    if (err) throw err;
    res.render('browse', { title: 'Item List', itemData: data });
  });
});

app.get('/browsewanted', (req, res, next) => {
  var sql = "SELECT * FROM items WHERE Type='wanted'";
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('browsewanted', { title: 'Item List', itemData: data });
  });
});

app.post('/searchbrowsewanted', (req, res, next) => {
  var s = req.body.search;
  var search = `%${s}%`;
  var sql = "SELECT * FROM items WHERE Type = 'wanted' AND Title COLLATE UTF8_GENERAL_CI LIKE ?";
  db.query(sql, search, function (err, data, fields) {
    if (err) throw err;
    res.render('browsewanted', { title: 'Item List', itemData: data });
  });
});

app.get('/browsewantedsort', (req, res, next) => {
  // var user = req.session.passport.user;
  var sort = req.query.sort;
  if (sort == 'atoz') {
    var sql = "SELECT * FROM items WHERE Type='wanted' ORDER BY Title";
  }
  if (sort == 'ztoa') {
    var sql = "SELECT * FROM items WHERE Type='wanted' ORDER BY Title desc";
  }
  if (sort == 'date') {
    var sql = "SELECT * FROM items WHERE Type='wanted' ORDER BY (DateAdded)";
  }
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('browsewanted', { title: 'Item List', itemData: data });
  });
});

app.get('/browsewantedcat', (req, res, next) => {
  var cat = req.query.cat;
  var sql = "SELECT * FROM items WHERE Type= 'wanted' AND Category = ?";
  db.query(sql, cat, function (err, data, fields) {
    if (err) throw err;
    res.render('browsewanted', { title: 'Item List', itemData: data });
  });
});

app.get('/browsewantedcoll', (req, res, next) => {
  var coll = req.query.coll;
  var sql = "SELECT * FROM items WHERE Type= 'wanted' AND Collection = ?";
  db.query(sql, coll, function (err, data, fields) {
    if (err) throw err;
    res.render('browsewanted', { title: 'Item List', itemData: data });
  });
});

app.get('/browsewantedloggedin', isLoggedIn, (req, res, next) => {
  var sql = "SELECT * FROM items WHERE Type='wanted'";
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('browsewantedloggedin', { title: 'Item List', itemData: data });
  });
});

app.get('/browsewantedlogsort', (req, res, next) => {
  // var user = req.session.passport.user;
  var sort = req.query.sort;
  if (sort == 'atoz') {
    var sql = "SELECT * FROM items WHERE Type='wanted' ORDER BY Title";
  }
  if (sort == 'ztoa') {
    var sql = "SELECT * FROM items WHERE Type='wanted' ORDER BY Title desc";
  }
  if (sort == 'date') {
    var sql = "SELECT * FROM items WHERE Type='wanted' ORDER BY (DateAdded)";
  }
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('browsewantedloggedin', { title: 'Item List', itemData: data });
  });
});

app.get('/browsewantedlogcat', (req, res, next) => {
  var cat = req.query.cat;
  var sql = "SELECT * FROM items WHERE Type= 'wanted' AND Category = ?";
  db.query(sql, cat, function (err, data, fields) {
    if (err) throw err;
    res.render('browsewantedloggedin', { title: 'Item List', itemData: data });
  });
});

app.get('/browsewantedlogcoll', (req, res, next) => {
  var coll = req.query.coll;
  var sql = "SELECT * FROM items WHERE Type= 'wanted' AND Collection = ?";
  db.query(sql, coll, function (err, data, fields) {
    if (err) throw err;
    res.render('browsewantedloggedin', { title: 'Item List', itemData: data });
  });
});

app.post('/searchbrowsewantedlog', (req, res, next) => {
  var s = req.body.search;
  var search = `%${s}%`;
  var sql = "SELECT * FROM items WHERE Type = 'wanted' AND Title COLLATE UTF8_GENERAL_CI LIKE ?";
  db.query(sql, search, function (err, data, fields) {
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
  var user = req.session.passport.user;
  var sql = 'SELECT * FROM users WHERE UserID=?';
  db.query(sql, user, function (err, data, fields) {
    if (err) throw err;
    res.render('account', { userData: data });
  });
});

app.post('/accountgeneral', isLoggedIn, async function (req, res, next) {
  var inputData = {
    City: req.body.city,
    PostCode: req.body.postcode,
    Country: req.body.country,
    Email: req.body.email,
    FirstName: req.body.firstname,
    LastName: req.body.lastname,
    UserID: req.session.passport.user,
  };

  db.query(
    `UPDATE users SET City = "${inputData.City}", PostCode ="${inputData.PostCode}", Country ="${inputData.Country}", Email ="${inputData.Email}", FirstName = "${inputData.FirstName}", LastName = "${inputData.LastName}" WHERE UserID = "${inputData.UserID}"`
  );
  res.redirect('/account');
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

  db.query(
    `INSERT INTO items (UserID, Type, Title, Description, Category, Collection, DateAdded, ImagePath) VALUES ("${inputData.UserID}", "${inputData.Type}", "${inputData.Title}", "${inputData.Description}","${inputData.Category}","${inputData.Collection}",NOW(), "${uploadPath}")`
  );
  res.redirect('browseloggedin');
});

// ITEMS
app.get('/offeritem', (req, res, next) => {
  var topic = req.query.itemid;
  var sql = 'SELECT * FROM items WHERE ItemID = ?;';
  db.query(sql, topic, function (err, data, fields) {
    if (err) throw err;
    console.log(data);
    return res.render('offeritem', { topic: topic, itemData: data });
  });
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

app.get('/communities', (req, res, next) => {
  var sql = 'SELECT * FROM communities';
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('communities', { title: 'Community List', communityData: data });
  });
});

app.get('/communitiessort', (req, res, next) => {
  // var user = req.session.passport.user;
  var sort = req.query.sort;
  if (sort == 'atoz') {
    var sql = 'SELECT * FROM communities ORDER BY CommunityName';
  }
  if (sort == 'ztoa') {
    var sql = 'SELECT * FROM communities ORDER BY CommunityName desc';
  }
  if (sort == 'date') {
    var sql = 'SELECT * FROM communities ORDER BY (DateCreated)';
  }
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('communities', { title: 'Community List', communityData: data });
  });
});

app.get('/communitiescat', (req, res, next) => {
  var cat = req.query.cat;
  var sql = 'SELECT * FROM communities WHERE Category = ?';
  db.query(sql, cat, function (err, data, fields) {
    if (err) throw err;
    res.render('communities', { title: 'Community List', communityData: data });
  });
});

app.post('/searchcom', (req, res, next) => {
  var s = req.body.search;
  var search = `%${s}%`;
  console.log(search);
  var sql = 'SELECT * FROM communities WHERE CommunityName COLLATE UTF8_GENERAL_CI LIKE ?';
  db.query(sql, search, function (err, data, fields) {
    if (err) throw err;
    console.log(search);
    res.render('communities', { title: 'Community List', communityData: data });
  });
});

app.post('/addcommunity', isLoggedIn, async function (req, res, next) {
  let sampleFile;
  let uploadPath;

  var inputData = {
    Name: req.body.name,
    Description: req.body.description,
    Category: req.body.category,
    UserID: req.session.passport.user,
  };

  uploadPath = '/img/categories/' + inputData.Category + '.jpg';

  db.query(
    `INSERT INTO communities (UserID, CommunityName, Description, Category, DateCreated, CommunityImg) VALUES ("${inputData.UserID}", "${inputData.Name}", "${inputData.Description}","${inputData.Category}",NOW(), "${uploadPath}")`
  );
  res.redirect('communitiesloggedin');
});

app.get('/communitiesloggedin', isLoggedIn, (req, res, next) => {
  var sql = 'SELECT * FROM communities';
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('communitiesloggedin', { title: 'Community List', communityData: data });
  });
});

app.get('/communitieslogsort', (req, res, next) => {
  // var user = req.session.passport.user;
  var sort = req.query.sort;
  if (sort == 'atoz') {
    var sql = 'SELECT * FROM communities ORDER BY CommunityName';
  }
  if (sort == 'ztoa') {
    var sql = 'SELECT * FROM communities ORDER BY CommunityName desc';
  }
  if (sort == 'date') {
    var sql = 'SELECT * FROM communities ORDER BY (DateCreated)';
  }
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('communitiesloggedin', { title: 'Community List', communityData: data });
  });
});

app.get('/communitieslogcat', (req, res, next) => {
  var cat = req.query.cat;
  var sql = 'SELECT * FROM communities WHERE Category = ?';
  db.query(sql, cat, function (err, data, fields) {
    if (err) throw err;
    res.render('communitiesloggedin', { title: 'Community List', communityData: data });
  });
});

app.post('/searchcomlog', (req, res, next) => {
  var s = req.body.search;
  var search = `%${s}%`;
  console.log(search);
  var sql = 'SELECT * FROM communities WHERE CommunityName COLLATE UTF8_GENERAL_CI LIKE ?';
  db.query(sql, search, function (err, data, fields) {
    if (err) throw err;
    console.log(search);
    res.render('communitiesloggedin', { title: 'Community List', communityData: data });
  });
});

app.get('/community', (req, res, next) => {
  var topic = req.query.communityid;
  var sql = 'SELECT * FROM communities WHERE CommunityID = ?;';
  db.query(sql, topic, function (err, data, fields) {
    if (err) throw err;
    console.log(data);
    return res.render('community', { communityData: data });
  });
});

app.get('/addcommunity', isLoggedIn, (req, res, next) => {
  return res.render('addcommunity');
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

// EVENTS
app.get('/event', (req, res, next) => {
  var topic = req.query.eventid;
  var sql = 'SELECT * FROM events WHERE EventID = ?;';
  db.query(sql, topic, function (err, data, fields) {
    if (err) throw err;
    console.log(data);
    return res.render('event', { eventData: data });
  });
});

app.get('/events', (req, res, next) => {
  var sql = 'SELECT * FROM events';
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('events', { title: 'Event List', eventData: data });
  });
});

app.get('/eventsloggedin', (req, res, next) => {
  var sql = 'SELECT * FROM events';
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('events', { title: 'Event List', eventData: data });
  });
});

app.get('/eventloggedin', isLoggedIn, (req, res, next) => {
  return res.render('eventloggedin');
});

app.get('/addevent', isLoggedIn, (req, res, next) => {
  return res.render('addevent');
});

app.post('/addevent', isLoggedIn, async function (req, res, next) {
  var inputData = {
    Name: req.body.name,
    Description: req.body.description,
    Collection: req.body.collection,
    UserID: req.session.passport.user,
    Date: req.body.date,
    PostCode: req.body.postcode,
  };

  db.query(
    `INSERT INTO events (EventName, Description, DateCreated, Author, Date, PostCode) VALUES ("${inputData.Name}", "${inputData.Description}",NOW(), "${inputData.UserID}", "${inputData.Date}", "${inputData.PostCode}")`
  );
  res.redirect('eventsloggedin');
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
