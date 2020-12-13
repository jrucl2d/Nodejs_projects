const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport"); // 로그인을 위한 passport 모듈
const passportConfig = require("./passport"); // 안의 index.js를 불러오는 것과 같다.
require("dotenv").config(); // 쿠키 비밀키를 불러오기 위해 생성한 .env 파일을 불러옴. 서버 시작시 .env의 비밀키들이 process.env에 들어감

const pageRouter = require("./routes/page"); // 페이지 분기를 위한 라우터
const authRouter = require("./routes/auth"); // 인증을 위한 라우터
const postRouter = require("./routes/post");
const userRouter = require("./routes/user");
const app = express();
const { sequelize } = require("./models");

sequelize.sync();
passportConfig(passport);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.set("port", process.env.PORT || 8000);

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploads"))); // 이미지 정적파일 위치 추가
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET)); // env 파일에서 쿠키 비밀키를 가져와서 사용
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);
app.use(flash());
app.use(passport.initialize()); // req 객체에 passport 설정을 심는다
app.use(passport.session()); // req.session 객체에 passport 정보를 저장한다. 따라서 express.session보다 뒤에 연결해야 한다.

app.use("/", pageRouter); // 우선 page를 구분해주기 위해서 pageRouter로 전송
app.use("/auth", authRouter); // 인증을 위해 라우터로 이동
app.use("/post", postRouter);
app.use("/user", userRouter);
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});
