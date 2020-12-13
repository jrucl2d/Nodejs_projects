const fs = require("fs");

const readStream = fs.createReadStream("./forpipe.txt");
const writeStream = fs.createWriteStream("./forpipe2.txt");

readStream.pipe(writeStream);
// read로 읽어온 스트림을 write로 파이핑 시켜줌
