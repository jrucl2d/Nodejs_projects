const express = require("express");
const path = require("path");

const router = express.Router();

// 최초 환영 페이지.
router.get("/", (req, res, next) => {
  console.log(req.user);
  res.render("index", { user: req.user });
});

module.exports = router;
