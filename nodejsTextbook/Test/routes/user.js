const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("./middlewares");
const { User } = require("../models");
const { addFollowing } = require("../controllers/user");

router.patch("/newNick", isLoggedIn, async (req, res, next) => {
  const user = await User.update(
    { nick: req.body.newNick },
    { where: { id: req.user.id } }
  );
  res.send("success");
});
router.post("/:id/follow", isLoggedIn, addFollowing);
router.post("/:id/unfollow", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } }); // 현재 유저 정보 가져와서
    if (user) {
      await user.removeFollowing(parseInt(req.params.id, 10)); // 상대방 팔로잉 제거
      res.send("success");
    } else {
      res.status(404).send("no-user");
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
