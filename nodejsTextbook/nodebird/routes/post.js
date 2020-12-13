const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const { Post, Hashtag } = require("../models");
const { isLog } = require("../config/authCheck");

const router = express();

// make folder
try {
  fs.readdirSync("uploads");
} catch (err) {
  console.error("making uploads folder...");
  fs.mkdirSync("uploads");
}

// Set storage Engine
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
  },
});

// Set multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
const upload2 = multer();

// Upload image -> this activates when user just select file
router.post("/img", isLog, upload.single("img"), (req, res) => {
  console.log("uploaded file : ", req.file);
  // /img/ is pseudo url, in app.js, /img/ path is connected to ./uploads
  res.json({ url: `/img/${req.file.filename}` }); // can touch to this informations by res.data.url
});

// Upload comments -> this activates when user click 'submit' button
router.post("/", isLog, upload2.none(), async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g); // RE is used
    if (hashtags) {
      const res = await Promise.all(
        // wait until all promises are done
        hashtags.map((tag) => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          });
        })
      );
      await post.addHashtags(res.map((r) => r[0]));
    }
    res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
