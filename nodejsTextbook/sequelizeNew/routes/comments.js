const express = require("express");
const router = express.Router();
const db = require("../models");

// 1. 댓글 등록
router.post("/", async (req, res, next) => {
  try {
    const [comment, metadata] = await db.sequelize.query(
      "INSERT INTO nodejs.comments (commenter, comment, createdAt, updatedAt) VALUES (?, ?,?, ?)",
      {
        replacements: [req.body.id, req.body.comment, new Date(), new Date()],
      }
    );
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 2. 댓글 수정
router.patch("/:id", async (req, res, next) => {
  try {
    const [result, metadata] = await db.sequelize.query(
      "UPDATE comments SET comment=?, updatedAt=? WHERE id=?",
      {
        replacements: [req.body.comment, new Date(), req.params.id],
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
    const [result, metadata] = await db.sequelize.query(
      "DELETE FROM comments WHERE id=?",
      {
        replacements: [req.params.id],
      }
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
