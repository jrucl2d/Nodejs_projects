const util = require("util");
const crypto = require("crypto");

const dontUse = util.deprecate((x, y) => {
  // 함수가 deprecated 되었음을 알려준다. 첫 인자로 넣은 함수를 사용하면 경고 메시지 출력
  console.log(x + y);
}, `dontUse 함수는 사용하지 마시오`);

dontUse(1, 2);

const randomBytesPromise = util.promisify(crypto.randomBytes); // 콜백 패턴을 프로미스 패턴으로 바꿔줌. 바꿀 함수를 인자로 넘겨줌.
randomBytesPromise(64)
  .then((buf) => {
    console.log(buf.toString("base64"));
  })
  .catch((error) => {
    console.error(error);
  });
