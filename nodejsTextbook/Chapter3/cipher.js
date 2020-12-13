const crypto = require("crypto");

const cipher = crypto.createCipher("aes-256-cbc", "열쇠"); // 암호화 알고리즘, 키를 넣어줌
let result = cipher.update("암호화할 문장", "utf8", "base64"); // 문자열, 인코딩, 출력 인코딩
result += cipher.final("base64"); // 출력 결과물의 인코딩을 넣어주면 암호화 완료
console.log("암호화 : ", result);

const decipher = crypto.createDecipher("aes-256-cbc", "열쇠");
let result2 = decipher.update(result, "base64", "utf8");
result2 += decipher.final("utf8");
console.log("복호화 : ", result2);
