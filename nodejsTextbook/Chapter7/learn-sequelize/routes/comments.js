var express = require("express");
var { User, Comment } = require("../models");

var router = express.Router();
router.get("/:id", async (req, res, next) => {
  try {
    var comments = await Comment.findAll({
      include: {
        model: User,
        where: { id: req.params.id },
      },
    });
    return res.json(comments);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    var result = await Comment.create({
      commenter: req.body.id,
      comment: req.body.comment,
    });
    console.log(result);
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    var result = await Comment.update(
      {
        comment: req.body.comment,
      },
      {
        where: { id: req.params.id },
      }
    );
    return res.json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    var result = await Comment.destroy({
      where: { id: req.params.id },
    });
    return res.json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
