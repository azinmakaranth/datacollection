const mysql = require('mysql');
//connection Variable
var con = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '123',
  database : 'heimdall'
});
var con_d = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '123',
  database : 'dsalt'
});
var con_dh = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '123',
  database : 'dataheimdall'
});

module.exports = {
  con,
  con_d,
  con_dh
};
