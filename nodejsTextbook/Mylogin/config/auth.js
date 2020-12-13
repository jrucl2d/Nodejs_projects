module.exports = {
  isAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "로그인이 필요합니다");
    res.redirect("/user/login");
  },
  isNotAuth: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect("/"); // 이미 로그인 되어있는 상태이므로 다시 index 페이지로 돌려보냄
  },
};
