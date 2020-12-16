const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const schedule = require("node-schedule");

const { isNotLoggedIn, isLoggedIn } = require("./middlewares");
const Good = require("../models/Good");
const Auction = require("../models/Auction");
const User = require("../models/User");
const { sequelize } = require("../models/index");

router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

router.get("/", async (req, res, next) => {
  try {
    const goods = await Good.findAll({ where: { SoldId: null } });
    res.render("main", {
      title: "껄껄경매",
      goods,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/join", isNotLoggedIn, (req, res) => {
  res.render("join", {
    title: "회원가입",
  });
});

router.get("/good", isLoggedIn, (req, res) => {
  res.render("good", { title: "상품 등록" });
});

try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads");
}
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
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
        img: req.file.filename,
        price,
      });
      const end = new Date();
      end.setDate(end.getDate() + 1); // 24시간 뒤로 설정
      // 스케줄링 -> 정해진 시간이 끝나면 콜백 함수가 호출됨
      schedule.scheduleJob(end, async () => {
        const t = await sequelize.transaction(); // 같은 t이면 같은 트랜잭션

        try {
          const success = await Auction.findOne({
            where: { GoodId: good.id },
            order: [["bid", "DESC"]], // 가장 마지막에 입찰한 사람
            transaction: t,
          });
          // await Good.setSold(success.UserId);
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
          await t.commit();
        } catch (err) {
          await t.rollback();
        }
      });

      res.redirect("/");
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// 경매 내역 가져오기
router.get("/good/:id", isLoggedIn, async (req, res, next) => {
  try {
    const [good, auction] = await Promise.all([
      Good.findOne({
        where: { id: req.params.id },
        include: { model: User, as: "Owner" },
      }),
      Auction.findAll({
        where: { GoodId: req.params.id },
        include: { model: User },
      }),
    ]);
    res.render("auction", {
      title: `${good.name}`,
      good,
      auction,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 입찰하는 부분
router.post("/good/:id/bid", isLoggedIn, async (req, res, next) => {
  try {
    const { bid, msg } = req.body;
    // 상품이 실제 있는지 체크
    const good = await Good.findOne({
      where: { id: req.params.id },
      include: { model: Auction },
      order: [[{ model: Auction }, "bid", "DESC"]],
    });
    // 입찰가 확인
    if (good.price >= bid) {
      return res.status(403).send("시작 가격보다 높게 입찰해야 합니다.");
    }
    // 경매 시작후 24시간 이내인지 확인
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
    // 방 인원들에게 모두 알림(경매 상품 아이디가 방 아이디)
    req.app.get("io").to(req.params.id).emit("bid", {
      bid: result.bid,
      msg: result.msg,
      nick: req.user.nick,
    });
    return res.send("ok");
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
