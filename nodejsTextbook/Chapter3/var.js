const odd = "Odd";
const even = "Even";

module.exports = {
  odd,
  even,
};
// 아래와 같은 방식으로도 똑같이 동작함
/*
exports.odd = "Odd";
exports.even = "Even";

module.exports와 exports가 같은 객체를 참조하기 때문에 가능하다.
실제로 console.log(module.exports === exports)를 하면 true가 나옴.
그러나 exports => module.exports => {}의 참조 관계가 성립하기 때문에
exports에 속성을 추가할 때는 객체처럼 속성명과 속성값을 대입해줘야 한다. -> exports.odd = "Odd"와 같은 방식
exports에 다른 값을 대입하면 객체의 참조 관계가 끊겨서 모듈로 동작하지 않는다.
또 exports로는 객체만 사용할 수 있으므로 함수를 대입할 수는 없다.
참조 관계에 유의해야 하므로 둘을 한 파일 내에서 사용하지 않는 것이 좋다.
*/
