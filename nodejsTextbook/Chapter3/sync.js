const fs = require("fs");

console.log("start");
let data = fs.readFileSync("./readme.txt");
console.log("1 : ", data.toString());
data = fs.readFileSync("./readme.txt");
console.log("2 : ", data.toString());
data = fs.readFileSync("./readme.txt");
console.log("3 : ", data.toString());
console.log("end");

// 콜백 함수에 넣지 않고 바로 값을 받아옴. 그러나 요청이 매우 많이 들어오면 성능이 안 좋아짐.
