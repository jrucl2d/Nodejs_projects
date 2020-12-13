const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { Post, User } = require("../models");

const router = express.Router();

router.get("/profile", isLoggedIn, (req, res) => {
  // 자기 프로필은 로그인을 했어야 볼 수 있으므로 중간에 확인한다.
  res.render("profile", { title: "내정보 - NodeBird", user: req.user }); // req.user은 세션에 저장되어 있는 로그인된 유저의 아이디이다.
});
router.get("/join", isNotLoggedIn, (req, res) => {
  // 회원가입 페이지는 로그인을 안 했어야 볼 수 있다.
  res.render("join", {
    title: "회원가입 - NodeBird",
    user: req.user,
    joinError: req.flash("joinError"), // req.flash('메시지') joinError을 변수로 사용해서 템플릿에서 joinError을 표시해줄 수 있다.
  });
});

router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      // 우선 게시글을 모두 찾음
      include: {
        model: User,
        attributes: ["id", "nick"],
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("main", {
      title: "NodeBird",
      twits: posts, // twits에 찾은 게시글을 넣어서 렌더링
      user: req.user,
      loginError: req.flash("loginError"),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
