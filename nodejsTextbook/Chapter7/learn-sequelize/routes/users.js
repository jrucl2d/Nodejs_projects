var express = require("express");
var User = require("../models").User; // 데이터베이스에서 가져온 User
var router = express.Router();

// GET 방식으로 /users로 요청이 들어왔을 때
router.get("/", async (req, res, next) => {
  try {
    var users = await User.findAll();
    return res.json(users);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// POST 방식으로 /users로 요청이 들어왔을 때
router.post("/", async (req, res, next) => {
  try {
    var result = await User.create({
      name: req.body.name,
      age: req.body.age,
      married: req.body.married,
    });
    console.log(result);
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
