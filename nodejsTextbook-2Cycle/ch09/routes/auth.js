const router = require("express").Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { isNotLoggedIn, isLoggedIn } = require("./middlewares");

// 회원가입 라우터
router.post("/join", isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect("/join?error=exist");
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
    next(err);
  }
});

// 로그인
router.post("/login", isNotLoggedIn, (req, res, next) => {
  // 처음에 로그인 하면 local 까지가 실행됨 -> index.js의 local()을 보고 localStrategy를 실행
  passport.authenticate("local", (authErr, user, info) => {
    // localStrategy의 결과로 done(서버에러, 유저정보, 메시지)를 전달 받음
    if (authErr) {
      console.error(authErr);
      return next(authErr);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    // req.login을 실행하면 index.js의 serializeUser가 실행되면서 user의 id 정보를 세션에 넣음
    // 그 결과가 뒤의 콜백 함수이고, 여기서 마지막 처리
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect("/");
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 붙여줘야 함
});

// 로그아웃
router.get("/logout", isLoggedIn, (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});
module.exports = router;
