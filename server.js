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
  postcodes = require('node-postcodes.io'),
  path = require('path'),
  { check, validationResult } = require('express-validator'),
  NodeGeocoder = require('node-geocoder');
//passport = require('./config/passport/passport');

var NodeGeocoder = require('node-geocoder');
const maps_api_key = 'AIzaSyBTFcbros0cp5ZPj4Fg0eKvp8P1liXV0Ms';

const options = {
  provider: 'google',
  // Optional depending on the providers
  //fetch: customFetchImplementation,
  apiKey: maps_api_key, // Google
  formatter: null, // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

function successCallback(result) {
  console.log('<<<<<TAGGER>>>>');
  console.log('Location Found: ');
  console.log(result);
  console.log('<<<<<TAGGER>>>>');
  return result;
}

function failureCallback(error) {
  console.log('<<<<<TAGGER>>>>');
  console.error('Location not found.' + error);
  console.log('<<<<<TAGGER>>>>');
  return false;
}

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
// QUERY FOR FINDING USERS NEAR ME
// SELECT * FROM `users` WHERE ST_Distance(`users`.`GeoLocation`, (SELECT `GeoLocation` FROM `users` WHERE `users`.`UserID` = 1)) <= 0.1 AND `users`.`UserID` != 1

app.get('/browseloggedin', isLoggedIn, (req, res, next) => {
  var user = req.session.passport.user;
  var sql = "SELECT * FROM items WHERE Type='offering'";
  var usersql = `SELECT Type FROM users WHERE UserID =${user}`;
  db.query(usersql, function (err, typedata, fields) {
    if (err) throw err;
    db.query(sql, function (err, data, fields) {
      if (err) throw err;
      res.render('browseloggedin', { title: 'Item List', itemData: data, typeData: typedata });
    });
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

app.get('/browselogsort', isLoggedIn, (req, res, next) => {
  var user = req.session.passport.user;
  var sort = req.query.sort;
  if (sort == 'distance') {
    //var sql = `SELECT GeoLocation FROM users WHERE UserID=${req.session.passport.user}`;
    var sql = `SELECT items.*, users.GeoLocation, ST_Distance((SELECT Geolocation FROM users WHERE UserID = items.UserID), (SELECT GeoLocation FROM users WHERE users.UserID =${user})) AS TempField FROM items INNER JOIN users ON items.UserID = users.UserID WHERE items.UserID != ${user}  AND items.Type='offering' ORDER BY TempField`;
  }
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
//TODO

app.get('/browsemap', isLoggedIn, (req, res, next) => {
  var sql = `SELECT GeoLocation FROM users WHERE UserID=${req.session.passport.user}`;

  //var proxsql = `SELECT * FROM \`items\` WHERE ST_Distance((SELECT \`Geolocation\` FROM \`users\` WHERE \`UserID\` = \`items\`.\`UserID\`), (SELECT \`GeoLocation\` FROM \`users\` WHERE \`users\`.\`UserID\` = ${req.session.passport.user})) <= 0.1 AND \`items\`.\`UserID\` != ${req.session.passport.user}`;
  var proxsql = `SELECT items.*, users.GeoLocation FROM items INNER JOIN users ON items.UserID = users.UserID WHERE ST_Distance((SELECT \`Geolocation\` FROM \`users\` WHERE \`UserID\` = \`items\`.\`UserID\`), (SELECT \`GeoLocation\` FROM \`users\` WHERE \`users\`.\`UserID\` = ${req.session.passport.user})) <= 100 AND \`items\`.\`UserID\` != ${req.session.passport.user}  AND items.Type='offering'`;
  /*db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('browsemap', { title: 'Item List', itemData: data });
  });*/
  db.query(sql, function (err, userData, fields) {
    db.query(proxsql, function (err, itemData, fields) {
      if (err) throw err;
      res.render('browsemap', {
        title: 'Item List',
        itemData: itemData,
        userData: userData,
      });
    });
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

// SELECT * FROM `items` WHERE ST_Distance((SELECT `Geolocation` FROM `users` WHERE `UserID` = `items`.`UserID`), (SELECT `GeoLocation` FROM `users` WHERE `users`.`UserID` = 1)) <= 0.1 AND `items`.`UserID` != 1

app.get('/browsemap', isLoggedIn, (req, res, next) => {
  var sql = `SELECT GeoLocation FROM users WHERE UserID=${req.session.passport.user}`;
  //var proxsql = `SELECT * FROM \`items\` WHERE ST_Distance((SELECT \`Geolocation\` FROM \`users\` WHERE \`UserID\` = \`items\`.\`UserID\`), (SELECT \`GeoLocation\` FROM \`users\` WHERE \`users\`.\`UserID\` = ${req.session.passport.user})) <= 0.1 AND \`items\`.\`UserID\` != ${req.session.passport.user}`;
  var proxsql = `SELECT items.*, users.GeoLocation FROM items INNER JOIN users ON items.UserID = users.UserID WHERE ST_Distance((SELECT \`Geolocation\` FROM \`users\` WHERE \`UserID\` = \`items\`.\`UserID\`), (SELECT \`GeoLocation\` FROM \`users\` WHERE \`users\`.\`UserID\` = ${req.session.passport.user})) <= 0.1 AND \`items\`.\`UserID\` != ${req.session.passport.user}  AND items.Type='offering'`;
  /*db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('browsemap', { title: 'Item List', itemData: data });
  });*/
  db.query(sql, function (err, userData, fields) {
    db.query(proxsql, function (err, itemData, fields) {
      if (err) throw err;
      res.render('browsemap', {
        title: 'Item List',
        itemData: itemData,
        userData: userData,
      });
    });
  });
});

app.get('/browsewantedmap', isLoggedIn, (req, res, next) => {
  var sql = `SELECT GeoLocation FROM users WHERE UserID=${req.session.passport.user}`;
  //var proxsql = `SELECT * FROM \`items\` WHERE ST_Distance((SELECT \`Geolocation\` FROM \`users\` WHERE \`UserID\` = \`items\`.\`UserID\`), (SELECT \`GeoLocation\` FROM \`users\` WHERE \`users\`.\`UserID\` = ${req.session.passport.user})) <= 0.1 AND \`items\`.\`UserID\` != ${req.session.passport.user}`;
  var proxsql = `SELECT items.*, users.GeoLocation FROM items INNER JOIN users ON items.UserID = users.UserID WHERE ST_Distance((SELECT \`Geolocation\` FROM \`users\` WHERE \`UserID\` = \`items\`.\`UserID\`), (SELECT \`GeoLocation\` FROM \`users\` WHERE \`users\`.\`UserID\` = ${req.session.passport.user})) <= 0.1 AND \`items\`.\`UserID\` != ${req.session.passport.user} AND items.Type='wanted'`;
  /*db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('browsemap', { title: 'Item List', itemData: data });
  });*/
  db.query(sql, function (err, userData, fields) {
    db.query(proxsql, function (err, itemData, fields) {
      if (err) throw err;
      console.log(itemData);
      res.render('browsewantedmap', {
        title: 'Item List',
        itemData: itemData,
        userData: userData,
      });
    });
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
  if (sort == 'distance') {
    //var sql = `SELECT GeoLocation FROM users WHERE UserID=${req.session.passport.user}`;
    var sql = `SELECT items.*, users.GeoLocation, ST_Distance((SELECT Geolocation FROM users WHERE UserID = items.UserID), (SELECT GeoLocation FROM users WHERE users.UserID =${user})) AS TempField FROM items INNER JOIN users ON items.UserID = users.UserID WHERE items.UserID != ${user}  AND items.Type='wanted' ORDER BY TempField`;
  }
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
  [check('email', 'Email is not valid').isEmail().normalizeEmail()],
  passport.authenticate('local-login', {
    successRedirect: '/browseloggedin',
    failureRedirect: '/login',
    failureFlash: true,
  })
);

// REGISTER
app.get('/register', (req, res, next) => {
  return res.render('register');
});

//authenticate user
app.post(
  '/register',
  [check('email', 'Email is not valid').isEmail().normalizeEmail()],
  passport.authenticate('local-signup', {
    successRedirect: '/browseloggedin',
    failureRedirect: '/register',
    failureFlash: true,
  }),
  function (req, res) {
    console.log(res);
  }
);

// ACCOUNT

app.get('/account', isLoggedIn, (req, res, next) => {
  var user = req.session.passport.user;
  var sql = 'SELECT * FROM users WHERE UserID=?';
  var sqlitemsoffer = "SELECT * FROM items WHERE Type = 'offering' AND UserID=?";
  var sqlitemswanted = "SELECT * FROM items WHERE Type = 'wanted' AND UserID=?";
  var sqlevents =
    'SELECT * FROM events WHERE EventID IN (SELECT EventID FROM userfavouriteevent WHERE UserID=?)';
  var sqlnotifications =
    'SELECT notifications.CommunityID, notifications.NotificationID, notifications.UserID, notifications.Message, communities.CommunityName FROM notifications INNER JOIN communities ON communities.CommunityID=notifications.CommunityID';
  var sqlitemsfavourites =
    'SELECT * FROM items WHERE ItemID IN (SELECT ItemID FROM userfavouriteitem WHERE UserID=?)';
  var sqlcommunities =
    'SELECT * FROM communities WHERE CommunityID IN (SELECT CommunityID FROM communitymembers WHERE UserID=?)';
  var usersql = `SELECT Type FROM users WHERE UserID =${user}`;
  var events = `SELECT * FROM events WHERE Author =${user}`;
  db.query(sql, user, function (err, data, fields) {
    if (err) throw err;
    db.query(sqlitemsoffer, user, function (err, dataitems, fields) {
      if (err) throw err;
      db.query(sqlitemswanted, user, function (err, datawanteditems, fields) {
        if (err) throw err;
        db.query(sqlevents, user, function (err, dataevents, fields) {
          if (err) throw err;
          db.query(sqlnotifications, user, function (err, datanotifications, fields) {
            if (err) throw err;
            db.query(sqlitemsfavourites, user, function (err, dataitemsfav, fields) {
              if (err) throw err;
              db.query(sqlcommunities, user, function (err, datacommunities, fields) {
                if (err) throw err;
                db.query(usersql, user, function (err, datatype, fields) {
                  if (err) throw err;
                  db.query(events, user, function (err, datayourevents, fields) {
                    if (err) throw err;
                    res.render('account', {
                      userData: data,
                      itemData: dataitems,
                      itemwantedData: datawanteditems,
                      eventData: dataevents,
                      notificationData: datanotifications,
                      itemfavData: dataitemsfav,
                      communityData: datacommunities,
                      typeData: datatype,
                      youreventsData: datayourevents,
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

app.post('/changepassword', isLoggedIn, async function (req, res, next) {
  var inputData = {
    current: req.body.current,
    new: req.body.new,
    UserID: req.session.passport.user,
  };

  var sql = `SELECT * WHERE UserID = "${inputData.UserID}" AND FirstName = "${inputData.current}"`;
  var sqlnew = `UPDATE users SET  FirstName = "${inputData.new}" WHERE UserID = "${inputData.UserID}"`;

  db.query(sql, function (err, data, fields) {
    if (err) {
      console.log('failed');
      res.redirect('/account');
    }
    db.query(sqlnew, function (err, data, fields) {
      if (err) throw err;
      res.redirect('/account');
    });
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

app.post('/acceptrequest', isLoggedIn, async function (req, res, next) {
  var inputData = {
    NotificationID: req.body.notid,
    UserID: req.body.userid,
    CommunityID: req.body.commid,
    OwnerID: req.session.passport.user,
  };
  var ID = '00' + `${inputData.CommunityID}` + '0' + `${inputData.UserID}`;

  var sql = `DELETE FROM notifications WHERE NotificationID="${inputData.NotificationID}";`;
  db.query(
    `INSERT INTO communitymembers (ID, CommunityID, UserID, Date) VALUES ("${ID}", "${inputData.CommunityID}", "${inputData.UserID}", NOW());`
  );
  db.query(sql, function (err, data, fields) {
    if (err) {
      console.log('Already in this community');
    }
  });

  res.redirect('/account');
});

app.get('/deleteitems', isLoggedIn, (req, res, next) => {
  var ItemID = req.query.itemid;
  var sql = `DELETE FROM items WHERE ItemID = ?`;
  db.query(sql, ItemID, function (err, data, fields) {
    if (err) {
      console.log('You Item does not exist');
    }
    res.redirect('/account');
  });
});

app.get('/deleteevents', isLoggedIn, (req, res, next) => {
  var EventID = req.query.eventid;
  var sql = `DELETE FROM events WHERE ItemID = ?`;
  db.query(sql, EventID, function (err, data, fields) {
    if (err) {
      console.log('You event does not exist');
    }
    res.redirect('/account');
  });
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
  var cat = req.query.category;
  var locsql = `SELECT GeoLocation FROM users WHERE UserID = (SELECT UserID from items WHERE ItemID = "${topic}")`;
  var sql = `SELECT * FROM items WHERE ItemID = "${topic}"`;
  var catsql = `SELECT * FROM items WHERE Category = "${cat}" AND Type = 'offering' AND NOT ItemID = "${topic}" LIMIT 3`;
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    db.query(catsql, function (err, catdata, fields) {
      if (err) throw err;
      db.query(locsql, function (err, locdata, fields) {
        if (err) throw err;
        return res.render('offeritem', {
          topic: topic,
          itemData: data,
          catdata: catdata,
          locdata: locdata,
        });
      });
    });
  });
});

app.get('/offeritemloggedin', isLoggedIn, (req, res, next) => {
  var topic = req.query.itemid;
  var cat = req.query.category;
  var locsql = `SELECT GeoLocation FROM users WHERE UserID = (SELECT UserID from items WHERE ItemID = "${topic}")`;
  var sql = `SELECT * FROM items WHERE ItemID = "${topic}"`;
  var catsql = `SELECT * FROM items WHERE Category = "${cat}" AND Type = 'offering' AND NOT ItemID = "${topic}" LIMIT 3`;

  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    db.query(catsql, function (err, catdata, fields) {
      if (err) throw err;
      db.query(locsql, function (err, locdata, fields) {
        if (err) throw err;
        return res.render('offeritemloggedin', {
          topic: topic,
          itemData: data,
          catdata: catdata,
          locdata: locdata,
        });
      });
    });
  });
});

app.get('/offeritemloggedinfav', isLoggedIn, (req, res, next) => {
  var data = {
    ItemID: req.query.itemid,
    UserID: req.session.passport.user,
  };
  var ID = '00' + `${data.ItemID}` + '0' + `${data.UserID}`;
  var sql = `INSERT INTO userfavouriteitem (ID, ItemID, UserID, Date) VALUES ("${ID}", "${data.ItemID}", "${data.UserID}", NOW())`;
  db.query(sql, function (err, data, fields) {
    if (err) {
      console.log('You already like this');
    }
  });
});

app.get('/wanteditem', (req, res, next) => {
  var topic = req.query.itemid;
  var cat = req.query.category;
  var locsql = `SELECT GeoLocation FROM users WHERE UserID = (SELECT UserID from items WHERE ItemID = "${topic}")`;
  var sql = `SELECT * FROM items WHERE ItemID = "${topic}"`;
  var catsql = `SELECT * FROM items WHERE Category = "${cat}" AND Type = 'wanted' AND NOT ItemID = "${topic}" LIMIT 3`;

  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    db.query(catsql, function (err, catdata, fields) {
      if (err) throw err;
      db.query(locsql, function (err, locdata, fields) {
        if (err) throw err;
        return res.render('wanteditem', {
          topic: topic,
          itemData: data,
          catdata: catdata,
          locdata: locdata,
        });
      });
    });
  });
});

app.get('/wanteditemloggedin', isLoggedIn, (req, res, next) => {
  var topic = req.query.itemid;
  var cat = req.query.category;
  var locsql = `SELECT GeoLocation FROM users WHERE UserID = (SELECT UserID from items WHERE ItemID = "${topic}")`;
  var sql = `SELECT * FROM items WHERE ItemID = "${topic}"`;
  var catsql = `SELECT * FROM items WHERE Category = "${cat}" AND Type = 'wanted' AND NOT ItemID = "${topic}" LIMIT 3`;

  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    db.query(catsql, function (err, catdata, fields) {
      if (err) throw err;
      db.query(locsql, function (err, locdata, fields) {
        if (err) throw err;
        return res.render('wanteditemloggedin', {
          topic: topic,
          itemData: data,
          catdata: catdata,
          locdata: locdata,
        });
      });
    });
  });
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
  var sql = 'SELECT * FROM communities WHERE CommunityName COLLATE UTF8_GENERAL_CI LIKE ?';
  db.query(sql, search, function (err, data, fields) {
    if (err) throw err;
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
  var user = req.session.passport.user;
  var sql = 'SELECT * FROM communities';
  var usersql = `SELECT Type FROM users WHERE UserID =${user}`;
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    db.query(usersql, function (err, typedata, fields) {
      if (err) throw err;
      res.render('communitiesloggedin', {
        title: 'Community List',
        communityData: data,
        typeData: typedata,
      });
    });
  });
});

app.get('/communitieslogsort', (req, res, next) => {
  // var user = req.session.passport.user;
  var sort = req.query.sort;

  if (sort == 'distance') {
    //var sql = `SELECT GeoLocation FROM users WHERE UserID=${req.session.passport.user}`;
    var sql = `SELECT communities.*, users.GeoLocation, ST_Distance((SELECT Geolocation FROM users WHERE UserID = items.UserID), (SELECT GeoLocation FROM users WHERE users.UserID =${user})) AS TempField FROM communities INNER JOIN users ON communities.UserID = users.UserID WHERE communities.UserID != ${user} ORDER BY TempField`;
  }
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
  var sql = 'SELECT * FROM communities WHERE CommunityName COLLATE UTF8_GENERAL_CI LIKE ?';
  db.query(sql, search, function (err, data, fields) {
    if (err) throw err;
    res.render('communitiesloggedin', { title: 'Community List', communityData: data });
  });
});

app.get('/community', (req, res, next) => {
  var topic = req.query.communityid;
  var sql = 'SELECT * FROM communities WHERE CommunityID = ?;';
  db.query(sql, topic, function (err, data, fields) {
    if (err) throw err;
    return res.render('community', { communityData: data });
  });
});

app.get('/communityloggedin', isLoggedIn, (req, res, next) => {
  var topic = req.query.communityid;
  var userid = req.session.passport.user;
  var users = 'SELECT * FROM communitymembers WHERE UserID = ? AND CommunityID = ?';
  var sql = 'SELECT * FROM communities WHERE CommunityID = ?;';
  var sqlitems = 'SELECT * FROM communityitems WHERE CommunityID = ?;';
  db.query(users, [userid, topic], function (err, data, fields) {
    if (data.length === 0) {
      db.query(sql, topic, function (err, data, fields) {
        if (err) throw err;
        return res.render('communityloggedin', { communityData: data });
      });
    } else {
      db.query(sql, topic, function (err, data, fields) {
        if (err) throw err;
        db.query(sqlitems, topic, function (err, dataitems, fields) {
          if (err) throw err;
          return res.render('communityloggedinspecific', {
            communityData: data,
            communityitemsData: dataitems,
          });
        });
      });
    }
  });
});

app.get('/addcommunity', isLoggedIn, (req, res, next) => {
  return res.render('addcommunity');
});

app.get('/communities', (req, res, next) => {
  return res.render('communities');
});

app.post('/requestjoin', isLoggedIn, async function (req, res, next) {
  var inputData = {
    Message: req.body.message,
    UserID: req.session.passport.user,
    CommunityID: req.body.communityid,
  };

  db.query(
    `INSERT INTO notifications (CommunityID, UserID, Date, Message) VALUES ("${inputData.CommunityID}", "${inputData.UserID}",NOW(), "${inputData.Message}")`
  );
  res.redirect(`communityloggedin?communityid=${inputData.CommunityID}`);
});

app.get('/addcommunityitem', isLoggedIn, (req, res, next) => {
  var category = req.query.category;
  var id = req.query.communityid;
  return res.render('addcommunityitem', { category: category, id: id });
});

app.post('/addcommunityitem', isLoggedIn, async function (req, res, next) {
  let sampleFile;
  let uploadPath;

  var inputData = {
    Type: req.body.type,
    Title: req.body.title,
    Description: req.body.description,
    CommunityID: req.body.communityid,
    Category: req.body.category,
    Collection: req.body.collection,
    UserID: req.session.passport.user,
    Image: req.body.img,
  };

  sampleFile = inputData.Image;
  uploadPath = '/img/test/' + sampleFile;
  var message = `A new item '${inputData.Title}' has been added to the community '${inputData.Category}'`;

  db.query(
    `INSERT INTO communityitems (UserID, Type, Title, Description, Community, CommunityID, Collection, DateAdded, ImagePath) VALUES ("${inputData.UserID}", "${inputData.Type}", "${inputData.Title}", "${inputData.Description}","${inputData.Category}", "${inputData.CommunityID}", "${inputData.Collection}",NOW(), "${uploadPath}")`
  );
  db.query(
    `INSERT INTO notifications (CommunityID, UserID, Message, Date)  VALUES ("${inputData.CommunityID}", "${inputData.UserID}", "${message}", NOW())`
  );
  res.redirect(`communitiesloggedin?communityid=${inputData.CommunityID}`);
});

app.get('/communityitem', isLoggedIn, (req, res, next) => {
  var topic = req.query.itemid;
  var sql =
    'SELECT communityitems.UserID, users.Email, communityitems.ImagePath, communityitems.ItemID, communityitems.Title, communityitems.Description FROM communityitems INNER JOIN users ON users.UserID=communityitems.UserID WHERE ItemID=?';
  db.query(sql, topic, function (err, data, fields) {
    if (err) throw err;
    return res.render('communityitem', { topic: topic, itemData: data });
  });
});

// EVENTS
app.get('/event', (req, res, next) => {
  var topic = req.query.eventid;
  var sql = 'SELECT * FROM events WHERE EventID = ?;';
  db.query(sql, topic, function (err, data, fields) {
    if (err) throw err;
    return res.render('event', { eventData: data });
  });
});

app.get('/events', (req, res, next) => {
  var sql = 'SELECT * FROM events WHERE events.Date > NOW()';
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('events', { title: 'Event List', eventData: data });
  });
});

app.get('/eventsloggedin', isLoggedIn, (req, res, next) => {
  var user = req.session.passport.user;
  //var sql = `SELECT events.*, users.GeoLocation FROM events INNER JOIN users ON events.Author = users.UserID WHERE ST_Distance((SELECT Geolocation FROM users WHERE UserID = events.Author), (SELECT GeoLocation FROM users WHERE users.UserID = ${user})) <= 100 AND events.Author != ${user} AND events.Date >= NOW() ORDER BY events.Date`;
  var sql = `SELECT events.*, users.GeoLocation FROM events INNER JOIN users ON events.Author = users.UserID WHERE ST_Distance((SELECT Geolocation FROM users WHERE UserID = events.Author), (SELECT GeoLocation FROM users WHERE users.UserID = ${user})) <= 0.1 AND Date > NOW() ORDER BY Date`;
  var usersql = `SELECT Type FROM users WHERE UserID =${user}`;
  db.query(usersql, function (err, typedata, fields) {
    if (err) throw err;
    db.query(sql, function (err, data, fields) {
      if (err) throw err;
      res.render('eventsloggedin', { title: 'Event List', eventData: data, typeData: typedata });
    });
  });
});

app.get('/eventloggedin', isLoggedIn, (req, res, next) => {
  var topic = req.query.eventid;
  var sql = 'SELECT * FROM events WHERE EventID = ?;';
  db.query(sql, topic, function (err, data, fields) {
    if (err) throw err;
    return res.render('eventloggedin', { eventData: data });
  });
});

app.get('/eventloggedinfav', isLoggedIn, (req, res, next) => {
  var data = {
    EventID: req.query.eventid,
    UserID: req.session.passport.user,
  };
  var ID = '00' + `${data.EventID}` + '0' + `${data.UserID}`;
  var sql = `INSERT INTO userfavouriteevent (ID, EventID, UserID, Date) VALUES ("${ID}", "${data.EventID}", "${data.UserID}", NOW())`;
  db.query(sql, function (err, data, fields) {
    if (err) {
      console.log('You already like this');
    }
  });
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
