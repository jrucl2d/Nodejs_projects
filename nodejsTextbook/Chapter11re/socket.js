const WebSocket = require("ws");

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    // 웹소켓 연결 시
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("새로운 클라이언트 접속", ip);
    ws.on("message", (msg) => console.log(msg));
    ws.on("error", (err) => console.error(err));
    ws.on("close", () => {
      console.log("클라이언트 접속 해제", ip);
      clearInterval(ws.interval);
    });
    ws.interval = setInterval(() => {
      // connecting, open, closing, closed 중 open일 때만 에러 없이 메시지 전송 보낼 수 있다.
      if (ws.readyState === ws.OPEN) {
        ws.send("서버에서 클라이언트로 메시지 전송");
      }
    }, 3000);
  });
};
