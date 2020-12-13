var express = require("express");
var User = require("../models").User; // 데이터베이스의 user

var router = express.Router();

// GET으로 /에 접속했을 때의 라우터
// User.findAll로 모든 사용자를 찾아서 sequelize.pug를 렌더링할 때 결과 users를 변수로 넣어준다.
// 미리 데이터베이스에서 데이터를 조회하고 템플릿 렌더링에 사용함
router.get("/", function (req, res, next) {
  User.findAll()
    .then((users) => {
      res.render("sequelize", { users });
    })
    .catch((err) => {
      console.err(err);
      next(err);
    });
});

// Async Await 사용시
// router.get("/", async (req, res, next) => {
//   try {
//     const users = await User.findAll();
//     res.render("sequelize", { users });
//   } catch (err) {
//     console.error(err);
//     next(err);
//   }
// });

module.exports = router;
