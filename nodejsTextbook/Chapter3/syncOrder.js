const fs = require("fs");

console.log("start");

fs.readFile("./readme.txt", (err, data) => {
  if (err) {
    throw err;
  }
  console.log("1 : ", data.toString());
  fs.readFile("./readme.txt", (err, data) => {
    if (err) {
      throw err;
    }
    console.log("2 : ", data.toString());
    fs.readFile("./readme.txt", (err, data) => {
      if (err) {
        throw err;
      }
      console.log("3 : ", data.toString());
    });
  });
});
console.log("end");

// 해결법
// 콜백 지옥이 생기지만 그래도 순서를 지킬 수 있게 된다. -> Promise와 async/await을 이용해서 해결 가능
