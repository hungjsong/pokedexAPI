"use strict";
const User = require("../models/User.model");

exports.registerAccount = function (req, res) {
  const newUser = new User(req.body);
  if (req.body.constructor === Object && Object.keys(req.body).length < 2) {
    res
      .status(400)
      .send({ error: true, message: "Please provide all required field" });
  } else {
    User.registerAccount(newUser, function (err, user) {
      if (err) {
        res.send(err);
      } else {
        res.json({
          error: false,
          message: "user added successfully!",
          data: user,
        });
      }
    });
  }
};

exports.login = function (req, res) {
  const loginCredentials = new User(req.body);
  User.login(loginCredentials, function (err, user) {
    if (err) res.send(err);
    if (user.length === 0) {
      res.json({
        error: false,
        message: "Login failed",
        data: user,
      });
    } else {
      res.json({
        error: false,
        message: "Login successful",
        data: user,
      });
    }
  });
};
