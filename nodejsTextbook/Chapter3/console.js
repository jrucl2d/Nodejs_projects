const string = "abc";
const number = 1;
const boolean = true;
const obj = {
  outside: {
    inside: {
      key: "value",
    },
  },
};

console.time("전체 시간"); // 뒤의 console.timeEnd(레이블)과 대응되어 같은 레이블을 가진 time과 time 사이의 시간을 측정함
console.log("평범한 로그. 쉼포료 구분해서 여러 값을 출력 가능");
console.log(string, number, boolean);
console.error("에러 메시지는 console.error에 담아준다.");

console.dir(obj, { colors: false, depth: 2 }); // 객체를 콘솔에 표시할 때 사용. (객체, 옵션)
console.dir(obj, { colors: true, depth: 1 }); // colors:true면 콘솔에 색이 추가, 보기 좋아짐. depth는 몇 단계까지 보여줄지. 기본값은 2

console.time("시간 측정");
for (let i = 0; i < 100000; i++) {
  continue;
}
console.timeEnd("시간 측정");

function b() {
  console.trace("에러 위치 추적"); // 에러 위치를 추적. 보통 알려주므로 자주 사용 x
}
function a() {
  b();
}
a();

console.timeEnd("전체 시간");
