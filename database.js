var mysql = require('mysql');
var bodyParser = require('body-parser');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'racoonr',
});

connection.connect();

global.db = connection;
