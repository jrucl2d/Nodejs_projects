const fs = require("fs");

const writeStream = fs.createWriteStream("./writeme.txt");
writeStream.on("finish", () => {
  // finish eventlistener을 추가해줌
  console.log("파일 쓰기 완료");
});

writeStream.write("가나다라마바사\n");
writeStream.write("아자차카타파하");
writeStream.end(); // end로 종료되면 finish event가 발생한다.
