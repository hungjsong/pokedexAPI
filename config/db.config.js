"use strict";
const mysql = require("mysql");
const dbConn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "pokedex",
});
dbConn.connect(function (err) {
  if (err) throw err;
  console.log("Database Connected!");
});

module.exports = dbConn;
