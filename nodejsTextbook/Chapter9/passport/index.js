const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const { User } = require("../models");

module.exports = (passport) => {
  // req.session 객체에 어떤 데이터를 저장할지 선택.
  passport.serializeUser((user, done) => {
    done(null, user.id); // 첫 번째 인자는 에러 발새시 사용, 사용자의 모든 데이터를 저장하기에는 낭비가 심하므로 아이디만 저장
  });

  // 매 요청시 실행. passport.sessioin() 미들웨어가 이 메서드를 호출. 위에서 저장한 아이디를 가지고 사용자 정보 조회.
  // 조회된 정보는 req.user에 저장되므로 req.user을 통해서 로그인한 사용자 정보를 가져올 수 있다.
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({
        where: { id }, // 아이디와 더불어 팔로잉 목록과 팔로워 목록을 같이 조회
        include: [
          {
            model: User,
            attributes: ["id", "nick"], // 실수로 비밀번호를 조회하는 것을 방지하기 위해서 attributes를 지정한다.
            as: "Followers",
          },
          {
            model: User,
            attriributes: ["id", "nick"],
            as: "Followings",
          },
        ],
      });
      done(null, user); // 이 뒤에 보내는 정보가 req.user에 저장된다.
    } catch (err) {
      done(err);
    }
  });

  local(passport);
  kakao(passport);
};
