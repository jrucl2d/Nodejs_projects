const fs = require("fs");

console.log("start");
fs.readFile("./readme.txt", (err, data) => {
  if (err) {
    throw err;
  }
  console.log("1 : ", data.toString());
});
fs.readFile("./readme.txt", (err, data) => {
  if (err) {
    throw err;
  }
  console.log("2 : ", data.toString());
});
fs.readFile("./readme.txt", (err, data) => {
  if (err) {
    throw err;
  }
  console.log("3 : ", data.toString());
});
console.log("end");

// 실행 결과가 순서대로 되지 않는다.
// 파일 읽기 요청만 보내고 다음 작업으로 넘어간다. 그래서 end가 더 일찍 나온다.
// 읽기가 완료되면 백그라운드가 다시 main thread에 알려주고 그 때 콜백 함수를 실행한다.
