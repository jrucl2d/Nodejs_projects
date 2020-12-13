var express = require("express");
var router = express.Router();
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// connect-flash 미들웨어 : 일회성 메시지를 브라우져에 표시하는 용도
router.get("/flash", function (req, res) {
  req.session.message = "세션 메시지";
  req.flash("message", "flash 메시지"); // key, 값을 설정한다.
  res.redirect("/users/flash/result"); // 응답을 다른 라우터로 보내줌
});
router.get("/flash/result", function (req, res) {
  res.send(`${req.session.message} ${req.flash("message")}`); // 처음 result로 가면 둘 다 나오지만 flash는 단발성이므로 새로고침 하면 없어짐
});

router.get("/:id", function (req, res, next) {
  // 이 방식으로 user/1이나 user/123 등의 요청을 잡을 수 있다.
  console.log(req.params, req.query); // params 객체 안에 id가 들어간다. 쿼리스트링 키-값 정보는 query 객체 안에 들어있다.
  res.send("catched"); // 라우터는 무조건 응답하거나 에러 핸들러로 요청을 넘겨야 한다. 응답은 무조건 한 요청에 대해서 한 번만!
});
// /users/123?limit=5&skip=10의 주소 요청을 여기서 잡으면 로그에 아래와 같은 결과가 출력된다.
// { id: '123' } { limit: '5', skip: '10' }
// 단 이 방식은 일반 라우터보다 더 뒤에 있는 것이 좋다. 그래야 다른 라우터를 방해하지 않는다.

module.exports = router;
