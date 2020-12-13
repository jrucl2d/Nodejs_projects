const express = require("express");
const router = express.Router();
const User = require("../schemas/user");

router.get("/", async (req, res, next) => {
  try {
    const users = await User.find({}); // 모든 것을 찾는 메소드
    res.render("index", { users });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
