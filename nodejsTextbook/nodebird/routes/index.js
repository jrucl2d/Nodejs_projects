const express = require("express");
const router = express.Router();
const { User, Post, Hashtag } = require("../models");

// Global variables Settings
router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerIdList = req.user
    ? req.user.Followings.map((f) => f.id)
    : [];
  return next();
});

router.get("/profile", (req, res) => {
  res.render("profile", { title: "My Profile" });
});

router.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
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
    res.render("index", {
      title: "NodeBird",
      twits: posts,
      user: req.user,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/hashtag", async (req, res, next) => {
  const query = req.query.hashtag; // because searching by get, should access to querystring
  if (!query) return res.redirect("/"); // no such hashtag
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }
    return res.render("index", {
      title: `${query} | NodeBird`,
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

module.exports = router;
