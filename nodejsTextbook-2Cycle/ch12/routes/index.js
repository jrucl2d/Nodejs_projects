const router = require("express").Router();
const Room = require("../schemas/room");
const Chat = require("../schemas/chat");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

router.get("/", async (req, res, next) => {
  try {
    const rooms = await Room.find({});
    res.render("main", { rooms, title: "GIF 채팅방" });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/room", (req, res) => {
  res.render("room", { title: "GIF 채팅방 생성" });
});

router.post("/room", async (req, res, next) => {
  try {
    const newRoom = await Room.create({
      title: req.body.title,
      max: req.body.max,
      owner: req.session.color,
      password: req.body.password,
    });
    const io = req.app.get("io");
    io.of("/room").emit("newRoom", newRoom);
    res.redirect(`/room/${newRoom._id}?password=${req.body.password}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/room/:id", async (req, res, next) => {
  try {
    const room = await Room.findOne({ _id: req.params.id });
    const io = req.app.get("io");
    if (!room) {
      return res.redirect("/?error=존재하지 않는 방입니다.");
    }
    if (room.password && room.password !== req.query.password) {
      return res.redirect("/?error=비밀번호가 틀렸습니다.");
    }
    const { rooms } = io.of("/chat").adapter; // adapter.rooms 안에 방들 목록 있음. Map이므로 rooms.get(방 아이디)으로 인원들 가져올 수 있음
    if (
      rooms &&
      rooms.get(req.params.id) &&
      room.max <= rooms.get(req.params.id).size // adapter.rooms.get(아이디)의 인원들은 Set이므로 .size로 크기 가져옴
    ) {
      return res.redirect("/?error=허용 인원이 초과하였습니다.");
    }
    const chats = await Chat.find({ room: room._id }).sort("createdAt");
    return res.render("chat", {
      room,
      title: room.title,
      chats,
      user: req.session.color,
      members:
        (rooms && rooms[req.params.id] && rooms[req.params.id].length + 1) || 1,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post("/room/:id/chat", async (req, res, next) => {
  try {
    const chat = await Chat.create({
      room: req.params.id,
      user: req.session.color,
      chat: req.body.chat,
    });
    // 전체 중에서 chat 네임스페이스, 그 중에서도 방 안에만 전송됨
    req.app.get("io").of("/chat").to(req.params.id).emit("chat", chat);
    res.send("ok");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

try {
  fs.readdirSync("uploads");
} catch (err) {
  console.error("uploads 폴더가 없으므로 생성합니다.");
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, "uploads/");
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/room/:id/gif", upload.single("gif"), async (req, res, next) => {
  try {
    const chat = await Chat.create({
      room: req.params.id,
      user: req.session.color,
      gif: req.file.filename,
    });
    req.app.get("io").of("/chat").to(req.params.id).emit("chat", chat);
    res.send("ok");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/room/:id/sys", async (req, res, next) => {
  const chat =
    req.body.type === "join"
      ? `${req.session.color}님이 입장하셨습니다.`
      : `${req.session.color}님이 퇴장하셨습니다.`;
  const sysChat = await Chat.create({
    room: req.params.id,
    chat,
    user: "system",
  });
  // socket에서 바로 emit 하지 않고 라우터에서 db 저장 후에 emit
  req.app
    .get("io")
    .of("/chat")
    .to(req.params.id)
    .emit(req.body.type, {
      user: "system",
      chat,
      members: req.app.get("io").of("/chat").adapter.rooms.get(req.params.id)
        .size,
    });
});

router.delete("/room/:id", async (req, res, next) => {
  try {
    await Room.remove({ _id: req.params.id });
    await Chat.remove({ room: req.params.id });
    res.send("ok");
    setTimeout(() => {
      req.app.get("io").of("/room").emit("removeRoom", req.params.id);
    }, 2000);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
