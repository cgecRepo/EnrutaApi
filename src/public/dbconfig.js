'use strict';
const mysql = require('mysql');

//local mysql db connection
const dbConn = mysql.createConnection({
  host: "localhost",       // localhost
  user: "enrutale_root",            // root & enrutale_carlos
  database: "enrutale_enruta_db",   // enruta_db & enrutale_enruta_db
  password: "W2Bfuvh{H-5k",        // 9776 & W2Bfuvh{H-5k
  port: 3306
});

dbConn.connect(function(err) {
  //if (err) throw err;
  console.log("Database Connected!");
});

module.exports = dbConn;