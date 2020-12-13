const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// User 모델 불러오기
const { User } = require("../models");
const passport = require("passport");

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Strategy
module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "pw",
      },
      async (email, pw, done) => {
        // Find user
        try {
          const exUser = await User.findOne({ where: { email } });
          if (exUser) {
            const result = await bcrypt.compare(pw, exUser.pw);
            if (result) {
              done(null, exUser);
            } else {
              done(null, false, { message: "비밀번호 불일치" });
            }
          } else {
            done(null, false, { message: "가입되지 않은 회원" });
          }
        } catch (err) {
          console.error(err);
          done(err);
        }
      }
    )
  );
};
