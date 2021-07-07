const mysql = require('mysql2');

const dbConnection = mysql.createPool({
  host: 'localhost',
  user: 'eved',
  password: 'racoonr',
  database: 'racoonr',
});

module.exports = dbConnection.promise();
