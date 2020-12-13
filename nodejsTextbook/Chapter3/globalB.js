const A = require("./globalA");

global.message = "Hello";
console.log(A());
// global 객체를 남용하는 것은 좋지 않다. 대신 모듈 형식으로 다른 파일의 값을 가져와서 사용해라.
