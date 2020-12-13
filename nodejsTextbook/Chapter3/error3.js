process.on("uncaughtException", (err) => {
  console.error("ERROR!!", err);
});

setInterval(() => {
  throw new Error("BADDDDD");
}, 1000);
// 프로세스 객체에 uncaughtException 이벤트 리스너를 달아주었기 때문에 프로세스가 멈추지 않고 유지된다.
// 만약 없었다면 아래의 setTimeout은 실행되지 않았을 것이다.

setTimeout(() => {
  console.log("processing..");
}, 2000);
