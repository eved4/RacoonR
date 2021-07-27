var bcrypt = require('bcryptjs');
const passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'racoonr',
});

module.exports = function (passport) {
  // used to serialize the user for the session

  passport.serializeUser(function (user, done) {
    console.log('>>>SERIALIZER<<<');
    console.log(user);
    done(null, user.UserID);
  });

  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
    connection.query('SELECT * FROM users WHERE UserID = ? ', [id], function (err, rows) {
      console.log('>>>DE-SERIALIZER<<<');
      console.log(rows[0]);
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
        connection.query('SELECT * FROM users WHERE Email = ?', [email], function (err, rows) {
          if (err) return done(err);
          if (rows.length) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
          } else {
            // if there is no user with that username
            // create the user
            var newUserMysql = {
              FirstName: req.body.firstname,
              LastName: req.body.lastname,
              Email: req.body.email,
              City: req.body.city,
              PostCode: req.body.postcode,
              Country: req.body.country,
              Password: req.body.password,
              DateJoined: '2021-10-10', // TODO: Change this to current data, I'm sure it's possible
              //username: username,
              //password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
            };
            bcrypt.hash(newUserMysql.Password, 10, function (err, hash) {
              if (err) console.log(err);
              else {
                newUserMysql.Password = hash;
                var insertQuery = 'INSERT INTO users SET ?';

                connection.query(insertQuery, newUserMysql, function (err, rows) {
                  //newUserMysql.id = rows.UserName;
                  return done(null, rows[0]);
                });
              }
            });
          }
        });
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
                  console.log('That is the wrang password', rows[0]);
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
                  console.log('>>>>HAZAAA<<<<');
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
