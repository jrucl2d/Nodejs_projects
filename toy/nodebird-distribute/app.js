const express = require("express");
const path = require("path");
const nunjucks = require("nunjucks");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const app = express();
const { sequelize } = require("./models");
const passport = require("passport");
const passportConfig = require("./passport");
const helmet = require("helmet");
const hpp = require("hpp");
const logger = require("./logger");
const redis = require("redis");
const RedisStore = require("connect-redis")(session); // express-session에 의존성이 있음
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD,
});
require("dotenv").config();

app.set("port", process.env.PORT || 8001);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });

passportConfig(); // passport require

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combine"));
  app.use(helmet());
  app.use(hpp());
} else {
  app.use(morgan("dev"));
}

app.use(express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  store: new RedisStore({ client: redisClient }),
};
if (process.env.NODE_ENV === "production") {
  sessionOption.proxy = true;
  // sessionOption.cookie.secure = true;
}
app.use(session(sessionOption));
app.use(passport.initialize()); // req에 passport 설정을 심고
app.use(passport.session()); // req.session에 passport 정보를 저장

app.use("/", require("./routes")); // index router
app.use("/auth", require("./routes/auth"));
app.use("/post", require("./routes/post"));
app.use("/user", require("./routes/user"));

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다`);
  error.status = 404;
  logger.info("hello");
  logger.error(error.message);
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(`${app.get("port")}번 포트에서 서버 동작`);
});
