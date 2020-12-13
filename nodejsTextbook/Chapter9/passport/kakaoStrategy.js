const KakaoStrategy = require("passport-kakao").Strategy;

const { User } = require("../models");
// 특징은 회원가입 절차가 따로 없고, 처음 로그인 때는 회원가입 처리, 두 번째 로그인 때부터는 로그인 처리를 해주어야 한다.

module.exports = (passport) => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID, // 카카오에서 발급해주는 아이디. 노출되면 안 되므로 process.env.KAKAO_ID로 함
        callbackURL: "/auth/kakao/callback", // 인증 결과를 받을 라우터 주소. auth에 추가해줌
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const exUser = await User.findOne({
            where: { snsId: profile.id, provider: "kakao" },
          });
          if (exUser) {
            done(null, exUser); // 한 번 로그인 한 경우(회원가입) 그냥 done 보냄
          } else {
            // 없다면 진행되는 회원가입 절차. 카카오에서는 인증 후 callback에 적힌 주소로 accessToken, refreshToken, profile을 보내줌
            const newUser = await User.create({
              email: profile._json && profile._json.kaccount_email,
              nick: profile.displayName,
              snsId: profile.id,
              provider: "kakao",
            });
            console.log(`카카오에서 보내준 회원가입 인증: ${profile}`);
            done(null, newUser);
          }
        } catch (err) {
          console.error(err);
          done(err);
        }
      }
    )
  );
};
