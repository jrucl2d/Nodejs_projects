const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const schedule = require("node-schedule");

const { Good, Auction, User, sequelize } = require("../models");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

router.get("/", async (req, res, next) => {
  try {
    const goods = await Good.findAll({ where: { SoldId: null } }); // 아직 팔리지 않은 물건
    res.render("main", {
      title: "NodeAuction",
      goods,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/join", isNotLoggedIn, (req, res, next) => {
  res.render("join", { title: "회원가입" });
});

router.get("/good", isLoggedIn, (req, res, next) => {
  res.render("good", { title: "상품 등록" });
});

try {
  fs.readdirSync("uploads");
} catch (err) {
  console.error("uploads 폴더가 없으므로 생성합니다.");
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, res, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(
        null,
        path.basename(file.originalname, ext) + new Date().valueOf() + ext
      );
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/good",
  isLoggedIn,
  upload.single("img"),
  async (req, res, next) => {
    try {
      const { name, price } = req.body;
      const good = await Good.create({
        OwnerId: req.user.id,
        name,
        end: req.body.end,
        img: req.file.filename,
        price,
      });
      const end = new Date();
      end.setHours(end.getHours() + good.end);
      schedule.scheduleJob(end, async () => {
        const t = await sequelize.transaction(); // 실패했을 경우 transaction rollback 시켜줌
        try {
          const success = await Auction.findOne({
            where: { GoodId: good.id },
            order: [["bid", "DESC"]],
            transaction: t,
          });
          if (success) {
            await Good.update(
              { SoldId: success.UserId },
              { where: { id: good.id }, transaction: t }
            );
            await User.update(
              {
                money: sequelize.literal(`money - ${success.bid}`),
              },
              {
                where: { id: success.UserId },
                transaction: t,
              }
            );
          } else {
            await Good.update(
              { soldId: good.ownerId }, // 주인을 소유자로 바꿔줌
              { where: { id: good.id }, transaction: t }
            );
          }
        } catch (err) {
          console.error(err);
          await t.rollback();
        }
      });
      res.redirect("/");
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

router.get("/good/:id", isLoggedIn, async (req, res, next) => {
  try {
    const [good, auction] = await Promise.all([
      Good.findOne({
        where: { id: req.params.id },
        include: {
          model: User,
          as: "Owner",
        },
      }),
      Auction.findAll({
        where: { GoodId: req.params.id },
        include: { model: User },
        order: [["bid", "ASC"]],
      }),
    ]);
    res.render("auction", {
      title: `${good.name} - 경매중`,
      good,
      auction,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/good/:id/bid", isLoggedIn, async (req, res, next) => {
  try {
    const { bid, msg } = req.body;
    const good = await Good.findOne({
      where: { id: req.params.id },
      include: { model: Auction },
      order: [[{ model: Auction }, "bid", "DESC"]], // include된 모델 컬럼 정렬 방법
    });
    if (good.OwnerId === req.user.id) {
      return res.status(403).send("소유자는 입찰할 수 없습니다"); // auction.html에서 error.response.data로 접근
    }
    if (good.price >= bid) {
      return res.status(403).send("시작 가격보다 높게 입찰해야 합니다"); // auction.html에서 error.response.data로 접근
    }
    if (new Date(good.createdAt).valueOf() + 24 * 60 * 60 * 1000 < new Date()) {
      return res.status(403).send("경매가 이미 종료되었습니다");
    }
    if (good.Auctions[0] && good.Auctions[0].bid >= bid) {
      return res.status(403).send("이전 입찰가보다 높아야 합니다");
    }
    const result = await Auction.create({
      bid,
      msg,
      UserId: req.user.id,
      GoodId: req.params.id,
    });

    // 실시간으로 입찰 내역 전송
    req.app.get("io").to(req.params.id).emit("bid", {
      bid: result.bid,
      msg: result.msg,
      nick: req.user.nick,
    });
    return res.send("ok");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/list", isLoggedIn, async (req, res, next) => {
  try {
    const goods = await Good.findAll({
      where: { SoldId: req.user.id },
      include: { model: Auction },
      order: [[{ model: Auction }, "bid", "DESC"]],
    });
    res.render("list", { title: "낙찰 목록", goods });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
