const express = require("express");
const router = express();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { isLog, isNotLog } = require("../config/authCheck");
const User = require("../models/user");

// not gonna make kakao login
router.get("/kakao", (req, res, next) => {
  res.redirect("/");
});

// register post, only can register when not logged in
router.post("/register", isNotLog, async (req, res, next) => {
  const { email, nick, password, password2 } = req.body;
  if (password !== password2) {
    return res.redirect("/register?pwError=pwError");
  }
  try {
    const exUser = await User.findOne({ where: { email } }); // find if the user is already exists
    if (exUser) {
      return res.redirect("/register?error=exist");
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

// login post, only can login when not logged in
router.post("/login", isNotLog, (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    // from passport strategy, done(error,user,message)
    if (authError) {
      console.error(authError);
      return next(authError);
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

// logout get, only can logout when logged in
router.get("/logout", isLog, (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
