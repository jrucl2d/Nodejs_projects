const express = require("express");
const router = express.Router();
const User = require("../schemas/user");
const Comment = require("../schemas/comment");

// 1. 사용자 로딩
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 2. 댓글 로딩
router.get(`/:id/comments`, async (req, res, next) => {
  try {
    const comments = await Comment.find({ commenter: req.params.id }).populate(
      "commenter"
    );
    res.json(comments);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 3. 사용자 등록
router.post("/", async (req, res, next) => {
  try {
    const user = await User.create({
      name: req.body.name,
      age: req.body.age,
      married: req.body.married,
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
