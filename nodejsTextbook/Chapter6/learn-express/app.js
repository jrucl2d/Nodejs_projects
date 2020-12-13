var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session"); // express-generator로 설치되지 않으므로 따로 설치해줘야 한다.
var flash = require("connect-flash"); // 역시 따로 설치해줘야 한다. cookie-parser과 session을 사용하므로 뒤에 위치해야 함

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup - 탬플릿을 사용. PUG 사용
// render 메소드가 이 폴더를 기준으로 템프릿 엔진을 찾아서 렌더링 함. views/admin/main.pug는 res.render('admin/main')으로 접근
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// 개인적으로 추가한 부분
app.use(function (req, res, next) {
  console.log(req.url, "나도 미들웨어다");
  next(); // next가 없으면 다음 미들웨어로 넘어가지 않는다.
});
// 미들웨어 여러 개를 하나의 use에 장착할 수 있다.
app.use(
  function (req, res, next) {
    console.log("첫 번째 미들웨어");
    next();
  },
  function (req, res, next) {
    console.log("두 번째 미들웨어");
    next();
  },
  function (req, res, next) {
    console.log("세 번째 미들웨어");
    next();
  }
);
app.use(logger("dev")); // 개발시에는 보통 dev,short 사용하고 배포 시에는 common이나 combined를 사용
// 원래는 bodyParser=require('body-parser')로 바디파서 미들웨어를 불러와서 bodyParser.json()으로 사용해야 하지만
// 이제는 내장되어있는 기능이다. 폼 데이터나 AJAX 요청의 데이터를 처리함

// 정적 파일을 발견하면 응답으로 해당 파일을 전송함. 이 경우 응답을 보냈으므로 다음 라우터가 실행되지 않는다. 즉, 쓸데없는 미들웨어 작업을 줄여준다.
// 그래서 기존의 코드에서 static 미들웨어를 morgan 다음까지 올려주는 것이 좋다. 그러나 가끔 cookie같은 것이 정적 파일 제공에 영향을 끼칠 수 있으므로 잘 정해야 한다.
app.use(express.static(path.join(__dirname, "public")));
// app.use('/img', express.static(path.join(__dirname, "public"))); 이처럼 정적 파일의 위치를 직접 지정할 수 있다.

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("secret code")); // c첫 인자에 문자열 넣어주면 서명된 쿠키의 경우 이 문자열로 복호화 가능

// 따로 추가한 session 파트
app.use(
  session({
    resave: false, // 요청이 왔을 때 세션에 수정사항이 생기지 않더라도 세션을 다시 저장할 것인지
    saveUninitialized: false, // 세션에 저장할 내역이 없더라도 세션을 다시 저장할지(방문자 추적에 사용)
    secret: "secret code", // 거의 필수항목. cookie-parser의 비밀 키
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

// flash 사용
app.use(flash());

// Router
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/", function (req, res, next) {
  console.log("/ 주소의 요청일 때 실행된다. HTTP 메서드는 상관없음");
  next();
});
app.get("/", function (req, res, next) {
  console.log("GET 메서드 / 주소의 요청일 때만 실행됨");
  next();
});
app.post("/data", function (req, res, next) {
  console.log("POST 메서드 /data 주소의 요청일 때만 실행됨");
  next();
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {}; // 시스템 환경이 개발환경인 경우만 표시된다. 배포환경에는 표시 X
  // 위에서 app.set한 값을 app.get으로 가져올 수 있다.

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
