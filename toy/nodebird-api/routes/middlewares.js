const jwt = require("jsonwebtoken");
const RateLimit = require("express-rate-limit");

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("로그인 필요");
  }
};
exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent("로그인 한 상태입니다");
    res.redirect(`/?error=${message}`);
  }
};

exports.verifyToken = (req, res, next) => {
  try {
    // req.headers.authorization이 바로 토큰. req.decoded에 대입해서 다음 미들웨어에서 쓸 수 있게 함
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(419).json({
        code: 419,
        message: "토큰이 만료되었습니다",
      });
    }
    return res.status(401).json({
      code: 401,
      message: "유효하지 않은 토큰입니다",
    });
  }
};

exports.apiLimiter = new RateLimit({
  windowMs: 60 * 1000, // 1분
  max: 3,
  delayMs: 0,
  handler(req, res) {
    res.status(this.statusCode).json({
      code: this.statusCode, // 기본값 429
      message: "무료 사용자는 1분에 세 번만 요청할 수 있습니다",
    });
  },
});
exports.premiumApiLimiter = new RateLimit({
  windowMs: 60 * 1000,
  max: 30,
  handler(req, res) {
    res.status(this.statusCode).json({
      code: this.statusCode,
      message: "프리미엄 사용자는 1분에 30번만 요청할 수 있습니다",
    });
  },
});

exports.deprecated = (req, res) => {
  res.status(410).json({
    code: 410,
    message: "새로운 버젼이 나왔습니다. 새로운 버전을 사용하세요",
  });
};
