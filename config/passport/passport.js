var bCrypt = require('bcrypt-nodejs');

module.exports = function (passport, user) {
  var User = user;
  var LocalStrategy = require('passport-local').Strategy;

  passport.use(
    'local-signup',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true, // allows us to pass back the entire request to the callback
      },
      function (req, email, password, done) {
        var generateHash = function (password) {
          return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
        };

        User.findOne({
          where: {
            email: email,
          },
        }).then(function (user) {
          if (user) {
            return done(null, false, {
              message: 'That email is already taken',
            });
          } else {
            var userPassword = generateHash(password);
            var data = {
              email: email,
              password: userPassword,
              firstname: req.body.firstname,
              lastname: req.body.lastname,
            };

            User.create(data).then(function (newUser, created) {
              if (!newUser) {
                return done(null, false);
              }
              if (newUser) {
                return done(null, newUser);
              }
            });
          }
        });
      }
    )
  );
};

/*
app.use('/register', register);
app.use('/register', register);

app.post('/register', function (req, res, next) {
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
*/
