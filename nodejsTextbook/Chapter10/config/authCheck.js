module.exports = {
  isLog: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(403).send("Login is neccessary");
  },
  isNotLog: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect(`/?error=already logined`);
  },
};
