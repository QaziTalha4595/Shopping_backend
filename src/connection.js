const mysql = require('mysql');


const connection = mysql.createConnection({
    host: "localhost",
    database: "books-db",
    user: "root",
    password: ""
  });

  connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });