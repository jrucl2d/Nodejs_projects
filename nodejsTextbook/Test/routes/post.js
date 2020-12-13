const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const { isLoggedIn } = require("./middlewares");
const { Post, Hashtag } = require("../models/");

try {
  fs.readdirSync("uploads");
} catch (err) {
  console.error("upload 폴더가 없어서 생성합니다");
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, callback) {
      callback(null, "uploads/");
    },
    filename(req, file, callback) {
      const ext = path.extname(file.originalname);
      callback(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// formData.append('img', file)이렇게 보냈기 때문에
router.post("/img", isLoggedIn, upload.single("img"), (req, res, next) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();
router.post("/", isLoggedIn, upload2.none(), async (req, res, next) => {
  const date = new Date();
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });

    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          });
        })
      );
      await post.addHashtags(result.map((v) => v[0]));
    }
    res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.delete("/:id/delete", async (req, res, next) => {
  try {
    // 실제 사용자가 삭제하는거 맞는지 이중 검사
    await Post.destroy({ where: { id: req.params.id, userId: req.user.id } });
    res.send("successfully deleted");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.patch("/:id/like", async (req, res, next) => {
  try {
    console.log(
      `${req.user.id} 사용자가 ${req.params.id}번 게시물을 좋아합니다`
    );
    const post = await Post.findOne({
      where: { id: req.params.id },
    });
    post.addLiker(req.user.id);
    res.send("like button clicked");
  } catch (err) {
    console.error(err);
    next(err);
  }
});
router.patch("/:id/unlike", async (req, res, next) => {
  try {
    console.log(
      `${req.user.id} 사용자가 ${req.params.id}번 게시물을 좋아요 취소합니다`
    );
    const post = await Post.findOne({
      where: { id: req.params.id },
    });
    post.removeLiker(req.user.id);
    res.send("unlike button clicked");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
