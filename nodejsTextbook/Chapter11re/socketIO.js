const SocketIO = require("socket.io");

module.exports = (server) => {
  const io = SocketIO(server, { path: "/socket.io" }); // 클라이언트와 연결하는 경로
  io.on("connection", (socket) => {
    const req = socket.request; // 이 방식으로 소켓 요청 객체에 접근 가능, socket.request.res로 응답 객체에 접근 가능
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("새로운 클라이언트 접속!", ip, socket.id, req.ip);
    socket.on("disconnect", () => {
      console.log("클라이언트 접속 해제", ip, socket.id);
      clearInterval(socket.interval);
    });
    socket.on("error", (err) => console.error(err));
    socket.on("reply", (data) => console.log(data)); // 직접 만든 이벤트. 클라이언트에서 reply라는 이벤트로 데이터 보냄
    socket.interval = setInterval(() => {
      socket.emit("news", "안녕 소켓");
    }, 3000);
  });
};
