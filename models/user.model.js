"use strict";
var dbConn = require("../config/db.config");

var User = function (user) {
  this.id = user.id;
  this.username = user.username;
  this.password = user.password;
};

User.registerAccount = function (newUser, result) {
  dbConn.query("INSERT INTO user set ?", newUser, function (err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      console.log(res.insertId);
      result(null, res.insertId);
    }
  });
};

User.login = function (loginCredentials, result) {
  const { username, password } = loginCredentials;
  dbConn.query(
    "SELECT id FROM user WHERE username = ? AND password = ?",
    [username, password],
    function (err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        console.log(res);
        result(null, res);
      }
    }
  );
};

module.exports = User;
