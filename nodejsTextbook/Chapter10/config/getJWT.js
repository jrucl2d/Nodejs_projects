const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET); // using token saved in request header
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(419).json({
        code: 419,
        message: "Token Expired",
      });
    }
    return res.status(401).json({
      code: 401,
      message: "Invalid Token",
    });
  }
};
