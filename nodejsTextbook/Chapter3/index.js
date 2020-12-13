const { odd, even } = require("./var");
const checkNum = require("./func"); // 이름을 다른 식으로 불러올 수도 있다.

function checkStringOddOrEven(str) {
  if (str.length % 2) {
    return odd;
  }
  return even;
}
console.log(checkNum(10));
console.log(checkStringOddOrEven("hello"));
