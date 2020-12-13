// 서버는 단지 방을 세팅하는 데에만 사용됨
const express = require("express");
const path = require("path");
const app = express();
const server = require("http").Server(app); // socket io를 위해 사용되는 서버를 만듦
const io = require("socket.io")(server); // 해당 서버를 socket io에게 넘겨줌
const nunjucks = require("nunjucks");
const { v4: uuidV4 } = require("uuid");
const PORT = process.env.PORT || 8000;

app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});
app.use(express.static(path.join(__dirname, "public")));

// Router
// 기본 index 페이지 -> random한 uuid로 room id 생성 후 유저를 해당 room으로 보냄
app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

// room id를 통해 해당 room에 참여
app.get("/:room", (req, res) => {
  res.render("room", { roomID: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomID, userID) => {
    console.log(`user joined : ${roomID}, ${userID}`);
    socket.join(roomID);
    // 새로운 user join 하면 해당 room에게 새로운 user id를 broadcast
    socket.to(roomID).broadcast.emit("user-connected", userID);

    // 만약 이 user가 방을 나가면 전체에게 broadcast 해줌
    socket.on("disconnect", () => {
      socket.to(roomID).broadcast.emit("user-disconnected", userID);
    });
  });
});

server.listen(PORT, () => console.log(`server is running on port ${PORT}`));
