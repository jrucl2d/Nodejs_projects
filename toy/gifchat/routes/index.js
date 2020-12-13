const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Room = require("../schemas/room");
const Chat = require("../schemas/chat");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const rooms = await Room.find({});
    res.render("main", { rooms, title: "GIF 채팅방" });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/room", (req, res, next) => {
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
    res.redirect(`/room/${newRoom._id}?password=${req.body.password}`); // 생성 후 바로 들어감. 프론트에서는 버튼으로 들어감
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/room/:id", async (req, res, next) => {
  try {
    const room = await Room.findOne({ _id: req.params.id });
    const io = req.app.get("io");
    if (!room) {
      return res.redirect(`/?error=존재하지 않는 방입니다`);
    }
    if (room.password && room.password !== req.query.password) {
      return res.redirect(`/?error=비밀번호가 틀렸습니다`);
    }
    const { rooms } = io.of("/chat").adapter;
    if (
      rooms &&
      rooms[req.params.id] &&
      room.max <= rooms[req.params.id].length // rooms 안의 소켓 목록이 들어있다.
    ) {
      return res.redirect(`/?error=허용 인원을 초과하였습니다`);
    }
    const chats = await Chat.find({ room: room._id }).sort("createdAt");
    console.log(rooms[req.params.id]);
    return res.render("chat", {
      room,
      title: room.title,
      chats,
      user: req.session.color,
      members:
        (rooms && rooms[req.params.id] && rooms[req.params.id].length + 1) || 1,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.delete("/room/:id", async (req, res, next) => {
  try {
    await Room.remove({ _id: req.params.id });
    await Chat.remove({ room: req.params.id });
    res.send("ok");
    setTimeout(() => {
      req.app.get("io").of("/room").emit("removeRoom", req.params.id);
    }, 2000);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/room/:id/chat", async (req, res, next) => {
  try {
    const chat = await Chat.create({
      room: req.params.id,
      user: req.session.color,
      chat: req.body.chat,
    });
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
  console.error("uploads 폴더가 없어서 생성합니다");
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
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/room/:id/sys", async (req, res, next) => {
  const chat =
    req.body.type === "join"
      ? `${req.session.color}님이 입장하셨습니다`
      : `${req.session.color}님이 퇴장하셨습니다`;
  const sysChat = await Chat.create({
    room: req.params.id,
    chat,
    user: "system",
  });
  // 원래 socket.js에서 바로 emit 해주던 것을 라우터 한 번 거쳐서 db 저장 후에 뿌려줌
  req.app
    .get("io")
    .of("/chat")
    .to(req.params.id)
    .emit(req.body.type, {
      user: "system",
      chat,
      members: req.app.get("io").of("/chat").adapter.rooms[req.params.id]
        .length,
    });
});

module.exports = router;
