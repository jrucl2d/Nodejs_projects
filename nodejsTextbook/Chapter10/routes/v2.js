const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const url = require("url");

const { verifyToken } = require("../config/getJWT");
const { apiLimiter } = require("../config/apiLimiter");
const { Domain, User, Post, Hashtag } = require("../models");

const router = express.Router();
router.use(async (req, res, next) => {
  const domain = await Domain.findOne({
    where: { host: url.parse(req.get("origin")).host },
  });
  if (domain) {
    // if want to customize middleware, add (req,res,next)
    cors({ origin: req.get("origin") })(req, res, next); // at caller, added 'origin' to header
  } else {
    next();
  }
});

router.post("/token", apiLimiter, async (req, res) => {
  const { clientSecret } = req.body;
  try {
    const domain = await Domain.findOne({
      where: { clientSecret },
      include: {
        model: User,
        attribute: ["nick", "id"],
      },
    });
    if (!domain) {
      return res.status(401).json({
        code: 401,
        message: "등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요",
      });
    }
    const token = jwt.sign(
      {
        id: domain.User.id,
        nick: domain.User.nick,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1m", // 1분
        issuer: "nodebird",
      }
    );
    return res.json({
      code: 200,
      message: "토큰이 발급되었습니다",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "서버 에러",
    });
  }
});

router.get("/test", verifyToken, apiLimiter, (req, res) => {
  res.json(req.decoded);
});

router.get("/posts/my", verifyToken, apiLimiter, (req, res) => {
  Post.findAll({ where: { userId: req.decoded.id } })
    .then((posts) => {
      console.log(posts);
      res.json({
        code: 200,
        payload: posts,
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({
        code: 500,
        message: "Server Error",
      });
    });
});

router.get(
  "/posts/hashtag/:title",
  verifyToken,
  apiLimiter,
  async (req, res) => {
    try {
      const hashtag = await Hashtag.findOne({
        where: { title: req.params.title },
      });
      if (!hashtag) {
        return res.status(404).json({
          code: 404,
          message: "No search Result",
        });
      }
      const posts = await hashtag.getPosts();
      return res.json({
        code: 200,
        payload: posts,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        code: 500,
        message: "Server Error",
      });
    }
  }
);

module.exports = router;
