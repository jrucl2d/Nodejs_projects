const passport = require("passport");
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const { User } = require("../models/");

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({
        where: { id },
        include: [
          {
            model: User,
            attributes: ["id", "nick"],
            as: "Followers",
          },
          {
            model: User,
            attributes: ["id", "nick"],
            as: "Followings",
          },
        ],
      });
      done(null, user); // 여기의 user가 req.user에 저장됨
    } catch (err) {
      done(err);
    }
  });
  local();
  kakao();
};
