const timeout = setTimeout(() => {
  console.log("after 1.5 sec");
}, 1500);

const interval = setInterval(() => {
  // 1초마다 반복
  console.log("every 1 sec");
}, 1000);

const timeout2 = setTimeout(() => {
  console.log("no excute");
}, 3000);

setTimeout(() => {
  clearTimeout(timeout2); // 타임아웃 제거
  clearInterval(interval); // 반복 제거
}, 2500);

const immed = setImmediate(() => {
  // 즉시 실행
  console.log("immediately excute");
});

const immed2 = setImmediate(() => {
  console.log("no excute");
});
// 특수한 경우에 setImmediate가 setTImeout(func, 0)보다 빠르게 실행된다. 그러나 항상 그렇지는 않는다. 때문에 setTimeout(func, 0)은 사용하지 않는 것이 좋다.

clearImmediate(immed2);
