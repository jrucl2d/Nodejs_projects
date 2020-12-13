const fs = require("fs");

fs.readFile("./readme.txt", (err, data) => {
  if (err) {
    throw err;
  }
  console.log(data);
  console.log(data.toString()); // 원래는 버퍼의 형태로 제공되므로 toString()을 통해서 문장으로 바꿔줘야 한다.
});
