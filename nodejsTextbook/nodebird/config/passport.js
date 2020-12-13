const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const { User } = require("../models");
const passport = require("passport");

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
        passwordField: "password",
      },
      async (email, password, done) => {
        // Find user
        try {
          const exUser = await User.findOne({ where: { email } });
          if (exUser) {
            const result = await bcrypt.compare(password, exUser.password);
            if (result) {
              done(null, exUser);
            } else {
              done(null, false, { message: "Password wrong!" });
            }
          } else {
            done(null, false, { message: "No registered" });
          }
        } catch (err) {
          console.error(err);
          done(err);
        }
      }
    )
  );
};
