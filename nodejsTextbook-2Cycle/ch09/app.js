const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjuck = require("nunjucks");
const dotenv = require("dotenv");

dotenv.config();
const { sequelize } = require("./models");

// 라우터
const pageRouter = require("./routes/page");

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

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
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

app.use("/", pageRouter);

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
