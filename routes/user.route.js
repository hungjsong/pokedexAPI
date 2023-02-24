const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.get("/", function (req, res) {
  res.send("user page");
});

router.post("/registerAccount", userController.registerAccount);

router.post("/login", userController.login);

module.exports = router;
