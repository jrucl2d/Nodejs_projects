const SocketIO = require("socket.io");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const cookie = require("cookie-signature");

module.exports = (server, app, sessionMiddleWare) => {
  const io = SocketIO(server, { path: "/socket.io" });
  app.set("io", io);
  const room = io.of("/room");
  const chat = io.of("/chat");

  io.use((socket, next) => {
    cookieParser(process.env.COOKIE_SECRET)(
      socket.request,
      socket.request.res,
      next
    ); // req, res, next를 붙여준 것
    sessionMiddleWare(socket.request, socket.request.res, next);
  });

  room.on("connection", (socket) => {
    console.log("room 네임스페이스에 접속");
    socket.on("disconnect", () => {
      console.log("room 네임스페이스 접속 해제");
    });
  });

  chat.on("connection", (socket) => {
    console.log("chat 네임스페이스에 접속");
    const req = socket.request;
    const {
      headers: { referer }, // 현재 웹 페이지의 url
    } = req;
    const roomId = referer
      .split("/")
      [referer.split("/").length - 1].replace(/\?.+/, ""); // 같은 네임스페이스 안에서도 방이 있다. 방 안에서만 데이터 주고받음.
    socket.join(roomId);
    // to()로 특정 방에만 데이터 전달
    // socket.to(roomId).emit("join", {
    //   user: "system",
    //   chat: `${app.get("username")}님이 입장하셨습니다.`,
    //   //   members: socket.adapter.rooms[roomId].length,
    // });

    // 시스템 메시지 socket에서 보내지 않고 라우터 거쳐서 보냄

    const signedCookie = cookie.sign(
      req.headers.cookie.split("=")[1],
      process.env.COOKIE_SECRET
    );

    axios.post(
      `http://localhost:8005/room/${roomId}/sys`,
      {
        type: "join",
      },
      {
        headers: {
          Cookie: `connect.sid=s%3A${signedCookie}`,
        },
      }
    );

    socket.on("disconnect", () => {
      console.log("chat 네임스페이스 접속 해제");
      socket.leave(roomId);
      const currentRoom = socket.adapter.rooms.get(roomId);
      const userCount = currentRoom ? currentRoom.size : 0;

      if (userCount === 0) {
        // // 유저가 0명이면 방 삭제

        axios
          .delete(`http://localhost:8005/room/${roomId}`, {
            headers: {
              Cookie: `connect.sid=s%3A${signedCookie}`,
            },
          })
          .then(() => {
            console.log(roomId + " 방 제거 요청 성공");
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        // socket.to(roomId).emit("exit", {
        //   user: "system",
        //   chat: `${app.get("username")}님이 퇴장하셨습니다.`,
        // });

        // 시스템 메시지 라우터 거쳐서 보냄
        axios.post(
          `http://localhost:8005/room/${roomId}/sys`,
          {
            type: "exit",
          },
          {
            headers: {
              Cookie: `connect.sid=s%3A${signedCookie}`,
            },
          }
        );
      }
    });
  });
};
