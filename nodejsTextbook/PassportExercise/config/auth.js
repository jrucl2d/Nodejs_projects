module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "PLZ login to view this resource");
    res.redirect("/users/login");
  },
};
