const express = require("express");
const db = require("../models");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [users, metadata] = await db.sequelize.query(`SELECT * FROM users;`);
    console.log(users);
    res.render("index", { users });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
