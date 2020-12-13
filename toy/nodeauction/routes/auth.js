const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");

const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const User = require("../models/user");
const { destroy } = require("../models/user");

router.post("/join", isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password, money } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect("/join?joinError=이미 가입된 회원입니다");
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
      money,
    });
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (authErr, user, info) => {
    if (authErr) {
      console.error(authErr);
      return next(authErr);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect("/");
    });
  })(req, res, next);
});

router.get("/logout", isLoggedIn, (req, res, next) => {
  req.logOut();
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
