const SSE = require("sse");

module.exports = (server) => {
  const sse = new SSE(server);
  // 라우터에서 sse 사용하고 싶으면 app.set으로 client 객체를 등록
  sse.on("connection", (client) => {
    setInterval(() => {
      client.send(Date.now().toString()); // 문자열만 보내기 가능
    }, 1000); // 1초마다 현재 시간 알려줌
  });
};
