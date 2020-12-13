const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { User, Domain } = require("../models");
const { isLoggedIn } = require("./middlewares");

router.get("/", async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: (req.user && req.user.id) || null },
      include: { model: Domain }, // 가지고 있는 도메인을 포함한 채 가져옴
    });
    res.render("login", {
      user,
      domains: user && user.Domains, // 자동으로 s가 붙어서 그 안에 여러 Domain들이 존재함
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});
router.post("/domain", isLoggedIn, async (req, res, next) => {
  try {
    await Domain.create({
      UserId: req.user.id,
      host: req.body.host,
      type: req.body.type,
      clientSecret: uuidv4(),
      frontSecret: uuidv4(),
    });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
