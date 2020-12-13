const cluster = require("cluster");
const http = require("http");
const numCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  console.log(`마스터 프로세스 아이디 : ${process.pid}`);
  // CPU 개수만큼 워커를 생산
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  // 워커 종료 시
  cluster.on("exit", (worker, code, signal) => {
    console.log(`${worker.process.pid}번 워커가 종료됨`);
    // cluster.fork(); // 워커 하나가 죽을 때마다 다시 하나를 fork해줌. 그러나 이것은 오류 자체를 막는 것에 비해 좋은 오류 해결법아 아님
  });
} else {
  // 워커들이 프로세스에서 대기
  http
    .createServer((req, res) => {
      res.write(`<h1>HEllo node!</h1>`);
      res.end(`<p>HEllo world!</p>`);
      // localhost:8080에 들어가서 새로고침 한 번 할 때마다(요청 하나마다) 워커가 1초 뒤 종료됨
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    })
    .listen(8080);
  console.log(`${process.pid}번 워커 실행`);
}
