const WebSocket = require("ws");

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });
  wss.on("connection", (ws, req) => {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress; // 프록시 서버를 판단하기 위해 x-forwarded-for을 사용
    console.log("클라이언트가 접속 " + ip);
    ws.on("message", (message) => {
      console.log(message);
    });
    ws.on("error", (err) => {
      console.error(err);
    });
    ws.on("close", () => {
      console.log("클라이언트 접속 해제 " + ip);
      clearInterval(ws.interval);
    });

    ws.interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.send("서버에서 클라이언트에게 메시지 전송");
      }
    }, 3000);
  });
};
