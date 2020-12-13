const fs = require("fs");

const readStream = fs.createReadStream("./writeme.txt", { highWaterMark: 16 }); // 버퍼의 크기를 바이트 단위로 정할 수 있다. 기본값은 64
const data = [];

readStream.on("data", (chunk) => {
  data.push(chunk);
  console.log("data : ", chunk, chunk.length);
});
readStream.on("end", () => {
  console.log("end : ", Buffer.concat(data).toString());
});
readStream.on("error", (err) => {
  console.log("error : ", err);
});
