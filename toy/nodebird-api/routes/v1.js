const express = require("express");
const jwt = require("jsonwebtoken");

const { verifyToken, deprecated } = require("./middlewares");
const { Domain, User, Post, Hashtag } = require("../models");

const router = express.Router();

router.use(deprecated); // 여기에 접근한 모든 라우터에 대해서 deprecated 에러를 보여줌

router.post("/token", async (req, res, next) => {
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
        expiresIn: "1m",
        issuer: "nodebird",
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
// 나의 post를 모두 가져오는 라우터
router.get("/posts/my", verifyToken, async (req, res, next) => {
  try {
    const posts = await Post.findAll({ where: { userId: req.decoded.id } });
    console.log(posts);
    res.json({ code: 200, payload: posts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      message: "서버 에러",
    });
  }
});

// post 중 원하는 해시태그를 가진 post를 가져오는 라우터
router.get("/posts/hashtag/:title", verifyToken, async (req, res, next) => {
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
});

router.get("/test", verifyToken, (req, res, next) => {
  res.json(req.decoded);
});

module.exports = router;
