const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { isAuth, isNotAuth } = require("../config/auth");
const passport = require("passport");
// 회원가입, 로그인은 로그인 하지 않은 경우(isNotAuth)에 접근 가능

// 회원가입 페이지
router.get("/register", isNotAuth, (req, res, next) => {
  res.render("register");
});
// 회원가입 post
router.post("/register", async (req, res, next) => {
  const { name, email, pw, pw2 } = req.body;

  let errors = [];
  if (!name || !email || !pw || !pw2) {
    errors.push({ msg: "모든 항목을 채워주십시오" });
  }
  if (pw !== pw2) {
    errors.push({ msg: "비밀번호가 일치하지 않습니다" });
  }
  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      pw,
      pw2,
    });
  } else {
    try {
      const exUser = await User.findOne({ where: { email } }); // 이미 존재하는지 찾아봄
      if (exUser) {
        errors.push({ msg: "이미 가입된 이메일입니다" });
        res.render("register", {
          errors,
          name,
          email,
          pw,
          pw2,
        });
      }
      const hash = await bcrypt.hash(pw, 12);
      await User.create({
        name,
        email,
        pw: hash,
      });
      req.flash("success_msg", "회원가입 성공!");
      res.redirect("login");
    } catch (err) {
      console.error(err);
      return next(err);
    }
  }
});

// 로그인 페이지
router.get("/login", isNotAuth, (req, res, next) => {
  res.render("login");
});
// 로그인 post
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      req.flash("fail_msg", info.message);
      return res.redirect("/user/login");
    }
    return req.login(user, (loginErr) => {
      if (loginErr) {
        console.error(err);
        return next(loginErr);
      }
      return res.redirect("/");
    });
  })(req, res, next);
});

// 로그아웃
router.get("/logout", isAuth, (req, res, next) => {
  req.logout();
  req.flash("success_msg", "로그아웃 성공!!");
  res.redirect("/");
});

module.exports = router;
