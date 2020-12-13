const crypto = require("crypto");

console.log(
  "base64:",
  crypto.createHash("sha512").update("password").digest("base64") // sha512가 현재 가장 무난하다. update뒤에 문자열 넣기, digest뒤에 인코딩 알고리즘
);
console.log(
  "hex:",
  crypto.createHash("sha512").update("password").digest("hex")
);
console.log(
  "base64:",
  crypto.createHash("sha512").update("another password").digest("base64")
);
