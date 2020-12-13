const RateLimit = require("express-rate-limit");

exports.apiLimiter = new RateLimit({
  windowMs: 60 * 1000, // 1 minute -> the time
  max: 3,
  delayMs: 0,
  handler(req, res) {
    // if over limit, execute this callback function
    res.status(this.statusCode).json({
      code: this.statusCode, // default 429
      message: "Only 1 request in 1 minute",
    });
  },
});

exports.deprecated = (req, res) => {
  res.status(410).json({
    code: 410,
    message: "New version updated! Use new version!",
  });
};
