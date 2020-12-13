const SocketIO = require("socket.io");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const cookie = require("cookie-signature");

module.exports = (server, app, sessionMiddleWare) => {
  const io = SocketIO(server, { path: "/socket.io" });
  app.set("io", io);
  const room = io.of("/room"); // socket.io에 네임스페이스 부여하는 메서드
  const chat = io.of("/chat"); // 기본으로 socket.io는 /의 네임 스페이스 가짐. 같은 네임스페이스끼리만 데이터 전송

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
    const roomId = referer // url에서 현재 방 id를 추출
      .split("/")
      [referer.split("/").length - 1].replace(/\?.+/, ""); // 같은 네임스페이스 안에서도 방이 있다. 방 안에서만 데이터 주고받음.
    socket.join(roomId);
    // to()로 특정 방에만 데이터 전달
    // socket.to(roomId).emit("join", {
    //   user: "system",
    //   chat: `${req.session.color}님이 입장하셨습니다.`,
    //   members: socket.adapter.rooms[roomId].length,
    // });

    // connect.sid가 세션 쿠키라서 이게 같으면 같은 사람으로 침. 근데 axios 요청을 보낼 때 새로운 요청이라서 쿠키가 달라질 수 있음
    // 그래서 다음의 과정을 통해 소켓 요청과 axios 요청이 같은 쿠키(사람)임을 알려주는 것.
    axios.post(
      `http://localhost:8000/room/${roomId}/sys`,
      {
        type: "join",
      },
      {
        headers: {
          Cookie: `connect.sid=${
            "s%3A" +
            cookie.sign(
              req.signedCookies["connect.sid"],
              process.env.COOKIE_SECRET
            )
          }`,
        },
      }
    );

    socket.on("disconnect", async () => {
      console.log("chat 네임스페이스 접속 해제");
      socket.leave(roomId);
      const currentRoom = socket.adapter.rooms[roomId];
      const userCount = currentRoom ? currentRoom.length : 0;
      if (userCount === 0) {
        const signedCookie = cookie.sign(
          req.signedCookies["connect.sid"],
          process.env.COOKIE_SECRET
        );
        const connectSID = `${signedCookie}`;
        try {
          await axios.delete(`http://localhost:8000/room/${roomId}`, {
            headers: {
              Cookie: `connect.sid=s%3A${connectSID}`,
            },
          });
          console.log("방 제거 요청 성공");
        } catch (err) {
          console.error(err);
        }
      } else {
        // socket.to(roomId).emit("exit", {
        //   user: "system",
        //   chat: `${req.session.color}님이 퇴장하셨습니다.`,
        //   members: socket.adapter.rooms[roomId].length,
        // });
        axios.post(
          `http://localhost:8000/room/${roomId}/sys`,
          {
            type: "exit",
          },
          {
            headers: {
              Cookie: `connect.sid=${
                "s%3A" +
                cookie.sign(
                  req.signedCookies["connect.sid"],
                  process.env.COOKIE_SECRET
                )
              }`,
            },
          }
        );
      }
    });
  });
};
