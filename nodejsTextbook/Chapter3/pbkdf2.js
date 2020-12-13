const crypto = require("crypto");

crypto.randomBytes(64, (err, buf) => {
  const salt = buf.toString("base64"); // randdomBytes로 64바이트 문자열을 생성(이것이 salt)
  console.log("salt :", salt);
  crypto.pbkdf2("비밀번호", salt, 100000, 64, "sha512", (err, key) => {
    // pbkdf2로 비밀번호, salt, 반복횟수, 출력 바이트, 해시 알고리즘
    console.log("password : ", key.toString("base64")); // sha512변환을 10만번 반복한 셈
  });
});
// 보통 1초 정도 걸리도록 반복 횟수를 조절해준다.
// 간단하지만 bcrypt나 scrypt보다 취약하므로 더 나은 보안이 필요하면 scrypt사용 추천.
