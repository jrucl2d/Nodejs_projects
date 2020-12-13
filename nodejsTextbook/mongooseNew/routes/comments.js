const express = require("express");
const router = express.Router();
const Comment = require("../schemas/comment");

// 1. 댓글 등록
router.post("/", async (req, res, next) => {
  try {
    const comment = await Comment.create({
      commenter: req.body.id,
      comment: req.body.comment,
    }).populate("commenter");
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 2. 댓글 수정
router.patch("/:id", async (req, res, next) => {
  try {
    // 수정할 대상, 수정 내용
    const result = await Comment.update(
      {
        _id: req.params.id,
      },
      {
        comment: req.body.comment,
      }
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 3. 댓글 삭제
router.delete("/:id", async (req, res, next) => {
  try {
    const result = await Comment.remove({ _id: req.params.id });
    res.json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
