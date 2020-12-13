const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  // res.render("index");
  res.render("index2");
});

module.exports = router;
