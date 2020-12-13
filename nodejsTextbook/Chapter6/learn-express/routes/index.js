var express = require("express");
var router = express.Router();

/* GET home page. */
router.get(
  "/",
  function (req, res, next) {
    console.log("이제부터 뛰어넘을것 - 라우터");
    next("route"); // 이 방식으로 라우터에 연결된 나머지 미들웨어를 건너 뛴다.
  },
  function (req, res, next) {
    console.log("여기는 실행 안 됨");
    next();
  }
);

router.get("/", function (req, res, next) {
  // 주소와 일치하는 다음 라우터로 넘어감
  console.log("여기는 실행됨 - 라우터");
  res.render("index", { title: "Express" });
  // res.locals.title = 'Express';
  // res.render('index'); 이렇게 사용해도 됨. 이 방식은 다른 미들웨어에서도 res.locals 객체에 접근 가능하다.
});

module.exports = router;
