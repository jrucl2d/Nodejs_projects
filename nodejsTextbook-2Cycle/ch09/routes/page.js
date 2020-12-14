const User = require("../models/User");
const Post = require("../models/Post");
const { Hashtag } = require("../models");

const router = require("express").Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerIdList = req.user
    ? req.user.Followings.map((f) => f.id)
    : [];
  next();
});

router.get("/profile", (req, res, next) => {
  res.render("profile", { title: "프로필" });
});

router.get("/join", (req, res, next) => {
  res.render("join", { title: "회원가입" });
});

router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ["id", "nick"],
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("main", {
      title: "껄껄북",
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 해시태그 검색. GET /hashtag?hashtag=뭐뭐
router.get("/hashtag", async (req, res, next) => {
  const query = decodeURIComponent(req.query.hashtag);
  if (!query) {
    return res.redirect("/");
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({
        include: [{ model: User, attributes: ["id", "nick"] }],
      });
    }
    return res.render("main", {
      title: `${query} 검색 결과` || "껄껄북",
      twits: posts,
    });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
