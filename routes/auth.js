var authController = require('../controllers/authcontroller.js');

module.exports = function (app, passport) {
  app.get('/register', authController.register);
  app.get('/login', authController.login);
  app.post(
    '/login',
    passport.authenticate('local-signup', {
      successRedirect: '/browseloggedin',

      failureRedirect: '/login',
    })
  );
};
