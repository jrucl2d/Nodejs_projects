const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Domain = require("../models/Domain");
const User = require("../models/User");
const Post = require("../models/Post");
const Hashtag = require("../models/Hashtag");

const { verifyToken, apiLimiter } = require("./middlewares");

router.post("/token", apiLimiter, async (req, res, next) => {
  const { serverSecret } = req.body;
  try {
    const domain = await Domain.findOne({
      where: { serverSecret },
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
        expiresIn: "1m",
        issuer: "껄껄북",
      }
    );
    return res.json({
      code: 200,
      message: "토큰이 발급되었습니다",
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      message: "서버 에러",
    });
  }
});

router.get("/test", verifyToken, apiLimiter, (req, res) => {
  res.json(req.decoded);
});

// 자신의 정보를 가져오는 라우터
router.get("/posts/my", verifyToken, apiLimiter, async (req, res, next) => {
  try {
    const posts = await Post.findAll({ where: { userId: req.decoded.id } });
    res.json({ code: 200, payload: posts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      message: "서버 에러",
    });
  }
});

// 해시태그로 게시글을 검색하는 라우터
router.get(
  "/posts/hashtag/:title",
  verifyToken,
  apiLimiter,
  async (req, res, next) => {
    try {
      const hashtag = await Hashtag.findOne({
        where: { title: req.params.title },
      });
      if (!hashtag) {
        return res.status(404).json({
          code: 404,
          message: "검색 결과가 없습니다",
        });
      }
      const posts = await hashtag.getPosts();
      return res.json({ code: 200, payload: posts });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        code: 500,
        message: "서버 에러",
      });
    }
  }
);

module.exports = router;
