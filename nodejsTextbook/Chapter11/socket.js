const SocketIO = require("socket.io");

module.exports = (server) => {
  const io = SocketIO(server, { path: "/socket.io" }); // 클라이언트와의 연결 경로 옵션 path
  io.on("connection", (socket) => {
    const req = socket.request; // 이걸로 요청 객체에 접근 가능
    // socket.request.res 로 응답 객체에 접근 가능
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("새로운 클라이언트 접속", ip, socket.id, req.ip); // socket.id로 소켓 고유 아이디(소켓의 주인이 누구인지 파악)
    socket.on("disconnect", () => {
      console.log("클라이언트 접속 해제", ip, socket.id);
      clearInterval(socket.interval);
    });
    socket.on("error", (err) => console.error(err));
    socket.on("reply", (data) => console.log(data)); // 사용자가 직접 만든 이벤트, 클라이언트에서 reply라는 이벤트명으로 데이터를 보낼 것
    socket.interval = setInterval(() => {
      socket.emit("news", "Hello Socket.IO"); // 이벤트 이름, 데이터-> 클라이언트에 news라는 이벤트 리스너를 만들어야 함
    }, 3000);
  });
};
