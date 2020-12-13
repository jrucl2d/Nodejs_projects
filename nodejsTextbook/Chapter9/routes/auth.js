const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { User } = require("../models");
const router = express.Router();

// 회원가입 : join.pug에서 auth/join으로 보내므로 우선 이 곳에서 잡힌다.
router.post("/join", isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body; // join.pug에서 email, nick, pw 순서대로 보낸다. name에 적힌대로 보낸다.
  try {
    const exUser = await User.findOne({ where: { email } }); // User에서 이미 가입한 사람이 존재하는지 확인
    if (exUser) {
      req.flash("joinError", "이미 가입된 이메일입니다."); // 이미 가입되었다고 경고 flash 날림
      return res.redirect("/join"); // 다시 회원가입 페이지(pug)로 돌려보낸다.
    }
    const hash = await bcrypt.hash(password, 12); // 비밀번호 암호화. 두 번째 인자는 반복횟수와 유사한 행동. 너무 크면 시간 오래걸림. 12 이상, 최대 31
    await User.create({
      email, // email: email
      nick, // nick: nick
      password: hash, // pw는 해시를 거친 hash 값으로 저장
    });
    return res.redirect("/"); // 다시 초기 페이지로 돌려보냄
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

// 로그인 안 된 상태인데 로그인 폼에 써서 submit하면 join/login에서 여기로 보내짐
router.post("/login", isNotLoggedIn, (req, res, next) => {
  // 미들웨어 안에 또 미들웨어가 있다. 사용자 정의 기능 추가하고 싶을 때 이렇게 사용.
  // 전략 파일은 따로 작성한다. 전략이 성공하거나 오류되면 콜백함수가 실행됨. 첫 인자가 있다면 실패. 두 번째 인자가 있다면 성공, req.login 메소드 호출.
  // passport가 알아서 추가해 놓은 req.login 메소드가 passport.serializeUser를 호출함. passport/index.js에 작성해 놓은 것.
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      req.flash("loginError", info.message); // 전략은 성공했으나 해당 유저가 없다.
      return res.redirect("/");
    }
    return req.login(user, (loginError) => {
      // 전략에도 성공하고 해당 유저도 존재하면 req.login 메소드를 호출. 유저 정보, 에러 시의 콜백함수를 넘김
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect("/"); // 로그인이 성공되면 layout.pug에서 user가 존재하므로 로그인 된 화면이 나오게 된다.
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙여준다.
});

// layout.pug에서 로그아웃 버튼을 누르면 auth/logout로 넘어옴
router.get("/logout", isLoggedIn, (req, res) => {
  req.logout(); // req.user 객체를 제거한다.
  req.session.destroy(); // req.session 객체 내의 정보도 삭제.
  res.redirect("/"); // 메인 페이지로 되돌ㄹ아감.
});

// 카카오 인증 결과 콜백 처리
// layout.pug에서 카카오 로그인 하면 /auth/kakao로 이동되고, GET /auth/kakao에서 카카오 로그인 차으로 리다이렉트 한다.
// 그 결과를 GET /auth/kakao/callback으로 받고 로그인 전략 수행. 그러나 콜백함수를 제공하지 않는 차이점이 있다.
// 카카오 로그인은 내부적으로 req.login을 호출하기 때문. 대신 로그인 실패시 이동 위치와 성공시 이동 위치를 명시해줌.
router.get("/kakao", passport.authenticate("kakao"));

router.get(
  "/kakao/callback",
  passport.authenticate("kakao", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

module.exports = router;
