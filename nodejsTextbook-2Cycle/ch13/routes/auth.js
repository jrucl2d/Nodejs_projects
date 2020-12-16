const router = require("express").Router();
const passport = require("passport");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

router.post("/join", isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password, money } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect("/join?joinError=이미 가입된 이메일입니다.");
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
    next(err);
  }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
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

router.get("/logout", isLoggedIn, (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
