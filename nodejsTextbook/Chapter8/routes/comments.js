var express = require("express");
var Comment = require("../schemas/comment");

var router = express.Router();
router.get("/:id", async (req, res, next) => {
  try {
    const comments = await Comment.find({ commenter: req.params.id }).populate(
      "commenter"
    ); // 아이디로 댓글 조회 후 관련있는 컬렉션의 다큐먼트 불러옴. commenter에서 ref가 User
    // commenter 필드가 ObjectId가 아닌 그 아이디를 가진 사용자 다큐먼트가 됨
    console.log(comments);
    res.json(comments);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const comment = new Comment({
      commenter: req.body.id,
      comment: req.body.comment,
    });
    const tmp = await comment.save();
    const result = await Comment.populate(tmp, { path: "commenter" });
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const result = await Comment.update(
      { _id: req.params.id },
      { comment: req.body.comment }
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

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
