const mysql = require('mysql');
//connection Variable
var con = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'htconem8',
  database : 'heimdall'
});
var con_d = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'htconem8',
  database : 'dsalt'
});

var ord = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'htconem8',
  database : 'ord'
});
module.exports = {
  con,
  con_d,
  ord
};
