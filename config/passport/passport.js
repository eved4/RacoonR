var bcrypt = require('bcryptjs');
var NodeGeocoder = require('node-geocoder');
const passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');

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

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'racoonr',
});

module.exports = function (passport) {
  // used to serialize the user for the session

  passport.serializeUser(function (user, done) {
    done(null, user.UserID);
  });

  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
    connection.query('SELECT * FROM users WHERE UserID = ? ', [id], function (err, rows) {
      done(err, rows[0]);
    });
  });

  passport.use(
    'local-signup',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true, // allows us to pass back the entire request to the callback
      },
      function (req, email, password, done) {
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        geocoder.geocode(req.body.postcode).then(function (result) {
          connection.query('SELECT * FROM users WHERE Email = ?', [email], function (err, rows) {
            if (err) return done(err);
            if (rows.length) {
              return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {
              // if there is no user with that username
              // create the user
              GeoLocation = `ST_PointFromText('POINT(${result[0].latitude} ${result[0].longitude})')`;
              //GeoLocation = `Point(${result[0].latitude} ${result[0].longitude})`;
              var newUserMysql = {
                FirstName: req.body.firstname,
                LastName: req.body.lastname,
                Email: req.body.email,
                City: req.body.city,
                PostCode: req.body.postcode,
                Country: req.body.country,
                Password: req.body.password,
                Type: req.body.type,
                DateJoined: new Date(),
                //username: username,
                //password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
              };
              bcrypt.hash(newUserMysql.Password, 10, function (err, hash) {
                if (err) console.log(err);
                else {
                  newUserMysql.Password = hash;
                  console.log(newUserMysql);
                  var insertQuery = `INSERT INTO users SET ?, \`GeoLocation\` = ${GeoLocation}`;
                  connection.query(insertQuery, newUserMysql, function (err, rows) {
                    //newUserMysql.id = rows.UserName;
                    if (err) {
                      console.log(this.sql);
                      return done(err);
                    } else {
                      connection.query(
                        'SELECT * FROM users WHERE Email = ?',
                        [email],
                        function (err, rows, fields) {
                          if (err) return done(err);
                          if (rows.length) {
                            console.log('>>>RETURNING USER<<<');
                            console.log(rows[0]);
                            return done(null, rows[0]);
                          }
                        }
                      );
                    }
                  });
                }
              });
            }
          });
        }, failureCallback);
      }
    )
  );

  passport.use(
    'local-login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true, // allows us to pass back the entire request to the callback
      },
      function (req, email, password, done) {
        connection.query(
          'SELECT * FROM users WHERE Email = ?',
          [email],
          function (err, rows, fields) {
            if (err) return done(err);
            if (rows.length) {
              bcrypt.compare(password, rows[0].Password, (err, result) => {
                if (err) {
                  console.log('That is the wrong password', rows[0]);
                  console.log(err, password);
                  return done(
                    null,
                    false,
                    req.flash(
                      'login-failed',
                      "Here's your password. SIKE, that's the wrong password!"
                    )
                  );
                } else if (result) {
                  req.session.loggedin = true;
                  req.session.name = email;
                  return done(null, rows[0]);
                } else {
                  console.log('PASSWORD FAILED');
                  console.log(result);
                  console.log(rows[0].Password);
                  console.log(password);
                  return done(
                    null,
                    false,
                    req.flash(
                      'login-failed',
                      "Here's your password. SIKE, that's the wrong password!"
                    )
                  );
                }
              });
            }
          }
        );
      }
    )
  );
};
