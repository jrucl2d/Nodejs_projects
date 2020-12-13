const express = require("express");
const multer = require("multer"); // 사진 업로드 모듈 Multer. from data의 사진을 전송하는 데 좋다.
const path = require("path");
const fs = require("fs");

const { Post, Hashtag, User } = require("../models");
const { isLoggedIn } = require("./middlewares");
const { nextTick } = require("process");

const router = express.Router();
fs.readdir("uploads", (err) => {
  if (err) {
    console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
    fs.mkdirSync("uploads"); // 폴더가 존재해야 하므로 sync방식으로 폴더 생성
  }
});

// upload는 미들웨어를 만드는 객체가 된다. 옵션으로는 storage속성과 limits 속성을 주었다.
// storage에는 파일 저장 방식과 경로, 파일명 등을 설정 가능
const upload = multer({
  storage: multer.diskStorage({
    // diskStorage를 사용해 서버 디스크에 이미지가 저장됨. diskStorage의 destination 메소드로 저장 경로를 nodebird 폴더 아래의 upload폴더로 설정
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    // fileName 메서드로 기존 이름(file.originalname)에 업로드 날자값, 기존 확장자를 붙이도록 설정
    filename(req, file, cb) {
      const ext = path.extname(file.originalname); // 파일 확장자 출력
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext); // 파일명 + 현재시간 + 확장자로 파일명 중복 피함
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});
// single은 한 이미지 업로드하고 req.file 객체 생성, array와 fields는 여러 개 이미지 업로드. none도 있음. req.files 객체를 생성한다.
// array와 fields의 차이는 이미지 업로드한 body 속성 개수이다. 속성 하나에 이미지 여러 개 업로드했다면 array, 여러 속성에 이미지 하나씩이면 fields.
// none은 이미지 올리지 않고 데이터만 multipart 형식으로 전송했을 때.
router.post("/img", isLoggedIn, upload.single("img"), (req, res) => {
  // single 메서드에 이미지가 담긴 req.body 속성의 이름(name 속성)을 적어줌. 여기선 img이다. 이제 single 미들웨어가 이미지를 처리하고 req.file 객체에 결과를 저장함
  console.log(req.file);
  res.json({ url: `/img/${req.file.filenane}` });
});

// 게시글 업로드 처리
const upload2 = multer();
router.post("/", isLoggedIn, upload2.none(), async (req, res, next) => {
  // 이미지가 들어있지 않으므로 none으로 사용
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url, // 이미지를 업로드 했다면 이미지 주소도 req.body.url로 전송된다.
      userId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g); // 해시태그들을 정규언어로 추출
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) =>
          Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          })
        )
      );
      await post.addHashtags(result.map((r) => r[0]));
    }
    res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 해시태그 검색 기능
router.get("/hashtag", async (req, res, next) => {
  const query = res.query.hashtag;
  if (!query) {
    return res.redirect("/");
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }
    return res.render("main", {
      title: `${query} | NodeBird`,
      user: req.user,
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

module.exports = router;
