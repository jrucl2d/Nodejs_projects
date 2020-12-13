const LocalStrategy = require("passport-local").Strategy; // Strategy 생성자를 불러와서 사용함
const bcrypt = require("bcrypt");

const { User } = require("../models");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      // 첫 번째 인자는 전략에 관한 설정. 해당 필드에 req.body의 속성명을 적어주면 된다. name 속성에 들어있는 값들과 일치함.
      {
        usernameField: "email",
        passwordField: "password",
      },
      // 두 번째 인자로 실제 전략이 들어감. 위에서 사용한 email과 password는 인자로 사용됨. done 함수는 passport.authenticate(auth.js)의 콜백함수이다.
      async (email, password, done) => {
        try {
          const exUser = await User.findOne({ where: { email } }); // 데이터베이스에 일치하는 이메일 존재하는지 찾는다.
          if (exUser) {
            const result = await bcrypt.compare(password, exUser.password); // 일단 이메일이 있다면 비밀번호 비교
            if (result) {
              done(null, exUser); // 모두 같다면 done으로 보냄. 첫 인자는 서버측 오류가 발생했을 때. 두 번째 인자로 사용자 정보를 보냄
            } else {
              done(null, false, { message: "비밀번호가 일치하지 않습니다." }); // 비밀번호가 틀리다면 사용자 정보 안 보내고 오류 메시지 보냄
            }
          } else {
            done(null, false, { message: "가입되지 않은 회원입니다." }); // 애초에 이메일도 같지 않으면 사용자 정보 안 보내고 오류 메시지 보냄
          }
        } catch (err) {
          console.error(err); // 아예 서버 오류이면 done(err)에서 첫 인자의 err가 passport.authenticate로 들어감.
          done(err);
        }
      }
    )
  );
};
