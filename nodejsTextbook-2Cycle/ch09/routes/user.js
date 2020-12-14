const User = require("../models/User");
const { isLoggedIn } = require("./middlewares");

const router = require("express").Router();

router.post("/:id/follow", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } }); // 내가 누군지 찾음
    if (user) {
      // setFollowings나 removeFollowings, getFollowings 사용 가능. 그러나 set 쓰면 기존 정보를 모두 날리고 설정하므로 조심.
      // 여러 개를 한 번에 addFollowings하면 파라미터에 배열을 넣어주면 된다.
      await user.addFollowings(parseInt(req.params.id, 10)); // 내가 id번 사용자를 팔로잉 하는 것.
      res.send("success");
    } else {
      res.status(404).send("no user");
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
