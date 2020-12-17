const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjuck = require("nunjucks");
const dotenv = require("dotenv");
const passport = require("passport");
const helmet = require("helmet");
const hpp = require("hpp");

dotenv.config();
const { sequelize } = require("./models");
const passportConfig = require("./passport");

// 라우터
const pageRouter = require("./routes/page");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const userRouter = require("./routes/user");

const app = express();
app.set("port", process.env.PORT || "8001");
app.set("view engine", "html");
nunjuck.configure("views", {
  express: app,
  watch: true,
});
sequelize
  .sync({ force: false }) // update. db 다시 생성해야 하면 true로(create)
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => console.error("데이터베이스 에러 : " + err));
passportConfig();

if (process.env.NODE_ENV === "production") {
  app.enable("trust proxy"); // session proxy true로 했을 때
  app.use(morgan("combined")); // 배포용에서 ip 주소까지 로깅
  app.use(helmet({ contentSecurityPolicy: false })); // 기본이 true이지만 외부 css등 가져올 때 오류 자주 나서 false로 해놓기
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
};
if (process.env.NODE_ENV === "production") {
  sessionOption.proxy = true; // nginx 사용하거나 할 때(true로 해놓는게 좋음)
  // sessionOption.cookie.secure = true; // https 사용시
}

app.use(session(sessionOption));

// 라우팅 하기 전에 passport가 설정되어야 함, 세션을 사용하므로 세션 아래에 위치해야 함
app.use(passport.initialize());
app.use(passport.session());

app.use("/", pageRouter);
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/user", userRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === "production" ? {} : err;
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(`${app.get("port")}번 포트에서 서버 실행 중`);
});
