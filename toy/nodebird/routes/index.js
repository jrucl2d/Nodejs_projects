const express = require("express");
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const db = require("../models/index");
const { Hashtag, Post, User } = require("../models/");

// 우선 initial 값으로 초기화
router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerIdList = req.user
    ? req.user.Followings.map((f) => f.id)
    : [];
  next();
});
router.get("/profile", isLoggedIn, async (req, res, next) => {
  res.render("profile", { title: "내정보-nodebird" });
});

router.get("/join", isNotLoggedIn, async (req, res, next) => {
  res.render("join", { title: "회원기압-nodebird" });
});

router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "nick"],
          as: "Liker",
        },
        {
          model: User,
          attributes: ["id", "nick"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    // posts안에 여러 post들이 들어있고, 그 안에 각각 Liker을 갖는다. Liker가 배열 형태로 나오므로 Liker[n]의 id가 바로 좋아요 누른 사람이다.
    // console.log(posts[n].Liker[m].id);
    let isLiker = []; // 현재 로그인 한 유저가 가지고 있는 좋아요 누른 글을 파악
    posts.forEach((liker) => {
      liker.Liker.forEach((v) => {
        if (req.user && v.id === req.user.id) {
          isLiker.push(liker.id); // 현재 글의 아이디를 저장
        }
      });
    });
    console.log(isLiker);

    res.render("main", {
      title: "NodeBird",
      twits: posts,
      isLiker,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/hashtag", async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    res.redirect("/");
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }
    return res.render("main", {
      title: `${query} || Nodebird`,
      user: req.user,
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
