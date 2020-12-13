const router = require("express").Router();

// router.use((req, res, next) => {
//   res.locals.user = null;
//   res.locals.followerCount = 0;
//   res.locals.followingCount = 0;
//   res.locals.followerIdList = [];
//   next();
// });

router.get("/profile", (req, res, next) => {
  res.render("profile", { title: "프로필" });
});

router.get("/join", (req, res, next) => {
  res.render("join", { title: "회원가입" });
});

router.get("/", (req, res, next) => {
  const twits = [];
  res.render("main", {
    title: "껄껄북",
    twits,
    user: req.user,
  });
});

module.exports = router;
