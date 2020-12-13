const User = require("../models/user");

exports.addFollowing = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } }); // 현재 유저의 정보를 가져와서
    if (user) {
      await user.addFollowings(parseInt(req.params.id, 10)); // 상대방을 팔로잉하는 것으로 추가
      res.send("success");
    } else {
      res.status(404).send("no user");
    }
  } catch (err) {
    // console.error(err);
    next(err);
  }
};
