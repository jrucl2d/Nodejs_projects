const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const url = require("url");

const { verifyToken, apiLimiter, premiumApiLimiter } = require("./middlewares");
const { Domain, User, Post, Hashtag } = require("../models");

const router = express.Router();

router.use(async (req, res, next) => {
  try {
    // 미리 설정한 도메인만 cors 접근 가능
    const domain = await Domain.findOne({
      where: { host: url.parse(req.get("origin"))?.host }, // optional chaining. 앞에가 undefined면 undefined이고 있으면 그 안에서 host 꺼내옴
    });
    if (domain) {
      cors({
        origin: req.get("origin"), // credentials가 들어가면 여기 *가 안 된다. 그래서 true를 쓰면 현재 도메인이 가능하다.
        credentials: true, // 쿠키가 같이 전달 안 되는 문제를 해결하기 위해서 넣어줌
      })(req, res, next);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.use(async (req, res, next) => {
  try {
    const domain = await Domain.findOne({
      where: { host: url.parse(req.get("origin")).host },
    });
    if (domain.type == "free") {
      console.log("무료 사용자 입니다");
      apiLimiter(req, res, next);
    } else {
      console.log("프리미엄 사용자 입니다");
      premiumApiLimiter(req, res, next);
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/token", async (req, res, next) => {
  const { frontSecret } = req.body;
  try {
    const domain = await Domain.findOne({
      where: { frontSecret },
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
        type: domain.type,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30m",
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
router.get("/follow", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.decoded.id },
      attributes: ["id", "nick"],
    });
    const followers = await user.getFollowers({ attributes: ["id", "nick"] });
    const followings = await user.getFollowings({ attributes: ["id", "nick"] });

    return res.json({
      code: 200,
      followers,
      followings,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      message: "서버 에러",
    });
  }
});

router.get("/test", verifyToken, apiLimiter, (req, res, next) => {
  res.json(req.decoded);
});

module.exports = router;
