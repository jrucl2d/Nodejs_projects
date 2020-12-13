const express = require("express");
const path = require("path");
const morgan = require("morgan");
const nunjucks = require("nunjucks");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");

const { sequelize } = require("./models");
require("dotenv").config();
const app = express();
const passportConfig = require("./passport");
passportConfig();
const sse = require("./sse");
const webSocket = require("./socket");
const checkAuction = require("./checkAuction");
checkAuction();

app.set("port", process.env.PORT || 8000);
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

const sessionMiddelware = session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddelware);
app.use(passport.initialize());
app.use(passport.session());

app.use("/", require("./routes"));
app.use("/auth", require("./routes/auth"));

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

const server = app.listen(app.get("port"), () => {
  console.log(`${app.get("port")}번 포트에서 서버 작동중`);
});

webSocket(server, app);
sse(server);
