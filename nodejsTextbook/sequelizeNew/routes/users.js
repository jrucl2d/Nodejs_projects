const express = require("express");
const router = express.Router();
const db = require("../models");

// 1. 사용자 로딩
router.get("/", async (req, res, next) => {
  try {
    const [users, metadata] = await db.sequelize.query("SELECT * FROM users;");
    console.log(users);
    res.json(users);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 2. 댓글 로딩
router.get(`/:id/comments`, async (req, res, next) => {
  try {
    const [comments, metadata] = await db.sequelize.query(
      "SELECT users.name, comments.id, comments.comment FROM users, comments WHERE commenter = :commenter and commenter=users.id",
      {
        replacements: { commenter: req.params.id },
      }
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
    const [user, metadata] = await db.sequelize.query(
      "INSERT INTO nodejs.users (name, age, married, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
      {
        replacements: [
          req.body.name,
          req.body.age,
          req.body.married,
          new Date(),
          new Date(),
        ],
      }
    );
    res.json(user);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
