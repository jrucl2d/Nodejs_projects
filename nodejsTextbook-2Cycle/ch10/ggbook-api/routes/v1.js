const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Domain = require("../models/Domain");
const User = require("../models/User");
const { verifyToken } = require("./middlewares");

router.post("/token", async (req, res, next) => {
  const { serverSecret } = req.body;
  try {
    const domain = await Domain.findOne({
      where: { serverSecret },
      include: {
        model: User,
        attributes: ["nick", "id"],
      },
    });
    if (!domain) {
      return res.status(401).json({
        code: 401,
        message: "등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요.",
      });
    }
    const token = jwt.sign(
      {
        id: domain.user.id,
        nick: domain.user.nick,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1m",
        issuer: "ggbook",
      }
    );
    return res.json({
      code: 200,
      message: "토큰이 발급되었습니다.",
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

router.get("/test", verifyToken, (req, res, next) => {
  res.json(req.decoded);
});
module.exports = router;
