module.exports = function (sequelize, Sequelize) {
  var User = sequelize.define('user', {
    UserName: {
      primaryKey: true,
      type: Sequelize.INTEGER,
    },

    FirstName: {
      type: Sequelize.STRING,
      notEmpty: true,
    },

    LastName: {
      type: Sequelize.STRING,
      notEmpty: true,
    },

    City: {
      type: Sequelize.TEXT,
    },

    Email: {
      type: Sequelize.STRING,
      validate: {
        isEmail: true,
      },
    },

    Password: {
      type: Sequelize.STRING,
    },

    DateJoined: {
      type: Sequelize.DATE,
    },

    Country: {
      type: Sequelize.STRING,
    },

    PostCode: {
      type: Sequelize.STRING,
    },
  });

  return User;
};
