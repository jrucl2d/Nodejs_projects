var express = require("express");
var User = require("../schemas/user"); // user 모델

var router = express.Router();

/* GET home page. */
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find();
    res.locals.users = users;
    res.render("mongoose");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
